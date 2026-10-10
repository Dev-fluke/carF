/**
 * ==============================================================================
 * Web Application: Vehicle Inspection & Maintenance Tracking System
 * Google Apps Script Backend (Code.gs)
 * ------------------------------------------------------------------------------
 * Handles:
 *  1. Google Sheets database creation & updates (Vehicles, Inspections, MileageLogs, MaintenanceLogs)
 *  2. Google Drive Image Storage (Upload vehicle photos & inspection defect photos)
 *  3. REST API endpoint (doGet, doPost) for the React Web App
 * ==============================================================================
 */

const FOLDER_NAME = 'VehicleInspectionApp_Uploads';
const SHEET_NAMES = {
  VEHICLES: 'Vehicles',
  INSPECTIONS: 'Inspections',
  MILEAGE: 'MileageLogs',
  MAINTENANCE: 'MaintenanceLogs'
};

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'PING';
  var result = {};

  try {
    initSpreadsheetStructure();

    if (action === 'PING') {
      result = { success: true, status: 'OK', message: 'Vehicle Inspection API is online.' };
    } else if (action === 'GET_ALL_DATA') {
      result = {
        success: true,
        vehicles: getSheetDataAsJson(SHEET_NAMES.VEHICLES),
        inspections: getSheetDataAsJson(SHEET_NAMES.INSPECTIONS),
        mileageLogs: getSheetDataAsJson(SHEET_NAMES.MILEAGE),
        maintenanceLogs: getSheetDataAsJson(SHEET_NAMES.MAINTENANCE)
      };
    } else {
      result = { success: false, message: 'Unknown GET action: ' + action };
    }
  } catch (error) {
    result = { success: false, error: error.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  var result = {};
  
  try {
    initSpreadsheetStructure();
    
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      throw new Error('No post data received.');
    }

    var action = data.action;

    if (action === 'PING') {
      result = { success: true, message: 'Pong! Connection successful.' };
    } 
    else if (action === 'ADD_VEHICLE' || action === 'UPDATE_VEHICLE') {
      result = handleAddOrUpdateVehicle(data);
    } 
    else if (action === 'ADD_INSPECTION') {
      result = handleAddInspection(data);
    } 
    else if (action === 'UPDATE_MILEAGE') {
      result = handleUpdateMileage(data);
    } 
    else if (action === 'RECORD_MAINTENANCE') {
      result = handleRecordMaintenance(data);
    } 
    else {
      result = { success: false, message: 'Unknown action: ' + action };
    }

  } catch (error) {
    result = { success: false, error: error.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Upload Base64 Image to Google Drive Folder
 */
function saveBase64ImageToDrive(base64Data, filenamePrefix) {
  if (!base64Data || typeof base64Data !== 'string' || !base64Data.includes('base64,')) {
    return base64Data || ''; // return as is if already a URL or empty
  }

  try {
    var parts = base64Data.split(';base64,');
    var contentType = parts[0].replace('data:', '');
    var rawBase64 = parts[1];
    var decoded = Utilities.base64Decode(rawBase64);
    
    var ext = 'jpg';
    if (contentType.includes('png')) ext = 'png';
    else if (contentType.includes('webp')) ext = 'webp';

    var filename = (filenamePrefix || 'photo') + '_' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd_HHmmss') + '.' + ext;
    var blob = Utilities.newBlob(decoded, contentType, filename);

    // Get or Create Folder
    var folders = DriveApp.getFoldersByName(FOLDER_NAME);
    var folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(FOLDER_NAME);
    }

    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Direct viewable URL (High-resolution Google Drive CDN thumbnail)
    var fileId = file.getId();
    var viewUrl = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w1000';
    return viewUrl;
  } catch (err) {
    Logger.log('Drive Upload Error: ' + err.toString());
    return '';
  }
}

/**
 * Handle Add/Update Vehicle
 */
function handleAddOrUpdateVehicle(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.VEHICLES);
  var vehicle = data.vehicle || data;

  var photoUrl = vehicle.photoUrl || '';
  if (photoUrl.startsWith('data:image')) {
    photoUrl = saveBase64ImageToDrive(photoUrl, 'Vehicle_' + (vehicle.plate || 'plate').replace(/\s+/g, '_'));
  }

  // Ensure header mapping
  var headerValues = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var colMap = {};
  for (var c = 0; c < headerValues.length; c++) {
    colMap[String(headerValues[c]).trim()] = c + 1;
  }

  // Ensure new columns exist
  var extraHeaders = ['วันต่อภาษี/พ.ร.บ.', 'วันหมดอายุประกัน', 'ชื่อเรียกรถ'];
  for (var h = 0; h < extraHeaders.length; h++) {
    var hName = extraHeaders[h];
    if (!colMap[hName]) {
      var nextCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextCol).setValue(hName);
      colMap[hName] = nextCol;
    }
  }

  var values = sheet.getDataRange().getValues();
  var rowIndex = -1;

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(vehicle.id) || String(values[i][1]) === String(vehicle.plate)) {
      rowIndex = i + 1;
      break;
    }
  }

  var targetRow = rowIndex > 0 ? rowIndex : sheet.getLastRow() + 1;

  // Base 21 fields
  var rowData = [
    vehicle.id || ('veh-' + new Date().getTime()),
    vehicle.plate || '',
    vehicle.province || '',
    vehicle.brand || '',
    vehicle.model || '',
    vehicle.type || '',
    vehicle.year || '',
    vehicle.color || '',
    photoUrl,
    Number(vehicle.currentMileage || 0),
    Number(vehicle.lastServiceMileage || 0),
    Number(vehicle.serviceIntervalKm || 10000),
    Number(vehicle.nextServiceMileage || 0),
    vehicle.lastServiceDate || '',
    Number(vehicle.serviceIntervalMonths || 6),
    vehicle.nextServiceDate || '',
    vehicle.assignedDriver || '',
    vehicle.fuelType || '',
    vehicle.status || 'normal',
    vehicle.notes || '',
    Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd HH:mm:ss')
  ];

  sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);

  // Set taxDueDate, insuranceDueDate, nickname
  if (colMap['วันต่อภาษี/พ.ร.บ.']) {
    sheet.getRange(targetRow, colMap['วันต่อภาษี/พ.ร.บ.']).setValue(vehicle.taxDueDate || '');
  }
  if (colMap['วันหมดอายุประกัน']) {
    sheet.getRange(targetRow, colMap['วันหมดอายุประกัน']).setValue(vehicle.insuranceDueDate || '');
  }
  if (colMap['ชื่อเรียกรถ']) {
    sheet.getRange(targetRow, colMap['ชื่อเรียกรถ']).setValue(vehicle.nickname || '');
  }

  return {
    success: true,
    message: 'บันทึกข้อมูลรถเรียบร้อยแล้ว',
    photoUrl: photoUrl,
    vehicleId: rowData[0]
  };
}

