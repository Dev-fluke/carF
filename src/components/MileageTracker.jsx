import React, { useState, useEffect } from 'react';
import { 
  Gauge, 
  Car, 
  Calendar, 
  User, 
  Fuel, 
  MapPin, 
  ArrowRight, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  History, 
  Loader2,
  TrendingUp,
  Plus
} from 'lucide-react';
import { addMileageLog } from '../services/storageService';
import { callGoogleAppsScript } from '../services/googleService';

export const MileageTracker = ({ 
  vehicles = [], 
  mileageLogs = [], 
  selectedVehicleId = null,
  onSuccess 
}) => {
  const [vehicleId, setVehicleId] = useState(selectedVehicleId || (vehicles[0]?.id || ''));
  const currentVehicle = vehicles.find((v) => v.id === vehicleId) || vehicles[0];

  const [driverName, setDriverName] = useState('');
  const [startMileage, setStartMileage] = useState('');
  const [endMileage, setEndMileage] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16).replace('T', ' '));
  const [purpose, setPurpose] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  // Sync initial values when vehicle selection changes
  useEffect(() => {
    if (currentVehicle) {
      setStartMileage(currentVehicle.currentMileage || 0);
      setEndMileage(currentVehicle.currentMileage ? currentVehicle.currentMileage + 50 : 50);
      setDriverName(currentVehicle.assignedDriver || '');
    }
  }, [vehicleId, currentVehicle]);

  // Distance calculation
  const distance = Math.max(0, (Number(endMileage) || 0) - (Number(startMileage) || 0));

  // Service threshold calculation for preview
  const nextServiceKm = currentVehicle?.nextServiceMileage || 
    ((currentVehicle?.lastServiceMileage || 0) + (currentVehicle?.serviceIntervalKm || 10000));
  
  const remainingAfterLog = nextServiceKm - (Number(endMileage) || 0);
  const willBeOverdue = remainingAfterLog <= 0;
  const willBeDueSoon = remainingAfterLog > 0 && remainingAfterLog <= 1000;

  // Filter logs for this vehicle
  const vehicleMileageLogs = mileageLogs.filter(
    (log) => log.vehicleId === vehicleId || log.plate === currentVehicle?.plate
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentVehicle) {
      alert('กรุณาเลือกรถ');
      return;
    }
    if (!endMileage || Number(endMileage) < Number(startMileage)) {
      alert('เลขไมล์สิ้นสุดต้องไม่น้อยกว่าเลขไมล์เริ่มต้น');
      return;
    }
    if (!driverName.trim()) {
      alert('กรุณากรอกชื่อผู้ขับขี่');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ type: 'info', text: 'กำลังบันทึกเลขไมล์ลง Google Sheets...' });

    const newLog = {
      id: `mile-${Date.now()}`,
      vehicleId: currentVehicle.id,
      plate: currentVehicle.plate,
      driverName: driverName.trim(),
      date,
      startMileage: Number(startMileage) || 0,
      endMileage: Number(endMileage) || 0,
      distanceKm: distance,
      purpose: purpose.trim() || 'การเดินทางทั่วไป',
      fuelAddedLiters: Number(fuelLiters) || 0,
      fuelCostBaht: Number(fuelCost) || 0,
      notes: notes.trim()
    };

    try {
      // 1. Save locally
      addMileageLog(newLog);

      // 2. Call Google Apps Script Web App
      const gasResult = await callGoogleAppsScript('UPDATE_MILEAGE', {
        mileageLog: newLog
      });

      setIsSubmitting(false);

      if (gasResult && gasResult.success) {
        setSubmitMessage({
          type: 'success',
          text: 'บันทึกเลขไมล์และอัปเดตลง Google Sheets เรียบร้อยแล้ว!'
        });
      } else {
        setSubmitMessage({
          type: 'success',
          text: 'บันทึกเลขไมล์ในเครื่องเรียบร้อยแล้ว'
        });
      }

      setTimeout(() => {
        if (onSuccess) onSuccess(newLog);
      }, 1000);

    } catch (err) {
      console.error('Mileage save error:', err);
      setIsSubmitting(false);
      setSubmitMessage({
        type: 'error',
        text: 'เกิดข้อผิดพลาดในการบันทึก: ' + err.message
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">บันทึกเลขไมล์ประจำวัน / การเดินทาง</h1>
          <p className="text-xs text-slate-500">บันทึกเลขไมล์เข้า-ออก เพื่อคำนวณระยะทางและรอบเข้าศูนย์บริการ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Mileage Entry Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Vehicle Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                เลือกรถที่ต้องการบันทึก <span className="text-red-500">*</span>
              </label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate} - {v.brand} {v.model} (ไมล์ปัจจุบัน: {Number(v.currentMileage || 0).toLocaleString()} กม.)
                  </option>
                ))}
              </select>
            </div>

            {/* Odometer Inputs */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Start Mileage */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600">
                    เลขไมล์ก่อนเดินทาง (กม.)
                  </label>
                  <input
                    type="number"
                    value={startMileage}
                    onChange={(e) => setStartMileage(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-base text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                {/* End Mileage */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-blue-700">
                    เลขไมล์ล่าสุด / สิ้นสุด (กม.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={endMileage}
                    onChange={(e) => setEndMileage(e.target.value)}
                    className="w-full p-2.5 rounded-lg border-2 border-blue-500 font-mono font-extrabold text-base text-blue-900 bg-blue-50/30 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

              </div>

              {/* Calculated Distance Ribbon */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">ระยะทางที่วิ่งในรอบนี้:</span>
                <span className="text-sm font-extrabold text-emerald-600 font-mono bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  +{distance.toLocaleString()} กม.
                </span>
              </div>
            </div>

            {/* Service Proximity Alert Banner */}
            {willBeOverdue ? (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-xs">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <span className="font-bold block">⚠️ เกินกำหนดเข้าศูนย์เช็คระยะแล้ว!</span>
                  <span>เลขไมล์นี้ ({Number(endMileage).toLocaleString()} กม.) เกินเป้าหมายบริการที่ {nextServiceKm.toLocaleString()} กม. แล้ว</span>
                </div>
              </div>
            ) : willBeDueSoon ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold block">⚠️ ใกล้ถึงรอบเช็คระยะแล้ว</span>
                  <span>เหลือระยะทางอีกเพียง {remainingAfterLog.toLocaleString()} กม. ก่อนถึงรอบเข้าศูนย์</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>สถานะปกติ: เหลือระยะทางอีก {remainingAfterLog.toLocaleString()} กม. ถึงรอบบริการถัดไป</span>
              </div>
            )}

            {/* Driver & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  ผู้ขับขี่ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="ชื่อผู้ขับขี่"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  วันเวลาที่บันทึก <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>

            </div>

            {/* Purpose */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                จุดประสงค์ / เส้นทางการเดินทาง
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="เช่น ขนส่งสินค้าไปสาขาบางนา, วิ่งงานประจำวัน"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            {/* Optional Fuel Logging */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Fuel className="w-4 h-4 text-amber-600" />
                <span>บันทึกการเติมน้ำมัน (ถ้ามี)</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">จำนวนลิตร (Liters)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    placeholder="เช่น 35.5"
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono text-xs bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">ยอดเงิน (บาท)</label>
                  <input
                    type="number"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    placeholder="เช่น 1200"
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono text-xs bg-white outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                หมายเหตุเพิ่มเติม
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="หมายเหตุ..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Status Message */}
            {submitMessage && (
              <div className={`p-3.5 rounded-xl text-xs font-medium ${
                submitMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {submitMessage.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึกข้อมูล...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>บันทึกเลขไมล์ลงระบบ</span>
                </>
              )}
            </button>

          </form>

        </div>

        {/* Right 1 Col: Vehicle Info & Recent Mileage History */}
        <div className="space-y-4">
          
          {/* Vehicle Mini Profile */}
          {currentVehicle && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  {currentVehicle.photoUrl ? (
                    <img src={currentVehicle.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Car className="w-6 h-6 m-auto text-slate-400 mt-3" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{currentVehicle.plate}</h3>
                  <p className="text-xs text-slate-500">{currentVehicle.brand} {currentVehicle.model}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">ไมล์ปัจจุบัน:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {Number(currentVehicle.currentMileage || 0).toLocaleString()} กม.
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">เป้าหมายบริการ:</span>
                  <span className="font-mono font-bold text-blue-600">
                    {Number(nextServiceKm).toLocaleString()} กม.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Recent Mileage Logs for this vehicle */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-600" />
                <h3 className="font-bold text-xs text-slate-800">ประวัติเลขไมล์ของคันนี้</h3>
              </div>
              <span className="text-[11px] text-slate-400">{vehicleMileageLogs.length} รายการ</span>
            </div>

            {vehicleMileageLogs.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                ยังไม่มีประวัติการบันทึกเลขไมล์
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {vehicleMileageLogs.slice(0, 8).map((log) => (
                  <div key={log.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 font-mono">
                        {Number(log.endMileage).toLocaleString()} กม.
                      </span>
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                        +{Number(log.distanceKm || 0).toLocaleString()} กม.
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{log.driverName}</span>
                      <span>{log.date}</span>
                    </div>
                    {log.purpose && (
                      <p className="text-[10px] text-slate-400 truncate">📍 {log.purpose}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
