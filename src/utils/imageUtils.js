/**
 * Image compression and Google Drive direct URL utilities
 */

/**
 * Resizes and compresses an image File or Blob to a lightweight base64 JPEG
 * (Typically reduces 5-15 MB mobile photos down to 60-120 KB)
 */
export const compressImage = (file, maxWidth = 1000, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');

    // If already a base64 string
    if (typeof file === 'string') {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const img = new Image();
      img.src = dataUrl;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };

      img.onerror = () => {
        // Fallback to original data URL if image decoding fails
        resolve(dataUrl);
      };
    };

    reader.onerror = (error) => reject(error);
  });
};

/**
 * Converts Google Drive sharing / view URLs to direct CDN embed URLs
 * Handles:
 * - https://drive.google.com/uc?export=view&id=FILE_ID
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 */
export const getDirectImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';

  // Already a base64 data URL or blob URL
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) {
    return url;
  }

  // Check if it's a Google Drive link
  if (url.includes('drive.google.com')) {
    // Extract file ID
    let fileId = null;
    const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      fileId = idParamMatch[1];
    } else {
      const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (dMatch && dMatch[1]) {
        fileId = dMatch[1];
      }
    }

    if (fileId) {
      // Direct high-resolution thumbnail CDN that works across all origins
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
  }

  return url;
};

/**
 * Ensures date string is strictly in YYYY-MM-DD for HTML5 <input type="date">
 */
export const formatDateForInput = (val) => {
  if (!val) return '';
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  } catch (e) {}

  return str.slice(0, 10);
};

/**
 * Formats date for Thai user interface display (e.g. 15 พ.ค. 2568)
 */
export const formatThaiDate = (val) => {
  if (!val) return '-';
  const clean = formatDateForInput(val);
  if (!clean || !/^\d{4}-\d{2}-\d{2}$/.test(clean)) return String(val).slice(0, 10);

  const [yearStr, monthStr, dayStr] = clean.split('-');
  const year = parseInt(yearStr, 10) + 543; // Buddhist Era
  const months = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const monthIdx = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  return `${day} ${months[monthIdx] || ''} ${year}`;
};
