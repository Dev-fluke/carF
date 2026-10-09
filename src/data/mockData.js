export const INITIAL_VEHICLES = [
  {
    id: 'veh-1',
    plate: '1กข 4589',
    province: 'กรุงเทพมหานคร',
    brand: 'Toyota',
    model: 'Hilux Revo 2.4 D-Cab',
    type: 'รถกระบะ (Pickup)',
    year: '2022',
    color: 'ขาวมุก',
    photoUrl: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format&fit=crop&q=80',
    currentMileage: 48500,
    lastServiceMileage: 40000,
    serviceIntervalKm: 10000,
    nextServiceMileage: 50000,
    lastServiceDate: '2024-08-15',
    serviceIntervalMonths: 6,
    nextServiceDate: '2025-02-15',
    assignedDriver: 'สมชาย ใจดี',
    fuelType: 'ดีเซล (Diesel)',
    status: 'due_soon', // normal | due_soon | overdue
    notes: 'ใช้งานทั่วไป ขนส่งอุปกรณ์'
  },
  {
    id: 'veh-2',
    plate: 'ฮภ 9921',
    province: 'กรุงเทพมหานคร',
    brand: 'Toyota',
    model: 'Commuter 2.8 Van',
    type: 'รถตู้ (Van)',
    year: '2023',
    color: 'บรอนซ์เงิน',
    photoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
    currentMileage: 61200,
    lastServiceMileage: 50000,
    serviceIntervalKm: 10000,
    nextServiceMileage: 60000,
    lastServiceDate: '2024-05-10',
    serviceIntervalMonths: 6,
    nextServiceDate: '2024-11-10',
    assignedDriver: 'วิชัย มั่นคง',
    fuelType: 'ดีเซล (Diesel)',
    status: 'overdue', // 61,200 > 60,000 km
    notes: 'รถรับส่งพนักงานและผู้บริหาร'
  },
  {
    id: 'veh-3',
    plate: '3ขง 1234',
    province: 'กรุงเทพมหานคร',
    brand: 'Honda',
    model: 'City e:HEV RS',
    type: 'รถเก๋ง (Sedan)',
    year: '2023',
    color: 'เทาเมทัลลิก',
    photoUrl: 'https://images.unsplash.com/photo-1590362891988-f7761733a661?w=800&auto=format&fit=crop&q=80',
    currentMileage: 22400,
    lastServiceMileage: 20000,
    serviceIntervalKm: 10000,
    nextServiceMileage: 30000,
    lastServiceDate: '2024-10-01',
    serviceIntervalMonths: 6,
    nextServiceDate: '2025-04-01',
    assignedDriver: 'กานดา สุขสม',
    fuelType: 'ไฮบริด/เบนซิน (Gasoline/Hybrid)',
    status: 'normal',
    notes: 'รถประจำตำแหน่งฝ่ายขาย'
  },
  {
    id: 'veh-4',
    plate: '70-5541',
    province: 'สมุทรปราการ',
    brand: 'Isuzu',
    model: 'ELF 6 ล้อ 175 แรงม้า',
    type: 'รถบรรทุก (Truck)',
    year: '2021',
    color: 'ขาว-น้ำเงิน',
    photoUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80',
    currentMileage: 119800,
    lastServiceMileage: 110000,
    serviceIntervalKm: 10000,
    nextServiceMileage: 120000,
    lastServiceDate: '2024-07-20',
    serviceIntervalMonths: 6,
    nextServiceDate: '2025-01-20',
    assignedDriver: 'อนันต์ สายลุย',
    fuelType: 'ดีเซล (Diesel)',
    status: 'due_soon', // เหลือ 200 กม.
    notes: 'รถขนส่งสินค้าสายภาคตะวันออก'
  }
];

