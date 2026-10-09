import React, { useState } from 'react';
import { 
  Car, 
  Bike,
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Gauge, 
  ClipboardCheck, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Plus, 
  Wrench,
  Calendar,
  AlertCircle,
  Fuel,
  Sparkles,
  FileText,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { VehicleIcon, getVehicleTypeBadge } from './VehicleIcon';
import { isMotorcycleType } from '../data/mockData';

export const Dashboard = ({ 
  vehicles = [], 
  inspections = [], 
  mileageLogs = [], 
  onNavigate, 
  onOpenQuickMileage,
  onOpenAddVehicle,
  onInspectVehicle,
  onServiceVehicle
}) => {
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(0);

  // If no vehicles yet, show a beautiful welcoming empty state
  if (vehicles.length === 0) {
    return (
      <div className="max-w-md mx-auto space-y-5 py-8 text-center pb-24 md:pb-8">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-5">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
            <Car className="w-10 h-10" />
          </div>
          
          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-slate-900">
              ยินดีต้อนรับสู่ My Garage 🚗🏍️
            </h2>
            <p className="text-xs text-slate-500">
              เริ่มต้นใช้งานสมุดบันทึกดูแลรักษารถยนต์และมอเตอร์ไซค์ส่วนตัว เพิ่มรถคันแรกของคุณได้เลยครับ
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={onOpenAddVehicle}
              className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มรถคันแรก (รถยนต์ / มอเตอร์ไซค์)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeVehicle = vehicles[selectedVehicleIndex] || vehicles[0];
  const isBike = activeVehicle ? isMotorcycleType(activeVehicle.type) : false;
  const currentKm = Number(activeVehicle?.currentMileage || activeVehicle?.mileage || 0);
  const intervalKm = Number(activeVehicle?.serviceIntervalKm || (isBike ? 4000 : 10000));
  const nextKm = Number(activeVehicle?.nextServiceMileage || (currentKm + intervalKm));
  const lastKm = Number(activeVehicle?.lastServiceMileage || Math.max(0, nextKm - intervalKm));
  const remainingKm = nextKm - currentKm;
  const progress = Math.min(100, Math.max(0, ((currentKm - lastKm) / intervalKm) * 100));

  let taxDaysLeft = null;
  if (activeVehicle?.taxDueDate) {
    try {
      const today = new Date();
      const dueDate = new Date(activeVehicle.taxDueDate);
      if (!isNaN(dueDate.getTime())) {
        const diffTime = dueDate - today;
        taxDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    } catch (e) {
      taxDaysLeft = null;
    }
  }

  const overdueVehicles = vehicles.filter(v => v.status === 'overdue');
  const dueSoonVehicles = vehicles.filter(v => v.status === 'due_soon');

  const activeVehicleInspections = (inspections || []).filter(
    i => i.vehicleId === activeVehicle?.id || i.plate === activeVehicle?.plate
  );
  const lastInspection = activeVehicleInspections[0];

  // Recent Mileage Logs
  const activeMileageLogs = (mileageLogs || []).filter(
    m => m.vehicleId === activeVehicle?.id || m.plate === activeVehicle?.plate
  );

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      
      {/* Garage Vehicle Switcher Tabs (Mobile & Desktop) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            โรงรถของฉัน ({vehicles.length} คัน)
          </span>
          <button
            onClick={onOpenAddVehicle}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มคันใหม่</span>
          </button>
        </div>

        {/* Scrollable Vehicle Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
          {vehicles.map((v, idx) => {
            const isSelected = idx === selectedVehicleIndex;
            const isVBike = isMotorcycleType(v.type);
            const hasAlert = v.status === 'overdue' || v.status === 'due_soon';

            return (
              <button
                key={v.id}
                onClick={() => setSelectedVehicleIndex(idx)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-102'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`p-1 rounded-lg ${isSelected ? 'bg-slate-800 text-blue-400' : 'bg-slate-100 text-slate-600'}`}>
                  {isVBike ? <Bike className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                </div>
                <div className="text-left">
                  <div className="leading-tight">{v.nickname || v.plate}</div>
                  <div className={`text-[10px] font-normal ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {v.brand} {v.model}
                  </div>
                </div>

                {hasAlert && (
                  <span className={`w-2 h-2 rounded-full ${v.status === 'overdue' ? 'bg-red-500 animate-ping' : 'bg-amber-500'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Vehicle Spotlight Card (Mobile-Optimized Hero) */}
      {activeVehicle && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          
          {/* Top Banner with Image & Identity */}
          <div className="relative aspect-[16/8] sm:aspect-[21/9] w-full bg-slate-900 overflow-hidden">
            {activeVehicle.photoUrl ? (
              <img 
                src={activeVehicle.photoUrl} 
                alt={activeVehicle.plate} 
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-800">
                <VehicleIcon type={activeVehicle.type} className="w-16 h-16 opacity-40 mb-1" />
                <span className="text-xs">ยังไม่มีรูปภาพ</span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Badges on Top */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md bg-white/95 ${
                activeVehicle.status === 'overdue'
                  ? 'text-red-700 bg-red-50/95 border-red-200 animate-pulse'
                  : activeVehicle.status === 'due_soon'
                  ? 'text-amber-700 bg-amber-50/95 border-amber-200'
                  : 'text-emerald-700 bg-emerald-50/95 border-emerald-200'
              }`}>
                {activeVehicle.status === 'overdue' ? '⚠️ เกินระยะเปลี่ยนถ่าย' : activeVehicle.status === 'due_soon' ? '⏳ ใกล้ถึงรอบเช็ค' : '✓ สภาพปกติ'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md bg-white/90 text-slate-800">
                {isBike ? '🏍️ มอเตอร์ไซค์' : '🚗 รถยนต์'}
              </span>
            </div>

            {/* Bottom Info on Image */}
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight">
                    {activeVehicle.nickname || `${activeVehicle.brand} ${activeVehicle.model}`}
                  </h2>
                  <p className="text-xs text-slate-300">
                    ทะเบียน <strong className="text-white font-mono">{activeVehicle.plate}</strong> ({activeVehicle.province}) • {activeVehicle.fuelType}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-300 block">เลขไมล์ปัจจุบัน</span>
                  <span className="text-lg sm:text-xl font-mono font-extrabold text-blue-300">
                    {currentKm.toLocaleString()} <span className="text-xs font-normal">กม.</span>
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Maintenance Progress & Tax Cards */}
          <div className="p-4 sm:p-5 pt-0 space-y-4">
            
            {/* Oil Change / Service Interval Countdown Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-blue-600" />
                  <span>รอบเปลี่ยนถ่ายน้ำมันเครื่อง & เช็คระยะ</span>
                </span>
                <span className={`font-mono font-bold ${remainingKm <= 0 ? 'text-red-600' : remainingKm <= 1000 ? 'text-amber-600' : 'text-slate-700'}`}>
                  {remainingKm <= 0 
                    ? `เกินกำหนดแล้ว ${Math.abs(remainingKm).toLocaleString()} กม.` 
                    : `เหลืออีก ${remainingKm.toLocaleString()} กม.`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    activeVehicle.status === 'overdue' ? 'bg-red-500' : activeVehicle.status === 'due_soon' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>เปลี่ยนล่าสุด: {lastKm.toLocaleString()} กม.</span>
                <span>เป้าหมาย: {nextKm.toLocaleString()} กม. (ทุก {intervalKm.toLocaleString()} กม.)</span>
              </div>
            </div>

            {/* Quick Metrics: Tax/Insurance + Last Inspection Score */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              
              {/* Tax & Insurance Badge */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>ภาษีประจำปี & พ.ร.บ.</span>
                </div>
                <div className="font-extrabold text-slate-900 text-sm">
                  {taxDaysLeft !== null ? (
                    taxDaysLeft <= 0 ? (
                      <span className="text-red-600">หมดอายุแล้ว!</span>
                    ) : taxDaysLeft <= 30 ? (
                      <span className="text-amber-600">เหลืออีก {taxDaysLeft} วัน</span>
                    ) : (
                      <span className="text-emerald-700">เหลืออีก {taxDaysLeft} วัน</span>
                    )
                  ) : (
                    <span>กำหนด: มี.ค. 2568</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block">
                  {activeVehicle.taxDueDate ? `ครบกำหนด ${activeVehicle.taxDueDate}` : 'พร้อมต่อภาษีประจำปี'}
                </span>
              </div>

              {/* Last Inspection Score */}
              <div 
                onClick={() => onNavigate('history')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 cursor-pointer hover:bg-slate-100 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <ClipboardCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span>ตรวจสภาพล่าสุด</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </div>
                <div className="font-extrabold text-slate-900 text-sm">
                  {lastInspection ? (
                    <span className={lastInspection.overallResult === 'PASS' ? 'text-emerald-600' : 'text-amber-600'}>
                      {lastInspection.overallResult === 'PASS' ? '✓ ผ่านสมบูรณ์' : '⚠️ มีจุดควรซ่อม'}
                    </span>
                  ) : (
                    <span className="text-slate-500">ยังไม่เคยตรวจ</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block truncate">
                  {lastInspection ? `${String(lastInspection.inspectionDate || '').slice(0, 10)} (ผ่าน ${lastInspection.passedCount || 0} ข้อ)` : 'แตะเพื่อเริ่มตรวจ'}
                </span>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Quick Action Button Grid (Large Touch Targets for Mobile) */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          เมนูด่วนสำหรับคันนี้
        </span>

        <div className="grid grid-cols-2 gap-3">
          
          {/* 1. Inspect */}
          <button
            onClick={() => onInspectVehicle(activeVehicle)}
            className="p-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white shadow-lg shadow-blue-600/20 text-left transition flex flex-col justify-between h-28"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">ตรวจสภาพรถ</div>
              <div className="text-[11px] text-blue-100 mt-0.5">
                {isBike ? 'เช็คโซ่ ยาง เบรก ไฟ' : 'เช็คของเหลว ยาง ไฟ แอร์'}
              </div>
            </div>
          </button>

          {/* 2. Fuel & Mileage */}
          <button
            onClick={() => onOpenQuickMileage(activeVehicle)}
            className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white shadow-lg shadow-emerald-600/20 text-left transition flex flex-col justify-between h-28"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Fuel className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">เติมน้ำมัน / ลงไมล์</div>
              <div className="text-[11px] text-emerald-100 mt-0.5">
                บันทึกเลขไมล์ & ค่าน้ำมัน
              </div>
            </div>
          </button>

          {/* 3. Service Log */}
          <button
            onClick={() => onServiceVehicle(activeVehicle)}
            className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white shadow-md text-left transition flex flex-col justify-between h-28"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">บันทึกเข้าศูนย์</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                เปลี่ยนถ่ายของเหลว / ค่าซ่อม
              </div>
            </div>
          </button>

          {/* 4. My Garage Details */}
          <button
            onClick={() => onNavigate('vehicles')}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 active:scale-98 text-slate-800 text-left transition flex flex-col justify-between h-28 shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-blue-600">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">จัดการข้อมูลรถ</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                ดูรถทั้งหมดในบ้าน ({vehicles.length} คัน)
              </div>
            </div>
          </button>

        </div>
      </div>

      {/* Critical Reminders Section (If any vehicle is overdue or due soon) */}
      {(overdueVehicles.length > 0 || dueSoonVehicles.length > 0) && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>รายการที่ต้องดูแลเป็นพิเศษ:</span>
          </div>

          <div className="space-y-2">
            {overdueVehicles.map(v => (
              <div 
                key={v.id} 
                onClick={() => onServiceVehicle(v)}
                className="p-3 bg-white rounded-xl border border-red-200 shadow-2xs flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                  <div className="truncate">
                    <span className="font-bold text-xs text-slate-900">{v.nickname || v.plate}</span>
                    <p className="text-[11px] text-red-600 font-medium">
                      เกินระยะถ่ายน้ำมันเครื่อง {Math.abs((v.nextServiceMileage || 0) - (v.currentMileage || 0)).toLocaleString()} กม.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg shrink-0">
                  บันทึกเข้าซ่อม
                </span>
              </div>
            ))}
            {dueSoonVehicles.map(v => (
              <div 
                key={v.id}
                onClick={() => onServiceVehicle(v)}
                className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                  <div className="truncate">
                    <span className="font-bold text-xs text-slate-900">{v.nickname || v.plate}</span>
                    <p className="text-[11px] text-amber-700">
                      เหลืออีก {(v.nextServiceMileage - v.currentMileage).toLocaleString()} กม. ถึงรอบเช็ค
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                  เช็คระยะ
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Trips & Fuel History for this Vehicle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            ประวัติการใช้งาน & เติมน้ำมันล่าสุด
          </span>
          <button
            onClick={() => onNavigate('mileage')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            ดูทั้งหมด
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          {activeMileageLogs.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              <Fuel className="w-8 h-8 mx-auto mb-1 opacity-30" />
              <span>ยังไม่มีประวัติการบันทึกเลขไมล์/เติมน้ำมัน</span>
            </div>
          ) : (
            activeMileageLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">
                    {Number(log.endMileage).toLocaleString()} กม.
                  </span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                    +{Number(log.distanceKm || 0).toLocaleString()} กม.
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{log.purpose || 'การเดินทางทั่วไป'}</span>
                  <span>{log.date ? String(log.date).replace('T', ' ').slice(0, 16) : ''}</span>
                </div>
                {log.fuelCostBaht > 0 && (
                  <div className="text-[10px] text-amber-700 font-medium">
                    ⛽ เติมน้ำมัน: {log.fuelAddedLiters} ลิตร ({log.fuelCostBaht} บาท)
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
