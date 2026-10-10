import { INITIAL_VEHICLES, INITIAL_INSPECTIONS, INITIAL_MILEAGE_LOGS } from '../data/mockData';

const STORAGE_KEYS = {
  VEHICLES: 'mg_vehicles_v2',
  INSPECTIONS: 'mg_inspections_v2',
  MILEAGE_LOGS: 'mg_mileage_logs_v2',
  GAS_CONFIG: 'mg_gas_config_v2',
  MAINTENANCE_LOGS: 'mg_maintenance_logs_v2'
};

// Migrate or get gas config
export const getGasConfig = () => {
  let data = localStorage.getItem(STORAGE_KEYS.GAS_CONFIG);
  if (!data) {
    // Try migrate from v1 if exists
    const oldData = localStorage.getItem('via_gas_config_v1');
    if (oldData) {
      data = oldData;
      localStorage.setItem(STORAGE_KEYS.GAS_CONFIG, oldData);
    }
  }

  if (!data) {
    return {
      webAppUrl: '',
      folderName: 'VehicleInspectionApp_Uploads',
      isConnected: false,
      lastSyncTime: null
    };
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return { webAppUrl: '', folderName: 'VehicleInspectionApp_Uploads', isConnected: false };
  }
};

export const saveGasConfig = (config) => {
  localStorage.setItem(STORAGE_KEYS.GAS_CONFIG, JSON.stringify(config));
};

export const getVehicles = () => {
  const data = localStorage.getItem(STORAGE_KEYS.VEHICLES);
  if (!data) {
    saveVehicles(INITIAL_VEHICLES);
    return INITIAL_VEHICLES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse vehicles', e);
    return INITIAL_VEHICLES;
  }
};

export const saveVehicles = (vehicles) => {
  try {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  } catch (err) {
    console.warn('Quota error in saveVehicles, trimming large base64 photos:', err);
    try {
      // Strip base64 photos exceeding 150KB if localStorage quota is tight
      const compactVehicles = vehicles.map(v => {
        if (v.photoUrl && v.photoUrl.startsWith('data:') && v.photoUrl.length > 150000) {
          return { ...v, photoUrl: '' };
        }
        return v;
      });
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(compactVehicles));
    } catch (innerErr) {
      console.error('Failed to save vehicles to storage:', innerErr);
    }
  }
};

export const addOrUpdateVehicle = (vehicle) => {
  const vehicles = getVehicles();
  const index = vehicles.findIndex((v) => v.id === vehicle.id);
  
  const updatedVehicle = calculateVehicleStatus(vehicle);
  
  let newVehicles;
  if (index >= 0) {
    newVehicles = [...vehicles];
    newVehicles[index] = { ...newVehicles[index], ...updatedVehicle };
  } else {
    newVehicles = [updatedVehicle, ...vehicles];
  }
  saveVehicles(newVehicles);
  return updatedVehicle;
};

export const deleteVehicle = (vehicleId) => {
  const vehicles = getVehicles();
  const filtered = vehicles.filter((v) => v.id !== vehicleId);
  saveVehicles(filtered);
  return filtered;
};

export const getInspections = () => {
  const data = localStorage.getItem(STORAGE_KEYS.INSPECTIONS);
  if (!data) {
    saveInspections(INITIAL_INSPECTIONS);
    return INITIAL_INSPECTIONS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_INSPECTIONS;
  }
};

export const saveInspections = (inspections) => {
  localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(inspections));
};

export const addInspection = (inspection) => {
  const inspections = getInspections();
  const updated = [inspection, ...inspections];
  saveInspections(updated);
  
  if (inspection.vehicleId && inspection.mileage) {
    updateVehicleMileage(inspection.vehicleId, inspection.mileage, inspection.inspectorName);
  }
  return updated;
};

export const getMileageLogs = () => {
  const data = localStorage.getItem(STORAGE_KEYS.MILEAGE_LOGS);
  if (!data) {
    saveMileageLogs(INITIAL_MILEAGE_LOGS);
    return INITIAL_MILEAGE_LOGS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_MILEAGE_LOGS;
  }
};

export const saveMileageLogs = (logs) => {
  localStorage.setItem(STORAGE_KEYS.MILEAGE_LOGS, JSON.stringify(logs));
};

export const addMileageLog = (log) => {
  const logs = getMileageLogs();
  const updated = [log, ...logs];
  saveMileageLogs(updated);

  if (log.vehicleId && log.endMileage) {
    updateVehicleMileage(log.vehicleId, log.endMileage, log.driverName);
  }
  return updated;
};