/**
 * Handle Add Inspection Checklist
 */
function handleAddInspection(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.INSPECTIONS);
  var inspection = data.inspection || data;

  // Handle uploaded defect photos
  var uploadedPhotoUrls = [];
  if (inspection.defectPhotos && Array.isArray(inspection.defectPhotos)) {
    for (var p = 0; p < inspection.defectPhotos.length; p++) {
      var photo = inspection.defectPhotos[p];
      if (photo.startsWith('data:image')) {
        var uploaded = saveBase64ImageToDrive(photo, 'Defect_' + (inspection.plate || 'insp'));
        if (uploaded) uploadedPhotoUrls.push(uploaded);
      } else {
        uploadedPhotoUrls.push(photo);
      }
    }
  }

  var rowData = [
    inspection.id || ('insp-' + new Date().getTime()),
    inspection.vehicleId || '',
    inspection.plate || '',
    inspection.inspectorName || '',
    inspection.inspectionDate || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd HH:mm:ss'),
    Number(inspection.mileage || 0),
    inspection.overallResult || 'PASS',
    Number(inspection.passedCount || 0),
    Number(inspection.warningCount || 0),
    Number(inspection.failedCount || 0),
    inspection.notes || '',
    uploadedPhotoUrls.join(', '),
    JSON.stringify(inspection.items || {}),
    Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd HH:mm:ss')
  ];

  sheet.appendRow(rowData);

  // Update vehicle current mileage
  if (inspection.vehicleId && inspection.mileage) {
    updateVehicleMileageInSheet(inspection.vehicleId, inspection.mileage, inspection.inspectorName);
  }

  return {
    success: true,
    message: 'บันทึกผลการตรวจเช็คสภาพรถลง Google Sheets เรียบร้อยแล้ว',
    defectPhotos: uploadedPhotoUrls
  };
}

