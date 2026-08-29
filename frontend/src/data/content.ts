// Data-driven static content pages, modules, and site data.

export interface ContentPage {
  slug: string;
  title: string;
  titleAr: string;
  group: 'about' | 'media' | 'support' | 'legal' | 'corporate' | 'careers';
  intro: string;
  image: string;
  body: string[];
}

const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=70`;

const lorem = (topic: string) => [
  `${topic} sits at the heart of KSA Skill Development's mission to build a world-class, future-ready Saudi workforce in full alignment with Vision 2030.`,
  `We combine government-grade governance with international best practices to deliver outcomes that are transparent, measurable, and built to last. Our teams operate to the highest standards of integrity and professionalism.`,
  `Through continuous investment in people, technology, and partnerships, we ensure that every stakeholder — from individual workers to national enterprises — experiences excellence at every step.`,
];

export const contentPages: ContentPage[] = [
  ['about', 'About Us', 'من نحن', 'about', '1486406146926-c627a92ad1ab'],
  ['vision', 'Our Vision', 'رؤيتنا', 'about', '1454165804606-c3d57bc86b40'],
  ['mission', 'Our Mission', 'رسالتنا', 'about', '1521737604893-d14cc237f11d'],
  ['values', 'Core Values', 'قيمنا', 'about', '1552664730-d307ca884978'],
  ['chairman-message', 'Chairman Message', 'كلمة رئيس مجلس الإدارة', 'corporate', '1560250097-0b93528c311a'],
  ['ceo-message', 'CEO Message', 'كلمة الرئيس التنفيذي', 'corporate', '1573497019940-1c28c88b4f3e'],
  ['organization', 'Organization Structure', 'الهيكل التنظيمي', 'corporate', '1497215728101-856f4ea42174'],
  ['departments', 'Departments', 'الإدارات', 'corporate', '1568992687947-868a62a9f521'],
  ['board', 'Board of Directors', 'مجلس الإدارة', 'corporate', '1517502884422-41eaead166d4'],
  ['branches', 'Branches', 'الفروع', 'corporate', '1486406146926-c627a92ad1ab'],
  ['partners', 'Partners', 'الشركاء', 'corporate', '1521791136064-7986c2920216'],
  ['projects', 'Projects', 'المشاريع', 'corporate', '1503387762-9b6c5e7b46b6'],
  ['success-stories', 'Success Stories', 'قصص النجاح', 'corporate', '1522071820081-009f0129c71c'],
  ['awards', 'Awards', 'الجوائز', 'corporate', '1567427017947-545c5f8d16ad'],
  ['certificates', 'Certificates', 'الشهادات', 'corporate', '1606166325683-e6deb697d301'],
  ['news', 'News', 'الأخبار', 'media', '1504711434969-e33886168f5c'],
  ['media-center', 'Media Center', 'المركز الإعلامي', 'media', '1495020689067-958852a7765e'],
  ['events', 'Events', 'الفعاليات', 'media', '1540575467063-178a50c2df87'],
  ['gallery', 'Photo Gallery', 'معرض الصور', 'media', '1452587925148-ce544e77e70d'],
  ['video-gallery', 'Video Gallery', 'معرض الفيديو', 'media', '1574717024653-61fd2cf4d44d'],
  ['blogs', 'Blogs', 'المدونة', 'media', '1499750310107-5fef28a66643'],
  ['testimonials', 'Testimonials', 'آراء العملاء', 'media', '1531058020387-3be344556be6'],
  ['downloads', 'Downloads', 'التحميلات', 'support', '1450101499163-c8848c66ca85'],
  ['contact', 'Contact Us', 'تواصل معنا', 'support', '1423666639041-f56000c27a9a'],
  ['faq', 'FAQ', 'الأسئلة الشائعة', 'support', '1454165804606-c3d57bc86b40'],
  ['support', 'Support', 'الدعم', 'support', '1556761175-5973dc0f32e7'],
  ['complaints', 'Complaints', 'الشكاوى', 'support', '1551836022-d5d88e9218df'],
  ['suggestions', 'Suggestions', 'الاقتراحات', 'support', '1517245386807-bb43f82c33c4'],
  ['verification', 'Certificate Verification', 'التحقق من الشهادات', 'support', '1606166325683-e6deb697d301'],
  ['tracking', 'Application Tracking', 'تتبع الطلب', 'support', '1551288049-bebda4e38f71'],
  ['privacy-policy', 'Privacy Policy', 'سياسة الخصوصية', 'legal', '1450101499163-c8848c66ca85'],
  ['terms', 'Terms & Conditions', 'الشروط والأحكام', 'legal', '1521587760476-6c12a4b040da'],
  ['careers', 'Careers', 'الوظائف', 'careers', '1521737604893-d14cc237f11d'],
].map(([slug, title, titleAr, group, id]) => ({
  slug,
  title,
  titleAr,
  group: group as ContentPage['group'],
  image: img(id),
  intro: `Welcome to ${title} at KSA Skill Development — delivered with the precision and care of a national institution.`,
  body: lorem(title),
}));

