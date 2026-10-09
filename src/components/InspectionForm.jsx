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
  Car, 
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
  HelpCircle
} from 'lucide-react';
import { INSPECTION_CATEGORIES } from '../data/mockData';
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
  const [inspectorName, setInspectorName] = useState('สมชาย ใจดี');
  const [inspectionDate, setInspectionDate] = useState(
    new Date().toISOString().slice(0, 16).replace('T', ' ')
  );
  
  // Selected Vehicle Object
  const currentVehicle = vehicles.find((v) => v.id === vehicleId) || vehicles[0];
  
  const [mileage, setMileage] = useState(currentVehicle ? currentVehicle.currentMileage : '');
  const [notes, setNotes] = useState('');
  
  // Checklist State: { [itemId]: 'pass' | 'warning' | 'fail' | 'na' }
  const [checklist, setChecklist] = useState({});
  const [defectPhotos, setDefectPhotos] = useState([]); // Array of base64 strings or URLs
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  // Initialize checklist to all 'pass' on mount
  useEffect(() => {
    if (currentVehicle) {
      setMileage(currentVehicle.currentMileage || '');
    }
  }, [vehicleId, vehicles]);

  useEffect(() => {
    // Default all items to 'pass'
    const initialChecklist = {};
    INSPECTION_CATEGORIES.forEach((cat) => {
      cat.items.forEach((item) => {
        initialChecklist[item.id] = 'pass';
      });
    });
    setChecklist(initialChecklist);
  }, []);

  const handleItemStatusChange = (itemId, status) => {
    setChecklist((prev) => ({
      ...prev,
      [itemId]: status
    }));
  };

  const handleMarkAllPass = () => {
    const updated = {};
    INSPECTION_CATEGORIES.forEach((cat) => {
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
    if (!vehicleId) {
      alert('กรุณาเลือกรถที่ต้องการตรวจเช็ค');
      return;
    }
    if (!inspectorName.trim()) {
      alert('กรุณากรอกชื่อผู้ตรวจเช็ค');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ type: 'info', text: 'กำลังบันทึกข้อมูลและอัปโหลดรูปภาพไปยัง Google Drive & Sheets...' });

    const newInspection = {
      id: `insp-${Date.now()}`,
      vehicleId: currentVehicle.id,
      plate: currentVehicle.plate,
      vehicleBrandModel: `${currentVehicle.brand} ${currentVehicle.model}`,
      inspectorName: inspectorName.trim(),
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
      // 1. Save locally
      addInspection(newInspection);

      // 2. Push to Google Apps Script (Google Sheets & Drive)
      const gasResult = await callGoogleAppsScript('ADD_INSPECTION', {
        inspection: newInspection
      });

      setIsSubmitting(false);

      if (gasResult && gasResult.success) {
        setSubmitMessage({
          type: 'success',
          text: 'บันทึกสำเร็จ! อัปโหลดข้อมูลและรูปลง Google Sheets & Google Drive เรียบร้อยแล้ว'
        });
      } else {
        setSubmitMessage({
          type: 'success',
          text: 'บันทึกข้อมูลในเครื่องเรียบร้อยแล้ว ' + (gasResult.isDemo ? '(โหมดทดสอบ)' : '')
        });
      }

      setTimeout(() => {
        if (onSuccess) onSuccess(newInspection);
      }, 1200);

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
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Form Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">แบบฟอร์มตรวจเช็คสภาพรถยนต์</h2>
              <p className="text-xs text-slate-500">บันทึกผลการตรวจสอบสภาพความพร้อมใช้งานก่อนออกปฏิบัติงาน</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleMarkAllPass}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>ผ่านทั้งหมด (Mark All Pass)</span>
          </button>
        </div>

        {/* Vehicle Selection & Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Select Vehicle */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              เลือกรถที่ตรวจสภาพ <span className="text-red-500">*</span>
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate} - {v.brand} {v.model} ({v.type})
                </option>
              ))}
            </select>
          </div>

          {/* Current Mileage */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              เลขไมล์ขณะตรวจ (กม.) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="เช่น 48500"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono font-bold text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <Gauge className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Inspector Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              ผู้ตรวจเช็ค <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                placeholder="ชื่อ-นามสกุล"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

        </div>

        {/* Selected Vehicle Summary Card */}
        {currentVehicle && (
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-10 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                {currentVehicle.photoUrl ? (
                  <img src={currentVehicle.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Car className="w-6 h-6 m-auto text-slate-400" />
                )}
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm">{currentVehicle.plate}</span>
                <span className="text-slate-500 ml-2">({currentVehicle.province})</span>
                <p className="text-slate-500">{currentVehicle.brand} {currentVehicle.model} • สี{currentVehicle.color}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px]">เป้าหมายเช็คระยะ:</span>
                <span className="font-bold font-mono text-slate-800">
                  {Number(currentVehicle.nextServiceMileage || 0).toLocaleString()} กม.
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">คนขับประจำ:</span>
                <span className="font-medium text-slate-700">{currentVehicle.assignedDriver || '-'}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Checklist Sections */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {INSPECTION_CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICONS[category.icon] || ClipboardCheck;

          return (
            <div key={category.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              {/* Category Header */}
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{category.name}</h3>
              </div>

              {/* Category Items */}
              <div className="divide-y divide-slate-100">
                {category.items.map((item) => {
                  const currentStatus = checklist[item.id] || 'pass';

                  return (
                    <div 
                      key={item.id} 
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>

                      {/* Status Toggle Buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        {/* PASS */}
                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(item.id, 'pass')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                            currentStatus === 'pass'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ปกติ</span>
                        </button>

                        {/* WARNING / REPAIR */}
                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(item.id, 'warning')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                            currentStatus === 'warning'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>ควรซ่อม</span>
                        </button>

                        {/* FAIL */}
                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(item.id, 'fail')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                            currentStatus === 'fail'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>ชำรุด</span>
                        </button>

                        {/* NA */}
                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(item.id, 'na')}
                          className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                            currentStatus === 'na'
                              ? 'bg-slate-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-400'
                          }`}
                          title="ไม่ได้ตรวจ / ไม่มีในรถ"
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Defect Photos & Drive Upload Section */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-slate-900 text-base">แนบรูปภาพจุดชำรุด / สภาพรถ (ส่งขึ้น Google Drive)</h3>
            </div>
            <span className="text-xs text-slate-500">({defectPhotos.length} รูป)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {defectPhotos.map((photo, index) => (
              <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                <img src={photo} alt={`Defect ${index}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600/90 hover:bg-red-700 text-white transition shadow-sm opacity-90 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Upload Button */}
            <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl aspect-video flex flex-col items-center justify-center p-4 cursor-pointer text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 transition">
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-xs font-semibold text-center">ถ่ายรูป / อัปโหลด</span>
              <span className="text-[10px] text-slate-400">JPG, PNG</span>
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

        {/* Overall Notes and Evaluation */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">สรุปผลการตรวจและความคิดเห็นเพิ่มเติม</h3>
          
          <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">ผลประเมินอัตโนมัติ:</span>
            <span className={`font-bold px-3 py-1 rounded-full border ${
              overallResult === 'PASS'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : overallResult === 'WARNING'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-red-100 text-red-800 border-red-300'
            }`}>
              {overallResult === 'PASS' && '✓ ผ่านเกณฑ์ปกติ พร้อมใช้งาน'}
              {overallResult === 'WARNING' && '⚠ มีรายการที่ควรนำเข้าซ่อม'}
              {overallResult === 'FAIL' && '✕ ชำรุด ไม่แนะนำให้นำไปใช้งาน'}
            </span>
            <div className="flex items-center gap-2 text-slate-500 ml-auto">
              <span className="text-emerald-600 font-semibold">ปกติ {passedCount}</span>
              <span>•</span>
              <span className="text-amber-600 font-semibold">ควรซ่อม {warningCount}</span>
              <span>•</span>
              <span className="text-red-600 font-semibold">ชำรุด {failedCount}</span>
            </div>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="ระบุข้อสังเกตเพิ่มเติม เช่น เสียงดังที่ล้อหน้าขวา, แอร์เริ่มไม่ค่อยเย็น..."
            className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Status Feedback banner */}
        {submitMessage && (
          <div className={`p-4 rounded-xl text-sm font-medium ${
            submitMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : submitMessage.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {submitMessage.text}
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition"
            >
              ยกเลิก
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังบันทึกและส่งข้อมูล...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>บันทึกผลการตรวจเช็คสภาพรถ</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
