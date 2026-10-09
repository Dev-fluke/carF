export const VEHICLE_TYPES = [
  'รถเก๋ง (Sedan / Hatchback)',
  'รถ SUV / PPV / Crossover',
  'รถกระบะ (Pickup)',
  'รถตู้ (Van / MPV)',
  'รถจักรยานยนต์ (Motorcycle)',
  'รถสกู๊ตเตอร์ / ออโตเมติก (Scooter)',
  'รถบิ๊กไบค์ (Big Bike)',
  'รถยนต์ไฟฟ้า (EV)',
  'รถบรรทุก (Truck)'
];

export const isMotorcycleType = (type = '') => {
  const t = (type || '').toLowerCase();
  return (
    t.includes('จักรยานยนต์') ||
    t.includes('มอเตอร์ไซค์') ||
    t.includes('motorcycle') ||
    t.includes('bike') ||
    t.includes('scooter') ||
    t.includes('สกู๊ตเตอร์') ||
    t.includes('เวสป้า')
  );
};

export const INITIAL_VEHICLES = [
  {
    id: 'veh-1',
    nickname: 'น้องซิตี้ (รถใช้ประจำวัน)',
    plate: '3ขง 1234',
    province: 'กรุงเทพมหานคร',
    brand: 'Honda',
    model: 'City e:HEV RS',
    type: 'รถเก๋ง (Sedan / Hatchback)',
    year: '2023',
    color: 'เทาเมทัลลิก',
    photoUrl: 'https://images.unsplash.com/photo-1590362891988-f7761733a661?w=800&auto=format&fit=crop&q=80',
    currentMileage: 22400,
    lastServiceMileage: 20000,
    serviceIntervalKm: 10000,
    nextServiceMileage: 30000,
    lastServiceDate: '2024-08-01',
    serviceIntervalMonths: 6,
    nextServiceDate: '2025-02-01',
    taxDueDate: '2025-03-15',
    insuranceDueDate: '2025-03-15',
    fuelType: 'ไฮบริด/เบนซิน (Gasoline/Hybrid)',
    status: 'normal',
    notes: 'รถยนต์ส่วนตัว ขับไปทำงานและเดินทางต่างจังหวัด'
  },
  {
    id: 'veh-2',
    nickname: 'เวฟคู่ใจ (ใช้ในซอย/ไปตลาด)',
    plate: '1กข 7788',
    province: 'กรุงเทพมหานคร',
    brand: 'Honda',
    model: 'Wave 110i LED',
    type: 'รถจักรยานยนต์ (Motorcycle)',
    year: '2023',
    color: 'แดง-ดำ',
    photoUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80',
    currentMileage: 8450,
    lastServiceMileage: 4000,
    serviceIntervalKm: 4000,
    nextServiceMileage: 8000,
    lastServiceDate: '2024-06-15',
    serviceIntervalMonths: 4,
    nextServiceDate: '2024-10-15',
    taxDueDate: '2025-05-20',
    insuranceDueDate: '2025-05-20',
    fuelType: 'เบนซิน 95 / E20',
    status: 'overdue', // 8,450 > 8,000 km
    notes: 'มอเตอร์ไซค์คันโปรด ขี่คล่องตัว ประหยัดน้ำมัน'
  },
  {
    id: 'veh-3',
    nickname: 'พี่ยักษ์ (รถครอบครัว/ลุยเที่ยว)',
    plate: '1กข 4589',
    province: 'กรุงเทพมหานคร',
    brand: 'Toyota',
    model: 'Hilux Revo Double Cab',
    type: 'รถกระบะ (Pickup)',
    year: '2022',
    color: 'ขาวมุก',
    photoUrl: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format&fit=crop&q=80',
    currentMileage: 49200,
    lastServiceMileage: 40000,
    serviceIntervalKm: 10000,
    nextServiceMileage: 50000,
    lastServiceDate: '2024-07-10',
    serviceIntervalMonths: 6,
    nextServiceDate: '2025-01-10',
    taxDueDate: '2024-11-30',
    insuranceDueDate: '2024-11-30',
    fuelType: 'ดีเซล (Diesel)',
    status: 'due_soon', // เหลือ 800 กม.
    notes: 'ใช้งานขนของ ท่องเที่ยวต่างจังหวัด'
  }
];