/**
 * Handle Update Mileage Log
 */
function handleUpdateMileage(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.MILEAGE);
  var log = data.mileageLog || data;

  var rowData = [
    log.id || ('mile-' + new Date().getTime()),
    log.vehicleId || '',
    log.plate || '',
    log.driverName || '',
    log.date || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd HH:mm:ss'),
    Number(log.startMileage || 0),
    Number(log.endMileage || 0),
    Number(log.distanceKm || 0),
    log.purpose || '',
    Number(log.fuelAddedLiters || 0),
    Number(log.fuelCostBaht || 0),
    log.notes || '',
    Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd HH:mm:ss')
  ];

  sheet.appendRow(rowData);

  // Update vehicle current mileage in Vehicles sheet
  if (log.vehicleId && log.endMileage) {
    updateVehicleMileageInSheet(log.vehicleId, log.endMileage, log.driverName);
  }

  return {
    success: true,
    message: 'บันทึกเลขไมล์ลง Google Sheets เรียบร้อยแล้ว'
  };
}

/**
 * Handle Record Maintenance
 */
function handleRecordMaintenance(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.MAINTENANCE);
  var maintenance = data.maintenance || data;

  var rowData = [
    maintenance.id || ('maint-' + new Date().getTime()),
    maintenance.vehicleId || '',
    maintenance.plate || '',
    maintenance.serviceType || '',
    maintenance.serviceDate || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
    Number(maintenance.serviceMileage || 0),
    Number(maintenance.costBaht || 0),
    maintenance.serviceCenter || '',
    maintenance.invoiceNumber || '',
    maintenance.notes || '',
    Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd HH:mm:ss')
  ];

  sheet.appendRow(rowData);

  // Update vehicle last service mileage & status
  if (maintenance.vehicleId) {
    var vSheet = ss.getSheetByName(SHEET_NAMES.VEHICLES);
    var values = vSheet.getDataRange().getValues();
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][0]) === String(maintenance.vehicleId) || String(values[i][1]) === String(maintenance.plate)) {
        var intervalKm = Number(values[i][11]) || 10000;
        var newLastKm = Number(maintenance.serviceMileage) || Number(values[i][9]);
        var newNextKm = newLastKm + intervalKm;
        
        vSheet.getRange(i + 1, 11).setValue(newLastKm); // lastServiceMileage
        vSheet.getRange(i + 1, 13).setValue(newNextKm); // nextServiceMileage
        vSheet.getRange(i + 1, 14).setValue(maintenance.serviceDate || ''); // lastServiceDate
        vSheet.getRange(i + 1, 19).setValue('normal'); // status
        break;
      }
    }
  }

  return {
    success: true,
    message: 'บันทึกประวัติการเข้าศูนย์ซ่อมบำรุงเรียบร้อยแล้ว'
  };
}

/**
 * Helper: Update vehicle mileage in Vehicles sheet
 */
function updateVehicleMileageInSheet(vehicleId, newMileage, updatedBy) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.VEHICLES);
  var values = sheet.getDataRange().getValues();

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(vehicleId) || String(values[i][1]) === String(vehicleId)) {
      var currentMileage = Number(values[i][9]) || 0;
      var higher = Math.max(currentMileage, Number(newMileage));
      var nextTarget = Number(values[i][12]) || ((Number(values[i][10]) || 0) + (Number(values[i][11]) || 10000));
      
      var status = 'normal';
      if (higher >= nextTarget) {
        status = 'overdue';
      } else if (nextTarget - higher <= 1000) {
        status = 'due_soon';
      }

      sheet.getRange(i + 1, 10).setValue(higher); // currentMileage
      sheet.getRange(i + 1, 19).setValue(status); // status
      sheet.getRange(i + 1, 21).setValue(Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd HH:mm:ss'));
      break;
    }
  }
}

/**
 * Initialize Sheets and Headers if they don't exist
 */
