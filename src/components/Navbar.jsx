import React from 'react';
import { 
  Car, 
  ClipboardCheck, 
  Gauge, 
  AlertTriangle, 
  Settings, 
  PlusCircle, 
  History, 
  CheckCircle2, 
  CloudOff,
  Cloud,
  Menu,
  X
} from 'lucide-react';

export const Navbar = ({ 
  activeTab, 
  setActiveTab, 
  gasConfig, 
  onOpenGasModal, 
  onOpenQuickMileage, 
  onOpenAddVehicle,
  alertsCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'ภาพรวม', icon: Gauge },
    { id: 'inspect', label: 'ตรวจสภาพรถ', icon: ClipboardCheck },
    { id: 'mileage', label: 'บันทึกเลขไมล์', icon: Gauge },
    { 
      id: 'maintenance', 
      label: 'แจ้งเตือนบำรุงรักษา', 
      icon: AlertTriangle,
      badge: alertsCount > 0 ? alertsCount : null 
    },
    { id: 'vehicles', label: 'ข้อมูลรถทั้งหมด', icon: Car },
    { id: 'history', label: 'ประวัติตรวจสภาพ', icon: History },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-lg border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & App Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2.5 rounded-xl shadow-md flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                  AutoCheck
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 font-light hidden sm:block">
                ระบบตรวจเช็คสภาพรถ & แจ้งเตือนบำรุงรักษา
              </p>
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
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold bg-amber-500 text-slate-900 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Google Sheets Status + Quick Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Quick Action Button */}
            <button
              onClick={onOpenQuickMileage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-sm"
              title="บันทึกเลขไมล์ด่วน"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>กรอกไมล์ด่วน</span>
            </button>

            {/* Google Sheets Connection Pill */}
            <button
              onClick={onOpenGasModal}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                gasConfig.webAppUrl && gasConfig.isConnected
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {gasConfig.webAppUrl && gasConfig.isConnected ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Sheets & Drive: เชื่อมต่อแล้ว</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>เชื่อมต่อ Google Sheets</span>
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                </>
              )}
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenGasModal}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              title="ตั้งค่า Google Sheets"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800">
            <button
              onClick={() => {
                onOpenQuickMileage();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 text-white text-sm font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              <span>กรอกเลขไมล์</span>
            </button>
            <button
              onClick={() => {
                onOpenAddVehicle();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600 text-white text-sm font-medium"
            >
              <Car className="w-4 h-4" />
              <span>เพิ่มรถใหม่</span>
            </button>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-slate-900 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
