import React from 'react';
import { Car, Bike, Truck } from 'lucide-react';
import { isMotorcycleType } from '../data/mockData';

export const VehicleIcon = ({ type = '', className = 'w-5 h-5' }) => {
  const t = (type || '').toLowerCase();
  
  if (isMotorcycleType(t)) {
    return <Bike className={className} />;
  }
  
  if (t.includes('truck') || t.includes('บรรทุก') || t.includes('6 ล้อ') || t.includes('10 ล้อ')) {
    return <Truck className={className} />;
  }
  
  return <Car className={className} />;
};

export const getVehicleTypeBadge = (type = '') => {
  if (isMotorcycleType(type)) {
    return {
      text: 'มอเตอร์ไซค์ 🏍️',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    };
  }
  if (type.includes('บรรทุก') || type.includes('Truck')) {
    return {
      text: 'รถบรรทุก 🚛',
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    };
  }
  return {
    text: 'รถยนต์ 🚗',
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  };
};
