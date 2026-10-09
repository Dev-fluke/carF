import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  MinusCircle, 
  Camera, 
  Upload, 
  Trash2, 
  Gauge, 
  User, 
  Calendar, 
  Sparkles, 
  Save, 
  Loader2, 
  FileText,
  Droplets,
  Disc,
  SunMedium,
  ShieldAlert,
  Bike,
  Car
} from 'lucide-react';
import { 
  getInspectionCategories, 
  isMotorcycleType,
  CAR_INSPECTION_CATEGORIES,
  MOTORCYCLE_INSPECTION_CATEGORIES 
} from '../data/mockData';
import { VehicleIcon } from './VehicleIcon';
import { fileToBase64, callGoogleAppsScript } from '../services/googleService';
import { addInspection } from '../services/storageService';

const CATEGORY_ICONS = {
  Droplets: Droplets,
  Disc: Disc,
  SunMedium: SunMedium,
  Gauge: Gauge,
  ShieldAlert: ShieldAlert
};

export const InspectionForm = ({ 
  vehicles = [], 
  selectedVehicleId = null, 
  onSuccess,
  onCancel
}) => {
  const [vehicleId, setVehicleId] = useState(selectedVehicleId || (vehicles[0]?.id || ''));
  const [inspectorName, setInspectorName] = useState('เจ้าของรถ (ฉันเอง)');
  const [inspectionDate, setInspectionDate] = useState(
    new Date().toISOString().slice(0, 16).replace('T', ' ')
  );
  
  const currentVehicle = vehicles.find((v) => v.id === vehicleId) || vehicles[0];
  const isBike = currentVehicle ? isMotorcycleType(currentVehicle.type) : false;
  const categories = currentVehicle ? getInspectionCategories(currentVehicle.type) : CAR_INSPECTION_CATEGORIES;

  const [mileage, setMileage] = useState(currentVehicle ? currentVehicle.currentMileage : '');
  const [notes, setNotes] = useState('');
  
  // Checklist State: { [itemId]: 'pass' | 'warning' | 'fail' | 'na' }
  const [checklist, setChecklist] = useState({});
  const [defectPhotos, setDefectPhotos] = useState([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  // Sync mileage & checklist whenever selected vehicle changes
  useEffect(() => {
    if (currentVehicle) {
      setMileage(currentVehicle.currentMileage || '');
      
      const targetCategories = getInspectionCategories(currentVehicle.type);
      const initialChecklist = {};
      targetCategories.forEach((cat) => {
        cat.items.forEach((item) => {
          initialChecklist[item.id] = 'pass';
        });
      });
      setChecklist(initialChecklist);
    }
  }, [vehicleId, vehicles]);

  const handleItemStatusChange = (itemId, status) => {
    setChecklist((prev) => ({
      ...prev,
      [itemId]: status
    }));
  };

  const handleMarkAllPass = () => {
    const updated = {};
    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        updated[item.id] = 'pass';
      });
    });
    setChecklist(updated);
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
      try {
        const base64 = await fileToBase64(file);
        setDefectPhotos((prev) => [...prev, base64]);
      } catch (err) {
        console.error('Error reading photo:', err);
      }
    }
  };

  const removePhoto = (index) => {
    setDefectPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Compute counts
  let passedCount = 0;
  let warningCount = 0;
  let failedCount = 0;
  let naCount = 0;

  Object.values(checklist).forEach((val) => {
    if (val === 'pass') passedCount++;
    else if (val === 'warning') warningCount++;
    else if (val === 'fail') failedCount++;
    else if (val === 'na') naCount++;
  });

  let overallResult = 'PASS';
  if (failedCount > 0) {
    overallResult = 'FAIL';
  } else if (warningCount > 0) {
    overallResult = 'WARNING';
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleId || !currentVehicle) {
      alert('กรุณาเลือกรถที่ต้องการตรวจเช็ค');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ type: 'info', text: 'กำลังบันทึกข้อมูลและอัปโหลดรูปภาพไปยัง Google Drive & Sheets...' });

    const newInspection = {
      id: `insp-${Date.now()}`,
      vehicleId: currentVehicle.id,
      plate: currentVehicle.plate,
      vehicleNickname: currentVehicle.nickname || currentVehicle.plate,
      vehicleType: currentVehicle.type,
      vehicleBrandModel: `${currentVehicle.brand} ${currentVehicle.model}`,
      inspectorName: inspectorName.trim() || 'เจ้าของรถ',
      inspectionDate: inspectionDate,
      mileage: Number(mileage) || currentVehicle.currentMileage || 0,
      overallResult,
      passedCount,
      warningCount,
      failedCount,
      notes: notes.trim(),
      defectPhotos,
      items: checklist
    };

    try {
      addInspection(newInspection);

      const gasResult = await callGoogleAppsScript('ADD_INSPECTION', {
        inspection: newInspection
      });

      setIsSubmitting(false);

      setSubmitMessage({
        type: 'success',
        text: 'บันทึกผลการตรวจเช็คสภาพรถเรียบร้อยแล้ว!'
      });

      setTimeout(() => {
        if (onSuccess) onSuccess(newInspection);
      }, 1000);

    } catch (err) {
      console.error('Inspection save error:', err);
      setIsSubmitting(false);
      setSubmitMessage({
        type: 'error',
        text: 'เกิดข้อผิดพลาดในการบันทึก: ' + err.message
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20 md:pb-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-2xl ${isBike ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">ตรวจเช็คความพร้อมของรถ</h2>
              <p className="text-[11px] text-slate-500">
                {isBike ? '🏍️ หมวดตรวจ: รถจักรยานยนต์ส่วนตัว' : '🚗 หมวดตรวจ: รถยนต์ส่วนตัว'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleMarkAllPass}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>ผ่านหมด</span>
          </button>
        </div>

        {/* Vehicle Selector Dropdown */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-600">
            เลือกรถที่จะตรวจสภาพ:
          </label>
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-slate-900 font-extrabold text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {vehicles.map((v) => {
              const isItemBike = isMotorcycleType(v.type);
              return (
                <option key={v.id} value={v.id}>
                  {isItemBike ? '🏍️' : '🚗'} {v.nickname || v.plate} - {v.brand} {v.model} ({v.plate})
                </option>
              );
            })}
          </select>
        </div>

        {/* Current Mileage on Inspection */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-600">
              เลขไมล์ขณะตรวจ (กม.)
            </label>
            <div className="relative">
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="เช่น 22400"
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-mono font-bold text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <Gauge className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-600">
              วันเวลาที่ตรวจ
            </label>
            <input
              type="text"
              value={inspectionDate}
              onChange={(e) => setInspectionDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs bg-white outline-none"
            />
          </div>
        </div>

      </div>

      {/* Checklist Sections */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {categories.map((category) => {
          const Icon = CATEGORY_ICONS[category.icon] || ClipboardCheck;

          return (
            <div key={category.id} className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
              {/* Category Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className={`p-1.5 rounded-lg ${isBike ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{category.name}</h3>
              </div>

              {/* Category Items */}
              <div className="divide-y divide-slate-100">
                {category.items.map((item) => {
                  const currentStatus = checklist[item.id] || 'pass';

                  return (
                    <div 
                      key={item.id} 
                      className="py-3 flex flex-col gap-2"
                    >
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-slate-800">{item.name}</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                      </div>

                      {/* Touch-Friendly Status Toggle Buttons (Mobile Full Width Grid) */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1">
                        {/* PASS */}
                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(item.id, 'pass')}
                          className={`py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition active:scale-95 ${
                            currentStatus === 'pass'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ปกติ</span>
                        </button>

                        {/* WARNING */}
                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(item.id, 'warning')}
                          className={`py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition active:scale-95 ${
                            currentStatus === 'warning'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>ควรดู</span>
                        </button>

                        {/* FAIL */}
                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(item.id, 'fail')}
                          className={`py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition active:scale-95 ${
                            currentStatus === 'fail'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>ชำรุด</span>
                        </button>

                        {/* NA */}
                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(item.id, 'na')}
                          className={`py-2 px-1 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition active:scale-95 ${
                            currentStatus === 'na'
                              ? 'bg-slate-700 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <span>ข้าม</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Defect Photos */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-slate-700" />
              <h3 className="font-extrabold text-slate-900 text-sm">ถ่ายรูปตำหนิ / สภาพรถ</h3>
            </div>
            <span className="text-[11px] text-slate-400">({defectPhotos.length} รูป)</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {defectPhotos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <img src={photo} alt={`Defect ${index}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white shadow-sm"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Upload Button */}
            <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl aspect-square flex flex-col items-center justify-center p-2 cursor-pointer text-slate-500 hover:text-blue-600 transition active:scale-95">
              <Camera className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold text-center">ถ่ายรูป/แนบรูป</span>
              <input
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Overall Notes */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm">โน้ตช่วยจำ / สิ่งที่ต้องทำ</h3>
          
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">ผลการตรวจ:</span>
            <span className={`font-bold px-2.5 py-0.5 rounded-full ${
              overallResult === 'PASS'
                ? 'bg-emerald-100 text-emerald-800'
                : overallResult === 'WARNING'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {overallResult === 'PASS' && '✓ ผ่านเกณฑ์ พร้อมใช้งาน'}
              {overallResult === 'WARNING' && '⚠️ มีจุดที่ควรสังเกต/ซ่อม'}
              {overallResult === 'FAIL' && '❌ มีจุดชำรุด'}
            </span>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder={isBike ? "โน้ตเพิ่มเติม เช่น อาทิตย์หน้าต้องหยอดน้ำมันโซ่..." : "โน้ตเพิ่มเติม เช่น ต้องเช็คลมยางเพิ่ม..."}
            className="w-full p-3 rounded-2xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Feedback Message */}
        {submitMessage && (
          <div className={`p-3.5 rounded-2xl text-xs font-bold ${
            submitMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {submitMessage.text}
          </div>
        )}

        {/* Submit Actions */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>บันทึกผลการตรวจเช็ค</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
