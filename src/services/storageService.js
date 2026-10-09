import { INITIAL_VEHICLES, INITIAL_INSPECTIONS, INITIAL_MILEAGE_LOGS } from '../data/mockData';

const STORAGE_KEYS = {
  VEHICLES: 'via_vehicles_v1',
  INSPECTIONS: 'via_inspections_v1',
  MILEAGE_LOGS: 'via_mileage_logs_v1',
  GAS_CONFIG: 'via_gas_config_v1',
  MAINTENANCE_LOGS: 'via_maintenance_logs_v1'
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
  localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
};

export const addOrUpdateVehicle = (vehicle) => {
  const vehicles = getVehicles();
  const index = vehicles.findIndex((v) => v.id === vehicle.id);
  
  // Calculate maintenance status
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
  
  // Also update vehicle current mileage if provided
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

  // Check date-based due status if nextServiceDate is set
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
      
      // Calculate next service date (e.g. +6 months)
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

export const getGasConfig = () => {
  const data = localStorage.getItem(STORAGE_KEYS.GAS_CONFIG);
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