export const updateVehicleMileage = (vehicleId, newMileage, updatedBy = '') => {
  const vehicles = getVehicles();
  const updated = vehicles.map((v) => {
    if (v.id === vehicleId) {
      const parsedMileage = Number(newMileage);
      const higherMileage = Math.max(v.currentMileage || 0, parsedMileage);
      const nextTarget = v.nextServiceMileage || ((v.lastServiceMileage || 0) + (v.serviceIntervalKm || 10000));
      
      let status = 'normal';
      if (higherMileage >= nextTarget) {
        status = 'overdue';
      } else if (nextTarget - higherMileage <= 1000) {
        status = 'due_soon';
      }

      return {
        ...v,
        currentMileage: higherMileage,
        status,
        lastUpdatedBy: updatedBy,
        lastUpdatedAt: new Date().toISOString()
      };
    }
    return v;
  });
  saveVehicles(updated);
  return updated;
};

export const calculateVehicleStatus = (vehicle) => {
  const current = Number(vehicle.currentMileage || 0);
  const lastKm = Number(vehicle.lastServiceMileage || 0);
  const intervalKm = Number(vehicle.serviceIntervalKm || 10000);
  const nextTargetKm = Number(vehicle.nextServiceMileage || (lastKm + intervalKm));

  let status = 'normal';
  const remainingKm = nextTargetKm - current;

  let dateOverdue = false;
  let dateDueSoon = false;
  if (vehicle.nextServiceDate) {
    const today = new Date();
    const nextDate = new Date(vehicle.nextServiceDate);
    const diffDays = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      dateOverdue = true;
    } else if (diffDays <= 15) {
      dateDueSoon = true;
    }
  }

  if (remainingKm <= 0 || dateOverdue) {
    status = 'overdue';
  } else if (remainingKm <= 1000 || dateDueSoon) {
    status = 'due_soon';
  }

  return {
    ...vehicle,
    nextServiceMileage: nextTargetKm,
    status
  };
};

export const recordVehicleService = (vehicleId, serviceData) => {
  const vehicles = getVehicles();
  const updated = vehicles.map((v) => {
    if (v.id === vehicleId) {
      const newLastMileage = Number(serviceData.serviceMileage || v.currentMileage);
      const intervalKm = Number(v.serviceIntervalKm || 10000);
      const newNextMileage = newLastMileage + intervalKm;
      
      const serviceDate = serviceData.serviceDate ? new Date(serviceData.serviceDate) : new Date();
      const intervalMonths = Number(v.serviceIntervalMonths || 6);
      const nextDate = new Date(serviceDate);
      nextDate.setMonth(nextDate.getMonth() + intervalMonths);
      const nextDateStr = nextDate.toISOString().split('T')[0];

      return {
        ...v,
        lastServiceMileage: newLastMileage,
        nextServiceMileage: newNextMileage,
        lastServiceDate: serviceData.serviceDate || new Date().toISOString().split('T')[0],
        nextServiceDate: nextDateStr,
        status: 'normal',
        lastServiceNotes: serviceData.notes || 'เข้าตรวจเช็คระยะเรียบร้อย'
      };
    }
    return v;
  });
  saveVehicles(updated);
  return updated;
};

export const clearAllLocalData = () => {
  saveVehicles([]);
  saveInspections([]);
  saveMileageLogs([]);
  saveCustomMaintenanceItems([]);
  // Also clean old v1 keys if any
  localStorage.removeItem('via_vehicles_v1');
  localStorage.removeItem('via_inspections_v1');
  localStorage.removeItem('via_mileage_logs_v1');
  return { vehicles: [], inspections: [], mileageLogs: [] };
};

// ==========================================
// Custom Maintenance Items (หน้าใส่รายการซ่อมบำรุงเอง)
// ==========================================
const CUSTOM_MAINT_KEY = 'mg_custom_maintenance_items_v2';

