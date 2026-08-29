// Hiring partners. Logos are loaded from the official company domains via Clearbit's
// logo service; a clean text fallback renders if a logo can't be fetched.

export interface HiringPartner {
  name: string;
  logo?: string; // local bundled logo path (from /public/partners); omit to use initials badge
  description: string;
}

export const hiringPartners: HiringPartner[] = [
  { name: 'Almarai', logo: '/partners/almarai.png', description: 'The largest vertically integrated dairy and food company in the region.' },
  { name: 'NADEC', logo: '/partners/nadec.png', description: 'National Agricultural Development Company — food and agriculture leader.' },
  { name: 'Alayuni', logo: '/partners/alayuni.png', description: 'Trading and investment group across multiple industrial sectors.' },
  { name: 'Limak', logo: '/partners/limak.png', description: 'International contracting group delivering major infrastructure projects.' },
  { name: 'Al Majal Al Arabi Group', description: 'Integrated facilities management and support services provider.' },
  { name: 'Alfanar', logo: '/partners/alfanar.png', description: 'Electrical products, EPC, and renewable-energy solutions company.' },
  { name: 'Saudi Binladin Group', logo: '/partners/sbg.png', description: 'One of the largest construction and development groups in the Kingdom.' },
  { name: 'BinDawood Holding', logo: '/partners/bindawood.png', description: 'Leading retail and grocery holding operating major supermarket chains.' },
  { name: 'Ministry of Tourism', logo: '/partners/mot.png', description: 'Government body driving Saudi Arabia’s tourism sector and Vision 2030.' },
  { name: 'Ministry of Education', logo: '/partners/moe.png', description: 'Government authority overseeing education across the Kingdom.' },
];