// รายการตรวจสภาพสำหรับ "รถยนต์ทั่วไป" (Personal Car Checklist)
export const CAR_INSPECTION_CATEGORIES = [
  {
    id: 'fluids',
    name: '1. ของเหลว & ห้องเครื่อง',
    icon: 'Droplets',
    items: [
      { id: 'fluid_oil', name: 'ระดับน้ำมันเครื่อง (Engine Oil)', desc: 'ดึงก้านวัดดูระดับ Min-Max และสีน้ำมัน' },
      { id: 'fluid_coolant', name: 'น้ำหล่อเย็น & หม้อพักน้ำ', desc: 'ระดับปกติ ไม่มีรอยรั่วซึมรอบหม้อน้ำ' },
      { id: 'fluid_brake', name: 'น้ำมันเบรก (Brake Fluid)', desc: 'อยู่ในเกณฑ์ปกติ ไม่พร่องต่ำกว่าขีด Min' },
      { id: 'fluid_washer', name: 'น้ำฉีดกระจก (Washer Fluid)', desc: 'มีน้ำเพียงพอ หัวฉีดไม่อุดตัน' },
      { id: 'fluid_battery', name: 'ขั้วแบตเตอรี่ (Battery)', desc: 'แน่นหนา ไม่มีคราบขี้เกลือเกาะ' }
    ]
  },
  {
    id: 'wheels_tires',
    name: '2. ยาง ช่วงล่าง & เบรก',
    icon: 'Disc',
    items: [
      { id: 'tire_pressure', name: 'ลมยางทั้ง 4 ล้อ (Tire Pressure)', desc: 'เติมตามสเปกข้างประตู ไม่แบนหรือแข็งเกินไป' },
      { id: 'tire_tread', name: 'ดอกยาง & แก้มยาง', desc: 'ดอกยางลึกพอ ไม่โล้น ไม่มีรอยบวมหรือแตก' },
      { id: 'wheel_nuts', name: 'น็อตล้อ & แม็กซ์', desc: 'แน่นหนาทุกล้อ ไม่คดงอ' },
      { id: 'brake_system', name: 'ความรู้สึกการเหยียบเบรก & เบรกมือ', desc: 'เบรกอยู่ดี ไม่จมลึก ไม่สั่น ไม่ดัง' }
    ]
  },
  {
    id: 'lights_signals',
    name: '3. ระบบไฟ & สัญญาณเตือน',
    icon: 'SunMedium',
    items: [
      { id: 'light_head', name: 'ไฟหน้า (สูง - ต่ำ)', desc: 'สว่างชัดเจนทั้งซ้ายและขวา' },
      { id: 'light_signal', name: 'ไฟเลี้ยว & ไฟฉุกเฉิน', desc: 'กระพริบปกติทั้งหน้า-หลัง ซ้าย-ขวา' },
      { id: 'light_tail_brake', name: 'ไฟท้าย & ไฟเบรก', desc: 'ติดสว่างชัดเจนเมื่อเหยียบเบรก' },
      { id: 'horn', name: 'แตร (Horn)', desc: 'เสียงดังชัดเจน' }
    ]
  },
  {
    id: 'exterior_interior',
    name: '4. ภายใน & ความสบาย',
    icon: 'Gauge',
    items: [
      { id: 'wipers', name: 'ใบปัดน้ำฝน (Wipers)', desc: 'ยางไม่ฉีกขาด ปัดสะอาด ไม่มีเสียงดัง' },
      { id: 'mirrors', name: 'กระจกมองข้าง & มองหลัง', desc: 'ปรับมุมมองได้ชัดเจน กระจกสะอาด' },
      { id: 'ac_system', name: 'ระบบแอร์ (A/C)', desc: 'ลมแรง เย็นฉ่ำ ไม่มีกลิ่นอับ' },
      { id: 'dash_warning', name: 'ไฟเตือนบนหน้าปัด', desc: 'ไม่มีไฟเครื่องยนต์ หรือไฟเตือนสีแดง/ส้มค้าง' }
    ]
  },
  {
    id: 'safety_equipment',
    name: '5. เอกสาร & อุปกรณ์ฉุกเฉิน',
    icon: 'ShieldAlert',
    items: [
      { id: 'tax_insurance', name: 'ป้ายภาษี พ.ร.บ. & ประกันภัย', desc: 'ยังไม่หมดอายุ มีสำเนาติดรถ' },
      { id: 'spare_tire', name: 'ยางอะไหล่ / ชุดปะยางฉุกเฉิน', desc: 'พร้อมใช้งาน' },
      { id: 'dashcam', name: 'กล้องติดหน้ารถ (Dashcam)', desc: 'บันทึกภาพปกติ เมมไม่เต็ม' }
    ]
  }
];

