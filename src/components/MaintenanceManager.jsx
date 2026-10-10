import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Gauge, 
  Calendar, 
  DollarSign, 
  FileText, 
  Sparkles, 
  Check, 
  X, 
  Droplet, 
  Wind, 
  Disc, 
  Zap, 
  Cog, 
  Fuel, 
  ShieldCheck, 
  Car, 
  Bike, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { isMotorcycleType } from '../data/mockData';
import { 
  getCustomMaintenanceItems, 
  addOrUpdateCustomMaintenanceItem, 
  deleteCustomMaintenanceItem, 
  recordCustomMaintenanceDone,
  DEFAULT_CAR_MAINTENANCE_TEMPLATES,
  DEFAULT_BIKE_MAINTENANCE_TEMPLATES,
  updateVehicleMileage
} from '../services/storageService';
import { formatThaiDate } from '../utils/imageUtils';

export const MaintenanceManager = ({ 
  vehicles = [], 
  initialVehicleId = null,
  onVehicleUpdated
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState(() => {
    return initialVehicleId || (vehicles[0]?.id || null);
  });

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all'); // all | overdue | due_soon | normal

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states for Add / Edit
  const [itemName, setItemName] = useState('');
  const [lastMileage, setLastMileage] = useState('');
  const [intervalKm, setIntervalKm] = useState('10000');
  const [lastDate, setLastDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Mark Done Modal state
  const [markingDoneItem, setMarkingDoneItem] = useState(null);
  const [doneMileage, setDoneMileage] = useState('');
  const [doneDate, setDoneDate] = useState(new Date().toISOString().split('T')[0]);
  const [doneCost, setDoneCost] = useState('');
  const [doneNotes, setDoneNotes] = useState('');

  // Active Vehicle
  const activeVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];
  const isBike = activeVehicle ? isMotorcycleType(activeVehicle.type) : false;
  const currentVehicleKm = Number(activeVehicle?.currentMileage || 0);

  // Load items whenever vehicle changes
  const loadItems = () => {
    if (!activeVehicle) {
      setItems([]);
      return;
    }
    let loaded = getCustomMaintenanceItems(activeVehicle.id);

    // If user has no items for this vehicle yet, auto-populate initial defaults
    if (loaded.length === 0) {
      const templates = isBike ? DEFAULT_BIKE_MAINTENANCE_TEMPLATES : DEFAULT_CAR_MAINTENANCE_TEMPLATES;
      const initialItems = templates.map((t, idx) => {
        const lastKm = Math.max(0, currentVehicleKm - (t.intervalKm / 2));
        return {
          id: `c-maint-${Date.now()}-${idx}`,
          vehicleId: activeVehicle.id,
          name: t.name,
          category: t.category,
          lastMileage: lastKm,
          intervalKm: t.intervalKm,
          nextMileage: lastKm + t.intervalKm,
          lastDoneDate: new Date().toISOString().split('T')[0],
          notes: 'เพิ่มตามค่าเริ่มต้นมาตรฐาน'
        };
      });
      initialItems.forEach(it => addOrUpdateCustomMaintenanceItem(it));
      loaded = getCustomMaintenanceItems(activeVehicle.id);
    }

    setItems(loaded);
  };

  useEffect(() => {
    if (activeVehicle) {
      loadItems();
    }
  }, [selectedVehicleId, activeVehicle?.id]);

  // Compute status for an item
  const getItemStatus = (item) => {
    const nextTarget = Number(item.nextMileage || (item.lastMileage + item.intervalKm));
    const remainingKm = nextTarget - currentVehicleKm;
    if (remainingKm <= 0) return { status: 'overdue', label: 'เกินกำหนดแล้ว', remainingKm, color: 'text-red-600 bg-red-50 border-red-200' };
    if (remainingKm <= 1000) return { status: 'due_soon', label: 'ใกล้ถึงกำหนด', remainingKm, color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { status: 'normal', label: 'ปกติ', remainingKm, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  // Helper icon
  const getItemIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('น้ำมัน') || n.includes('oil')) return <Droplet className="w-4 h-4 text-amber-500" />;
    if (n.includes('กรอง') || n.includes('filter') || n.includes('อากาศ')) return <Wind className="w-4 h-4 text-sky-500" />;
    if (n.includes('เบรก') || n.includes('brake') || n.includes('ยาง')) return <Disc className="w-4 h-4 text-rose-500" />;
    if (n.includes('หัวเทียน') || n.includes('แบต')) return <Zap className="w-4 h-4 text-yellow-500" />;
    if (n.includes('โซ่') || n.includes('สายพาน') || n.includes('เกียร์')) return <Cog className="w-4 h-4 text-indigo-500" />;
    return <Wrench className="w-4 h-4 text-blue-500" />;
  };

  // Open Add Modal
  const handleOpenAddModal = (presetTemplate = null) => {
    setEditingItem(null);
    if (presetTemplate) {
      setItemName(presetTemplate.name);
      setIntervalKm(String(presetTemplate.intervalKm));
      setLastMileage(String(currentVehicleKm));
    } else {
      setItemName('');
      setIntervalKm(isBike ? '4000' : '10000');
      setLastMileage(String(currentVehicleKm));
    }
    setLastDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setLastMileage(String(item.lastMileage));
    setIntervalKm(String(item.intervalKm));
    setLastDate(item.lastDoneDate || new Date().toISOString().split('T')[0]);
    setNotes(item.notes || '');
    setIsFormModalOpen(true);
  };

  // Save Add / Edit
  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!itemName.trim() || !activeVehicle) return;

    const parsedLast = Number(lastMileage) || 0;
    const parsedInterval = Number(intervalKm) || 10000;

    const itemData = {
      id: editingItem ? editingItem.id : undefined,
      vehicleId: activeVehicle.id,
      name: itemName.trim(),
      lastMileage: parsedLast,
      intervalKm: parsedInterval,
      nextMileage: parsedLast + parsedInterval,
      lastDoneDate: lastDate,
      notes: notes.trim()
    };

    addOrUpdateCustomMaintenanceItem(itemData);
    setIsFormModalOpen(false);
    loadItems();
  };

  // Delete Item
  const handleDeleteItem = (itemId, title) => {
    if (window.confirm(`ต้องการลบรายการ "${title}" ใช่หรือไม่?`)) {
      deleteCustomMaintenanceItem(itemId);
      loadItems();
    }
  };

  // Open Mark Done Modal
  const handleOpenMarkDoneModal = (item) => {
    setMarkingDoneItem(item);
    setDoneMileage(String(currentVehicleKm || item.nextMileage));
    setDoneDate(new Date().toISOString().split('T')[0]);
    setDoneCost('');
    setDoneNotes('');
  };

  // Save Mark Done
  const handleSaveMarkDone = (e) => {
    e.preventDefault();
    if (!markingDoneItem) return;

    const parsedMileage = Number(doneMileage) || currentVehicleKm;
    recordCustomMaintenanceDone(markingDoneItem.id, {
      mileage: parsedMileage,
      date: doneDate,
      costBaht: Number(doneCost) || 0,
      notes: doneNotes.trim()
    });

    // If doneMileage is higher than current mileage, update vehicle current mileage as well!
    if (parsedMileage > currentVehicleKm && activeVehicle) {
      updateVehicleMileage(activeVehicle.id, parsedMileage, 'บันทึกซ่อมบำรุง');
      if (onVehicleUpdated) onVehicleUpdated();
    }

    setMarkingDoneItem(null);
    loadItems();
  };

  // Calculated next mileage for Form Preview
  const previewNextMileage = (Number(lastMileage) || 0) + (Number(intervalKm) || 0);

  // Filter items
  const filteredItems = items.filter(it => {
    const st = getItemStatus(it);
    if (filter === 'overdue') return st.status === 'overdue';
    if (filter === 'due_soon') return st.status === 'due_soon';
    if (filter === 'normal') return st.status === 'normal';
    return true;
  });

  const overdueCount = items.filter(it => getItemStatus(it).status === 'overdue').length;
  const dueSoonCount = items.filter(it => getItemStatus(it).status === 'due_soon').length;

  if (vehicles.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 text-center text-slate-500">
        <Car className="w-12 h-12 mx-auto mb-2 text-slate-300" />
        <p className="font-bold text-slate-700">ยังไม่มีข้อมูลรถในระบบ</p>
        <p className="text-xs text-slate-400 mt-1">กรุณาเพิ่มรถยนต์หรือมอเตอร์ไซค์ก่อนเพื่อจัดการรายการซ่อม</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 md:pb-8 max-w-4xl mx-auto">
      
      {/* Header & Vehicle Selector */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
                รายการซ่อมบำรุง & กำหนดรอบเปลี่ยน
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              กำหนดระยะทางและคำนวณรอบเปลี่ยนอะไหล่-ของเหลวอัตโนมัติ สำหรับรถแต่ละคัน
            </p>
          </div>

          <button
            onClick={() => handleOpenAddModal()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มรายการซ่อมบำรุงเอง</span>
          </button>
        </div>

        {/* Vehicle Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
          {vehicles.map((v) => {
            const isSelected = v.id === activeVehicle?.id;
            const isVBike = isMotorcycleType(v.type);
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVehicleId(v.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-102'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isVBike ? <Bike className="w-3.5 h-3.5 text-blue-400" /> : <Car className="w-3.5 h-3.5 text-blue-400" />}
                <span>{v.nickname || v.plate}</span>
                <span className="text-[10px] opacity-75 font-mono">({Number(v.currentMileage || 0).toLocaleString()} กม.)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Vehicle Status Bar */}
      {activeVehicle && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">รถปัจจุบัน:</span>
              <span className="font-extrabold text-sm sm:text-base text-white">
                {activeVehicle.nickname || `${activeVehicle.brand} ${activeVehicle.model}`}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/10 text-blue-300 border border-white/10">
                {activeVehicle.plate}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-300 block">ไมล์ปัจจุบัน</span>
              <span className="font-mono font-extrabold text-blue-400 text-base sm:text-lg">
                {currentVehicleKm.toLocaleString()} <span className="text-xs font-normal text-slate-300">กม.</span>
              </span>
            </div>
          </div>

          {/* Quick status summary filter pills */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-700/60 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition shrink-0 ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              ทั้งหมด ({items.length})
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition shrink-0 flex items-center gap-1 ${
                filter === 'overdue' ? 'bg-red-500 text-white' : 'bg-red-950/40 text-red-300 hover:bg-red-900/60'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>เกินกำหนด ({overdueCount})</span>
            </button>
            <button
              onClick={() => setFilter('due_soon')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition shrink-0 flex items-center gap-1 ${
                filter === 'due_soon' ? 'bg-amber-500 text-slate-950' : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>ใกล้ถึงรอบ ({dueSoonCount})</span>
            </button>
            <button
              onClick={() => setFilter('normal')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition shrink-0 ${
                filter === 'normal' ? 'bg-emerald-600 text-white' : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60'
              }`}
            >
              ปกติ ({items.length - overdueCount - dueSoonCount})
            </button>
          </div>
        </div>
      )}

      {/* Item List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-3">
            <Wrench className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">ไม่พบรายการซ่อมบำรุงในหมวดนี้</p>
            <p className="text-xs text-slate-400">
              กดปุ่มด้านล่างเพื่อเพิ่มรายการซ่อมที่ต้องการดูแล เช่น น้ำมันเครื่อง, กรองอากาศ, กรองโซล่า ฯลฯ
            </p>
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md transition"
            >
              + เพิ่มรายการซ่อมบำรุง
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const statusInfo = getItemStatus(item);
            const nextTarget = Number(item.nextMileage || (item.lastMileage + item.intervalKm));
            const interval = Number(item.intervalKm) || 10000;
            const lastKm = Number(item.lastMileage) || 0;
            
            // Progress percentage
            const progress = Math.min(100, Math.max(0, ((currentVehicleKm - lastKm) / interval) * 100));

            return (
              <div 
                key={item.id} 
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3.5"
              >
                {/* Top Row: Title, Icon, Status Badge & Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      {getItemIcon(item.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                          {item.name}
                        </h3>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.lastDoneDate ? `เปลี่ยนล่าสุด: ${formatThaiDate(item.lastDoneDate)}` : 'ยังไม่มีประวัติวันเปลี่ยน'}
                        {item.lastCostBaht ? ` • ฿${item.lastCostBaht.toLocaleString()}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Edit & Delete Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                      title="แก้ไขรายการ"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id, item.name)}
                      className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                      title="ลบรายการ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 3 Metric Columns: ไมล์ที่ก่อนเปลี่ยน | ระยะไมล์ถ่าย | ถึงระยะไมล์ที่ต้องถ่าย (ระบบคำนวนให้) */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                  <div className="border-r border-slate-200/70 pr-1">
                    <span className="text-[10px] text-slate-400 block font-medium">ไมล์ก่อนเปลี่ยน</span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-slate-700">
                      {lastKm.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-400 block">กม.</span>
                  </div>

                  <div className="border-r border-slate-200/70 pr-1">
                    <span className="text-[10px] text-slate-400 block font-medium">ระยะทางรอบถ่าย</span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-blue-600">
                      +{interval.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-400 block">กม.</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">ถึงระยะที่ต้องถ่าย</span>
                    <span className="font-mono font-extrabold text-xs sm:text-sm text-slate-900">
                      {nextTarget.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-blue-600 font-bold block">(ระบบคำนวณ)</span>
                  </div>
                </div>

                {/* Progress Bar & Countdown */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      ไมล์รถปัจจุบัน: <strong className="font-mono text-slate-800">{currentVehicleKm.toLocaleString()} กม.</strong>
                    </span>
                    <span className={`font-mono font-bold ${
                      statusInfo.remainingKm <= 0 ? 'text-red-600' : statusInfo.remainingKm <= 1000 ? 'text-amber-600' : 'text-emerald-700'
                    }`}>
                      {statusInfo.remainingKm <= 0 
                        ? `⚠️ เกินแล้ว ${Math.abs(statusInfo.remainingKm).toLocaleString()} กม.` 
                        : `เหลืออีก ${statusInfo.remainingKm.toLocaleString()} กม.`}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        statusInfo.status === 'overdue' ? 'bg-red-500' : statusInfo.status === 'due_soon' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Mark Done Action Bar */}
                <div className="pt-1 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400 truncate">
                    {item.notes ? `หมายเหตุ: ${item.notes}` : ''}
                  </div>

                  <button
                    onClick={() => handleOpenMarkDoneModal(item)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>✓ บันทึกว่าเปลี่ยนแล้ว</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ======================================================== */}
      {/* Modal 1: Add / Edit Maintenance Item                     */}
      {/* ======================================================== */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-5 my-8">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {editingItem ? 'แก้ไขรายการซ่อมบำรุง' : 'เพิ่มรายการซ่อมบำรุงใหม่'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Template Suggestions for rapid entry */}
            {!editingItem && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  ตัวเลือกยอดนิยม (แตะเพื่อใส่ชื่ออัตโนมัติ):
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(isBike ? DEFAULT_BIKE_MAINTENANCE_TEMPLATES : DEFAULT_CAR_MAINTENANCE_TEMPLATES).slice(0, 5).map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setItemName(t.name);
                        setIntervalKm(String(t.intervalKm));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-semibold transition"
                    >
                      {t.name.split(' ')[0]} ({t.intervalKm.toLocaleString()} กม.)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveItem} className="space-y-4">
              
              {/* Item Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  ชื่อรายการซ่อมบำรุง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น เปลี่ยนถ่ายน้ำมันเครื่อง, กรองโซล่า, กรองอากาศ"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 2 Column Mileage Inputs: ก่อนเปลี่ยน + ระยะถ่าย */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* 1. เลขไมล์ก่อนเปลี่ยน */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    1. เลขไมล์ล่าสุดที่เปลี่ยน (กม.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="เช่น 250000"
                    value={lastMileage}
                    onChange={(e) => setLastMileage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 block">คุณเป็นคนกรอก</span>
                </div>

                {/* 2. ระยะไมล์รอบถ่าย */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    2. รอบระยะถ่าย (กม.)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    placeholder="เช่น 10000"
                    value={intervalKm}
                    onChange={(e) => setIntervalKm(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-blue-600 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 block">คุณเป็นคนกรอก</span>
                </div>

              </div>

              {/* Calculation Preview Box (Requested formula) */}
              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                  <span>🎯 ถึงระยะไมล์ที่ต้องถ่ายถัดไป:</span>
                  <span className="font-mono text-base text-blue-700 font-extrabold">
                    {previewNextMileage.toLocaleString()} กม.
                  </span>
                </div>
                <div className="text-[11px] text-blue-800/80">
                  สูตร: ไมล์ก่อนเปลี่ยน ({Number(lastMileage || 0).toLocaleString()}) + รอบถ่าย ({Number(intervalKm || 0).toLocaleString()}) = <strong>{previewNextMileage.toLocaleString()} กม.</strong> (ระบบคำนวณให้อัตโนมัติ)
                </div>
              </div>

              {/* Date & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    วันที่เปลี่ยนล่าสุด
                  </label>
                  <input
                    type="date"
                    value={lastDate}
                    onChange={(e) => setLastDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    ยี่ห้อ / เบอร์อะไหล่ (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น Castrol 5W-30"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกรายการ</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Modal 2: Mark Done Modal ("✓ บันทึกว่าเปลี่ยนแล้ว")           */}
      {/* ======================================================== */}
      {markingDoneItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 my-8">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    บันทึกประวัติว่าเปลี่ยนแล้ว
                  </h3>
                  <span className="text-xs text-blue-600 font-bold">
                    {markingDoneItem.name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMarkingDoneItem(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMarkDone} className="space-y-4">
              
              {/* Mileage at change */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  เลขไมล์ขณะทำการเปลี่ยน (กม.) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={doneMileage}
                  onChange={(e) => setDoneMileage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400 block">
                  ระบบจะเริ่มนับรอบถัดไปจากเลขไมล์นี้ (+{Number(markingDoneItem.intervalKm).toLocaleString()} กม.)
                </span>
              </div>

              {/* Date & Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    วันที่เปลี่ยน
                  </label>
                  <input
                    type="date"
                    required
                    value={doneDate}
                    onChange={(e) => setDoneDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    ค่าใช้จ่าย (บาท)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="เช่น 1200"
                    value={doneCost}
                    onChange={(e) => setDoneCost(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  อู่ / ศูนย์บริการ / บันทึกเพิ่มเติม
                </label>
                <input
                  type="text"
                  placeholder="เช่น B-Quik สาขาพระราม 9, อู่ช่างต้น"
                  value={doneNotes}
                  onChange={(e) => setDoneNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Auto recalculated target preview */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-0.5">
                <span className="font-bold block">
                  🎯 รอบต่อไปจะถึงที่: {((Number(doneMileage) || 0) + Number(markingDoneItem.intervalKm || 0)).toLocaleString()} กม.
                </span>
                <span className="text-[10px] text-emerald-700 block">
                  (ระบบจะคำนวณและตั้งการเตือนรอบใหม่ให้อัตโนมัติ)
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMarkingDoneItem(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกเรียบร้อย</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
