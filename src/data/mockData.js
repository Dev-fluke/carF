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

// เริ่มต้นด้วยข้อมูลว่างเปล่า พร้อมสำหรับเริ่มต้นใช้งานจริง
export const INITIAL_VEHICLES = [];

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

// เริ่มต้นว่างเปล่า
export const INITIAL_INSPECTIONS = [];

// เริ่มต้นว่างเปล่า
export const INITIAL_MILEAGE_LOGS = [];

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
