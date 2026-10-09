import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudOff, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Settings, 
  X, 
  HelpCircle, 
  FileCode, 
  FolderPlus,
  Loader2,
  Trash2,
  Save
} from 'lucide-react';
import { testGoogleAppsScriptConnection, fetchGoogleSheetsData } from '../services/googleService';
import { saveGasConfig, clearAllLocalData } from '../services/storageService';

const SAMPLE_GAS_CODE = `/**
 * Google Apps Script Backend (Code.gs)
 * คัดลอกโค้ดนี้ไปวางใน Extensions -> Apps Script ใน Google Sheets
 */
const FOLDER_NAME = 'VehicleInspectionApp_Uploads';
const SHEET_NAMES = {
  VEHICLES: 'Vehicles',
  INSPECTIONS: 'Inspections',
  MILEAGE: 'MileageLogs',
  MAINTENANCE: 'MaintenanceLogs'
};

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'PING';
  initSpreadsheetStructure();
  if (action === 'PING') return jsonOut({ success: true, status: 'OK' });
  if (action === 'GET_ALL_DATA') {
    return jsonOut({
      success: true,
      vehicles: getSheetDataAsJson(SHEET_NAMES.VEHICLES),
      inspections: getSheetDataAsJson(SHEET_NAMES.INSPECTIONS),
      mileageLogs: getSheetDataAsJson(SHEET_NAMES.MILEAGE),
      maintenanceLogs: getSheetDataAsJson(SHEET_NAMES.MAINTENANCE)
    });
  }
  return jsonOut({ success: false, message: 'Unknown action' });
}

function doPost(e) {
  initSpreadsheetStructure();
  var data = JSON.parse(e.postData.contents);
  if (data.action === 'PING') return jsonOut({ success: true, message: 'Pong!' });
  if (data.action === 'ADD_VEHICLE') return jsonOut(handleAddOrUpdateVehicle(data));
  if (data.action === 'ADD_INSPECTION') return jsonOut(handleAddInspection(data));
  if (data.action === 'UPDATE_MILEAGE') return jsonOut(handleUpdateMileage(data));
  if (data.action === 'RECORD_MAINTENANCE') return jsonOut(handleRecordMaintenance(data));
  return jsonOut({ success: false, message: 'Invalid action' });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ดูโค้ดฉบับเต็มพร้อมฟังก์ชันอัปโหลด Google Drive ได้ในโฟลเดอร์ google-apps-script/Code.gs`;