// รายการตรวจสภาพสำหรับ "รถจักรยานยนต์ / มอเตอร์ไซค์" (Personal Motorcycle Checklist)
export const MOTORCYCLE_INSPECTION_CATEGORIES = [
  {
    id: 'mc_engine_fluids',
    name: '1. เครื่องยนต์ & ของเหลว',
    icon: 'Droplets',
    items: [
      { id: 'mc_oil', name: 'ระดับน้ำมันเครื่อง (Engine Oil)', desc: 'ดูตาแมว/ก้านวัด ระดับพอดี สีไม่ดำข้น' },
      { id: 'mc_coolant', name: 'น้ำยาหม้อน้ำ/พักน้ำ (ถ้ามี)', desc: 'ระดับปกติ ไม่มีน้ำหยดรั่วซึม' },
      { id: 'mc_battery_start', name: 'สตาร์ทมือ / สตาร์ทเท้า', desc: 'สตาร์ทติดง่าย ไฟแรงสม่ำเสมอ' },
      { id: 'mc_air_filter', name: 'กรองอากาศ & ท่อไอเสีย', desc: 'สะอาด ท่อไอเสียแน่น ไม่มีควันขาว' }
    ]
  },
  {
    id: 'mc_drivetrain_tires',
    name: '2. โซ่ สเตอร์ สายพาน & ยาง',
    icon: 'Disc',
    items: [
      { id: 'mc_chain_belt', name: 'โซ่-สเตอร์ / สายพานขับ', desc: 'โซ่ไม่หย่อนเกินไป หยอดน้ำมันลื่น ฟันสเตอร์ไม่แหลม' },
      { id: 'mc_tire_front', name: 'ยางหน้า & วงล้อ', desc: 'ลมยางพอดี ดอกยางไม่โล้น ซี่ลวด/แม็กซ์ไม่คด' },
      { id: 'mc_tire_rear', name: 'ยางหลัง & วงล้อ', desc: 'ลมยางพอดี ดอกยางหนา ไม่มีรอยตะปู/ฉีกขาด' },
      { id: 'mc_suspension', name: 'โช้คหน้า & โช้คหลัง', desc: 'แกนโช้คใส ไม่มีน้ำมันซึม นุ่มนวล' }
    ]
  },
  {
    id: 'mc_brakes_controls',
    name: '3. เบรก คันเร่ง & แฮนด์',
    icon: 'Gauge',
    items: [
      { id: 'mc_brake_front', name: 'เบรกหน้า (ก้านเบรก / ผ้าเบรก)', desc: 'ระยะเหนี่ยวก้านเบรกกระชับ เบรกอยู่มั่นใจ' },
      { id: 'mc_brake_rear', name: 'เบรกหลัง (แป้นเหยียบ / ก้านเบรก)', desc: 'ระยะเหยียบพอดี เบรกอยู่ดี ไม่ลึก' },
      { id: 'mc_throttle_clutch', name: 'คันเร่ง & คลัตช์', desc: 'คันเร่งบิดลื่น คืนตัวทันที คลัตช์นิ่มนวล' },
      { id: 'mc_handlebar_steering', name: 'คอแฮนด์ & เลี้ยว', desc: 'เลี้ยวซ้าย-ขวาคล่องตัว ไม่ฝืด ไม่ส่าย' },
      { id: 'mc_stands', name: 'ขาตั้งข้าง & ขาตั้งคู่', desc: 'สปริงแข็งแรง ขาตั้งพับกลับได้ดี' }
    ]
  },
  {
    id: 'mc_lights_signals',
    name: '4. ระบบไฟ & สัญญาณ',
    icon: 'SunMedium',
    items: [
      { id: 'mc_light_head', name: 'ไฟหน้า (สูง - ต่ำ)', desc: 'สว่างชัดเจน ไม่ขาด' },
      { id: 'mc_light_signals', name: 'ไฟเลี้ยว หน้า-หลัง ซ้าย-ขวา', desc: 'กระพริบปกติครบ 4 ดวง' },
      { id: 'mc_light_tail_brake', name: 'ไฟท้าย & ไฟเบรก', desc: 'ติดสว่างเมื่อบีบหรือเหยียบเบรก' },
      { id: 'mc_horn', name: 'แตร (Horn)', desc: 'กดติด เสียงดังฟังชัด' }
    ]
  },
  {
    id: 'mc_safety_equipment',
    name: '5. หมวกกันน็อค & พ.ร.บ.',
    icon: 'ShieldAlert',
    items: [
      { id: 'mc_mirrors', name: 'กระจกมองข้าง ซ้าย-ขวา', desc: 'มีครบทั้งสองข้าง ปรับมุมมองชัดเจน' },
      { id: 'mc_helmet_gear', name: 'หมวกกันน็อค', desc: 'มีหมวกสภาพดี ชิลด์หน้าใส สายรัดคางแน่น' },
      { id: 'mc_tax_insurance', name: 'ป้ายภาษี & พ.ร.บ.', desc: 'ยังไม่หมดอายุ พกสำเนาติดรถ' }
    ]
  }
];