export const INSPECTION_CATEGORIES = [
  {
    id: 'fluids',
    name: 'ระบบของเหลวและเครื่องยนต์',
    icon: 'Droplets',
    items: [
      { id: 'fluid_oil', name: 'ระดับน้ำมันเครื่อง (Engine Oil)', desc: 'อยู่ในเกณฑ์ Min-Max สีไม่ดำข้นเกินไป' },
      { id: 'fluid_brake', name: 'ระดับน้ำมันเบรก / คลัตช์ (Brake Fluid)', desc: 'ไม่ต่ำกว่าขีด Min' },
      { id: 'fluid_coolant', name: 'น้ำหล่อเย็นและหม้อพักน้ำ (Coolant)', desc: 'ระดับปกติ ไม่มีคราบรั่วซึม' },
      { id: 'fluid_washer', name: 'น้ำยาฉีดกระจก (Washer Fluid)', desc: 'มีเพียงพอ หัวฉีดไม่อุดตัน' },
      { id: 'fluid_battery', name: 'สภาพแบตเตอรี่ & ขั้วต่อ (Battery)', desc: 'ไม่มีคราบขี้เกลือ แน่นหนา' }
    ]
  },
  {
    id: 'wheels_tires',
    name: 'ระบบช่วงล่าง ยาง และเบรก',
    icon: 'Disc',
    items: [
      { id: 'tire_pressure', name: 'แรงดันลมยางทั้ง 4 ล้อ (Tire Pressure)', desc: 'ไม่อ่อนหรือแข็งเกินไป' },
      { id: 'tire_tread', name: 'สภาพดอกยางและแก้มยาง (Tire Condition)', desc: 'ไม่สึกหรอโล้น ไม่มีรอยแตกบวม' },
      { id: 'wheel_nuts', name: 'น็อตล้อและสภาพล้อแม็ก (Wheel Nuts)', desc: 'ขันแน่นครบทุกตัว ไม่คดงอ' },
      { id: 'brake_system', name: 'ระบบเบรกและเบรกมือ (Brake Test)', desc: 'เบรกอยู่ดี ไม่ลึก ไม่ปัด ไม่ดัง' }
    ]
  },
  {
    id: 'lights_signals',
    name: 'ระบบไฟส่องสว่างและสัญญาณ',
    icon: 'SunMedium',
    items: [
      { id: 'light_head', name: 'ไฟหน้า (สูง - ต่ำ)', desc: 'ติดครบสองข้าง ไม่หรี่ ไม่แตก' },
      { id: 'light_signal', name: 'ไฟเลี้ยว ซ้าย-ขวา / ไฟฉุกเฉิน', desc: 'กระพริบปกติทั้งหน้าและหลัง' },
      { id: 'light_tail_brake', name: 'ไฟท้าย และ ไฟเบรก', desc: 'ติดครบ สว่างชัดเจนเมื่อเหยียบเบรก' },
      { id: 'light_reverse', name: 'ไฟถอยหลัง (Reverse Light)', desc: 'ติดเมื่อเข้าเกียร์ R' },
      { id: 'horn', name: 'แตร (Horn)', desc: 'เสียงดังชัดเจน' }
    ]
  },
  {
    id: 'exterior_interior',
    name: 'อุปกรณ์ภายนอกและภายในห้องโดยสาร',
    icon: 'Gauge',
    items: [
      { id: 'wipers', name: 'ใบปัดน้ำฝน (Wipers)', desc: 'ยางไม่กรอบ ปัดสะอาด ไม่มีเสียงดัง' },
      { id: 'mirrors', name: 'กระจกมองข้างและกระจกมองหลัง', desc: 'ใส สะอาด ปรับได้ปกติ ไม่แตกร้าว' },
      { id: 'seatbelts', name: 'เข็มขัดนิรภัยทุกที่นั่ง (Seatbelts)', desc: 'ดึงล็อคกระชับ สายไม่ขาดชำรุด' },
      { id: 'ac_system', name: 'ระบบปรับอากาศ (A/C)', desc: 'เย็นปกติ ไม่มีกลิ่นอับ' },
      { id: 'dash_warning', name: 'ไฟเตือนบนหน้าปัด (Dashboard Warning)', desc: 'ไม่มีไฟเตือนรูปเครื่องยนต์หรือ ABS ค้าง' }
    ]
  },
  {
    id: 'safety_equipment',
    name: 'อุปกรณ์ความปลอดภัยฉุกเฉิน',
    icon: 'ShieldAlert',
    items: [
      { id: 'spare_tire', name: 'ยางอะไหล่ (Spare Tire)', desc: 'มีพร้อมใช้ ลมยางพร้อม' },
      { id: 'jack_tools', name: 'แม่แรงและชุดเครื่องมือเปลี่ยนล้อ', desc: 'มีครบชุดในตัวรถ' },
      { id: 'extinguisher', name: 'ถังดับเพลิงฉุกเฉิน / ป้ายสามเหลี่ยมสะท้อนแสง', desc: 'เกจวัดปกติ มีพร้อมหยิบใช้' },
      { id: 'dashcam', name: 'กล้องบันทึกหน้ารถ (Dashcam)', desc: 'เปิดติด บันทึกไฟล์ปกติ' }
    ]
  }
];

