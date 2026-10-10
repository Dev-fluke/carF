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
import { fetchGoogleSheetsData } from './services/googleService';
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
  const [vehicles, setVehicles] = useState(() => getVehicles());
  const [inspections, setInspections] = useState(() => getInspections());
  const [mileageLogs, setMileageLogs] = useState(() => getMileageLogs());
  const [gasConfig, setGasConfig] = useState(() => getGasConfig());

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
    // Auto background sync from Google Sheets if connected
    const config = getGasConfig();
    if (config?.webAppUrl) {
      fetchGoogleSheetsData(config.webAppUrl)
        .then((remoteData) => {
          if (remoteData && remoteData.success) {
            handleSyncComplete(remoteData);
          }
        })
        .catch((err) => console.warn('Background sync error:', err));
    }
  }, []);

  // Compute maintenance alert count
  const alertsCount = vehicles.filter(
    (v) => v.status === 'overdue' || v.status === 'due_soon'
  ).length;

  // Handlers
  const handleInspectVehicle = (vehicle) => {
    setSelectedVehicleForInspect(vehicle?.id || null);
    setActiveTab('inspect');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogMileage = (vehicle) => {
    setSelectedVehicleForMileage(vehicle?.id || null);
    setActiveTab('mileage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleServiceVehicle = (vehicle) => {
    setSelectedVehicleForService(vehicle);
    setActiveTab('maintenance');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAddVehicle = () => {
    setOpenAddVehicleOnMount(true);
    setActiveTab('vehicles');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInspectionSuccess = () => {
    refreshData();
    setActiveTab('history');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMileageSuccess = () => {
    refreshData();
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleServiceCompleted = () => {
    refreshData();
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSyncComplete = (remoteData) => {
    if (remoteData.vehicles && remoteData.vehicles.length > 0) {
      const localVehicles = getVehicles();
      const mergedVehicles = remoteData.vehicles.map((remoteVeh) => {
        const localMatch = localVehicles.find(
          (lv) => lv.id === remoteVeh.id || lv.plate === remoteVeh.plate
        );
        if (localMatch) {
          return {
            ...localMatch,
            ...remoteVeh,
            photoUrl: remoteVeh.photoUrl || localMatch.photoUrl || '',
            taxDueDate: remoteVeh.taxDueDate || localMatch.taxDueDate || '',
            insuranceDueDate: remoteVeh.insuranceDueDate || localMatch.insuranceDueDate || '',
            nickname: remoteVeh.nickname || localMatch.nickname || remoteVeh.plate
          };
        }
        return remoteVeh;
      });
      saveVehicles(mergedVehicles);
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
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-blue-600 selection:text-white antialiased">
      
      {/* Top Navbar & Mobile Bottom Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        gasConfig={gasConfig}
        onOpenGasModal={() => setIsGasModalOpen(true)}
        onOpenQuickMileage={() => {
          setSelectedVehicleForMileage(null);
          setActiveTab('mileage');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAddVehicle={handleOpenAddVehicle}
        alertsCount={alertsCount}
        vehicles={vehicles}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {activeTab === 'dashboard' && (
          <Dashboard
            vehicles={vehicles}
            inspections={inspections}
            mileageLogs={mileageLogs}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenQuickMileage={(veh) => {
              setSelectedVehicleForMileage(veh?.id || null);
              setActiveTab('mileage');
              window.scrollTo({ top: 0, behavior: 'smooth' });
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
            onCancel={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
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

      {/* Footer (Desktop view) */}
      <footer className="hidden md:block bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-white font-bold">My Garage</span>
            <span>•</span>
            <span>สมุดบันทึกดูแลรักษารถยนต์ & มอเตอร์ไซค์ส่วนตัว (Google Sheets & Drive Sync)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={() => setIsGasModalOpen(true)} className="hover:text-blue-400 transition">
              ตั้งค่า Google Sheets
            </button>
            <span>•</span>
            <span>เวอร์ชัน 2.0 (Personal Mobile Edition)</span>
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
