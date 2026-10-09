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
        'Content-Type': 'text/plain;charset=utf-8', // GAS doPost standard format to avoid CORS preflight issues
      },
      body: JSON.stringify({
        action,
        timestamp: new Date().toISOString(),
        ...payload
      })
    });

    const result = await response.json();
    
    // Update last sync time on success
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
export const fetchGoogleSheetsData = async () => {
  const config = getGasConfig();
  if (!config.webAppUrl) {
    return { success: false, message: 'กรุณากรอก Google Apps Script Web App URL ก่อน' };
  }

  try {
    const url = `${config.webAppUrl}?action=GET_ALL_DATA&t=${Date.now()}`;
    const response = await fetch(url);
    const data = await response.json();
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
      return { success: true, message: 'เชื่อมต่อ Google Sheets & Google Drive สำเร็จ!' };
    }
    return { success: true, message: 'เชื่อมต่อสำเร็จ' };
  } catch (error) {
    // Some GAS endpoints only respond to POST or might have CORS on GET
    // Let's test with POST
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
