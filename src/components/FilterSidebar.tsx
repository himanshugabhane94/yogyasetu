'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { INDIAN_STATES, CASTE_CATEGORIES, OCCUPATIONS } from '@/lib/indianStates';
import { CATEGORIES_CONFIG } from '@/lib/categoriesConfig';
import { Filter, X, RefreshCw } from 'lucide-react';

interface FilterSidebarProps {
  filters: {
    category: string;
    state: string;
    level?: string;
    gender: string;
    caste: string;
    occupation: string;
    benefitType: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  onReset: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function FilterSidebar({
  filters,
  setFilters,
  onReset,
  isOpenMobile = false,
  onCloseMobile,
}: FilterSidebarProps) {
  const { language, t } = useLanguage();

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const hasActiveFilters = Object.values(filters).some((val) => val && val !== 'all' && val !== 'All');

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div className="flex items-center space-x-2 text-govNavy-900 font-bold">
          <Filter className="w-4 h-4 text-govEmerald-600" />
          <span>{t('filterTitle')}</span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs font-semibold text-govEmerald-700 hover:text-govEmerald-800 flex items-center space-x-1 transition-smooth"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{t('clearAllFilters')}</span>
          </button>
        )}
      </div>

      {/* Scope / Level Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {language === 'hi' ? 'योजना क्षेत्र / स्तर' : 'Scope & Level'}
        </label>
        <select
          value={filters.state === 'Maharashtra' ? 'Maharashtra' : filters.state === 'Central' ? 'Central' : filters.level || 'all'}
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'Maharashtra') {
              setFilters((prev: any) => ({ ...prev, state: 'Maharashtra', level: 'all' }));
            } else if (val === 'Central') {
              setFilters((prev: any) => ({ ...prev, state: 'Central', level: 'CENTRAL' }));
            } else {
              setFilters((prev: any) => ({ ...prev, state: 'All', level: 'all' }));
            }
          }}
          className="w-full text-xs font-semibold bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-govNavy-800 outline-none transition-smooth"
        >
          <option value="all">{language === 'hi' ? '🌐 सभी योजनाएं (All Schemes)' : '🌐 All Schemes'}</option>
          <option value="Central">{language === 'hi' ? '🇮🇳 केंद्रीय योजनाएं (Central Ministries)' : '🇮🇳 All India / Central'}</option>
          <option value="Maharashtra">{language === 'hi' ? '🚩 महाराष्ट्र शासन (Maharashtra State)' : '🚩 Maharashtra (Maha DBT)'}</option>
        </select>
      </div>

      {/* State / UT Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {t('filterByState')}
        </label>
        <select
          value={filters.state}
          onChange={(e) => handleFilterChange('state', e.target.value)}
          className="w-full text-xs font-semibold bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-govNavy-800 outline-none transition-smooth"
        >
          <option value="All">{t('allStates')}</option>
          {INDIAN_STATES.map((st) => (
            <option key={st.code} value={st.nameEn}>
              {language === 'hi' ? st.nameHi : st.nameEn} {st.isUT ? '(UT)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {t('filterByCategory')}
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full text-xs font-semibold bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-govNavy-800 outline-none transition-smooth"
        >
          <option value="all">{t('allCategories')}</option>
          {CATEGORIES_CONFIG.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {language === 'hi' ? cat.nameHi : cat.nameEn}
            </option>
          ))}
        </select>
      </div>

      {/* Benefit Type Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {t('filterByBenefitType')}
        </label>
        <select
          value={filters.benefitType}
          onChange={(e) => handleFilterChange('benefitType', e.target.value)}
          className="w-full text-xs font-semibold bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-govNavy-800 outline-none transition-smooth"
        >
          <option value="all">All Benefits</option>
          <option value="Financial">💰 Financial Aid / DBT</option>
          <option value="Educational">📚 Educational / Scholarship</option>
          <option value="Health">🏥 Health / Medical Cover</option>
          <option value="Housing">🏠 Housing Subsidy</option>
          <option value="Livelihood">💼 Employment & Skills</option>
          <option value="Social Security">🛡️ Social Security / Pension</option>
        </select>
      </div>

      {/* Gender Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {t('filterByGender')}
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {['All', 'Female', 'Male', 'Transgender'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => handleFilterChange('gender', g)}
              className={`py-1.5 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                filters.gender === g
                  ? 'bg-govNavy-900 text-white border-govNavy-900 shadow-soft-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Social Category / Reservation */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {t('filterByCaste')}
        </label>
        <select
          value={filters.caste}
          onChange={(e) => handleFilterChange('caste', e.target.value)}
          className="w-full text-xs font-semibold bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-govNavy-800 outline-none transition-smooth"
        >
          <option value="All">All Categories</option>
          {CASTE_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {language === 'hi' ? c.nameHi : c.nameEn}
            </option>
          ))}
        </select>
      </div>

      {/* Occupation */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {t('filterByOccupation')}
        </label>
        <select
          value={filters.occupation}
          onChange={(e) => handleFilterChange('occupation', e.target.value)}
          className="w-full text-xs font-semibold bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-govNavy-800 outline-none transition-smooth"
        >
          <option value="All">All Occupations</option>
          {OCCUPATIONS.map((occ) => (
            <option key={occ.id} value={occ.id}>
              {language === 'hi' ? occ.nameHi : occ.nameEn}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-soft-sm h-fit sticky top-28">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-govNavy-950/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 shadow-soft-lg overflow-y-auto z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/80">
                <span className="font-bold text-govNavy-900">{t('filterTitle')}</span>
                <button
                  onClick={onCloseMobile}
                  className="p-1 rounded-xl hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {content}
            </div>

            <button
              onClick={onCloseMobile}
              className="mt-6 w-full py-3 bg-govNavy-900 hover:bg-govNavy-800 text-white font-bold text-sm rounded-xl shadow-soft-sm transition-smooth"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
}
