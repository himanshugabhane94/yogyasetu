'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import FilterSidebar from '@/components/FilterSidebar';
import SchemeCard from '@/components/SchemeCard';
import { SchemeItem } from '@/types';
import { CATEGORIES_CONFIG } from '@/lib/categoriesConfig';
import {
  Search,
  Filter,
  ArrowUpDown,
  Compass,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

function SchemesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    state: searchParams.get('state') || 'All',
    level: searchParams.get('level') || 'all',
    gender: searchParams.get('gender') || 'All',
    caste: searchParams.get('caste') || 'All',
    occupation: searchParams.get('occupation') || 'All',
    benefitType: searchParams.get('benefitType') || 'all',
  });

  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('popular');

  const fetchSchemes = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (filters.category !== 'all') params.set('category', filters.category);
      if (filters.state !== 'All') params.set('state', filters.state);
      if (filters.level && filters.level !== 'all') params.set('level', filters.level);
      if (filters.gender !== 'All') params.set('gender', filters.gender);
      if (filters.caste !== 'All') params.set('caste', filters.caste);
      if (filters.benefitType !== 'all') params.set('benefitType', filters.benefitType);
      params.set('page', String(pagination.page));
      params.set('limit', String(pagination.limit));

      const res = await fetch(`/api/schemes?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server error occurred while loading schemes.');
      }

      if (data.schemes) {
        let list = data.schemes;
        // Client-side sort
        if (sortBy === 'title') {
          list = [...list].sort((a, b) =>
            (language === 'hi' ? a.titleHi : a.titleEn).localeCompare(
              language === 'hi' ? b.titleHi : b.titleEn
            )
          );
        } else if (sortBy === 'newest') {
          list = [...list].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        setSchemes(list);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      }
    } catch (err: any) {
      console.error('Failed to load schemes:', err);
      setApiError(err?.message || 'Unable to connect to database. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [filters, pagination.page, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSchemes();
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters({
      category: 'all',
      state: 'All',
      level: 'all',
      gender: 'All',
      caste: 'All',
      occupation: 'All',
      benefitType: 'all',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const [suggestions, setSuggestions] = useState<SchemeItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (search.trim().length > 1) {
      const timer = setTimeout(() => {
        fetch(`/api/schemes?search=${encodeURIComponent(search.trim())}&limit=5`)
          .then((res) => res.json())
          .then((data) => {
            if (data.schemes) setSuggestions(data.schemes);
          })
          .catch(() => {});
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [search]);

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-govNavy-900 tracking-tight">
            {t('schemesPageTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {pagination.total} {t('schemesFound')} across Central Ministries and State Departments
          </p>
        </div>

        {/* Top Control Bar: Search input with Autocomplete, Mobile Filter Toggle, Sort Dropdown */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-soft-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-3 relative z-30">
          {/* Search Input with Autocomplete */}
          <div className="relative w-full md:max-w-md">
            <form onSubmit={handleSearchSubmit}>
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-govNavy-800 outline-none"
              />
            </form>

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-soft-lg py-2 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Matching Schemes
                </div>
                {suggestions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/schemes/${s.id}`}
                    className="flex items-center justify-between px-3.5 py-2.5 hover:bg-govNavy-50 text-slate-800 hover:text-govNavy-900 transition-colors"
                  >
                    <span className="font-semibold line-clamp-1">
                      {language === 'hi' && s.titleHi ? s.titleHi : s.titleEn}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 ml-2">
                      {s.category?.nameEn || 'Central'}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-govNavy-900 bg-slate-100 rounded-xl border border-slate-200"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{t('filterTitle')}</span>
            </button>

            {/* Sort by dropdown */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-medium hidden sm:inline">{t('sortBy')}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-govNavy-800 outline-none"
              >
                <option value="popular">{t('sortPopular')}</option>
                <option value="newest">{t('sortNewest')}</option>
                <option value="title">{t('sortByTitle')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Layout: Sidebar + Grid */}
        <div className="flex items-start gap-8">
          {/* Desktop Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            onReset={handleResetFilters}
            isOpenMobile={mobileFilterOpen}
            onCloseMobile={() => setMobileFilterOpen(false)}
          />

          {/* Scheme Cards Grid */}
          <div className="flex-1 w-full">
            {/* Scope / Level Quick Filter (All Schemes vs Central vs Maharashtra) */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-soft-sm mb-4">
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
                  {language === 'hi' ? 'योजना स्तर:' : 'Scope & Level:'}
                </span>

                <button
                  onClick={() => setFilters((prev) => ({ ...prev, state: 'All', level: 'all' }))}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                    filters.state === 'All' && (!filters.level || filters.level === 'all')
                      ? 'bg-govNavy-900 text-white shadow-soft-sm'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-govNavy-900'
                  }`}
                >
                  <span>🌐</span>
                  <span>{language === 'hi' ? 'सभी योजनाएं (All Schemes)' : 'All Schemes'}</span>
                </button>

                <button
                  onClick={() => setFilters((prev) => ({ ...prev, state: 'Central', level: 'CENTRAL' }))}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                    filters.state === 'Central' || filters.level === 'CENTRAL'
                      ? 'bg-blue-700 text-white shadow-soft-sm'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-blue-900'
                  }`}
                >
                  <span>🇮🇳</span>
                  <span>{language === 'hi' ? 'अखिल भारतीय / केंद्रीय (Central)' : 'All India / Central'}</span>
                </button>

                <button
                  onClick={() => setFilters((prev) => ({ ...prev, state: 'Maharashtra', level: 'all' }))}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                    filters.state === 'Maharashtra'
                      ? 'bg-amber-600 text-white shadow-soft-sm'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-amber-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-saffron-500 animate-pulse"></span>
                  <span>{language === 'hi' ? 'महाराष्ट्र शासन (Maha DBT)' : 'Maharashtra (Maha DBT)'}</span>
                </button>
              </div>

              {/* 12-Category Quick Filter Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pt-3 mt-2.5 border-t border-slate-100 pb-1 scrollbar-thin">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 hidden md:inline">
                  {language === 'hi' ? 'श्रेणी:' : 'Category:'}
                </span>

                <button
                  onClick={() => setFilters((prev) => ({ ...prev, category: 'all' }))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                    filters.category === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {language === 'hi' ? 'सभी श्रेणियां' : 'All Categories'}
                </button>

                {CATEGORIES_CONFIG.map((cat) => {
                  const isActive = filters.category === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => setFilters((prev) => ({ ...prev, category: cat.slug }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center space-x-1 ${
                        isActive
                          ? 'bg-govNavy-900 text-white shadow-soft-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{language === 'hi' ? cat.nameHi : cat.nameEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-72 rounded-2xl bg-white border border-slate-200 animate-pulse p-6" />
                ))}
              </div>
            ) : apiError ? (
              <div className="bg-white rounded-3xl border border-rose-200 p-12 text-center shadow-soft-sm">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-govNavy-900 mb-1">
                  Unable to load schemes
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
                  We encountered an issue connecting to the official schemes registry. Please try again.
                </p>
                <button
                  onClick={() => fetchSchemes()}
                  className="px-5 py-2.5 bg-govNavy-900 hover:bg-govNavy-800 text-white text-xs font-bold rounded-xl shadow-soft-sm transition-smooth"
                >
                  Retry Loading Schemes
                </button>
              </div>
            ) : schemes.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-soft-sm">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-govNavy-900 mb-1">
                  {t('noSchemesFound')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
                  Try clearing some filter criteria or searching with a broader keyword like "Kisan", "Scholarship", "Pension", or "Awas".
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-govNavy-900 hover:bg-govNavy-800 text-white text-xs font-bold rounded-xl shadow-soft-sm transition-smooth"
                >
                  {t('clearAllFilters')}
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {schemes.map((scheme) => (
                    <SchemeCard key={scheme.id} scheme={scheme} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 pt-4">
                    <button
                      onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                      disabled={pagination.page <= 1}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 shadow-soft-sm transition-smooth"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-govNavy-900 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-soft-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))
                      }
                      disabled={pagination.page >= pagination.totalPages}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 shadow-soft-sm transition-smooth"
                      aria-label="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SchemesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-semibold">Loading schemes...</div>}>
      <SchemesContent />
    </Suspense>
  );
}
