import React, { useState } from 'react';
import { 
  Car, 
  Bike,
  Truck,
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
  Sparkles,
  Wrench,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { VEHICLE_TYPES, isMotorcycleType } from '../data/mockData';
import { VehicleIcon, getVehicleTypeBadge } from './VehicleIcon';
import { fileToBase64, callGoogleAppsScript } from '../services/googleService';
import { addOrUpdateVehicle, deleteVehicle } from '../services/storageService';

const BRAND_SUGGESTIONS = [
  'Honda',
  'Yamaha',
  'Toyota',
  'Isuzu',
  'Kawasaki',
  'Suzuki',
  'Vespa',
  'GPX',
  'Lambretta',
  'Ducati',
  'BMW',
  'Ford',
  'Mitsubishi',
  'Mazda',
  'Nissan',
  'MG',
  'BYD',
  'GWM'
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
  const [nickname, setNickname] = useState('');
  const [plate, setPlate] = useState('');
  const [province, setProvince] = useState('กรุงเทพมหานคร');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState('รถเก๋ง (Sedan / Hatchback)');
  const [year, setYear] = useState('2023');
  const [color, setColor] = useState('ขาว');
  const [fuelType, setFuelType] = useState('เบนซิน 95 / E20');
  const [currentMileage, setCurrentMileage] = useState('');
  const [serviceIntervalKm, setServiceIntervalKm] = useState('10000');
  const [serviceIntervalMonths, setServiceIntervalMonths] = useState('6');
  const [taxDueDate, setTaxDueDate] = useState('');
  const [insuranceDueDate, setInsuranceDueDate] = useState('');
  const [notes, setNotes] = useState('');
  
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  // Filtered List
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = 
      (v.nickname || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.plate || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.brand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.model || '').toLowerCase().includes(searchQuery.toLowerCase());

    let matchesType = true;
    if (selectedTypeFilter === 'ALL') {
      matchesType = true;
    } else if (selectedTypeFilter === 'MOTORCYCLE') {
      matchesType = isMotorcycleType(v.type);
    } else if (selectedTypeFilter === 'CAR') {
      matchesType = !isMotorcycleType(v.type);
    } else {
      matchesType = v.type === selectedTypeFilter;
    }

    return matchesSearch && matchesType;
  });

  const handleTypeChange = (newType) => {
    setType(newType);
    if (isMotorcycleType(newType)) {
      if (serviceIntervalKm === '10000') setServiceIntervalKm('4000');
      if (serviceIntervalMonths === '6') setServiceIntervalMonths('4');
      if (fuelType === 'ดีเซล (Diesel)') setFuelType('เบนซิน 95 / E20');
    } else {
      if (serviceIntervalKm === '4000') setServiceIntervalKm('10000');
      if (serviceIntervalMonths === '4') setServiceIntervalMonths('6');
    }
  };

  const handleOpenAddModal = (defaultType = 'รถเก๋ง (Sedan / Hatchback)') => {
    setEditingVehicle(null);
    setNickname('');
    setPlate('');
    setProvince('กรุงเทพมหานคร');
    setBrand('');
    setModel('');
    handleTypeChange(defaultType);
    setYear('2023');
    setColor('ขาว');
    setCurrentMileage('');
    setTaxDueDate('');
    setInsuranceDueDate('');
    setNotes('');
    setPhotoUrl('');
    setPhotoFile(null);
    setSubmitMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setNickname(vehicle.nickname || '');
    setPlate(vehicle.plate || '');
    setProvince(vehicle.province || 'กรุงเทพมหานคร');
    setBrand(vehicle.brand || '');
    setModel(vehicle.model || '');
    setType(vehicle.type || 'รถเก๋ง (Sedan / Hatchback)');
    setYear(vehicle.year || '');
    setColor(vehicle.color || '');
    setFuelType(vehicle.fuelType || 'เบนซิน 95 / E20');
    setCurrentMileage(vehicle.currentMileage || 0);
    setServiceIntervalKm(vehicle.serviceIntervalKm || (isMotorcycleType(vehicle.type) ? 4000 : 10000));
    setServiceIntervalMonths(vehicle.serviceIntervalMonths || (isMotorcycleType(vehicle.type) ? 4 : 6));
    setTaxDueDate(vehicle.taxDueDate || '');
    setInsuranceDueDate(vehicle.insuranceDueDate || '');
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

  const handleDelete = (vehicleId, vehicleName) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${vehicleName}" ออกจากโรงรถ?`)) {
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
    setSubmitMessage({ type: 'info', text: 'กำลังบันทึกข้อมูลและอัปโหลดรูปภาพไปยัง Google Drive & Sheets...' });

    const vehicleId = editingVehicle ? editingVehicle.id : `veh-${Date.now()}`;
    const curMileage = Number(currentMileage) || 0;
    const intervalKm = Number(serviceIntervalKm) || (isMotorcycleType(type) ? 4000 : 10000);
    const intervalMonths = Number(serviceIntervalMonths) || (isMotorcycleType(type) ? 4 : 6);
    const lastServiceMileage = editingVehicle ? (editingVehicle.lastServiceMileage || 0) : 0;
    const nextServiceMileage = lastServiceMileage + intervalKm > curMileage ? lastServiceMileage + intervalKm : curMileage + intervalKm;

    const newVehicle = {
      id: vehicleId,
      nickname: nickname.trim() || `${brand.trim()} ${model.trim()}`,
      plate: plate.trim(),
      province: province.trim(),
      brand: brand.trim(),
      model: model.trim(),
      type: type,
      year: year.trim(),
      color: color.trim(),
      photoUrl: photoUrl,
      currentMileage: curMileage,
      lastServiceMileage: lastServiceMileage,
      serviceIntervalKm: intervalKm,
      nextServiceMileage: nextServiceMileage,
      lastServiceDate: editingVehicle?.lastServiceDate || new Date().toISOString().split('T')[0],
      serviceIntervalMonths: intervalMonths,
      taxDueDate: taxDueDate || '',
      insuranceDueDate: insuranceDueDate || '',
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

  const isCurrentFormBike = isMotorcycleType(type);

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      
      {/* Header & Quick Add Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">โรงรถของฉัน (My Garage)</h1>
          <p className="text-xs text-slate-500">จัดการข้อมูลรถยนต์และมอเตอร์ไซค์ส่วนตัว</p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2">
          <button
            onClick={() => handleOpenAddModal('รถจักรยานยนต์ (Motorcycle)')}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition"
          >
            <Bike className="w-4 h-4" />
            <span>+ มอเตอร์ไซค์</span>
          </button>
          <button
            onClick={() => handleOpenAddModal('รถเก๋ง (Sedan / Hatchback)')}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition"
          >
            <Car className="w-4 h-4" />
            <span>+ รถยนต์</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-2.5">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อรถ, ทะเบียน, ยี่ห้อ, รุ่น..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-700 outline-none w-full sm:w-auto"
          >
            <option value="ALL">รถทุกคัน ({vehicles.length})</option>
            <option value="MOTORCYCLE">🏍️ มอเตอร์ไซค์ ({vehicles.filter(v => isMotorcycleType(v.type)).length})</option>
            <option value="CAR">🚗 รถยนต์ ({vehicles.filter(v => !isMotorcycleType(v.type)).length})</option>
          </select>
        </div>
      </div>

      {/* Vehicles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredVehicles.map((vehicle) => {
          const isBike = isMotorcycleType(vehicle.type);
          const typeBadge = getVehicleTypeBadge(vehicle.type);

          let statusBadge = {
            color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            text: 'ปกติ'
          };
          if (vehicle.status === 'overdue') {
            statusBadge = {
              color: 'bg-red-50 text-red-700 border-red-200 animate-pulse',
              text: 'เกินระยะถ่ายน้ำมัน'
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
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Photo Header */}
                <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                  {vehicle.photoUrl ? (
                    <img 
                      src={vehicle.photoUrl} 
                      alt={vehicle.plate} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <VehicleIcon type={vehicle.type} className="w-12 h-12 mb-1 opacity-40" />
                      <span className="text-xs">ไม่มีรูปภาพ</span>
                    </div>
                  )}

                  {/* Badges on Photo */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs backdrop-blur-md bg-white/95 ${statusBadge.color}`}>
                      {statusBadge.text}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md bg-white/90 ${typeBadge.color}`}>
                      {typeBadge.text}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(vehicle)}
                      className="p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-sm transition active:scale-95"
                      title="แก้ไขข้อมูล"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id, vehicle.nickname || vehicle.plate)}
                      className="p-1.5 rounded-full bg-white/90 hover:bg-red-50 text-red-600 shadow-sm transition active:scale-95"
                      title="ลบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                      {vehicle.nickname || `${vehicle.brand} ${vehicle.model}`}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-bold text-xs text-blue-600">{vehicle.plate}</span>
                      <span className="text-[11px] text-slate-400">({vehicle.province}) • {vehicle.brand} {vehicle.model}</span>
                    </div>
                  </div>

                  {/* Mileage & Service metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">เลขไมล์ปัจจุบัน</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {Number(vehicle.currentMileage || 0).toLocaleString()} <span className="text-[10px] font-normal text-slate-500">กม.</span>
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">รอบถ่ายน้ำมันเครื่อง</span>
                      <span className="font-mono font-bold text-blue-600 text-sm">
                        {Number(vehicle.nextServiceMileage || 0).toLocaleString()} <span className="text-[10px] font-normal text-slate-500">กม.</span>
                      </span>
                    </div>
                  </div>

                  {/* Fuel & Tax Due info */}
                  <div className="text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>⛽ {vehicle.fuelType}</span>
                      <span>ปี {vehicle.year} • สี{vehicle.color}</span>
                    </div>
                    {vehicle.taxDueDate && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        <FileText className="w-3 h-3 text-amber-600" />
                        <span>วันครบกำหนดภาษี/พ.ร.บ.: <strong>{vehicle.taxDueDate}</strong></span>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Bottom Quick Action Buttons */}
              <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onInspect(vehicle)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 ${
                    isBike
                      ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>ตรวจสภาพ</span>
                </button>
                <button
                  onClick={() => onLogMileage(vehicle)}
                  className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Fuel className="w-3.5 h-3.5" />
                  <span>เติมน้ำมัน/ไมล์</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${isCurrentFormBike ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                  {isCurrentFormBike ? <Bike className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {editingVehicle ? 'แก้ไขข้อมูลรถ' : `เพิ่ม${isCurrentFormBike ? 'มอเตอร์ไซค์' : 'รถยนต์'}คันใหม่`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    บันทึกข้อมูลลงสมุดโรงรถส่วนตัว
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Photo Upload Section */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  รูปภาพรถ
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <VehicleIcon type={type} className="w-8 h-8 text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition">
                      <Camera className="w-4 h-4" />
                      <span>ถ่ายภาพ / เลือกรูป</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400">
                      รองรับภาพถ่ายจากมือถือ
                    </p>
                  </div>
                </div>
              </div>

              {/* Nickname */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  ชื่อเรียกรถ / ฉายา (Nickname)
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={isCurrentFormBike ? "เช่น เวฟคู่ใจ, แดงซ่า" : "เช่น น้องซิตี้, พี่ยักษ์"}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* License Plate & Province */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    ทะเบียนรถ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    placeholder="เช่น 1กข 7788"
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
              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    ยี่ห้อ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="brand-list"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Honda"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                    required
                  />
                  <datalist id="brand-list">
                    {BRAND_SUGGESTIONS.map(b => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    รุ่น <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="City, Wave"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">ประเภท</label>
                  <select
                    value={type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none truncate"
                  >
                    {VEHICLE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fuel & Color */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">น้ำมัน/พลังงาน</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                  >
                    <option value="เบนซิน 95 / E20">เบนซิน 95 / E20</option>
                    <option value="ไฮบริด (Hybrid)">ไฮบริด (Hybrid)</option>
                    <option value="ดีเซล (Diesel)">ดีเซล (Diesel)</option>
                    <option value="ไฟฟ้า (EV 100%)">ไฟฟ้า (EV 100%)</option>
                    <option value="LPG / NGV">LPG / NGV</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">สี / ปี</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="เทา / 2023"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                  />
                </div>
              </div>

              {/* Mileage & Service Settings */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-blue-600" />
                    <span>เลขไมล์ & รอบเปลี่ยนถ่าย</span>
                  </div>
                  <span className="text-[10px] font-normal text-slate-500">
                    {isCurrentFormBike ? 'มอเตอร์ไซค์: ทุก 3,000-4,000 กม.' : 'รถยนต์: ทุก 10,000 กม.'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      เลขไมล์ปัจจุบัน (กม.)
                    </label>
                    <input
                      type="number"
                      value={currentMileage}
                      onChange={(e) => setCurrentMileage(e.target.value)}
                      placeholder="เช่น 22400"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      รอบเปลี่ยนน้ำมันเครื่อง (กม.)
                    </label>
                    <input
                      type="number"
                      value={serviceIntervalKm}
                      onChange={(e) => setServiceIntervalKm(e.target.value)}
                      placeholder={isCurrentFormBike ? "4000" : "10000"}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono bg-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Tax & Insurance Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">วันต่อภาษี & พ.ร.บ.</label>
                  <input
                    type="date"
                    value={taxDueDate}
                    onChange={(e) => setTaxDueDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">วันหมดอายุประกันภัย</label>
                  <input
                    type="date"
                    value={insuranceDueDate}
                    onChange={(e) => setInsuranceDueDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                  />
                </div>
              </div>

              {/* Status feedback */}
              {submitMessage && (
                <div className={`p-3 rounded-xl text-xs font-medium ${
                  submitMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {submitMessage.text}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>บันทึกรถเข้าโรงรถ</span>
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
