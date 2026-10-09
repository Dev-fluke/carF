import React from 'react';
import { 
  Car, 
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
  AlertCircle
} from 'lucide-react';

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
  // Calculations
  const totalVehicles = vehicles.length;
  const overdueVehicles = vehicles.filter(v => v.status === 'overdue');
  const dueSoonVehicles = vehicles.filter(v => v.status === 'due_soon');
  const normalVehicles = vehicles.filter(v => v.status === 'normal' || !v.status);

  // Today's inspections
  const todayStr = new Date().toISOString().split('T')[0];
  const todayInspections = inspections.filter(i => (i.inspectionDate || '').startsWith(todayStr));

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ระบบตรวจเช็คสภาพยานพาหนะอัจฉริยะ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            ศูนย์ควบคุมและติดตามสภาพรถยนต์
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            บันทึกการตรวจเช็คสภาพประจำวัน อัปเดตเลขไมล์ และระบบแจ้งเตือนเข้าศูนย์บริการอัตโนมัติ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => onNavigate('inspect')}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition active:scale-95"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>เริ่มตรวจสภาพรถ</span>
          </button>
          <button
            onClick={onOpenQuickMileage}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition active:scale-95"
          >
            <Gauge className="w-4 h-4" />
            <span>กรอกเลขไมล์</span>
          </button>
          <button
            onClick={onOpenAddVehicle}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition"
            title="เพิ่มรถคันใหม่"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">เพิ่มรถ</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Vehicles */}
        <div 
          onClick={() => onNavigate('vehicles')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-500">รถทั้งหมดในระบบ</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalVehicles}</span>
            <span className="text-xs text-slate-500">คัน</span>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium flex items-center gap-1">
            <span>ดูข้อมูลรถทั้งหมด</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Overdue Maintenance */}
        <div 
          onClick={() => onNavigate('maintenance')}
          className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm hover:shadow-md transition cursor-pointer group relative overflow-hidden"
        >
          {overdueVehicles.length > 0 && (
            <div className="absolute top-0 right-0 w-2 h-full bg-red-500" />
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-500">เกินกำหนดซ่อมบำรุง</span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold ${overdueVehicles.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {overdueVehicles.length}
            </span>
            <span className="text-xs text-slate-500">คัน (ต้องตรวจด่วน)</span>
          </div>
          <div className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
            <span>ดูรายการที่ต้องซ่อม</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Due Soon Maintenance */}
        <div 
          onClick={() => onNavigate('maintenance')}
          className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-500">ใกล้ถึงรอบเช็คระยะ</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold ${dueSoonVehicles.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {dueSoonVehicles.length}
            </span>
            <span className="text-xs text-slate-500">คัน (ใน 1,000 กม.)</span>
          </div>
          <div className="mt-2 text-xs text-amber-600 font-medium flex items-center gap-1">
            <span>ดูตารางนัดหมาย</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Ready / Inspected Today */}
        <div 
          onClick={() => onNavigate('history')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-500">ตรวจสภาพวันนี้</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{todayInspections.length}</span>
            <span className="text-xs text-slate-500">ครั้ง (พร้อมใช้ {normalVehicles.length} คัน)</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <span>ดูประวัติตรวจสภาพ</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

      </div>

      {/* Critical Maintenance Alert Banner (If Any Overdue or Due Soon) */}
      {(overdueVehicles.length > 0 || dueSoonVehicles.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5 shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-base font-bold text-amber-900">
                  แจ้งเตือนการบำรุงรักษา: มีรถ {overdueVehicles.length + dueSoonVehicles.length} คัน ถึงกำหนดหรือใกล้ถึงรอบเปลี่ยนถ่ายน้ำมันเครื่อง/เช็คระยะ
                </h3>
                <button
                  onClick={() => onNavigate('maintenance')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-950 underline"
                >
                  <span>จัดการตารางซ่อม</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Badges of affected vehicles */}
              <div className="mt-3 flex flex-wrap gap-2">
                {overdueVehicles.map(v => (
                  <div 
                    key={v.id} 
                    className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-red-200 text-xs shadow-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="font-bold text-slate-800">{v.plate}</span>
                    <span className="text-slate-500 font-light">({v.brand} {v.model})</span>
                    <span className="font-semibold text-red-600">เกิน {Math.abs((v.nextServiceMileage || 0) - (v.currentMileage || 0)).toLocaleString()} กม.</span>
                    <button 
                      onClick={() => onServiceVehicle(v)}
                      className="px-2 py-0.5 rounded bg-red-100 hover:bg-red-200 text-red-700 font-medium text-[11px]"
                    >
                      บันทึกเข้าซ่อม
                    </button>
                  </div>
                ))}
                {dueSoonVehicles.map(v => (
                  <div 
                    key={v.id} 
                    className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-200 text-xs shadow-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="font-bold text-slate-800">{v.plate}</span>
                    <span className="text-slate-500 font-light">({v.brand} {v.model})</span>
                    <span className="font-semibold text-amber-700">เหลืออีก {(v.nextServiceMileage - v.currentMileage).toLocaleString()} กม.</span>
                    <button 
                      onClick={() => onServiceVehicle(v)}
                      className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium text-[11px]"
                    >
                      เช็คระยะ
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Vehicles Cards & Recent Inspection Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Vehicles Quick Status Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-slate-700" />
              <h2 className="text-lg font-bold text-slate-900">สถานะยานพาหนะและระยะทาง</h2>
            </div>
            <button
              onClick={() => onNavigate('vehicles')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>ดูทั้งหมด ({vehicles.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vehicles.map((v) => {
              const currentKm = v.currentMileage || 0;
              const nextKm = v.nextServiceMileage || ((v.lastServiceMileage || 0) + (v.serviceIntervalKm || 10000));
              const lastKm = v.lastServiceMileage || 0;
              const progress = Math.min(100, Math.max(0, Math.round(((currentKm - lastKm) / (nextKm - lastKm || 10000)) * 100)));
              
              let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              let badgeText = 'สภาพปกติ';
              if (v.status === 'overdue') {
                badgeColor = 'bg-red-50 text-red-700 border-red-200 animate-pulse';
                badgeText = 'เกินระยะเช็ค';
              } else if (v.status === 'due_soon') {
                badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                badgeText = 'ใกล้ถึงรอบเช็ค';
              }

              return (
                <div 
                  key={v.id} 
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header with Photo & Plate */}
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                        {v.photoUrl ? (
                          <img 
                            src={v.photoUrl} 
                            alt={v.plate} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400';
                            }}
                          />
                        ) : (
                          <Car className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-extrabold text-base text-slate-900 truncate">{v.plate}</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                            {badgeText}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate">{v.brand} {v.model}</p>
                        <p className="text-[11px] text-slate-400 truncate">{v.type} • {v.assignedDriver || 'ไม่มีคนขับประจำ'}</p>
                      </div>
                    </div>

                    {/* Mileage & Progress */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5 text-slate-400" />
                          <span>เลขไมล์ปัจจุบัน:</span>
                        </span>
                        <span className="font-bold text-slate-800 font-mono text-sm">
                          {Number(v.currentMileage || 0).toLocaleString()} <span className="text-[10px] font-normal text-slate-500">กม.</span>
                        </span>
                      </div>

                      {/* Maintenance progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>รอบบริการ: {Number(nextKm).toLocaleString()} กม.</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              v.status === 'overdue' ? 'bg-red-500' : v.status === 'due_soon' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => onInspectVehicle(v)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition flex items-center justify-center gap-1"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      <span>ตรวจสภาพ</span>
                    </button>
                    <button
                      onClick={() => onOpenQuickMileage(v)}
                      className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1"
                      title="อัปเดตเลขไมล์"
                    >
                      <Gauge className="w-3.5 h-3.5" />
                      <span>ลงไมล์</span>
                    </button>
                    <button
                      onClick={() => onServiceVehicle(v)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                      title="บันทึกการเช็คระยะ"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Recent Inspections & Activity Log */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-slate-700" />
              <h2 className="text-lg font-bold text-slate-900">ประวัติตรวจสภาพล่าสุด</h2>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>ดูทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            {inspections.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                <ClipboardCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <span>ยังไม่มีประวัติการตรวจสภาพรถ</span>
              </div>
            ) : (
              inspections.slice(0, 5).map((insp) => {
                let statusBadge = {
                  color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  icon: CheckCircle2,
                  text: 'ผ่านสมบูรณ์'
                };
                if (insp.overallResult === 'WARNING') {
                  statusBadge = {
                    color: 'bg-amber-50 text-amber-700 border-amber-200',
                    icon: AlertCircle,
                    text: 'มีจุดควรซ่อม'
                  };
                } else if (insp.overallResult === 'FAIL') {
                  statusBadge = {
                    color: 'bg-red-50 text-red-700 border-red-200',
                    icon: AlertTriangle,
                    text: 'ไม่ผ่าน'
                  };
                }
                const StatusIcon = statusBadge.icon;

                return (
                  <div 
                    key={insp.id}
                    onClick={() => onNavigate('history')}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{insp.plate}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusBadge.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusBadge.text}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>ผู้ตรวจ: {insp.inspectorName}</span>
                      <span className="font-mono">{Number(insp.mileage || 0).toLocaleString()} กม.</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>{insp.inspectionDate}</span>
                      {insp.defectPhotos && insp.defectPhotos.length > 0 && (
                        <span className="text-blue-600 font-medium">📷 มีรูปจุดชำรุด ({insp.defectPhotos.length})</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Mileage Log Mini Card */}
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm">บันทึกเลขไมล์วันนี้แล้วหรือยัง?</h3>
            </div>
            <p className="text-xs text-slate-300">
              การอัปเดตเลขไมล์สม่ำเสมอจะช่วยให้ระบบแจ้งเตือนเข้าศูนย์บริการได้แม่นยำ ป้องกันเครื่องยนต์เสียหาย
            </p>
            <button
              onClick={onOpenQuickMileage}
              className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-sm"
            >
              + บันทึกเลขไมล์ทันที
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
