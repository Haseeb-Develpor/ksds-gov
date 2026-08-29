// The 12 main workforce categories shown on the homepage. Each links to its Jobs page.

export interface Category {
  slug: string;
  name: string;
  nameAr: string;
  icon: string; // lucide-react icon name
  description: string;
  image: string;
  jobs: string[];
}

const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1000&q=68`;

export const categories: Category[] = [
  {
    slug: 'construction-development', name: 'Construction & Development', nameAr: 'الإنشاءات والتطوير', icon: 'HardHat',
    description: 'Skill trades for the Kingdom’s giga-projects and infrastructure.',
    image: img('1541888946425-d81bb19240f5'),
    jobs: ['Civil Technician', 'Electrician', 'Plumber', 'Welder', 'Steel Fixer', 'Mason', 'Painter', 'Scaffolder', 'Site Supervisor'],
  },
  {
    slug: 'technology-it', name: 'Technology & IT', nameAr: 'التقنية وتقنية المعلومات', icon: 'Cpu',
    description: 'Software, networks, and digital talent powering Vision 2030.',
    image: img('1518770660439-4636190af475'),
    jobs: ['Software Engineer', 'Network Engineer', 'IT Support Technician', 'Data Analyst', 'Cybersecurity Specialist', 'Cloud Engineer', 'UI/UX Designer'],
  },
  {
    slug: 'healthcare-pharma', name: 'Healthcare & Pharma', nameAr: 'الرعاية الصحية والصيدلة', icon: 'Stethoscope',
    description: 'Certified medical and pharmaceutical professionals.',
    image: img('1576091160550-2173dba999ef'),
    jobs: ['Registered Nurse', 'Medical Assistant', 'Lab Technician', 'Pharmacy Assistant', 'Radiology Technician', 'Physiotherapist'],
  },
  {
    slug: 'engineering-architecture', name: 'Engineering & Architecture', nameAr: 'الهندسة والعمارة', icon: 'Ruler',
    description: 'Design and engineering expertise for landmark developments.',
    image: img('1503387762-9b6c5e7b46b6'),
    jobs: ['Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Architect', 'Quantity Surveyor', 'HVAC Engineer', 'Project Engineer'],
  },
  {
    slug: 'tourism-hospitality', name: 'Tourism & Hospitality', nameAr: 'السياحة والضيافة', icon: 'ConciergeBell',
    description: 'Hospitality talent for hotels, resorts, and tourism destinations.',
    image: img('1566073771259-6a8506099945'),
    jobs: ['Hotel Receptionist', 'Chef', 'Waiter', 'Housekeeping', 'Concierge', 'Tour Guide', 'Event Coordinator'],
  },
  {
    slug: 'garments-apparel', name: 'Garments & Apparel', nameAr: 'الملابس والمنسوجات', icon: 'Shirt',
    description: 'Production and tailoring specialists for the apparel sector.',
    image: img('1489987707025-afc232f7ea0f'),
    jobs: ['Tailor', 'Sewing Machine Operator', 'Fabric Cutter', 'Quality Inspector', 'Production Supervisor'],
  },
  {
    slug: 'furniture-interior-event', name: 'Furniture, Interior & Event', nameAr: 'الأثاث والديكور والفعاليات', icon: 'Sofa',
    description: 'Craftsmanship for interiors, furniture, and event production.',
    image: img('1555041469-a586c61ea9bc'),
    jobs: ['Carpenter', 'Interior Finisher', 'Upholsterer', 'Event Setup Crew', 'Decor Technician', 'CNC Operator'],
  },
  {
    slug: 'health-beauty', name: 'Health & Beauty', nameAr: 'الصحة والجمال', icon: 'Sparkles',
    description: 'Wellness, salon, and personal-care professionals.',
    image: img('1560066984-138dadb4c035'),
    jobs: ['Barber', 'Hair Stylist', 'Beautician', 'Spa Therapist', 'Nail Technician', 'Wellness Coach'],
  },
  {
    slug: 'fashion-entertainment', name: 'Fashion & Entertainment', nameAr: 'الأزياء والترفيه', icon: 'Clapperboard',
    description: 'Creative talent for fashion, media, and entertainment.',
    image: img('1492684223066-81342ee5ff30'),
    jobs: ['Fashion Designer', 'Photographer', 'Videographer', 'Stage Technician', 'Makeup Artist', 'Content Creator'],
  },
  {
    slug: 'storage-supply-delivery', name: 'Storage, Supply & Delivery', nameAr: 'التخزين والإمداد والتوصيل', icon: 'Truck',
    description: 'Logistics, warehousing, and last-mile delivery workforce.',
    image: img('1553413077-190dd305871c'),
    jobs: ['Warehouse Worker', 'Forklift Operator', 'Delivery Driver', 'Storekeeper', 'Logistics Coordinator', 'Heavy Driver'],
  },
  {
    slug: 'education-educator', name: 'Education & Educator', nameAr: 'التعليم والمعلمون', icon: 'GraduationCap',
    description: 'Teachers, trainers, and academic support staff.',
    image: img('1523240795612-9a054b0db644'),
    jobs: ['Teacher', 'Vocational Trainer', 'Lab Assistant', 'Academic Coordinator', 'Special Needs Educator', 'E-Learning Specialist'],
  },
  {
    slug: 'automotive', name: 'Automotive', nameAr: 'قطاع السيارات', icon: 'Car',
    description: 'Vehicle maintenance, repair, and workshop professionals.',
    image: img('1486262715619-67b85e0b08d3'),
    jobs: ['Auto Mechanic', 'Auto Electrician', 'Denter & Painter', 'Tyre Technician', 'Service Advisor', 'Workshop Supervisor'],
  },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
