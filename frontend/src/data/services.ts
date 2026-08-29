export interface Service {
  slug: string;
  name: string;
  nameAr: string;
  category: string;
  icon: string;
  image: string;
  summary: string;
}

const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=70`;

export const serviceCategories = [
  'Construction',
  'Mechanical',
  'Driving & Logistics',
  'Safety',
  'IT & Digital',
  'Business',
  'Security & Hospitality',
  'Agriculture & Healthcare',
];

const raw: Array<[string, string, string, string]> = [
  // [name, nameAr, category, unsplashId]
  ['Electrician', 'كهربائي', 'Construction', '1621905251189-08b45d6a269e'],
  ['Plumber', 'سبّاك', 'Construction', '1607472586893-edb57bdc0e39'],
  ['Welder', 'لحّام', 'Construction', '1504328345606-18bbc8c9d7d1'],
  ['Steel Fixer', 'حداد تسليح', 'Construction', '1503387762-9b6c5e7b46b6'],
  ['Scaffolding Specialist', 'فني سقالات', 'Construction', '1541888946425-d81bb19240f5'],
  ['Civil Technician', 'فني مدني', 'Construction', '1581094794329-c8112a89af12'],
  ['Construction Worker', 'عامل بناء', 'Construction', '1503328427499-d92d1ac3d174'],
  ['Painter', 'دهّان', 'Construction', '1589939705384-5185137a7f0f'],
  ['Carpenter', 'نجّار', 'Construction', '1452860606245-08befc0ff44b'],
  ['Tile Fixer', 'مبلّط', 'Construction', '1581092160562-40aa08e78837'],
  ['Gypsum Worker', 'فني جبس', 'Construction', '1572981779307-38b8cabb2407'],
  ['Mechanical Technician', 'فني ميكانيكا', 'Mechanical', '1581092918056-0c4c3acd3789'],
  ['HVAC Technician', 'فني تكييف مركزي', 'Mechanical', '1581092580497-e0d23cbdf1dc'],
  ['AC Technician', 'فني تبريد', 'Mechanical', '1635348729202-2ec02cfc5dca'],
  ['Forklift Operator', 'مشغّل رافعة شوكية', 'Mechanical', '1565891741441-64926e441838'],
  ['Crane Operator', 'مشغّل رافعة', 'Mechanical', '1504307651254-35680f356dfd'],
  ['Heavy Driver', 'سائق ثقيل', 'Driving & Logistics', '1601584115197-04ecc0da31d7'],
  ['Light Driver', 'سائق خفيف', 'Driving & Logistics', '1449965408869-eaa3f722e40d'],
  ['Warehouse Worker', 'عامل مستودع', 'Driving & Logistics', '1553413077-190dd305871c'],
  ['Factory Worker', 'عامل مصنع', 'Driving & Logistics', '1565514020179-026b92b2d70b'],
  ['Safety Officer', 'مسؤول سلامة', 'Safety', '1578255321055-d6e0123e4f6a'],
  ['HSE Officer', 'مسؤول الصحة والسلامة', 'Safety', '1581092160607-7baca1f17e0a'],
  ['IT Technician', 'فني تقنية', 'IT & Digital', '1518770660439-4636190af475'],
  ['Software Engineer', 'مهندس برمجيات', 'IT & Digital', '1517694712202-14dd9538aa97'],
  ['Network Engineer', 'مهندس شبكات', 'IT & Digital', '1558494949-ef010cbdcc31'],
  ['Graphic Designer', 'مصمم جرافيك', 'IT & Digital', '1626785774573-4b799315345d'],
  ['Digital Marketer', 'مختص تسويق رقمي', 'IT & Digital', '1460925895917-afdab827c52f'],
  ['Accountant', 'محاسب', 'Business', '1554224155-6726b3ff858f'],
  ['Receptionist', 'موظف استقبال', 'Business', '1497366754035-f200968a6e72'],
  ['Security Guard', 'حارس أمن', 'Security & Hospitality', '1521791136064-7986c2920216'],
  ['Chef', 'طاهٍ', 'Security & Hospitality', '1577219491135-ce391730fb2c'],
  ['Waiter', 'نادل', 'Security & Hospitality', '1414235077428-338989a2e8c0'],
  ['Housekeeping', 'عامل نظافة', 'Security & Hospitality', '1581578731548-c64695cc6952'],
  ['Laundry Worker', 'عامل غسيل', 'Security & Hospitality', '1545173168-9f1947eebb7f'],
  ['Agriculture Worker', 'عامل زراعة', 'Agriculture & Healthcare', '1500651230702-0e2d8a49d4ad'],
  ['Healthcare Worker', 'عامل رعاية صحية', 'Agriculture & Healthcare', '1576091160550-2173dba999ef'],
  ['Nurse', 'ممرض', 'Agriculture & Healthcare', '1559757148-5c350d0d3c56'],
  ['Medical Assistant', 'مساعد طبي', 'Agriculture & Healthcare', '1631217868264-e5b90bb7e133'],
  ['Lab Technician', 'فني مختبر', 'Agriculture & Healthcare', '1582719478250-c89cae4dc85b'],
  ['Pharmacy Assistant', 'مساعد صيدلي', 'Agriculture & Healthcare', '1587854692152-cbe660dbde88'],
  ['Mason', 'بنّاء', 'Construction', '1607000975408-1f3c6e5b2f0f'],
  ['Rigger', 'مُجهّز رفع', 'Mechanical', '1486406146926-c627a92ad1ab'],
  ['Pipe Fitter', 'فني تركيب أنابيب', 'Construction', '1521791055366-0d553872125f'],
  ['Sandblaster', 'فني سفع رملي', 'Mechanical', '1530124566582-a618bc2615dc'],
  ['Insulation Worker', 'فني عزل', 'Construction', '1531834685032-c34bf0d84c77'],
  ['Glass Fitter', 'فني تركيب زجاج', 'Construction', '1556909114-f6e7ad7d3136'],
  ['Aluminum Technician', 'فني ألمنيوم', 'Construction', '1581092795360-fd1ca04f0952'],
  ['Cleaner', 'عامل تنظيف', 'Security & Hospitality', '1563453392212-326f5e854473'],
  ['Storekeeper', 'أمين مستودع', 'Driving & Logistics', '1586528116311-ad8dd3c8310d'],
  ['Bus Driver', 'سائق حافلة', 'Driving & Logistics', '1570125909232-eb263c188f7e'],
  ['Solar Technician', 'فني طاقة شمسية', 'IT & Digital', '1509391366360-2e959784a276'],
  ['Data Entry Operator', 'مدخل بيانات', 'Business', '1486312338219-ce68d2c6f44d'],
];

export const services: Service[] = raw.map(([name, nameAr, category, id]) => ({
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  name,
  nameAr,
  category,
  icon: 'Wrench',
  image: img(id),
  summary: `Certified ${name.toLowerCase()} professionals, fully vetted and ready for deployment across the Kingdom in line with Saudi labor standards.`,
}));

export const getService = (slug: string) => services.find((s) => s.slug === slug);
