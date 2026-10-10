import { getGasConfig, saveGasConfig } from './storageService';

/**
 * Converts a File or Blob object into a base64 Data URL string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Normalizes vehicle object from Google Sheets Thai/English columns into React model
 */
export const normalizeVehicleFromSheet = (raw) => {
  if (!raw) return null;
  const brand = raw['ยี่ห้อ'] || raw['brand'] || '';
  const model = raw['รุ่น'] || raw['model'] || '';
  const plate = raw['ทะเบียนรถ'] || raw['plate'] || '';
  const nickname = raw['ชื่อเรียกรถ'] || raw['ฉายา'] || raw['nickname'] || (brand || model ? `${brand} ${model}`.trim() : plate);

  // Parse taxDueDate and insuranceDueDate cleanly (handle ISO dates like 2026-10-08T17:00:00.000Z)
  let taxDueDate = raw['วันต่อภาษี/พ.ร.บ.'] || raw['วันต่อภาษี'] || raw['taxDueDate'] || raw['taxDate'] || '';
  if (taxDueDate && typeof taxDueDate === 'string') {
    taxDueDate = taxDueDate.slice(0, 10);
  }

  let insuranceDueDate = raw['วันหมดอายุประกัน'] || raw['วันหมดอายุประกันภัย'] || raw['insuranceDueDate'] || '';
  if (insuranceDueDate && typeof insuranceDueDate === 'string') {
    insuranceDueDate = insuranceDueDate.slice(0, 10);
  }

  return {
    id: String(raw['Vehicle ID'] || raw['id'] || `veh-${Date.now()}`),
    nickname: nickname,
    plate: plate,
    province: raw['จังหวัด'] || raw['province'] || 'กรุงเทพมหานคร',
    brand: brand,
    model: model,
    type: raw['ประเภท'] || raw['type'] || 'รถเก๋ง (Sedan / Hatchback)',
    year: String(raw['ปี'] || raw['year'] || '2023'),
    color: raw['สี'] || raw['color'] || '',
    photoUrl: raw['รูปรถ (Google Drive URL)'] || raw['photoUrl'] || raw['รูปรถ'] || '',
    currentMileage: Number(raw['เลขไมล์ปัจจุบัน'] || raw['currentMileage'] || 0),
    lastServiceMileage: Number(raw['เลขไมล์เช็คระยะล่าสุด'] || raw['lastServiceMileage'] || 0),
    serviceIntervalKm: Number(raw['รอบเช็คระยะ (กม.)'] || raw['serviceIntervalKm'] || 10000),
    nextServiceMileage: Number(raw['เป้าหมายเช็คระยะถัดไป (กม.)'] || raw['nextServiceMileage'] || 0),
    lastServiceDate: raw['วันที่เช็คระยะล่าสุด'] || raw['lastServiceDate'] || '',
    serviceIntervalMonths: Number(raw['รอบระยะเวลา (เดือน)'] || raw['serviceIntervalMonths'] || 6),
    nextServiceDate: raw['วันที่เช็คระยะถัดไป'] || raw['nextServiceDate'] || '',
    taxDueDate: taxDueDate,
    insuranceDueDate: insuranceDueDate,
    assignedDriver: raw['คนขับประจำ'] || raw['assignedDriver'] || '',
    fuelType: raw['ประเภทเชื้อเพลิง'] || raw['fuelType'] || 'เบนซิน 95 / E20',
    status: raw['สถานะการซ่อมบำรุง'] || raw['status'] || 'normal',
    notes: raw['หมายเหตุ'] || raw['notes'] || ''
  };
};

/**
 * Normalizes inspection object from Google Sheets
 */
export const normalizeInspectionFromSheet = (raw) => {
  if (!raw) return null;
  let itemsObj = {};
  if (raw['รายละเอียดรายการตรวจ (JSON)']) {
    try {
      itemsObj = typeof raw['รายละเอียดรายการตรวจ (JSON)'] === 'string'
        ? JSON.parse(raw['รายละเอียดรายการตรวจ (JSON)'])
        : raw['รายละเอียดรายการตรวจ (JSON)'];
    } catch (e) {
      itemsObj = {};
    }
  } else if (raw.items) {
    itemsObj = typeof raw.items === 'string' ? JSON.parse(raw.items) : raw.items;
  }

  let photos = [];
  const photosRaw = raw['รูปจุดชำรุด (Google Drive URLs)'] || raw['defectPhotos'];
  if (Array.isArray(photosRaw)) {
    photos = photosRaw;
  } else if (typeof photosRaw === 'string' && photosRaw.trim()) {
    photos = photosRaw.split(',').map(s => s.trim()).filter(Boolean);
  }

  return {
    id: String(raw['Inspection ID'] || raw['id'] || `insp-${Date.now()}`),
    vehicleId: String(raw['Vehicle ID'] || raw['vehicleId'] || ''),
    plate: raw['ทะเบียนรถ'] || raw['plate'] || '',
    vehicleNickname: raw['ชื่อเรียกรถ'] || raw['vehicleNickname'] || raw['ทะเบียนรถ'] || raw['plate'] || '',
    vehicleType: raw['ประเภทรถ'] || raw['vehicleType'] || '',
    inspectorName: raw['ผู้ตรวจเช็ค'] || raw['inspectorName'] || 'เจ้าของรถ',
    inspectionDate: raw['วันเวลาที่ตรวจ'] || raw['inspectionDate'] || '',
    mileage: Number(raw['เลขไมล์ขณะตรวจ'] || raw['mileage'] || 0),
    overallResult: raw['ผลการตรวจรวม'] || raw['overallResult'] || 'PASS',
    passedCount: Number(raw['ผ่าน (รายการ)'] || raw['passedCount'] || 0),
    warningCount: Number(raw['เตือน (รายการ)'] || raw['warningCount'] || 0),
    failedCount: Number(raw['ไม่ผ่าน (รายการ)'] || raw['failedCount'] || 0),
    notes: raw['หมายเหตุ/ข้อบกพร่อง'] || raw['notes'] || '',
    defectPhotos: photos,
    items: itemsObj
  };
};

