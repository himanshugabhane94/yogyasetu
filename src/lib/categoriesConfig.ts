export interface CategoryConfig {
  id: string;
  slug: string;
  nameEn: string;
  nameHi: string;
  icon: string;
  color: string;
  accent: string;
  taglineEn: string;
  taglineHi: string;
}

export const CATEGORIES_CONFIG: CategoryConfig[] = [
  {
    id: 'women',
    slug: 'women',
    nameEn: 'Women & Child',
    nameHi: 'महिला एवं बाल विकास',
    icon: 'HeartHandshake',
    color: 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100',
    accent: '#E11D48',
    taglineEn: 'Maternity assistance, girl child safety, self-help groups & women empowerment',
    taglineHi: 'मातृत्व सहायता, बालिका सुरक्षा, स्वयं सहायता समूह और महिला सशक्तिकरण',
  },
  {
    id: 'students',
    slug: 'students',
    nameEn: 'Students & Youth',
    nameHi: 'छात्र एवं युवा',
    icon: 'GraduationCap',
    color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    accent: '#2563EB',
    taglineEn: 'Pre/post-matric scholarships, government hostels, higher education grants & fee waivers',
    taglineHi: 'प्री/पोस्ट-मॅट्रिक शिष्यवृत्ती, शासकीय वसतिगृह, उच्च शिक्षण अनुदान व फी सवलत',
  },
  {
    id: 'farmers',
    slug: 'farmers',
    nameEn: 'Farmers & Agriculture',
    nameHi: 'किसान एवं कृषि',
    icon: 'Sprout',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
    accent: '#059669',
    taglineEn: 'Direct DBT income, crop insurance, solar pumps, drip irrigation & subsidized credit',
    taglineHi: 'थेट डीबीटी उत्पन्न, पीक विमा, सौर कृषी पंप, ठिबक सिंचन व अनुदानित कर्ज',
  },
  {
    id: 'senior-citizens',
    slug: 'senior-citizens',
    nameEn: 'Senior Citizens',
    nameHi: 'वरिष्ठ नागरिक',
    icon: 'Award',
    color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
    accent: '#D97706',
    taglineEn: 'Old age pensions, assisted living equipment, healthcare & social security',
    taglineHi: 'वृद्धावस्था पेंशन, सहायक जीवन उपकरण, आरोग्य व सामाजिक सुरक्षा',
  },
  {
    id: 'divyangjan',
    slug: 'divyangjan',
    nameEn: 'Divyangjan (PwD)',
    nameHi: 'दिव्यांगजन',
    icon: 'Accessibility',
    color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
    accent: '#7C3AED',
    taglineEn: 'Assistive devices, disability pensions, UDID benefits & inclusive opportunities',
    taglineHi: 'सहायक उपकरण, दिव्यांगता पेन्शन, यूडीआयडी कार्ड लाभ व समान संधी',
  },
  {
    id: 'employment',
    slug: 'employment',
    nameEn: 'Employment & Skills',
    nameHi: 'रोजगार एवं कौशल',
    icon: 'Briefcase',
    color: 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100',
    accent: '#0891B2',
    taglineEn: 'Guaranteed rural jobs, MSME credit, apprenticeships, ITI & skill development',
    taglineHi: 'हमी ग्रामीण रोजगार, एमएसएमई पतपुरवठा, शिकाऊ उमेदवारी व कौशल्य विकास',
  },
  {
    id: 'housing',
    slug: 'housing',
    nameEn: 'Housing & Shelter',
    nameHi: 'आवास एवं आश्रय',
    icon: 'Home',
    color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
    accent: '#EA580C',
    taglineEn: 'Pucca house subsidies, rural/urban housing grants & interest subvention',
    taglineHi: 'पक्के घर अनुदान, ग्रामीण/शहरी आवास योजना व गृहकर्ज व्याज सवलत',
  },
  {
    id: 'health',
    slug: 'health',
    nameEn: 'Health & Wellness',
    nameHi: 'स्वास्थ्य एवं परिवार कल्याण',
    icon: 'HeartPulse',
    color: 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100',
    accent: '#0D9488',
    taglineEn: 'Cashless hospital treatment, Jan Aushadhi generic medicines & universal health cover',
    taglineHi: 'कॅशलेस रुग्णालय उपचार, जन औषधी जेनेरिक औषधे व आरोग्य संरक्षण',
  },
];