export const INSPECTION_CATEGORIES = CAR_INSPECTION_CATEGORIES;

export const getInspectionCategories = (vehicleType = '') => {
  return isMotorcycleType(vehicleType)
    ? MOTORCYCLE_INSPECTION_CATEGORIES
    : CAR_INSPECTION_CATEGORIES;
};

export const INITIAL_INSPECTIONS = [
  {
    id: 'insp-101',
    vehicleId: 'veh-1',
    plate: '3ขง 1234',
    vehicleType: 'รถเก๋ง (Sedan / Hatchback)',
    vehicleBrandModel: 'Honda City e:HEV RS',
    inspectorName: 'เจ้าของรถ (ฉันเอง)',
    inspectionDate: '2024-10-09 08:30',
    mileage: 22400,
    overallResult: 'PASS',
    passedCount: 16,
    warningCount: 0,
    failedCount: 0,
    notes: 'เช็คสภาพก่อนออกเดินทางไปทำงาน รถสมบูรณ์พร้อมใช้',
    defectPhotos: [],
    items: {
      fluid_oil: 'pass',
      fluid_coolant: 'pass',
      fluid_brake: 'pass',
      fluid_washer: 'pass',
      fluid_battery: 'pass',
      tire_pressure: 'pass',
      tire_tread: 'pass',
      wheel_nuts: 'pass',
      brake_system: 'pass',
      light_head: 'pass',
      light_signal: 'pass',
      light_tail_brake: 'pass',
      horn: 'pass',
      wipers: 'pass',
      mirrors: 'pass',
      ac_system: 'pass',
      dash_warning: 'pass',
      tax_insurance: 'pass',
      spare_tire: 'pass',
      dashcam: 'pass'
    }
  },
  {
    id: 'insp-102',
    vehicleId: 'veh-2',
    plate: '1กข 7788',
    vehicleType: 'รถจักรยานยนต์ (Motorcycle)',
    vehicleBrandModel: 'Honda Wave 110i LED',
    inspectorName: 'เจ้าของรถ (ฉันเอง)',
    inspectionDate: '2024-10-08 17:00',
    mileage: 8450,
    overallResult: 'WARNING',
    passedCount: 16,
    warningCount: 1,
    failedCount: 0,
    notes: 'โซ่เริ่มหย่อนเล็กน้อย ควรหยอดน้ำมันโซ่ และเลยรอบถ่ายน้ำมันเครื่องแล้ว',
    defectPhotos: [],
    items: {
      mc_oil: 'warning',
      mc_coolant: 'pass',
      mc_battery_start: 'pass',
      mc_air_filter: 'pass',
      mc_chain_belt: 'warning',
      mc_tire_front: 'pass',
      mc_tire_rear: 'pass',
      mc_suspension: 'pass',
      mc_brake_front: 'pass',
      mc_brake_rear: 'pass',
      mc_throttle_clutch: 'pass',
      mc_handlebar_steering: 'pass',
      mc_stands: 'pass',
      mc_light_head: 'pass',
      mc_light_signals: 'pass',
      mc_light_tail_brake: 'pass',
      mc_horn: 'pass',
      mc_mirrors: 'pass',
      mc_helmet_gear: 'pass',
      mc_tax_insurance: 'pass'
    }
  }
];

