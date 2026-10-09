import React, { useState } from 'react';
import { 
  Car, 
  Plus, 
  Search, 
  Filter, 
  Camera, 
  Upload, 
  Trash2, 
  Edit, 
  Gauge, 
  User, 
  Fuel, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Loader2, 
  X,
  Sparkles
} from 'lucide-react';
import { fileToBase64, callGoogleAppsScript } from '../services/googleService';
import { addOrUpdateVehicle, deleteVehicle } from '../services/storageService';

const VEHICLE_TYPES = [
  'รถกระบะ (Pickup)',
  'รถเก๋ง (Sedan)',
  'รถตู้ (Van)',
  'รถบรรทุก (Truck)',
  'รถ SUV / PPV',
  'รถจักรยานยนต์ (Motorcycle)'
];

export const VehiclesList = ({ 
  vehicles = [], 
  onInspect, 
  onLogMileage, 
  onRefresh,
  openAddOnMount = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(openAddOnMount);
  const [editingVehicle, setEditingVehicle] = useState(null);
  
  // Form State
  const [plate, setPlate] = useState('');
  const [province, setProvince] = useState('กรุงเทพมหานคร');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState('รถกระบะ (Pickup)');
  const [year, setYear] = useState('2023');
  const [color, setColor] = useState('ขาว');
  const [fuelType, setFuelType] = useState('ดีเซล (Diesel)');
  const [assignedDriver, setAssignedDriver] = useState('');
  const [currentMileage, setCurrentMileage] = useState('');
  const [serviceIntervalKm, setServiceIntervalKm] = useState('10000');
  const [serviceIntervalMonths, setServiceIntervalMonths] = useState('6');
  const [notes, setNotes] = useState('');
  
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  // Filtered List
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = 
      (v.plate || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.brand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.model || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.assignedDriver || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedTypeFilter === 'ALL' || v.type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleOpenAddModal = () => {
    setEditingVehicle(null);
    setPlate('');
    setProvince('กรุงเทพมหานคร');
    setBrand('');
    setModel('');
    setType('รถกระบะ (Pickup)');
    setYear('2023');
    setColor('ขาว');
    setFuelType('ดีเซล (Diesel)');
    setAssignedDriver('');
    setCurrentMileage('');
    setServiceIntervalKm('10000');
    setServiceIntervalMonths('6');
    setNotes('');
    setPhotoUrl('');
    setPhotoFile(null);
    setSubmitMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setPlate(vehicle.plate || '');
    setProvince(vehicle.province || 'กรุงเทพมหานคร');
    setBrand(vehicle.brand || '');
    setModel(vehicle.model || '');
    setType(vehicle.type || 'รถกระบะ (Pickup)');
    setYear(vehicle.year || '');
    setColor(vehicle.color || '');
    setFuelType(vehicle.fuelType || 'ดีเซล (Diesel)');
    setAssignedDriver(vehicle.assignedDriver || '');
    setCurrentMileage(vehicle.currentMileage || 0);
    setServiceIntervalKm(vehicle.serviceIntervalKm || 10000);
    setServiceIntervalMonths(vehicle.serviceIntervalMonths || 6);
    setNotes(vehicle.notes || '');
    setPhotoUrl(vehicle.photoUrl || '');
    setPhotoFile(null);
    setSubmitMessage(null);
    setIsModalOpen(true);
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    try {
      const base64 = await fileToBase64(file);
      setPhotoUrl(base64);
    } catch (err) {
      console.error('Photo read error:', err);
    }
  };

  const handleDelete = (vehicleId, vehiclePlate) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรถทะเบียน "${vehiclePlate}" ออกจากระบบ?`)) {
      deleteVehicle(vehicleId);
      if (onRefresh) onRefresh();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!plate.trim() || !brand.trim() || !model.trim()) {
      alert('กรุณากรอกทะเบียนรถ, ยี่ห้อ และรุ่น ให้ครบถ้วน');
      return;
    }

    setIsUploading(true);
    setSubmitMessage({ type: 'info', text: 'กำลังบันทึกข้อมูลรถและอัปโหลดรูปภาพไปยัง Google Drive & Sheets...' });

    const vehicleId = editingVehicle ? editingVehicle.id : `veh-${Date.now()}`;
    const curMileage = Number(currentMileage) || 0;
    const intervalKm = Number(serviceIntervalKm) || 10000;
    const intervalMonths = Number(serviceIntervalMonths) || 6;
    const lastServiceMileage = editingVehicle ? (editingVehicle.lastServiceMileage || 0) : 0;
    const nextServiceMileage = lastServiceMileage + intervalKm > curMileage ? lastServiceMileage + intervalKm : curMileage + intervalKm;

    const newVehicle = {
      id: vehicleId,
      plate: plate.trim(),
      province: province.trim(),
      brand: brand.trim(),
      model: model.trim(),
      type: type,
      year: year.trim(),
      color: color.trim(),
      photoUrl: photoUrl, // Will be uploaded to Drive via Apps Script
      currentMileage: curMileage,
      lastServiceMileage: lastServiceMileage,
      serviceIntervalKm: intervalKm,
      nextServiceMileage: nextServiceMileage,
      lastServiceDate: editingVehicle?.lastServiceDate || new Date().toISOString().split('T')[0],
      serviceIntervalMonths: intervalMonths,
      assignedDriver: assignedDriver.trim(),
      fuelType: fuelType,
      notes: notes.trim()
    };

    try {
      // 1. Save to Local Storage
      const updated = addOrUpdateVehicle(newVehicle);

      // 2. Push to Google Apps Script (Google Sheets & Google Drive)
      const gasResult = await callGoogleAppsScript('ADD_VEHICLE', {
        vehicle: updated
      });

      // If GAS returned a Drive URL for the photo, update local state
      if (gasResult && gasResult.photoUrl) {
        addOrUpdateVehicle({ ...updated, photoUrl: gasResult.photoUrl });
      }

      setIsUploading(false);
      setSubmitMessage({
        type: 'success',
        text: 'บันทึกข้อมูลรถเรียบร้อยแล้ว!'
      });

      setTimeout(() => {
        setIsModalOpen(false);
        if (onRefresh) onRefresh();
      }, 1000);

    } catch (err) {
      console.error('Vehicle save error:', err);
      setIsUploading(false);
      setSubmitMessage({
        type: 'error',
        text: 'เกิดข้อผิดพลาดในการบันทึก: ' + err.message
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ทะเบียนยานพาหนะทั้งหมด</h1>
          <p className="text-xs text-slate-500">จัดการข้อมูลรถ รูปภาพ ทะเบียน และรอบระยะตรวจเช็ค</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มรถคันใหม่</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาทะเบียน, ยี่ห้อ, รุ่น, คนขับ..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium text-slate-700 outline-none w-full sm:w-auto"
          >
            <option value="ALL">ทุกประเภทรถ</option>
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Vehicles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVehicles.map((vehicle) => {
          let statusBadge = {
            color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            text: 'ปกติ'
          };
          if (vehicle.status === 'overdue') {
            statusBadge = {
              color: 'bg-red-50 text-red-700 border-red-200 animate-pulse',
              text: 'เกินระยะเช็ค'
            };
          } else if (vehicle.status === 'due_soon') {
            statusBadge = {
              color: 'bg-amber-50 text-amber-700 border-amber-200',
              text: 'ใกล้ถึงรอบเช็ค'
            };
          }

          return (
            <div 
              key={vehicle.id} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Photo Header */}
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                  {vehicle.photoUrl ? (
                    <img 
                      src={vehicle.photoUrl} 
                      alt={vehicle.plate} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <Car className="w-12 h-12 mb-1 opacity-50" />
                      <span className="text-xs">ไม่มีรูปภาพ</span>
                    </div>
                  )}

                  {/* Badges on Photo */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-xs backdrop-blur-md bg-white/95 ${statusBadge.color}`}>
                      {statusBadge.text}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(vehicle)}
                      className="p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-sm transition"
                      title="แก้ไขข้อมูล"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id, vehicle.plate)}
                      className="p-1.5 rounded-full bg-white/90 hover:bg-red-50 text-red-600 shadow-sm transition"
                      title="ลบรถ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900">{vehicle.plate}</h3>
                      <p className="text-xs text-slate-500">{vehicle.province}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {vehicle.brand} {vehicle.model}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">เลขไมล์ปัจจุบัน</span>
                      <span className="font-mono font-bold text-slate-800">
                        {Number(vehicle.currentMileage || 0).toLocaleString()} กม.
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">เป้าหมายเช็คระยะ</span>
                      <span className="font-mono font-bold text-blue-600">
                        {Number(vehicle.nextServiceMileage || 0).toLocaleString()} กม.
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>คนขับประจำ: <strong>{vehicle.assignedDriver || '-'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Fuel className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vehicle.fuelType} • ปี {vehicle.year}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Quick Action Buttons */}
              <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onInspect(vehicle)}
                  className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>ตรวจสภาพ</span>
                </button>
                <button
                  onClick={() => onLogMileage(vehicle)}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span>ลงไมล์</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingVehicle ? 'แก้ไขข้อมูลรถ' : 'เพิ่มรถคันใหม่ในระบบ'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    บันทึกข้อมูลรถและอัปโหลดรูปภาพขึ้น Google Drive & Sheets
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Photo Upload Section */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  รูปภาพรถ (จะถูกอัปโหลดไปเก็บที่ Google Drive)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-28 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Car className="w-8 h-8 text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition">
                      <Camera className="w-4 h-4" />
                      <span>เลือกไฟล์รูป / ถ่ายภาพ</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400">
                      รองรับไฟล์ JPG, PNG หรือภาพถ่ายจากกล้องมือถือ
                    </p>
                  </div>
                </div>
              </div>

              {/* License Plate & Province */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    ทะเบียนรถ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    placeholder="เช่น 1กข 4589"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">จังหวัด</label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="เช่น กรุงเทพมหานคร"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Brand, Model & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    ยี่ห้อ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="เช่น Toyota, Isuzu"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    รุ่น <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="เช่น Hilux Revo, Commuter"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">ประเภทรถ</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                  >
                    {VEHICLE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Year, Color, Fuel */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">ปี (ค.ศ./พ.ศ.)</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2023"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">สีรถ</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="ขาวมุก"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">เชื้อเพลิง</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                  >
                    <option value="ดีเซล (Diesel)">ดีเซล (Diesel)</option>
                    <option value="เบนซิน (Gasoline)">เบนซิน (Gasoline)</option>
                    <option value="ไฮบริด (Hybrid)">ไฮบริด (Hybrid)</option>
                    <option value="ไฟฟ้า (EV 100%)">ไฟฟ้า (EV 100%)</option>
                  </select>
                </div>
              </div>

              {/* Mileage & Service Settings */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Gauge className="w-4 h-4 text-blue-600" />
                  <span>ตั้งค่าเลขไมล์และรอบซ่อมบำรุง</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      เลขไมล์ปัจจุบัน (กม.)
                    </label>
                    <input
                      type="number"
                      value={currentMileage}
                      onChange={(e) => setCurrentMileage(e.target.value)}
                      placeholder="เช่น 48500"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      รอบเช็คระยะทุกๆ (กม.)
                    </label>
                    <input
                      type="number"
                      value={serviceIntervalKm}
                      onChange={(e) => setServiceIntervalKm(e.target.value)}
                      placeholder="10000"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      รอบระยะเวลา (เดือน)
                    </label>
                    <input
                      type="number"
                      value={serviceIntervalMonths}
                      onChange={(e) => setServiceIntervalMonths(e.target.value)}
                      placeholder="6"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono bg-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Assigned Driver & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">คนขับประจำ</label>
                  <input
                    type="text"
                    value={assignedDriver}
                    onChange={(e) => setAssignedDriver(e.target.value)}
                    placeholder="ชื่อผู้รับผิดชอบรถ"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">หมายเหตุ</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="เช่น รถแผนกจัดส่ง, ติดแก๊ส LPG"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                  />
                </div>
              </div>

              {/* Status feedback */}
              {submitMessage && (
                <div className={`p-3.5 rounded-xl text-xs font-medium ${
                  submitMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {submitMessage.text}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังอัปโหลดและบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>บันทึกข้อมูลรถ</span>
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
