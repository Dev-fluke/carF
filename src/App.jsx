import React, { useState, useEffect } from 'react';
import { 
  getVehicles, 
  getInspections, 
  getMileageLogs, 
  getGasConfig, 
  saveVehicles,
  saveInspections,
  saveMileageLogs
} from './services/storageService';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { InspectionForm } from './components/InspectionForm';
import { MileageTracker } from './components/MileageTracker';
import { MaintenanceAlerts } from './components/MaintenanceAlerts';
import { VehiclesList } from './components/VehiclesList';
import { InspectionHistory } from './components/InspectionHistory';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | inspect | mileage | maintenance | vehicles | history
  const [vehicles, setVehicles] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [mileageLogs, setMileageLogs] = useState([]);
  const [gasConfig, setGasConfig] = useState({ webAppUrl: '', isConnected: false });

  // Navigation context states
  const [selectedVehicleForInspect, setSelectedVehicleForInspect] = useState(null);
  const [selectedVehicleForMileage, setSelectedVehicleForMileage] = useState(null);
  const [selectedVehicleForService, setSelectedVehicleForService] = useState(null);

  // Modals
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);
  const [isQuickMileageOpen, setIsQuickMileageOpen] = useState(false);
  const [openAddVehicleOnMount, setOpenAddVehicleOnMount] = useState(false);

  // Load initial data
  const refreshData = () => {
    setVehicles(getVehicles());
    setInspections(getInspections());
    setMileageLogs(getMileageLogs());
    setGasConfig(getGasConfig());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Compute maintenance alert count
  const alertsCount = vehicles.filter(
    (v) => v.status === 'overdue' || v.status === 'due_soon'
  ).length;

  // Handlers
  const handleInspectVehicle = (vehicle) => {
    setSelectedVehicleForInspect(vehicle?.id || null);
    setActiveTab('inspect');
  };

  const handleLogMileage = (vehicle) => {
    setSelectedVehicleForMileage(vehicle?.id || null);
    setActiveTab('mileage');
  };

  const handleServiceVehicle = (vehicle) => {
    setSelectedVehicleForService(vehicle);
    setActiveTab('maintenance');
  };

  const handleOpenAddVehicle = () => {
    setOpenAddVehicleOnMount(true);
    setActiveTab('vehicles');
  };

  const handleInspectionSuccess = () => {
    refreshData();
    setActiveTab('history');
  };

  const handleMileageSuccess = () => {
    refreshData();
  };

  const handleServiceCompleted = () => {
    refreshData();
  };

  const handleSyncComplete = (remoteData) => {
    if (remoteData.vehicles && remoteData.vehicles.length > 0) {
      saveVehicles(remoteData.vehicles);
    }
    if (remoteData.inspections && remoteData.inspections.length > 0) {
      saveInspections(remoteData.inspections);
    }
    if (remoteData.mileageLogs && remoteData.mileageLogs.length > 0) {
      saveMileageLogs(remoteData.mileageLogs);
    }
    refreshData();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        gasConfig={gasConfig}
        onOpenGasModal={() => setIsGasModalOpen(true)}
        onOpenQuickMileage={() => {
          setSelectedVehicleForMileage(null);
          setActiveTab('mileage');
        }}
        onOpenAddVehicle={handleOpenAddVehicle}
        alertsCount={alertsCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {activeTab === 'dashboard' && (
          <Dashboard
            vehicles={vehicles}
            inspections={inspections}
            mileageLogs={mileageLogs}
            onNavigate={setActiveTab}
            onOpenQuickMileage={() => {
              setSelectedVehicleForMileage(null);
              setActiveTab('mileage');
            }}
            onOpenAddVehicle={handleOpenAddVehicle}
            onInspectVehicle={handleInspectVehicle}
            onServiceVehicle={handleServiceVehicle}
          />
        )}

        {activeTab === 'inspect' && (
          <InspectionForm
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleForInspect}
            onSuccess={handleInspectionSuccess}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'mileage' && (
          <MileageTracker
            vehicles={vehicles}
            mileageLogs={mileageLogs}
            selectedVehicleId={selectedVehicleForMileage}
            onSuccess={handleMileageSuccess}
          />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceAlerts
            vehicles={vehicles}
            onServiceCompleted={handleServiceCompleted}
            initialSelectedVehicle={selectedVehicleForService}
          />
        )}

        {activeTab === 'vehicles' && (
          <VehiclesList
            vehicles={vehicles}
            onInspect={handleInspectVehicle}
            onLogMileage={handleLogMileage}
            onRefresh={refreshData}
            openAddOnMount={openAddVehicleOnMount}
          />
        )}

        {activeTab === 'history' && (
          <InspectionHistory
            inspections={inspections}
            vehicles={vehicles}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-white font-bold">AutoCheck Pro</span>
            <span>•</span>
            <span>ระบบตรวจเช็คสภาพรถ & บันทึกเลขไมล์ (Google Sheets & Drive Integration)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={() => setIsGasModalOpen(true)} className="hover:text-blue-400 transition">
              ตั้งค่า Google Sheets
            </button>
            <span>•</span>
            <span>เวอร์ชัน 1.0.0</span>
          </div>
        </div>
      </footer>

      {/* Google Sheets Config Modal */}
      <GoogleSheetsModal
        isOpen={isGasModalOpen}
        onClose={() => setIsGasModalOpen(false)}
        config={gasConfig}
        onConfigUpdated={(cfg) => setGasConfig(cfg)}
        onSyncComplete={handleSyncComplete}
      />

    </div>
  );
}

export default App;
