'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { INDIAN_STATES } from '@/lib/indianStates';
import { CATEGORIES_CONFIG } from '@/lib/categoriesConfig';
import SchemeCard from '@/components/SchemeCard';
import { SchemeItem } from '@/types';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  ChevronRight,
  GraduationCap,
  Sprout,
  HeartHandshake,
  Award,
  Accessibility,
  Briefcase,
  Home as HomeIcon,
  HeartPulse,
  Landmark,
  CheckCircle2,
  Zap,
  Globe2,
  FileCheck2,
  Users2,
  Lightbulb,
} from 'lucide-react';

const CATEGORY_ICON_COMPONENTS: Record<string, any> = {
  GraduationCap,
  Sprout,
  HeartHandshake,
  Award,
  Accessibility,
  Briefcase,
  Home: HomeIcon,
  HeartPulse,
  Building2,
  Landmark,
  Lightbulb,
  Users: Users2,
};

import HeroIllustration from '@/components/HeroIllustration';

export default function HomePage() {
  const router = useRouter();
  const { language, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [featuredSchemes, setFeaturedSchemes] = useState<SchemeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/schemes?limit=6')
      .then((res) => res.json())
      .then((data) => {
        if (data.schemes) {
          setFeaturedSchemes(data.schemes);
        }
      })
      .catch((err) => console.error('Failed to load featured schemes:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedState !== 'All') params.set('state', selectedState);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    router.push(`/schemes?${params.toString()}`);
  };

  // Quick Filter Pills
  const quickFilterPills = [
    { labelEn: 'Students', labelHi: 'छात्र', slug: 'students', icon: '🎓' },
    { labelEn: 'Farmers', labelHi: 'किसान', slug: 'farmers', icon: '🌾' },
    { labelEn: 'Women', labelHi: 'महिलाएं', slug: 'women', icon: '👩' },
    { labelEn: 'Healthcare', labelHi: 'स्वास्थ्य', slug: 'health', icon: '🏥' },
    { labelEn: 'Employment', labelHi: 'रोजगार', slug: 'employment', icon: '💼' },
    { labelEn: 'Senior Citizens', labelHi: 'वरिष्ठ नागरिक', slug: 'senior-citizens', icon: '👴' },
    { labelEn: 'Divyangjan', labelHi: 'दिव्यांगजन', slug: 'divyangjan', icon: '♿' },
    { labelEn: 'Hostels', labelHi: 'वसतिगृह', slug: 'hostels', icon: '🏢' },
    { labelEn: 'Maha DBT', labelHi: 'महाडीबीटी', slug: 'mahadbt', icon: '🏛️' },
    { labelEn: 'Housing', labelHi: 'आवास', slug: 'housing', icon: '🏠' },
    { labelEn: 'Skills', labelHi: 'कौशल', slug: 'skills', icon: '💡' },
    { labelEn: 'Minority', labelHi: 'अल्पसंख्यक', slug: 'minority', icon: '👥' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* 1. TWO-COLUMN HERO BANNER */}
      <section className="relative bg-gradient-to-br from-govNavy-950 via-govNavy-900 to-slate-900 text-white pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle Ambient Mesh Glows */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />
        <div className="absolute top-10 left-10 w-96 h-96 bg-saffron-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-govEmerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Eyebrow + Headline + Search Bar + Trust Row */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Eyebrow Tag */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-slate-200 text-xs font-semibold shadow-soft-sm">
              <span className="w-2 h-2 rounded-full bg-saffron-400 animate-pulse" />
              <span>
                {language === 'en'
                  ? "India's Scheme Discovery Platform"
                  : 'भारत का प्रमुख सरकारी योजना खोज मंच'}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight sm:leading-tight text-white">
              {language === 'en'
                ? 'Aapke Liye Sahi Yojana, Ab Ek Hi Jagah.'
                : 'आपके लिए सही योजना, अब एक ही जगह।'}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-normal">
              {language === 'en'
                ? 'Discover verified central scholarships, farmer DBT transfers, health covers, and women welfare programs tailored to your profile with zero middlemen.'
                : 'अपनी प्रोफ़ाइल के अनुसार छात्रवृत्तियां, किसान डीबीटी, आयुष्मान स्वास्थ्य कार्ड और स्वरोजगार योजनाएं खोजें।'}
            </p>

            {/* Elevated Search Card with State & Category Dropdowns */}
            <form
              onSubmit={handleHeroSearch}
              className="glass-panel p-3.5 sm:p-4 rounded-2xl shadow-glass border border-white/70 text-slate-900"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                {/* Search Input Field */}
                <div className="sm:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      language === 'en'
                        ? 'Scheme ya scholarship search karein...'
                        : 'योजना या छात्रवृत्ति खोजें...'
                    }
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-govNavy-800 outline-none transition-smooth"
                  />
                </div>

                {/* State Dropdown (All 28 States + 8 UTs) */}
                <div className="sm:col-span-3 relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full pl-8 pr-2 py-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-govNavy-800 outline-none transition-smooth truncate"
                  >
                    <option value="All">{t('allStates')}</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st.code} value={st.nameEn}>
                        {language === 'hi' ? st.nameHi : st.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Dropdown */}
                <div className="sm:col-span-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-2.5 py-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-govNavy-800 outline-none transition-smooth truncate"
                  >
                    <option value="all">{t('allCategories')}</option>
                    {CATEGORIES_CONFIG.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {language === 'hi' ? cat.nameHi : cat.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Saffron CTA Button */}
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-3 bg-saffron-500 hover:bg-saffron-600 active:bg-saffron-700 text-govNavy-950 font-black text-xs sm:text-sm rounded-xl shadow-soft-sm hover:shadow-soft-md transition-smooth flex items-center justify-center space-x-1"
                  >
                    <span>{t('findSchemesBtn')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>

            {/* Small Trust Row below search */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-slate-300 font-medium">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-govEmerald-400" />
                <span>500+ Verified Schemes</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Globe2 className="w-4 h-4 text-saffron-400" />
                <span>28 States Covered</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-govEmerald-400" />
                <span>100% Free Public Service</span>
              </span>
            </div>

            {/* Quick Explore Pills in a single clean row on desktop, wrapping gracefully on mobile */}
            <div className="flex flex-wrap items-center gap-2 pt-2.5">
              <span className="text-xs text-slate-300 font-bold shrink-0 mr-0.5">
                {language === 'en' ? 'Quick Explore:' : 'त्वरित खोजें:'}
              </span>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {quickFilterPills.map((pill) => (
                  <Link
                    key={pill.slug}
                    href={`/schemes?category=${pill.slug}`}
                    className="inline-flex items-center space-x-1.5 h-8 px-3.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/15 text-xs font-semibold text-slate-200 hover:text-white backdrop-blur-sm transition-all hover:scale-105 shadow-soft-sm shrink-0 select-none"
                  >
                    <span className="text-xs">{pill.icon}</span>
                    <span>{language === 'hi' ? pill.labelHi : pill.labelEn}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: High-Quality Custom SVG Hero Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* 2. VERIFIED STATS COUNTER ROW */}
      <section className="bg-white border-b border-slate-200/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="p-3">
            <div className="flex items-center justify-center space-x-2 text-2xl sm:text-3xl font-black text-govNavy-900">
              <FileCheck2 className="w-6 h-6 text-govEmerald-600 inline" />
              <span>500+ Schemes</span>
            </div>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
              {language === 'en' ? 'Verified Programs' : 'सत्यापित योजनाएं'}
            </p>
          </div>

          <div className="p-3">
            <div className="flex items-center justify-center space-x-2 text-2xl sm:text-3xl font-black text-govNavy-900">
              <Globe2 className="w-6 h-6 text-blue-600 inline" />
              <span>All 28 States</span>
            </div>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
              {language === 'en' ? 'Pan-India Coverage' : 'अखिल भारतीय कवरेज'}
            </p>
          </div>

          <div className="p-3">
            <div className="flex items-center justify-center space-x-2 text-2xl sm:text-3xl font-black text-govEmerald-600">
              <Zap className="w-6 h-6 text-govEmerald-600 inline" />
              <span>Instant Eligibility</span>
            </div>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
              {language === 'en' ? 'AI Rules Engine' : 'AI पात्रता इंजन'}
            </p>
          </div>

          <div className="p-3">
            <div className="flex items-center justify-center space-x-2 text-2xl sm:text-3xl font-black text-govNavy-900">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 inline" />
              <span>100% Free</span>
            </div>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
              {language === 'en' ? 'Direct Official Portals' : 'प्रत्यक्ष आधिकारिक पोर्टल'}
            </p>
          </div>
        </div>
      </section>

      {/* 3. QUICK CATEGORY TILES */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-govEmerald-700 uppercase tracking-wider block mb-1">
              {language === 'en' ? 'Target Beneficiaries' : 'लक्षित लाभार्थी'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-govNavy-900 tracking-tight">
              {t('exploreByCategory')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t('exploreSub')}
            </p>
          </div>

          <Link
            href="/schemes"
            className="inline-flex items-center space-x-1 text-xs sm:text-sm font-bold text-govNavy-900 hover:text-govEmerald-600 transition-colors shrink-0"
          >
            <span>{t('viewAllSchemes')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 8 Category Tiles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES_CONFIG.map((cat) => {
            const Icon = CATEGORY_ICON_COMPONENTS[cat.icon] || Landmark;
            const catName = language === 'hi' ? cat.nameHi : cat.nameEn;
            const tagline = language === 'hi' ? cat.taglineHi : cat.taglineEn;

            return (
              <Link
                key={cat.slug}
                href={`/schemes?category=${cat.slug}`}
                className="group relative bg-white p-6 rounded-2xl border border-slate-200/90 hover:border-govNavy-300 shadow-soft-sm hover:shadow-soft-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${cat.accent}15`, color: cat.accent }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-govNavy-900 group-hover:text-govNavy-800 mb-1">
                    {catName}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {tagline}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-govNavy-800 group-hover:text-govEmerald-600">
                  <span>Explore Schemes</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="bg-slate-100/60 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-govEmerald-700 uppercase tracking-wider block mb-1">
              {language === 'en' ? 'Transparent & Middlemen-Free' : 'पारदर्शी एवं बिचौलियों से मुक्त'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-govNavy-900 tracking-tight">
              {t('howItWorksTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              {t('howItWorksSub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-soft-sm relative">
              <div className="w-12 h-12 rounded-xl bg-govNavy-50 border border-govNavy-100 text-govNavy-900 font-black text-base flex items-center justify-center mb-5">
                01
              </div>
              <h3 className="text-base sm:text-lg font-bold text-govNavy-900 mb-2">{t('step1Title')}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('step1Desc')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-soft-sm relative">
              <div className="w-12 h-12 rounded-xl bg-govEmerald-50 border border-govEmerald-100 text-govEmerald-700 font-black text-base flex items-center justify-center mb-5">
                02
              </div>
              <h3 className="text-base sm:text-lg font-bold text-govNavy-900 mb-2">{t('step2Title')}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('step2Desc')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-soft-sm relative">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-black text-base flex items-center justify-center mb-5">
                03
              </div>
              <h3 className="text-base sm:text-lg font-bold text-govNavy-900 mb-2">{t('step3Title')}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('step3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED SCHEMES SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-govEmerald-700 uppercase tracking-wider block mb-1">
              {language === 'en' ? 'Verified Government Programs' : 'सत्यापित सरकारी कार्यक्रम'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-govNavy-900 tracking-tight">
              {language === 'en' ? 'Flagship National Welfare Schemes' : 'प्रमुख राष्ट्रीय कल्याणकारी योजनाएं'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {language === 'en'
                ? 'Direct cash transfers, health covers, and educational subsidies for citizens'
                : 'नागरिकों के लिए प्रत्यक्ष नकद अंतरण, स्वास्थ्य सुरक्षा एवं छात्रवृत्ति योजनाएं'}
            </p>
          </div>

          <Link
            href="/schemes"
            className="inline-flex items-center space-x-1 text-xs sm:text-sm font-bold text-govNavy-900 hover:text-govEmerald-600 transition-colors"
          >
            <span>{t('viewAllSchemes')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSchemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}
      </section>

      {/* 6. GOVTECH TRUST & PRIVACY GUARANTEE BANNER */}
      <section className="bg-govNavy-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-t border-govNavy-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-govEmerald-600 rounded-2xl text-white shrink-0 shadow-soft-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                {language === 'en'
                  ? 'Zero Identity Document Storage & Direct Government Redirection'
                  : 'शून्य दस्तावेज भंडारण एवं प्रत्यक्ष सरकारी पोर्टल रीडायरेक्शन'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {language === 'en'
                  ? 'YogyaSetu operates as an open discovery and eligibility bridge. We never collect or store Aadhaar numbers, biometric data, or bank credentials. All applications are submitted strictly on authorized Government of India (.gov.in / .nic.in) portals.'
                  : 'योग्यसेतु नागरिकों और योजनाओं के बीच एक पारदर्शी डिजिटल सेतु है। हम कभी आधार, बायोमेट्रिक्स या बैंकिंग क्रेडेंशियल स्टोर नहीं करते। सभी आवेदन सीधे आधिकारिक सरकारी पोर्टल पर ही किए जाते हैं।'}
              </p>
            </div>
          </div>

          <Link
            href="/eligibility"
            className="shrink-0 px-6 py-3.5 bg-govEmerald-600 hover:bg-govEmerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-soft-sm hover:shadow-soft-md transition-smooth flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>{t('checkEligibilityHeroBtn')}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