export const GoogleSheetsModal = ({ 
  isOpen, 
  onClose, 
  config, 
  onConfigUpdated,
  onSyncComplete
}) => {
  const [url, setUrl] = useState(config?.webAppUrl || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState('settings'); // settings | guide | code

  // Synchronize URL when config changes or modal opens
  useEffect(() => {
    if (config?.webAppUrl) {
      setUrl(config.webAppUrl);
    }
  }, [config?.webAppUrl, isOpen]);

  if (!isOpen) return null;

  const persistUrl = (newUrl) => {
    const cleanUrl = (newUrl !== undefined ? newUrl : url).trim();
    const newConfig = {
      ...config,
      webAppUrl: cleanUrl,
      isConnected: cleanUrl.length > 0,
      lastSyncTime: new Date().toISOString()
    };
    saveGasConfig(newConfig);
    if (onConfigUpdated) onConfigUpdated(newConfig);
    return cleanUrl;
  };

  const handleSaveAndSync = async () => {
    const cleanUrl = persistUrl();
    if (!cleanUrl) {
      setTestResult({ success: false, message: 'กรุณากรอก Google Apps Script Web App URL' });
      return;
    }

    setIsSyncing(true);
    setTestResult({ success: true, message: '💾 บันทึก URL ลงเครื่องเรียบร้อยแล้ว กำลังดึงข้อมูลจาก Google Sheets...' });

    try {
      const data = await fetchGoogleSheetsData(cleanUrl);
      setIsSyncing(false);
      if (data && data.success) {
        setTestResult({ 
          success: true, 
          message: `✅ เชื่อมต่อและดึงข้อมูลสำเร็จ! (พบรถ ${data.vehicles?.length || 0} คัน, ประวัติตรวจ ${data.inspections?.length || 0} รายการ)` 
        });
        if (onSyncComplete) onSyncComplete(data);
      } else {
        setTestResult({
          success: false,
          message: 'บันทึก URL แล้ว แต่ดึงข้อมูลไม่สำเร็จ: ' + (data.error || 'โปรดตรวจสอบสิทธิ์ Anyone ใน Apps Script')
        });
      }
    } catch (err) {
      setIsSyncing(false);
      setTestResult({
        success: false,
        message: 'บันทึก URL แล้ว แต่พบปัญหาการเชื่อมต่อ: ' + err.message
      });
    }
  };

  const handleTestConnection = async () => {
    const cleanUrl = persistUrl();
    if (!cleanUrl) {
      setTestResult({ success: false, message: 'กรุณากรอก Web App URL' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testGoogleAppsScriptConnection(cleanUrl);
    setIsTesting(false);
    setTestResult(result);

    if (result.success) {
      // Auto sync data
      try {
        const data = await fetchGoogleSheetsData(cleanUrl);
        if (data && data.success && onSyncComplete) {
          onSyncComplete(data);
        }
      } catch (err) {
        console.warn('Auto sync on test error:', err);
      }
    }
  };

  const handleClearCache = () => {
    if (window.confirm('คุณต้องการล้างข้อมูลแคชในเครื่องทั้งหมด (รถ, ประวัติการตรวจ, บันทึกไมล์) เพื่อเริ่มต้นใหม่หรือไม่?')) {
      clearAllLocalData();
      if (onSyncComplete) {
        onSyncComplete({ vehicles: [], inspections: [], mileageLogs: [] });
      }
      alert('ล้างข้อมูลในเครื่องเรียบร้อยแล้ว');
      onClose();
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(SAMPLE_GAS_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">ตั้งค่าการเชื่อมต่อ Google Sheets & Google Drive</h3>
              <p className="text-xs text-slate-500">บันทึกข้อมูลและรูปภาพขึ้นระบบคลาวด์ของ Google ฟรี 100%</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2 px-3 transition border-b-2 ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ตั้งค่า URL
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2 px-3 transition border-b-2 flex items-center gap-1 ${
              activeTab === 'guide'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>ขั้นตอนการติดตั้ง (3 นาที)</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-2 px-3 transition border-b-2 flex items-center gap-1 ${
              activeTab === 'code'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>โค้ด Apps Script</span>
          </button>
        </div>

        {/* Tab 1: Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            
            {/* Status box */}
            <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
              config.isConnected && config.webAppUrl
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              {config.isConnected && config.webAppUrl ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">🟢 เชื่อมต่อระบบ Google Sheets & Drive สำเร็จแล้ว</span>
                    <span>ข้อมูลและรูปภาพที่บันทึกจะถูกส่งไปยัง Google Sheets และ Google Drive อัตโนมัติ</span>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold block">⚪ กำลังทำงานในโหมดออฟไลน์ (Local Demo Mode)</span>
                    <span>ระบบบันทึกข้อมูลในบราวเซอร์ของคุณ นำ Web App URL มาใส่เพื่อบันทึกลง Google Sheets จริง</span>
                  </div>
                </>
              )}
            </div>

            {/* Input URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Google Apps Script Web App URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  persistUrl(e.target.value);
                }}
                onBlur={() => persistUrl(url)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-[11px] text-slate-400">
                ได้จากการ Deploy as Web App ใน Google Sheets (ดูแท็บ "ขั้นตอนการติดตั้ง")
              </p>
            </div>

            {/* Test Result Message */}
            {testResult && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {testResult.message}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveAndSync}
                  disabled={!url || isSyncing}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-blue-600/20"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังดึงข้อมูล...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>บันทึก & ดึงข้อมูล (Sync)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !url}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังทดสอบ...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ทดสอบเชื่อมต่อ</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-200 transition flex items-center gap-1"
                  title="ล้างข้อมูลรถและประวัติการตรวจในเครื่อง"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ล้างข้อมูลในเครื่อง</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Installation Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-4 text-xs text-slate-600">
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-slate-800 block">สร้าง Google Sheets เปล่า</strong>
                  <span>ไปที่ <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">sheets.new</a> เพื่อสร้าง Google Spreadsheet ใหม่</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-slate-800 block">เปิด Apps Script & วางโค้ด</strong>
                  <span>คลิกเมนู <strong>ส่วนขยาย (Extensions)</strong> &gt; <strong>Apps Script</strong> &gt; นำโค้ดในแท็บ "โค้ด Apps Script" หรือไฟล์ <code className="bg-slate-200 px-1 rounded">Code.gs</code> ไปวางแล้วกดบันทึก</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-slate-800 block">Deploy เป็น Web App</strong>
                  <span>คลิกปุ่มสีน้ำเงิน <strong>"ทำให้ใช้งานได้" (Deploy)</strong> &gt; <strong>การทำให้ใช้งานได้รายการใหม่ (New deployment)</strong> &gt; เลือกประเภท <strong>เว็บแอป (Web app)</strong></span>
                  <div className="mt-1 bg-white p-2 rounded-lg border border-blue-200 text-[11px] text-slate-700">
                    ⚠️ <strong>สำคัญ:</strong> ตั้งค่า "ผู้มีสิทธิ์เข้าถึง (Who has access)" เป็น <strong>"ทุกคน (Anyone)"</strong>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</span>
                <div>
                  <strong className="text-slate-800 block">คัดลอก URL มาใส่ในระบบ</strong>
                  <span>คัดลอก Web app URL ที่ได้มาวางในช่อง URL ในแท็บ "ตั้งค่า URL" แล้วกดทดสอบ</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Code View */}
        {activeTab === 'code' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">ไฟล์: google-apps-script/Code.gs</span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ดทั้งหมด'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto max-h-72 border border-slate-800">
              <code>{SAMPLE_GAS_CODE}</code>
            </pre>
            <p className="text-[11px] text-slate-500">
              โค้ดฉบับเต็มพร้อมฟังก์ชันสร้างโฟลเดอร์ Google Drive และอัปโหลดภาพแบบอัตโนมัติอยู่ในโปรเจกต์ที่โฟลเดอร์ <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-blue-600">google-apps-script/Code.gs</code>
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