export const getContentPage = (slug: string) => contentPages.find((p) => p.slug === slug);

// ---- Module pages (Hajj / Umrah / Visa / Training) ----
export interface ModulePage {
  slug: string;
  title: string;
  image: string;
  intro: string;
}

const moduleItems = [
  'Packages', 'Visa', 'Hotels', 'Flights', 'Transport', 'Guides',
  'Booking', 'Tracking', 'Downloads', 'Gallery', 'Videos', 'FAQ', 'Support', 'Overview',
];
const visaItems = [
  'Overview', 'Work Visa', 'Visit Visa', 'Family Visa', 'Business Visa',
  'Visa Status', 'Requirements', 'Renewal', 'Cancellation', 'Support',
];
const trainingItems = [
  'Overview', 'Programs', 'Certification', 'Workshops', 'E-Learning',
  'Schedule', 'Trainers', 'Enrollment', 'Partners', 'FAQ',
];

const mk = (prefix: string, items: string[], id: string): ModulePage[] =>
  items.map((t) => ({
    slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title: t,
    image: img(id),
    intro: `${prefix} — ${t}. Premium, fully managed service backed by KSA Skill Development.`,
  }));

export const hajjPages = mk('Hajj', moduleItems, '1591604129939-f1efa4d9f7fa');
export const umrahPages = mk('Umrah', moduleItems, '1565019011521-b0575ca92daf');
export const visaPages = mk('Visa Services', visaItems, '1569154941061-e231b4725ef1');
export const trainingPages = mk('Training', trainingItems, '1524178232363-1fb2b075b655');

// ---- Site data ----
export const stats = [
  { value: 25000, suffix: '+', key: 'workers' },
  { value: 52, suffix: '+', key: 'services' },
  { value: 320, suffix: '+', key: 'partners' },
  { value: 98, suffix: '%', key: 'satisfaction' },
];

export const leadership = [
  { name: 'H.E. Abdullah Al-Rashid', role: 'Chairman', image: img('1560250097-0b93528c311a') },
  { name: 'Eng. Faisal Al-Otaibi', role: 'Chief Executive Officer', image: img('1472099645785-5658abf4ff4e') },
  { name: 'Dr. Noura Al-Qahtani', role: 'Chief Operating Officer', image: img('1580489944761-15a19d654956') },
];

export const testimonials = [
  { name: 'Mohammed Al-Harbi', role: 'Site Engineer, Riyadh', text: 'The recruitment process was seamless and the workers are highly skill. A truly government-grade service.', image: img('1507003211169-0a1dd7228f2d') },
  { name: 'Aisha Al-Zahrani', role: 'HR Director, Jeddah', text: 'KSA Skill Development transformed how we source talent. Transparent, fast, and reliable.', image: img('1494790108377-be9c29b29330') },
  { name: 'Khalid Al-Otaibi', role: 'Project Manager, Dammam', text: 'Outstanding training programs and a dashboard that makes tracking everything effortless.', image: img('1500648767791-00dcc994a43e') },
  { name: 'Fatimah Al-Ghamdi', role: 'Operations Lead, Makkah', text: 'From visa to deployment, every step was handled with professionalism and care.', image: img('1438761681033-6461ffad8d80') },
];

// Major Saudi enterprises (names shown as styled wordmarks).
export const partners = [
  { name: 'Saudi Aramco', sub: 'Energy' },
  { name: 'SABIC', sub: 'Petrochemicals' },
  { name: 'stc', sub: 'Telecom' },
  { name: "Ma'aden", sub: 'Mining' },
  { name: 'Almarai', sub: 'Food & Dairy' },
  { name: 'Al Rajhi Bank', sub: 'Banking' },
  { name: 'ACWA Power', sub: 'Utilities' },
  { name: 'NEOM', sub: 'Giga-Project' },
];

export const whyChoose = [
  { icon: 'ShieldCheck', title: 'Government-Grade Trust', text: 'Full compliance with Saudi labor regulations and Vision 2030 standards.' },
  { icon: 'Award', title: 'Certified Professionals', text: 'Every worker is vetted, tested, and certified before deployment.' },
  { icon: 'Globe2', title: 'Bilingual & Global', text: 'Seamless EN/AR support with international recruitment reach.' },
  { icon: 'Zap', title: 'Fast Deployment', text: 'Streamlined visa and onboarding for rapid workforce mobilization.' },
  { icon: 'Headset', title: '24/7 Support', text: 'Dedicated live chat and support teams around the clock.' },
  { icon: 'TrendingUp', title: 'Proven Results', text: 'A 98% client satisfaction rate across thousands of placements.' },
];
