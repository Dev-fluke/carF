import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Car, 
  Bike,
  Gauge, 
  Calendar, 
  Plus, 
  Filter, 
  Droplet, 
  Disc, 
  Wind, 
  Zap, 
  ShieldAlert, 
  FileText,
  DollarSign,
  Loader2,
  X,
  Cog,
  ShieldCheck
} from 'lucide-react';
import { isMotorcycleType } from '../data/mockData';
import { VehicleIcon, getVehicleTypeBadge } from './VehicleIcon';
import { recordVehicleService } from '../services/storageService';
import { callGoogleAppsScript } from '../services/googleService';

export const MaintenanceAlerts = ({ 
  vehicles = [], 
  onServiceCompleted,
  initialSelectedVehicle = null
}) => {
  const [filter, setFilter] = useState('all'); // all | overdue | due_soon | normal
  const [selectedVehicleForService, setSelectedVehicleForService] = useState(initialSelectedVehicle);

  // Service Modal Form States
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceMileage, setServiceMileage] = useState('');
  const [serviceType, setServiceType] = useState('เปลี่ยนถ่ายน้ำมันเครื่อง & ไส้กรอง');
  const [serviceCenter, setServiceCenter] = useState('ศูนย์บริการมาตรฐาน');
  const [costBaht, setCostBaht] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered vehicles
  const filteredVehicles = vehicles.filter((v) => {
    if (filter === 'overdue') return v.status === 'overdue';
    if (filter === 'due_soon') return v.status === 'due_soon';
    if (filter === 'normal') return v.status === 'normal' || !v.status;
    return true;
  });

  const overdueCount = vehicles.filter(v => v.status === 'overdue').length;
  const dueSoonCount = vehicles.filter(v => v.status === 'due_soon').length;
  const normalCount = vehicles.filter(v => v.status === 'normal' || !v.status).length;

  const handleOpenServiceModal = (vehicle) => {
    setSelectedVehicleForService(vehicle);
    setServiceMileage(vehicle.currentMileage || '');
    if (isMotorcycleType(vehicle.type)) {
      setServiceType('เปลี่ยนถ่ายน้ำมันเครื่อง & น้ำมันเฟืองท้าย');
      setServiceCenter('ศูนย์บริการฮอนด้า/ยามาฮ่า/อู่ทั่วไป');
    } else {
      setServiceType('เปลี่ยนถ่ายน้ำมันเครื่อง & ไส้กรอง');
      setServiceCenter('ศูนย์บริการมาตรฐาน / B-Quik');
    }
  };

  const handleCloseServiceModal = () => {
    setSelectedVehicleForService(null);
    setCostBaht('');
    setInvoiceNumber('');
    setServiceNotes('');
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicleForService) return;

    setIsSubmitting(true);

    const serviceData = {
      id: `maint-${Date.now()}`,
      vehicleId: selectedVehicleForService.id,
      plate: selectedVehicleForService.plate,
      vehicleNickname: selectedVehicleForService.nickname || selectedVehicleForService.plate,
      vehicleType: selectedVehicleForService.type,
      serviceDate,
      serviceMileage: Number(serviceMileage) || selectedVehicleForService.currentMileage || 0,
      serviceType,
      serviceCenter: serviceCenter.trim(),
      costBaht: Number(costBaht) || 0,
      invoiceNumber: invoiceNumber.trim(),
      notes: serviceNotes.trim()
    };

    try {
      recordVehicleService(selectedVehicleForService.id, serviceData);

      await callGoogleAppsScript('RECORD_MAINTENANCE', {
        maintenance: serviceData
      });

      setIsSubmitting(false);
      handleCloseServiceModal();

      if (onServiceCompleted) {
        onServiceCompleted(serviceData);
      }
    } catch (err) {
      console.error('Service save error:', err);
      setIsSubmitting(false);
      alert('บันทึกผิดพลาด: ' + err.message);
    }
  };

  const isModalVehicleBike = selectedVehicleForService ? isMotorcycleType(selectedVehicleForService.type) : false;

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20 md:pb-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">แจ้งเตือนดูแลรถ & เข้าศูนย์</h1>
        <p className="text-xs text-slate-500">ติดตามรอบเปลี่ยนถ่ายน้ำมันเครื่อง วันต่อภาษี พ.ร.บ. และประวัติค่าใช้จ่าย</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-2xl text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl transition shrink-0 ${
            filter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ทั้งหมด ({vehicles.length})
        </button>
        <button
          onClick={() => setFilter('overdue')}
          className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0 ${
            filter === 'overdue'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-red-700 hover:bg-red-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>เกินกำหนด ({overdueCount})</span>
        </button>
        <button
          onClick={() => setFilter('due_soon')}
          className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0 ${
            filter === 'due_soon'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-amber-800 hover:bg-amber-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>ใกล้ถึงรอบ ({dueSoonCount})</span>
        </button>
        <button
          onClick={() => setFilter('normal')}
          className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0 ${
            filter === 'normal'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>ปกติ ({normalCount})</span>
        </button>
      </div>

      {/* Vehicles Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVehicles.length === 0 ? (
          <div className="md:col-span-2 bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-700">รถทุกคันอยู่ในสถานะปกติ</h3>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => {
            const isBike = isMotorcycleType(vehicle.type);
            const currentKm = Number(vehicle.currentMileage || 0);
            const lastKm = Number(vehicle.lastServiceMileage || 0);
            const intervalKm = Number(vehicle.serviceIntervalKm || (isBike ? 4000 : 10000));
            const nextKm = Number(vehicle.nextServiceMileage || (lastKm + intervalKm));

            const remainingKm = nextKm - currentKm;
            const progress = Math.min(100, Math.max(0, Math.round(((currentKm - lastKm) / intervalKm) * 100)));

            const isOverdue = vehicle.status === 'overdue' || remainingKm <= 0;
            const isDueSoon = vehicle.status === 'due_soon' || (remainingKm > 0 && remainingKm <= 1000);

            // Calculate Tax Days Left
            let taxDays = null;
            if (vehicle.taxDueDate) {
              const today = new Date();
              const d = new Date(vehicle.taxDueDate);
              taxDays = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
            }

            return (
              <div 
                key={vehicle.id} 
                className={`bg-white rounded-3xl border p-4 sm:p-5 shadow-sm space-y-3.5 transition ${
                  isOverdue 
                    ? 'border-red-300 ring-1 ring-red-200' 
                    : isDueSoon 
                    ? 'border-amber-300' 
                    : 'border-slate-200'
                }`}
              >
                {/* Vehicle Title & Photo */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                      {vehicle.photoUrl ? (
                        <img src={vehicle.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <VehicleIcon type={vehicle.type} className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                        {vehicle.nickname || vehicle.plate}
                      </h3>
                      <p className="text-xs text-blue-600 font-bold">{vehicle.plate} • <span className="text-slate-400 font-normal">{vehicle.brand} {vehicle.model}</span></p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {isOverdue ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                      <span>เกินระยะ {Math.abs(remainingKm).toLocaleString()} กม.</span>
                    </span>
                  ) : isDueSoon ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      <Clock className="w-3 h-3" />
                      <span>เหลือ {remainingKm.toLocaleString()} กม.</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>ปกติ</span>
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">ถ่ายน้ำมันเครื่องรอบถัดไป:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {nextKm.toLocaleString()} กม.
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverdue ? 'bg-red-500' : isDueSoon ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>ไมล์ปัจจุบัน: {currentKm.toLocaleString()} กม.</span>
                    <span>{remainingKm <= 0 ? 'ควรเข้าเปลี่ยนถ่ายทันที' : `เหลืออีก ${remainingKm.toLocaleString()} กม.`}</span>
                  </div>
                </div>

                {/* Tax / Act / Insurance Reminder */}
                {vehicle.taxDueDate && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 border border-slate-100">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span>วันต่อภาษี/พ.ร.บ.</span>
                    </span>
                    <span className="font-bold text-slate-800">
                      {vehicle.taxDueDate} {taxDays !== null && `(อีก ${taxDays} วัน)`}
                    </span>
                  </div>
                )}

                {/* Action Button: Log service */}
                <div className="pt-1 flex items-center justify-end">
                  <button
                    onClick={() => handleOpenServiceModal(vehicle)}
                    className="w-full py-2.5 px-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>บันทึกการเปลี่ยนถ่าย / เข้าศูนย์</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Service Modal */}
      {selectedVehicleForService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-2xl ${isModalVehicleBike ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                  {isModalVehicleBike ? <Bike className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">บันทึกการเข้าศูนย์ / เปลี่ยนถ่าย</h3>
                  <p className="text-xs text-slate-500">
                    {selectedVehicleForService.nickname || selectedVehicleForService.plate} ({selectedVehicleForService.plate})
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseServiceModal}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleServiceSubmit} className="space-y-3.5">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">วันที่เข้าทำ</label>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">เลขไมล์ขณะทำ (กม.)</label>
                  <input
                    type="number"
                    value={serviceMileage}
                    onChange={(e) => setServiceMileage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">รายการที่ทำ</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white outline-none truncate"
                >
                  {isModalVehicleBike ? (
                    <>
                      <option value="เปลี่ยนถ่ายน้ำมันเครื่อง & น้ำมันเฟืองท้าย">เปลี่ยนถ่ายน้ำมันเครื่อง & น้ำมันเฟืองท้าย</option>
                      <option value="ตั้ง/หยอดโซ่-สเตอร์ หรือเปลี่ยนชุดโซ่">ตั้ง/หยอดโซ่-สเตอร์ หรือเปลี่ยนชุดโซ่</option>
                      <option value="เปลี่ยนสายพานขับ CVT และเม็ดตุ้มถ่วง">เปลี่ยนสายพานขับ CVT และเม็ดตุ้มถ่วง</option>
                      <option value="เปลี่ยนหัวเทียน & ไส้กรองอากาศ">เปลี่ยนหัวเทียน & ไส้กรองอากาศ</option>
                      <option value="เปลี่ยนผ้าเบรกหน้า-หลัง">เปลี่ยนผ้าเบรกหน้า-หลัง</option>
                      <option value="เปลี่ยนยางนอก-ยางใน">เปลี่ยนยางนอก-ยางใน</option>
                      <option value="ต่อภาษี พ.ร.บ. ประจำปี">ต่อภาษี พ.ร.บ. ประจำปี</option>
                      <option value="เช็คระยะรอบใหญ่ (Major Service)">เช็คระยะรอบใหญ่ (Major Service)</option>
                    </>
                  ) : (
                    <>
                      <option value="เปลี่ยนถ่ายน้ำมันเครื่อง & ไส้กรอง">เปลี่ยนถ่ายน้ำมันเครื่อง & ไส้กรอง</option>
                      <option value="สลับยาง ถ่วงล้อ & ตั้งศูนย์">สลับยาง ถ่วงล้อ & ตั้งศูนย์</option>
                      <option value="เปลี่ยนผ้าเบรก & เจียรจาน">เปลี่ยนผ้าเบรก & เจียรจาน</option>
                      <option value="เปลี่ยนแบตเตอรี่ใหม่">เปลี่ยนแบตเตอรี่ใหม่</option>
                      <option value="ต่อภาษี พ.ร.บ. & ประกันภัย">ต่อภาษี พ.ร.บ. & ประกันภัย</option>
                      <option value="ล้างแอร์ / ซ่อมบำรุงทั่วไป">ล้างแอร์ / ซ่อมบำรุงทั่วไป</option>
                      <option value="เช็คระยะรอบใหญ่ (Major Service)">เช็คระยะรอบใหญ่ (Major Service)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">อู่ / ศูนย์บริการ</label>
                  <input
                    type="text"
                    value={serviceCenter}
                    onChange={(e) => setServiceCenter(e.target.value)}
                    placeholder="เช่น ศูนย์โตโยต้า, B-Quik, อู่ประจำ"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">ค่าใช้จ่าย (บาท)</label>
                  <input
                    type="number"
                    value={costBaht}
                    onChange={(e) => setCostBaht(e.target.value)}
                    placeholder={isModalVehicleBike ? "เช่น 350" : "เช่น 2400"}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">โน้ตช่วยจำ / อะไหล่ที่เปลี่ยน</label>
                <textarea
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  rows={2}
                  placeholder="เช่น ใช้น้ำมันเครื่อง 0W-20 สังเคราะห์แท้..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseServiceModal}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>บันทึกการเช็คระยะ</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
