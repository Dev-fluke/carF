import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Printer, 
  ExternalLink, 
  Eye, 
  FileText,
  Car,
  Bike,
  X,
  ChevronRight
} from 'lucide-react';
import { getInspectionCategories, isMotorcycleType, CAR_INSPECTION_CATEGORIES } from '../data/mockData';
import { VehicleIcon, getVehicleTypeBadge } from './VehicleIcon';

export const InspectionHistory = ({ inspections = [], vehicles = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [activeReport, setActiveReport] = useState(null);

  const filteredInspections = inspections.filter((insp) => {
    const matchesSearch = 
      (insp.plate || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (insp.vehicleNickname || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (insp.notes || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVehicle = selectedVehicleFilter === 'ALL' || insp.vehicleId === selectedVehicleFilter;
    
    let matchesType = true;
    if (selectedTypeFilter === 'MOTORCYCLE') {
      matchesType = isMotorcycleType(insp.vehicleType);
    } else if (selectedTypeFilter === 'CAR') {
      matchesType = !isMotorcycleType(insp.vehicleType);
    }

    return matchesSearch && matchesVehicle && matchesType;
  });

  const handlePrint = () => {
    window.print();
  };

  const getReportCategories = (report) => {
    if (!report) return CAR_INSPECTION_CATEGORIES;
    const vehicle = vehicles.find(v => v.id === report.vehicleId || v.plate === report.plate);
    const vehicleType = report.vehicleType || vehicle?.type || '';
    return getInspectionCategories(vehicleType);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20 md:pb-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">ประวัติการตรวจเช็คสภาพ</h1>
        <p className="text-xs text-slate-500">บันทึกผลการตรวจเช็ครถยนต์และมอเตอร์ไซค์ส่วนตัว</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-2.5">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาทะเบียน, ชื่อรถ, โน้ต..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-700 outline-none w-full sm:w-auto"
          >
            <option value="ALL">ทุกประเภท</option>
            <option value="MOTORCYCLE">🏍️ มอเตอร์ไซค์</option>
            <option value="CAR">🚗 รถยนต์</option>
          </select>
        </div>
      </div>

      {/* Mobile-Friendly Inspection List Cards */}
      <div className="space-y-3">
        {filteredInspections.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm text-slate-400">
            <ClipboardCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <h3 className="text-sm font-bold text-slate-700">ไม่พบประวัติการตรวจเช็ค</h3>
          </div>
        ) : (
          filteredInspections.map((insp) => {
            const isBike = isMotorcycleType(insp.vehicleType);
            const typeBadge = getVehicleTypeBadge(insp.vehicleType);

            let statusBadge = {
              color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              text: '✓ ผ่านปกติ'
            };
            if (insp.overallResult === 'WARNING') {
              statusBadge = {
                color: 'bg-amber-50 text-amber-700 border-amber-200',
                text: '⚠️ มีจุดควรซ่อม'
              };
            } else if (insp.overallResult === 'FAIL') {
              statusBadge = {
                color: 'bg-red-50 text-red-700 border-red-200',
                text: '❌ ไม่ผ่าน'
              };
            }

            return (
              <div 
                key={insp.id}
                onClick={() => setActiveReport(insp)}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-blue-300 transition cursor-pointer active:scale-99 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${isBike ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                      <VehicleIcon type={insp.vehicleType} className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">
                        {insp.vehicleNickname || insp.plate}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {insp.plate} • {insp.vehicleBrandModel || ''}
                      </p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.color}`}>
                    {statusBadge.text}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-600">
                  <span>📅 {insp.inspectionDate}</span>
                  <span className="font-mono font-bold text-slate-800">{Number(insp.mileage || 0).toLocaleString()} กม.</span>
                </div>

                {insp.notes && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 truncate">
                    💬 {insp.notes}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-blue-600 font-bold pt-1">
                  <span>ดูรายละเอียด & รายการตรวจ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detailed Report Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  ผลการตรวจเช็คสภาพรถ
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrint}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveReport(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report View */}
            <div className="space-y-4 print:p-0 text-xs">
              
              {/* Header Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">รถคันที่ตรวจ:</span>
                  <span className="font-extrabold text-sm text-slate-900">{activeReport.vehicleNickname || activeReport.plate}</span>
                  <span className="text-[11px] text-slate-500 block">ทะเบียน: {activeReport.plate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">วันเวลาที่ตรวจ:</span>
                  <span className="font-medium text-slate-800 text-xs">{activeReport.inspectionDate}</span>
                  <span className="text-[11px] font-mono font-bold text-slate-700 block">ไมล์: {Number(activeReport.mileage || 0).toLocaleString()} กม.</span>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-3 rounded-xl bg-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-700">ผลการประเมิน:</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                  activeReport.overallResult === 'PASS'
                    ? 'bg-emerald-100 text-emerald-800'
                    : activeReport.overallResult === 'WARNING'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {activeReport.overallResult === 'PASS' ? '✓ ผ่านเกณฑ์ปกติ พร้อมใช้งาน' : '⚠️ มีจุดควรซ่อม'}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900">รายละเอียดรายการตรวจ:</h4>
                <div className="space-y-3">
                  {getReportCategories(activeReport).map((cat) => (
                    <div key={cat.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                      <div className="bg-slate-100 px-3 py-1.5 font-bold text-[11px] text-slate-800">
                        {cat.name}
                      </div>
                      <div className="divide-y divide-slate-100">
                        {cat.items.map((item) => {
                          const status = activeReport.items ? activeReport.items[item.id] : 'pass';
                          return (
                            <div key={item.id} className="p-2 px-3 flex items-center justify-between">
                              <span className="text-slate-700">{item.name}</span>
                              {status === 'pass' && <span className="text-emerald-700 font-bold">✓ ปกติ</span>}
                              {status === 'warning' && <span className="text-amber-700 font-bold">⚠️ ควรดู</span>}
                              {status === 'fail' && <span className="text-red-700 font-bold">❌ ชำรุด</span>}
                              {status === 'na' && <span className="text-slate-400">ข้าม</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {activeReport.notes && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-0.5">
                  <span className="font-bold text-slate-700">โน้ตช่วยจำ:</span>
                  <p className="text-slate-600">{activeReport.notes}</p>
                </div>
              )}

              {/* Defect Photos */}
              {activeReport.defectPhotos && activeReport.defectPhotos.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-700">รูปภาพประกอบ:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {activeReport.defectPhotos.map((p, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden border border-slate-200">
                        <img src={p} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
