import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Car, 
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
  X
} from 'lucide-react';
import { MAINTENANCE_TYPES } from '../data/mockData';
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
  const [serviceType, setServiceType] = useState('เปลี่ยนถ่ายน้ำมันเครื่อง & ไส้กรอง (รอบเช็คระยะ)');
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
      serviceDate,
      serviceMileage: Number(serviceMileage) || selectedVehicleForService.currentMileage || 0,
      serviceType,
      serviceCenter: serviceCenter.trim(),
      costBaht: Number(costBaht) || 0,
      invoiceNumber: invoiceNumber.trim(),
      notes: serviceNotes.trim()
    };

    try {
      // 1. Update vehicle status and record service in LocalStorage
      recordVehicleService(selectedVehicleForService.id, serviceData);

      // 2. Call Google Apps Script backend
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

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ระบบแจ้งเตือนและวางแผนซ่อมบำรุง</h1>
          <p className="text-xs text-slate-500">ติดตามระยะทางและกำหนดเวลาเข้าศูนย์บริการเปลี่ยนถ่ายของเหลวและอะไหล่</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด ({vehicles.length})
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
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
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
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
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              filter === 'normal'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ปกติ ({normalCount})</span>
          </button>
        </div>
      </div>

      {/* Maintenance Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredVehicles.length === 0 ? (
          <div className="md:col-span-2 bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-700">ไม่พบรายการที่ตรงกับเงื่อนไข</h3>
            <p className="text-xs text-slate-400 mt-1">รถทุกคันอยู่ในสถานะปกติและพร้อมใช้งาน</p>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => {
            const currentKm = Number(vehicle.currentMileage || 0);
            const lastKm = Number(vehicle.lastServiceMileage || 0);
            const nextKm = Number(vehicle.nextServiceMileage || (lastKm + (vehicle.serviceIntervalKm || 10000)));
            const intervalKm = Number(vehicle.serviceIntervalKm || 10000);

            const remainingKm = nextKm - currentKm;
            const progress = Math.min(100, Math.max(0, Math.round(((currentKm - lastKm) / intervalKm) * 100)));

            const isOverdue = vehicle.status === 'overdue' || remainingKm <= 0;
            const isDueSoon = vehicle.status === 'due_soon' || (remainingKm > 0 && remainingKm <= 1000);

            return (
              <div 
                key={vehicle.id} 
                className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition ${
                  isOverdue 
                    ? 'border-red-300 ring-1 ring-red-200' 
                    : isDueSoon 
                    ? 'border-amber-300' 
                    : 'border-slate-200'
                }`}
              >
                
                {/* Vehicle Header & Photo */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {vehicle.photoUrl ? (
                        <img src={vehicle.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Car className="w-6 h-6 m-auto text-slate-400 mt-3" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900">{vehicle.plate}</span>
                        <span className="text-xs text-slate-500">({vehicle.province})</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{vehicle.brand} {vehicle.model}</p>
                      <p className="text-[11px] text-slate-400">ผู้ขับ: {vehicle.assignedDriver || '-'}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {isOverdue ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>เกินระยะ {Math.abs(remainingKm).toLocaleString()} กม.</span>
                    </span>
                  ) : isDueSoon ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      <Clock className="w-3.5 h-3.5" />
                      <span>เหลือ {remainingKm.toLocaleString()} กม.</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ปกติ (เหลือ {remainingKm.toLocaleString()} กม.)</span>
                    </span>
                  )}
                </div>

                {/* Mileage Progress Bar */}
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">เลขไมล์ปัจจุบัน: <strong className="text-slate-800 font-mono">{currentKm.toLocaleString()}</strong> กม.</span>
                    <span className="text-slate-500">เป้าหมาย: <strong className="text-blue-600 font-mono">{nextKm.toLocaleString()}</strong> กม.</span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverdue ? 'bg-red-500' : isDueSoon ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>เช็คล่าสุดเมื่อ: {vehicle.lastServiceDate || '-'} ({lastKm.toLocaleString()} กม.)</span>
                    <span>รอบทุกๆ {intervalKm.toLocaleString()} กม.</span>
                  </div>
                </div>

                {/* Recommended Service Items for this Cycle */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    รายการซ่อมบำรุงตามระยะที่แนะนำ:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      <Droplet className="w-3 h-3 text-amber-500" />
                      <span>น้ำมันเครื่อง & กรอง</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      <Disc className="w-3 h-3 text-blue-500" />
                      <span>สลับยาง & ถ่วงล้อ</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      <Wind className="w-3 h-3 text-teal-500" />
                      <span>กรองแอร์/อากาศ</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      <ShieldAlert className="w-3 h-3 text-red-500" />
                      <span>ตรวจผ้าเบรก</span>
                    </span>
                  </div>
                </div>

                {/* Action Button: Mark As Serviced */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => handleOpenServiceModal(vehicle)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition active:scale-95"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>บันทึกการเข้าศูนย์เช็คระยะ</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Service Modal */}
      {selectedVehicleForService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">บันทึกการเข้าศูนย์บริการ / เช็คระยะ</h3>
                  <p className="text-xs text-slate-500">
                    รถทะเบียน: <strong className="text-slate-800">{selectedVehicleForService.plate}</strong> ({selectedVehicleForService.brand} {selectedVehicleForService.model})
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseServiceModal}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleServiceSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">วันที่เข้าซ่อมบำรุง</label>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">เลขไมล์ขณะเข้าศูนย์ (กม.)</label>
                  <input
                    type="number"
                    value={serviceMileage}
                    onChange={(e) => setServiceMileage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">รายการที่เข้ารับบริการ</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="เปลี่ยนถ่ายน้ำมันเครื่อง & ไส้กรอง (รอบเช็คระยะ)">เปลี่ยนถ่ายน้ำมันเครื่อง & ไส้กรอง (รอบเช็คระยะ)</option>
                  <option value="สลับยาง ถ่วงล้อ & ตั้งศูนย์">สลับยาง ถ่วงล้อ & ตั้งศูนย์</option>
                  <option value="เปลี่ยนผ้าเบรก & เจียรจานเบรก">เปลี่ยนผ้าเบรก & เจียรจานเบรก</option>
                  <option value="เปลี่ยนแบตเตอรี่ลูกใหม่">เปลี่ยนแบตเตอรี่ลูกใหม่</option>
                  <option value="ซ่อมบำรุงระบบแอร์ / ช่วงล่าง">ซ่อมบำรุงระบบแอร์ / ช่วงล่าง</option>
                  <option value="เช็คระยะรอบใหญ่ (Major Service)">เช็คระยะรอบใหญ่ (Major Service)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">ศูนย์บริการ / อู่</label>
                  <input
                    type="text"
                    value={serviceCenter}
                    onChange={(e) => setServiceCenter(e.target.value)}
                    placeholder="เช่น ศูนย์โตโยต้า, B-Quik, Cockpit"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">ค่าใช้จ่ายรวม (บาท)</label>
                  <input
                    type="number"
                    value={costBaht}
                    onChange={(e) => setCostBaht(e.target.value)}
                    placeholder="เช่น 2850"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono bg-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">เลขที่ใบเสร็จ / ใบแจ้งหนี้</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="เช่น INV-2024-0891"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">หมายเหตุ / อะไหล่ที่เปลี่ยน</label>
                <textarea
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  rows={2}
                  placeholder="รายละเอียดเพิ่มเติม เช่น ใช้น้ำมันเครื่องสังเคราะห์แท้ 0W-20..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl text-blue-900 text-xs border border-blue-100">
                💡 เมื่อบันทึกแล้ว ระบบจะรีเซ็ตสถานะเป็น <strong>"ปกติ"</strong> และตั้งเป้าหมายเช็คระยะรอบถัดไปอัตโนมัติ (+{selectedVehicleForService.serviceIntervalKm || 10000} กม.)
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseServiceModal}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ยืนยันการเช็คระยะ</span>
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
