import React, { useState, useEffect } from 'react';
import { 
  Gauge, 
  Car, 
  Bike,
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
  Plus,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { isMotorcycleType } from '../data/mockData';
import { VehicleIcon } from './VehicleIcon';
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
  const isBike = currentVehicle ? isMotorcycleType(currentVehicle.type) : false;

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
      setEndMileage(currentVehicle.currentMileage ? currentVehicle.currentMileage + 30 : 30);
    }
  }, [vehicleId, currentVehicle]);

  // Distance calculation
  const distance = Math.max(0, (Number(endMileage) || 0) - (Number(startMileage) || 0));

  // Fuel consumption calculation (km / L and Baht / km)
  const litersNum = Number(fuelLiters) || 0;
  const costNum = Number(fuelCost) || 0;
  const kmPerLiter = litersNum > 0 && distance > 0 ? (distance / litersNum).toFixed(1) : null;
  const bahtPerKm = distance > 0 && costNum > 0 ? (costNum / distance).toFixed(2) : null;

  // Next service calculation
  const nextServiceKm = currentVehicle?.nextServiceMileage || 
    ((currentVehicle?.lastServiceMileage || 0) + (currentVehicle?.serviceIntervalKm || (isBike ? 4000 : 10000)));
  const remainingAfterLog = nextServiceKm - (Number(endMileage) || 0);

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
      alert('เลขไมล์ล่าสุดต้องไม่น้อยกว่าเลขไมล์เริ่มต้น');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ type: 'info', text: 'กำลังบันทึกเลขไมล์ลง Google Sheets...' });

    const newLog = {
      id: `mile-${Date.now()}`,
      vehicleId: currentVehicle.id,
      plate: currentVehicle.plate,
      vehicleNickname: currentVehicle.nickname || currentVehicle.plate,
      vehicleType: currentVehicle.type,
      driverName: 'เจ้าของรถ',
      date,
      startMileage: Number(startMileage) || 0,
      endMileage: Number(endMileage) || 0,
      distanceKm: distance,
      purpose: purpose.trim() || 'การเดินทางประจำวัน',
      fuelAddedLiters: litersNum,
      fuelCostBaht: costNum,
      kmPerLiter: kmPerLiter,
      notes: notes.trim()
    };

    try {
      addMileageLog(newLog);

      const gasResult = await callGoogleAppsScript('UPDATE_MILEAGE', {
        mileageLog: newLog
      });

      setIsSubmitting(false);
      setSubmitMessage({
        type: 'success',
        text: 'บันทึกเลขไมล์และเติมน้ำมันเรียบร้อยแล้ว!'
      });

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
    <div className="max-w-2xl mx-auto space-y-4 pb-20 md:pb-6">
      
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">บันทึกเลขไมล์ & เติมน้ำมัน</h1>
        <p className="text-xs text-slate-500">ติดตามระยะทาง ค่าน้ำมัน และอัตราสิ้นเปลืองส่วนตัว</p>
      </div>

      {/* Main Entry Form Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Vehicle Selection */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              เลือกรถที่ต้องการบันทึก:
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
                    {isItemBike ? '🏍️' : '🚗'} {v.nickname || v.plate} (ไมล์ล่าสุด: {Number(v.currentMileage || 0).toLocaleString()} กม.)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Odometer Inputs */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="grid grid-cols-2 gap-3">
              
              {/* Start Mileage */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-600">
                  ไมล์ก่อนเดินทาง (กม.)
                </label>
                <input
                  type="number"
                  value={startMileage}
                  onChange={(e) => setStartMileage(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono font-bold text-sm text-slate-700 bg-white outline-none"
                  required
                />
              </div>

              {/* End Mileage */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-blue-700">
                  ไมล์ล่าสุด (กม.) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={endMileage}
                  onChange={(e) => setEndMileage(e.target.value)}
                  className="w-full p-2 rounded-xl border-2 border-blue-500 font-mono font-extrabold text-base text-blue-900 bg-blue-50/50 outline-none"
                  required
                />
              </div>

            </div>

            {/* Calculated Distance */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">ระยะทางที่วิ่งรอบนี้:</span>
              <span className="font-extrabold text-emerald-700 font-mono bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                +{distance.toLocaleString()} กม.
              </span>
            </div>
          </div>

          {/* Optional Fuel Logging */}
          <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Fuel className="w-4 h-4 text-amber-600" />
              <span>บันทึกการเติมน้ำมัน (ถ้ามีเติมในรอบนี้)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">จำนวนลิตร (L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={fuelLiters}
                  onChange={(e) => setFuelLiters(e.target.value)}
                  placeholder={isBike ? "เช่น 3.5" : "เช่น 35"}
                  className="w-full p-2 rounded-xl border border-amber-200 font-mono font-bold text-xs bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">ยอดเงิน (บาท)</label>
                <input
                  type="number"
                  value={fuelCost}
                  onChange={(e) => setFuelCost(e.target.value)}
                  placeholder={isBike ? "เช่น 120" : "เช่น 1200"}
                  className="w-full p-2 rounded-xl border border-amber-200 font-mono font-bold text-xs bg-white outline-none"
                />
              </div>
            </div>

            {/* Auto Economy Calculation if filled */}
            {kmPerLiter && (
              <div className="pt-1.5 flex items-center justify-between text-[11px] text-amber-900 font-bold bg-white p-2 rounded-xl border border-amber-200">
                <span>อัตราสิ้นเปลือง: <strong>{kmPerLiter} กม./ลิตร</strong></span>
                {bahtPerKm && <span>เฉลี่ย: <strong>{bahtPerKm} บาท/กม.</strong></span>}
              </div>
            )}
          </div>

          {/* Trip Details & Purpose */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              บันทึกเส้นทาง / โน้ตการเดินทาง
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="เช่น ขับไปทำงาน, ไปเที่ยวชลบุรี, ขี่ซื้อของ"
              className="w-full p-2.5 rounded-2xl border border-slate-300 text-xs text-slate-900 bg-white outline-none"
            />
          </div>

          {/* Status Message */}
          {submitMessage && (
            <div className={`p-3 rounded-2xl text-xs font-bold ${
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
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>บันทึกไมล์ & ค่าน้ำมัน</span>
              </>
            )}
          </button>

        </form>

      </div>

      {/* Recent History Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            ประวัติการบันทึกของคันนี้ ({vehicleMileageLogs.length} รายการ)
          </span>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-2.5">
          {vehicleMileageLogs.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              ยังไม่มีประวัติการบันทึก
            </div>
          ) : (
            vehicleMileageLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-slate-900 text-sm">
                    {Number(log.endMileage).toLocaleString()} กม.
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg text-[11px]">
                    +{Number(log.distanceKm || 0).toLocaleString()} กม.
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>📍 {log.purpose || 'การเดินทางทั่วไป'}</span>
                  <span>{log.date}</span>
                </div>
                {log.fuelCostBaht > 0 && (
                  <div className="text-[10px] text-amber-800 font-semibold pt-0.5">
                    ⛽ เติม {log.fuelAddedLiters}L • {log.fuelCostBaht} บาท
                    {log.kmPerLiter && ` (${log.kmPerLiter} กม./ลิตร)`}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
