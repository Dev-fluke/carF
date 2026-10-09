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
  X
} from 'lucide-react';
import { INSPECTION_CATEGORIES } from '../data/mockData';

export const InspectionHistory = ({ inspections = [], vehicles = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState('ALL');
  const [activeReport, setActiveReport] = useState(null);

  const filteredInspections = inspections.filter((insp) => {
    const matchesSearch = 
      (insp.plate || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (insp.inspectorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (insp.notes || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVehicle = selectedVehicleFilter === 'ALL' || insp.vehicleId === selectedVehicleFilter;
    return matchesSearch && matchesVehicle;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ประวัติการตรวจเช็คสภาพรถ</h1>
          <p className="text-xs text-slate-500">รายงานผลการตรวจเช็คความพร้อมของรถทุกคันย้อนหลัง</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาทะเบียน, ผู้ตรวจ, หมายเหตุ..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Vehicle Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedVehicleFilter}
            onChange={(e) => setSelectedVehicleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium text-slate-700 outline-none w-full sm:w-auto"
          >
            <option value="ALL">รถทุกคัน</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plate} ({v.brand} {v.model})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inspections Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredInspections.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-bold text-slate-700">ไม่พบประวัติการตรวจเช็ค</h3>
            <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือเริ่มบันทึกการตรวจสภาพรถใหม่</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">ทะเบียนรถ</th>
                  <th className="py-3.5 px-4">วันเวลาที่ตรวจ</th>
                  <th className="py-3.5 px-4">ผู้ตรวจเช็ค</th>
                  <th className="py-3.5 px-4">เลขไมล์</th>
                  <th className="py-3.5 px-4">ผลการประเมิน</th>
                  <th className="py-3.5 px-4">รูปถ่ายชำรุด</th>
                  <th className="py-3.5 px-4 text-right">ใบรายงาน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredInspections.map((insp) => {
                  let statusBadge = {
                    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    text: 'ผ่านปกติ'
                  };
                  if (insp.overallResult === 'WARNING') {
                    statusBadge = {
                      color: 'bg-amber-50 text-amber-700 border-amber-200',
                      text: 'มีจุดควรซ่อม'
                    };
                  } else if (insp.overallResult === 'FAIL') {
                    statusBadge = {
                      color: 'bg-red-50 text-red-700 border-red-200',
                      text: 'ไม่ผ่าน'
                    };
                  }

                  return (
                    <tr key={insp.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{insp.plate}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{insp.vehicleBrandModel || ''}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {insp.inspectionDate}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {insp.inspectorName}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {Number(insp.mileage || 0).toLocaleString()} กม.
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge.color}`}>
                          {statusBadge.text}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {insp.defectPhotos && insp.defectPhotos.length > 0 ? (
                          <span className="text-blue-600 font-semibold flex items-center gap-1">
                            📷 {insp.defectPhotos.length} รูป
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setActiveReport(insp)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>ดูรายงาน</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspection Detailed Report Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header Actions */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-lg">ใบรายงานผลการตรวจสภาพรถยนต์</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์รายงาน (Print)</span>
                </button>
                <button
                  onClick={() => setActiveReport(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report View */}
            <div className="space-y-6 print:p-0">
              
              {/* Report Title & Metadata Box */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">ทะเบียนรถ:</span>
                  <span className="font-extrabold text-base text-slate-900">{activeReport.plate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ผู้ตรวจเช็ค:</span>
                  <span className="font-bold text-slate-800 text-sm">{activeReport.inspectorName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">วันเวลาที่ตรวจ:</span>
                  <span className="font-medium text-slate-800 text-xs">{activeReport.inspectionDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">เลขไมล์ขณะตรวจ:</span>
                  <span className="font-bold font-mono text-slate-900 text-sm">
                    {Number(activeReport.mileage || 0).toLocaleString()} กม.
                  </span>
                </div>
              </div>

              {/* Status summary banner */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100 border border-slate-200">
                <span className="text-xs font-bold text-slate-700">ผลการตรวจเช็คโดยรวม:</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  activeReport.overallResult === 'PASS'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : activeReport.overallResult === 'WARNING'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }`}>
                  {activeReport.overallResult === 'PASS' && '✓ ผ่านเกณฑ์ปกติ พร้อมใช้งาน'}
                  {activeReport.overallResult === 'WARNING' && '⚠ มีรายการที่ควรนำเข้าซ่อม'}
                  {activeReport.overallResult === 'FAIL' && '✕ ชำรุด ไม่แนะนำให้นำไปใช้งาน'}
                </span>
              </div>

              {/* Checklist Matrix */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">รายละเอียดรายการตรวจเช็ค:</h4>
                <div className="space-y-4">
                  {INSPECTION_CATEGORIES.map((cat) => (
                    <div key={cat.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-100 px-3.5 py-2 font-bold text-xs text-slate-800">
                        {cat.name}
                      </div>
                      <div className="divide-y divide-slate-100">
                        {cat.items.map((item) => {
                          const status = activeReport.items ? activeReport.items[item.id] : 'pass';
                          return (
                            <div key={item.id} className="p-2.5 px-3.5 flex items-center justify-between text-xs">
                              <span className="text-slate-700">{item.name}</span>
                              {status === 'pass' && (
                                <span className="text-emerald-700 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>ปกติ</span>
                                </span>
                              )}
                              {status === 'warning' && (
                                <span className="text-amber-700 font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                  <span>ควรซ่อม</span>
                                </span>
                              )}
                              {status === 'fail' && (
                                <span className="text-red-700 font-bold flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                                  <span>ชำรุด</span>
                                </span>
                              )}
                              {status === 'na' && (
                                <span className="text-slate-400">ไม่ได้ตรวจ</span>
                              )}
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
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <span className="font-bold text-slate-700">หมายเหตุ / ข้อสังเกตเพิ่มเติม:</span>
                  <p className="text-slate-600">{activeReport.notes}</p>
                </div>
              )}

              {/* Photos Gallery */}
              {activeReport.defectPhotos && activeReport.defectPhotos.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">รูปภาพประกอบการตรวจเช็ค:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {activeReport.defectPhotos.map((photo, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img src={photo} alt="" className="w-full h-full object-cover" />
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