export const DEFAULT_CAR_MAINTENANCE_TEMPLATES = [
  { name: 'เปลี่ยนถ่ายน้ำมันเครื่อง & ไส้กรอง', intervalKm: 10000, category: 'fluids', icon: 'Droplet' },
  { name: 'เปลี่ยนกรองอากาศ (Air Filter)', intervalKm: 20000, category: 'filters', icon: 'Wind' },
  { name: 'เปลี่ยนกรองแอร์ (Cabin Filter)', intervalKm: 20000, category: 'filters', icon: 'Wind' },
  { name: 'เปลี่ยนกรองโซล่า / กรองน้ำมันเชื้อเพลิง', intervalKm: 20000, category: 'filters', icon: 'Fuel' },
  { name: 'เปลี่ยนถ่ายน้ำมันเกียร์', intervalKm: 40000, category: 'fluids', icon: 'Droplet' },
  { name: 'สลับยาง & ถ่วงล้อ', intervalKm: 10000, category: 'tires', icon: 'Disc' },
  { name: 'เปลี่ยนผ้าเบรก (หน้า/หลัง)', intervalKm: 40000, category: 'brakes', icon: 'Disc' },
  { name: 'เปลี่ยนหัวเทียน', intervalKm: 40000, category: 'engine', icon: 'Zap' },
  { name: 'เปลี่ยนแบตเตอรี่', intervalKm: 50000, category: 'battery', icon: 'Zap' }
];

export const DEFAULT_BIKE_MAINTENANCE_TEMPLATES = [
  { name: 'เปลี่ยนถ่ายน้ำมันเครื่อง', intervalKm: 3000, category: 'fluids', icon: 'Droplet' },
  { name: 'เปลี่ยนถ่ายน้ำมันเฟืองท้าย', intervalKm: 6000, category: 'fluids', icon: 'Droplet' },
  { name: 'เปลี่ยนไส้กรองอากาศ', intervalKm: 12000, category: 'filters', icon: 'Wind' },
  { name: 'เปลี่ยนหัวเทียน', intervalKm: 10000, category: 'engine', icon: 'Zap' },
  { name: 'ตรวจเช็ค / เปลี่ยนสายพาน หรือ โซ่-สเตอร์', intervalKm: 15000, category: 'drivetrain', icon: 'Cog' },
  { name: 'เปลี่ยนผ้าเบรก', intervalKm: 15000, category: 'brakes', icon: 'Disc' },
  { name: 'เปลี่ยนยางนอก / ใน', intervalKm: 20000, category: 'tires', icon: 'Disc' }
];

export const getCustomMaintenanceItems = (vehicleId = null) => {
  try {
    const raw = localStorage.getItem(CUSTOM_MAINT_KEY);
    const items = raw ? JSON.parse(raw) : [];
    if (vehicleId) {
      return items.filter(it => it.vehicleId === vehicleId);
    }
    return items;
  } catch (e) {
    console.error('Failed to get custom maintenance items', e);
    return [];
  }
};

export const saveCustomMaintenanceItems = (items) => {
  try {
    localStorage.setItem(CUSTOM_MAINT_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save custom maintenance items', e);
  }
};

export const addOrUpdateCustomMaintenanceItem = (item) => {
  const allItems = getCustomMaintenanceItems();
  const lastMileage = Number(item.lastMileage) || 0;
  const intervalKm = Number(item.intervalKm) || 10000;
  // Auto calculate next target mileage
  const nextMileage = lastMileage + intervalKm;

  const itemToSave = {
    ...item,
    id: item.id || `c-maint-${Date.now()}`,
    lastMileage,
    intervalKm,
    nextMileage,
    updatedAt: new Date().toISOString()
  };

  const idx = allItems.findIndex(i => i.id === itemToSave.id);
  let updated;
  if (idx >= 0) {
    updated = [...allItems];
    updated[idx] = itemToSave;
  } else {
    updated = [itemToSave, ...allItems];
  }
  saveCustomMaintenanceItems(updated);
  return itemToSave;
};

export const deleteCustomMaintenanceItem = (itemId) => {
  const allItems = getCustomMaintenanceItems();
  const updated = allItems.filter(i => i.id !== itemId);
  saveCustomMaintenanceItems(updated);
  return updated;
};

export const recordCustomMaintenanceDone = (itemId, doneData) => {
  const allItems = getCustomMaintenanceItems();
  const item = allItems.find(i => i.id === itemId);
  if (!item) return null;

  const doneMileage = Number(doneData.mileage) || Number(item.nextMileage) || 0;
  const intervalKm = Number(item.intervalKm) || 10000;
  const newNextMileage = doneMileage + intervalKm;

  const updatedItem = {
    ...item,
    lastMileage: doneMileage,
    nextMileage: newNextMileage,
    lastDoneDate: doneData.date || new Date().toISOString().split('T')[0],
    lastCostBaht: Number(doneData.costBaht) || 0,
    lastNotes: doneData.notes || '',
    updatedAt: new Date().toISOString()
  };

  const updatedList = allItems.map(i => i.id === itemId ? updatedItem : i);
  saveCustomMaintenanceItems(updatedList);
  return updatedItem;
};