export const INITIAL_INSPECTIONS = [
  {
    id: 'insp-101',
    vehicleId: 'veh-1',
    plate: '1กข 4589',
    inspectorName: 'สมชาย ใจดี',
    inspectionDate: '2024-10-09 08:30',
    mileage: 48500,
    overallResult: 'PASS', // PASS | WARNING | FAIL
    passedCount: 22,
    warningCount: 0,
    failedCount: 0,
    notes: 'ตรวจเช็คประจำวัน สภาพรถสมบูรณ์พร้อมใช้งาน',
    defectPhotos: [],
    items: {
      fluid_oil: 'pass',
      fluid_brake: 'pass',
      fluid_coolant: 'pass',
      fluid_washer: 'pass',
      fluid_battery: 'pass',
      tire_pressure: 'pass',
      tire_tread: 'pass',
      wheel_nuts: 'pass',
      brake_system: 'pass',
      light_head: 'pass',
      light_signal: 'pass',
      light_tail_brake: 'pass',
      light_reverse: 'pass',
      horn: 'pass',
      wipers: 'pass',
      mirrors: 'pass',
      seatbelts: 'pass',
      ac_system: 'pass',
      dash_warning: 'pass',
      spare_tire: 'pass',
      jack_tools: 'pass',
      extinguisher: 'pass',
      dashcam: 'pass'
    }
  },
  {
    id: 'insp-102',
    vehicleId: 'veh-2',
    plate: 'ฮภ 9921',
    inspectorName: 'วิชัย มั่นคง',
    inspectionDate: '2024-10-08 07:45',
    mileage: 61200,
    overallResult: 'WARNING',
    passedCount: 20,
    warningCount: 2,
    failedCount: 1,
    notes: 'ไฟเบรกดวงขวาขาด และยางหน้าซ้ายมีรอยกินข้าง ควรรีบนำเข้าศูนย์เช็คระยะ',
    defectPhotos: [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'
    ],
    items: {
      fluid_oil: 'warning',
      fluid_brake: 'pass',
      fluid_coolant: 'pass',
      fluid_washer: 'pass',
      fluid_battery: 'pass',
      tire_pressure: 'pass',
      tire_tread: 'warning',
      wheel_nuts: 'pass',
      brake_system: 'pass',
      light_head: 'pass',
      light_signal: 'pass',
      light_tail_brake: 'fail',
      light_reverse: 'pass',
      horn: 'pass',
      wipers: 'pass',
      mirrors: 'pass',
      seatbelts: 'pass',
      ac_system: 'pass',
      dash_warning: 'pass',
      spare_tire: 'pass',
      jack_tools: 'pass',
      extinguisher: 'pass',
      dashcam: 'pass'
    }
  }
];

export const INITIAL_MILEAGE_LOGS = [
  {
    id: 'mile-1',
    vehicleId: 'veh-1',
    plate: '1กข 4589',
    driverName: 'สมชาย ใจดี',
    date: '2024-10-09 17:30',
    startMileage: 48250,
    endMileage: 48500,
    distanceKm: 250,
    purpose: 'ส่งสินค้าคลังบางพลี - พระราม 2',
    fuelAddedLiters: 35,
    fuelCostBaht: 1100,
    notes: 'การเดินทางราบรื่น'
  },
  {
    id: 'mile-2',
    vehicleId: 'veh-2',
    plate: 'ฮภ 9921',
    driverName: 'วิชัย มั่นคง',
    date: '2024-10-08 19:00',
    startMileage: 61000,
    endMileage: 61200,
    distanceKm: 200,
    purpose: 'รับส่งเจ้าหน้าที่สัมมนาพัทยา',
    fuelAddedLiters: 40,
    fuelCostBaht: 1250,
    notes: 'เลยระยะเช็คระยะ 60,000 กม. แล้ว'
  },
  {
    id: 'mile-3',
    vehicleId: 'veh-3',
    plate: '3ขง 1234',
    driverName: 'กานดา สุขสม',
    date: '2024-10-07 16:20',
    startMileage: 22300,
    endMileage: 22400,
    distanceKm: 100,
    purpose: 'พบลูกค้าโซนสาทร-สีลม',
    fuelAddedLiters: 0,
    fuelCostBaht: 0,
    notes: 'ปกติ'
  }
];

export const MAINTENANCE_TYPES = [
  { id: 'oil_change', name: 'เปลี่ยนถ่ายน้ำมันเครื่อง & ไส้กรอง', intervalKm: 10000, intervalMonths: 6, icon: 'Droplet' },
  { id: 'tire_service', name: 'สลับยาง ถ่วงล้อ & ตั้งศูนย์', intervalKm: 10000, intervalMonths: 6, icon: 'Disc' },
  { id: 'brake_service', name: 'ตรวจเช็คผ้าเบรก & น้ำมันเบรก', intervalKm: 20000, intervalMonths: 12, icon: 'ShieldAlert' },
  { id: 'filters', name: 'เปลี่ยนไส้กรองอากาศ & กรองแอร์', intervalKm: 20000, intervalMonths: 12, icon: 'Wind' },
  { id: 'spark_plugs', name: 'เปลี่ยนหัวเทียน / กรองน้ำมันเชื้อเพลิง', intervalKm: 40000, intervalMonths: 24, icon: 'Zap' },
  { id: 'transmission_fluid', name: 'เปลี่ยนน้ำมันเกียร์ & เฟืองท้าย', intervalKm: 40000, intervalMonths: 24, icon: 'Cog' },
  { id: 'battery', name: 'ตรวจเช็ค/เปลี่ยนแบตเตอรี่', intervalKm: 50000, intervalMonths: 24, icon: 'BatteryCharging' },
  { id: 'tax_insurance', name: 'ต่อภาษี พ.ร.บ. & ประกันภัยประจำปี', intervalKm: 0, intervalMonths: 12, icon: 'FileText' }
];
