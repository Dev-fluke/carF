import React from 'react';
import { 
  Car, 
  Bike,
  ClipboardCheck, 
  Gauge, 
  AlertTriangle, 
  Settings, 
  PlusCircle, 
  History, 
  CheckCircle2, 
  CloudOff,
  Cloud,
  Home,
  Fuel,
  Wrench,
  Sparkles
} from 'lucide-react';
import { isMotorcycleType } from '../data/mockData';

export const Navbar = ({ 
  activeTab, 
  setActiveTab, 
  gasConfig, 
  onOpenGasModal, 
  onOpenQuickMileage, 
  onOpenAddVehicle,
  alertsCount = 0,
  vehicles = [],
  selectedVehicleId,
  onSelectVehicle
}) => {
  const navItems = [
    { id: 'dashboard', label: 'หน้าแรก', mobileLabel: 'หน้าแรก', icon: Home },
    { id: 'vehicles', label: 'รถของฉัน', mobileLabel: 'รถของฉัน', icon: Car, count: vehicles.length },
    { 
      id: 'maintenance', 
      label: 'รายการซ่อมบำรุง', 
      mobileLabel: 'ซ่อมบำรุง',
      icon: Wrench,
      badge: alertsCount > 0 ? alertsCount : null 
    },
    { id: 'mileage', label: 'ไมล์ & น้ำมัน', mobileLabel: 'ไมล์/น้ำมัน', icon: Fuel }
  ];

  return (
    <>
      {/* Top Header (Desktop & Mobile) */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Logo & App Title */}
            <div 
              className="flex items-center gap-2.5 cursor-pointer select-none active:scale-95 transition" 
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl shadow-md flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                    My Garage
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    สมุดบันทึกดูแลรถ
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-500 text-slate-900 rounded-full animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Top Actions */}
            <div className="flex items-center gap-2">
              {/* Google Sheets Sync Indicator Button */}
              <button
                onClick={onOpenGasModal}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${
                  gasConfig.webAppUrl && gasConfig.isConnected
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title="ตั้งค่าสำรองข้อมูล Google Sheets & Drive"
              >
                {gasConfig.webAppUrl && gasConfig.isConnected ? (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">บันทึกลงชีตอัตโนมัติ</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">เชื่อมต่อ Google Sheets</span>
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                  </>
                )}
              </button>

              {/* Quick Add Vehicle (Desktop only) */}
              <button
                onClick={onOpenAddVehicle}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ เพิ่มรถ</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed at bottom for thumb-friendly mobile control) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 pb-safe shadow-2xl">
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-blue-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
                }`}
              >
                <div className={`p-1 rounded-lg transition ${isActive ? 'bg-blue-600/20' : ''}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                  {item.mobileLabel}
                </span>

                {item.badge && (
                  <span className="absolute top-0.5 right-2 px-1 text-[9px] font-extrabold bg-amber-500 text-slate-900 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