/**
 * Normalizes mileage log from Google Sheets
 */
export const normalizeMileageLogFromSheet = (raw) => {
  if (!raw) return null;
  return {
    id: String(raw['Log ID'] || raw['id'] || `mile-${Date.now()}`),
    vehicleId: String(raw['Vehicle ID'] || raw['vehicleId'] || ''),
    plate: raw['ทะเบียนรถ'] || raw['plate'] || '',
    driverName: raw['ผู้ขับขี่'] || raw['driverName'] || 'เจ้าของรถ',
    date: raw['วันเวลา'] || raw['date'] || '',
    startMileage: Number(raw['เลขไมล์เริ่มต้น'] || raw['startMileage'] || 0),
    endMileage: Number(raw['เลขไมล์สิ้นสุด'] || raw['endMileage'] || 0),
    distanceKm: Number(raw['ระยะทาง (กม.)'] || raw['distanceKm'] || 0),
    purpose: raw['จุดประสงค์/เส้นทาง'] || raw['purpose'] || '',
    fuelAddedLiters: Number(raw['เติมน้ำมัน (ลิตร)'] || raw['fuelAddedLiters'] || 0),
    fuelCostBaht: Number(raw['ค่าน้ำมัน (บาท)'] || raw['fuelCostBaht'] || 0),
    notes: raw['หมายเหตุ'] || raw['notes'] || ''
  };
};

/**
 * Sends a POST payload to Google Apps Script Web App
 */
export const callGoogleAppsScript = async (action, payload) => {
  const config = getGasConfig();
  if (!config.webAppUrl) {
    console.warn('Google Apps Script URL not configured. Data saved locally only.');
    return { success: false, isDemo: true, message: 'บันทึกในเครื่องเรียบร้อย (ยังไม่ได้เชื่อมต่อ Google Apps Script)' };
  }

  try {
    const response = await fetch(config.webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action,
        timestamp: new Date().toISOString(),
        ...payload
      })
    });

    const result = await response.json();
    
    if (result.success) {
      saveGasConfig({
        ...config,
        isConnected: true,
        lastSyncTime: new Date().toISOString()
      });
    }

    return result;
  } catch (error) {
    console.error('Google Apps Script request error:', error);
    return {
      success: false,
      error: error.message || 'ไม่สามารถเชื่อมต่อ Google Apps Script ได้',
      isOffline: true
    };
  }
};

/**
 * Fetch all data from Google Sheets (Sync)
 */
export const fetchGoogleSheetsData = async (customUrl = null) => {
  const config = getGasConfig();
  const urlToUse = customUrl || config.webAppUrl;
  
  if (!urlToUse) {
    return { success: false, message: 'กรุณากรอก Google Apps Script Web App URL ก่อน' };
  }

  try {
    const url = `${urlToUse}?action=GET_ALL_DATA&t=${Date.now()}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.success) {
      const vehicles = (data.vehicles || []).map(normalizeVehicleFromSheet).filter(Boolean);
      const inspections = (data.inspections || []).map(normalizeInspectionFromSheet).filter(Boolean);
      const mileageLogs = (data.mileageLogs || []).map(normalizeMileageLogFromSheet).filter(Boolean);

      return {
        success: true,
        vehicles,
        inspections,
        mileageLogs
      };
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch from Google Sheets:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test Google Apps Script Web App connection
 */
export const testGoogleAppsScriptConnection = async (url) => {
  if (!url || !url.startsWith('http')) {
    return { success: false, message: 'URL ต้องขึ้นต้นด้วย https://script.google.com/macros/s/...' };
  }

  try {
    const testUrl = `${url}?action=PING&t=${Date.now()}`;
    const response = await fetch(testUrl);
    const data = await response.json();
    if (data.status === 'OK' || data.success) {
      return { success: true, message: 'เชื่อมต่อ Google Sheets สำเร็จ!' };
    }
    return { success: true, message: 'เชื่อมต่อสำเร็จ' };
  } catch (error) {
    try {
      const postResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'PING' })
      });
      const postData = await postResponse.json();
      return { success: true, message: 'เชื่อมต่อ Google Sheets สำเร็จ!', data: postData };
    } catch (postErr) {
      return {
        success: false,
        message: 'เชื่อมต่อไม่สำเร็จ: โปรดตรวจสอบว่า Deploy Web App เป็น "Anyone" (ทุกคน) แล้วหรือไม่'
      };
    }
  }
};