export const INITIAL_MILEAGE_LOGS = [
  {
    id: 'mile-1',
    vehicleId: 'veh-1',
    plate: '3ขง 1234',
    driverName: 'เจ้าของรถ',
    date: '2024-10-09 18:30',
    startMileage: 22320,
    endMileage: 22400,
    distanceKm: 80,
    purpose: 'ขับไป-กลับที่ทำงาน (อโศก - บางนา)',
    fuelAddedLiters: 0,
    fuelCostBaht: 0,
    notes: 'ขับขี่ประหยัดน้ำมัน 24 กม./ลิตร'
  },
  {
    id: 'mile-2',
    vehicleId: 'veh-2',
    plate: '1กข 7788',
    driverName: 'เจ้าของรถ',
    date: '2024-10-09 12:15',
    startMileage: 8430,
    endMileage: 8450,
    distanceKm: 20,
    purpose: 'ขี่ไปซื้อของตลาดและธุระแถวบ้าน',
    fuelAddedLiters: 3.2,
    fuelCostBaht: 120,
    notes: 'เติมน้ำมันเบนซิน 95 เต็มถัง'
  }
];

export const MAINTENANCE_TYPES = [
  { id: 'oil_change', name: 'เปลี่ยนถ่ายน้ำมันเครื่อง & ไส้กรอง', intervalKm: 10000, intervalMonths: 6, icon: 'Droplet' },
  { id: 'mc_oil_change', name: 'เปลี่ยนถ่ายน้ำมันเครื่องมอเตอร์ไซค์ & เฟืองท้าย', intervalKm: 4000, intervalMonths: 4, icon: 'Droplet' },
  { id: 'mc_chain_belt', name: 'ตั้ง/หยอดน้ำมันโซ่-สเตอร์ หรือเปลี่ยนสายพานขับ', intervalKm: 8000, intervalMonths: 6, icon: 'Cog' },
  { id: 'tire_service', name: 'สลับยาง ถ่วงล้อ & ตั้งศูนย์ (รถยนต์)', intervalKm: 10000, intervalMonths: 6, icon: 'Disc' },
  { id: 'brake_service', name: 'เปลี่ยนผ้าเบรก & เจียรจาน / น้ำมันเบรก', intervalKm: 20000, intervalMonths: 12, icon: 'ShieldAlert' },
  { id: 'filters', name: 'เปลี่ยนไส้กรองแอร์ & กรองอากาศ', intervalKm: 20000, intervalMonths: 12, icon: 'Wind' },
  { id: 'battery', name: 'เปลี่ยนแบตเตอรี่ใหม่', intervalKm: 40000, intervalMonths: 24, icon: 'BatteryCharging' },
  { id: 'tax_act', name: 'ต่อภาษีประจำปี & พ.ร.บ.', intervalKm: 0, intervalMonths: 12, icon: 'FileText' },
  { id: 'insurance', name: 'ต่อประกันภัยรถยนต์ (ชั้น 1/2+/3+)', intervalKm: 0, intervalMonths: 12, icon: 'ShieldCheck' }
];