function initSpreadsheetStructure() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Vehicles Sheet
  var vSheet = ss.getSheetByName(SHEET_NAMES.VEHICLES);
  if (!vSheet) {
    vSheet = ss.insertSheet(SHEET_NAMES.VEHICLES);
    var vHeaders = [
      'Vehicle ID', 'ทะเบียนรถ', 'จังหวัด', 'ยี่ห้อ', 'รุ่น', 'ประเภท', 'ปี', 'สี',
      'รูปรถ (Google Drive URL)', 'เลขไมล์ปัจจุบัน', 'เลขไมล์เช็คระยะล่าสุด', 'รอบเช็คระยะ (กม.)',
      'เป้าหมายเช็คระยะถัดไป (กม.)', 'วันที่เช็คระยะล่าสุด', 'รอบระยะเวลา (เดือน)', 'วันที่เช็คระยะถัดไป',
      'คนขับประจำ', 'ประเภทเชื้อเพลิง', 'สถานะการซ่อมบำรุง', 'หมายเหตุ', 'วันต่อภาษี/พ.ร.บ.', 'วันหมดอายุประกัน', 'ชื่อเรียกรถ', 'อัปเดตล่าสุด'
    ];
    vSheet.appendRow(vHeaders);
    formatHeaderRow(vSheet);
  }

  // 2. Inspections Sheet
  var iSheet = ss.getSheetByName(SHEET_NAMES.INSPECTIONS);
  if (!iSheet) {
    iSheet = ss.insertSheet(SHEET_NAMES.INSPECTIONS);
    var iHeaders = [
      'Inspection ID', 'Vehicle ID', 'ทะเบียนรถ', 'ผู้ตรวจเช็ค', 'วันเวลาที่ตรวจ', 'เลขไมล์ขณะตรวจ',
      'ผลการตรวจรวม', 'ผ่าน (รายการ)', 'เตือน (รายการ)', 'ไม่ผ่าน (รายการ)', 'หมายเหตุ/ข้อบกพร่อง',
      'รูปจุดชำรุด (Google Drive URLs)', 'รายละเอียดรายการตรวจ (JSON)', 'บันทึกเมื่อ'
    ];
    iSheet.appendRow(iHeaders);
    formatHeaderRow(iSheet);
  }

  // 3. MileageLogs Sheet
  var mSheet = ss.getSheetByName(SHEET_NAMES.MILEAGE);
  if (!mSheet) {
    mSheet = ss.insertSheet(SHEET_NAMES.MILEAGE);
    var mHeaders = [
      'Log ID', 'Vehicle ID', 'ทะเบียนรถ', 'ผู้ขับขี่', 'วันเวลา', 'เลขไมล์เริ่มต้น',
      'เลขไมล์สิ้นสุด', 'ระยะทาง (กม.)', 'จุดประสงค์/เส้นทาง', 'เติมน้ำมัน (ลิตร)', 'ค่าน้ำมัน (บาท)', 'หมายเหตุ', 'บันทึกเมื่อ'
    ];
    mSheet.appendRow(mHeaders);
    formatHeaderRow(mSheet);
  }

  // 4. MaintenanceLogs Sheet
  var mtSheet = ss.getSheetByName(SHEET_NAMES.MAINTENANCE);
  if (!mtSheet) {
    mtSheet = ss.insertSheet(SHEET_NAMES.MAINTENANCE);
    var mtHeaders = [
      'Maintenance ID', 'Vehicle ID', 'ทะเบียนรถ', 'รายการซ่อมบำรุง', 'วันที่เข้าซ่อม',
      'เลขไมล์ขณะเข้าซ่อม', 'ค่าใช้จ่าย (บาท)', 'ศูนย์บริการ/อู่', 'เลขที่ใบเสร็จ', 'หมายเหตุ', 'บันทึกเมื่อ'
    ];
    mtSheet.appendRow(mtHeaders);
    formatHeaderRow(mtSheet);
  }
}

/**
 * Format Sheet Header styling
 */
function formatHeaderRow(sheet) {
  var range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  range.setBackground('#1e293b');
  range.setFontColor('#ffffff');
  range.setFontWeight('bold');
  sheet.setFrozenRows(1);
}

/**
 * Read Sheet Data as JSON
 */
function getSheetDataAsJson(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var rows = [];

  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    rows.push(row);
  }
  return rows;
}
