'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/context/LanguageContext';
import { SchemeItem, EligibilityCriteria } from '@/types';
import DeadlineBadge from '@/components/DeadlineBadge';
import {
  Bookmark,
  ExternalLink,
  FileText,
  Building2,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Sprout,
  HeartHandshake,
  Award,
  Accessibility,
  Briefcase,
  Home,
  HeartPulse,
  BadgeCheck,
  Users,
  Calendar,
  IndianRupee,
  AlertTriangle,
  Landmark,
  Lightbulb,
} from 'lucide-react';

interface SchemeCardProps {
  scheme: SchemeItem;
  onBookmarkToggle?: (schemeId: string, newState: boolean) => void;
  showMatchScore?: boolean;
}

const CATEGORY_ICONS: Record<string, any> = {
  GraduationCap,
  Sprout,
  HeartHandshake,
  Award,
  Accessibility,
  Briefcase,
  Home,
  HeartPulse,
  Building2,
  Landmark,
  Lightbulb,
  Users,
};

export default function SchemeCard({
  scheme,
  onBookmarkToggle,
  showMatchScore = false,
}: SchemeCardProps) {
  const { data: session } = useSession();
  const { language, t } = useLanguage();
  const [isBookmarked, setIsBookmarked] = useState(scheme.isBookmarked || false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // Parse JSON documents count and eligibility
  let docsCount = 3;
  let criteria: EligibilityCriteria = {};
  try {
    const docs = JSON.parse(scheme.documentsRequired || '[]');
    docsCount = docs.length;
  } catch {}

  try {
    criteria = JSON.parse(scheme.eligibilityJson || '{}');
  } catch {}

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      window.location.href = '/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setIsBookmarking(true);
    const newState = !isBookmarked;
    setIsBookmarked(newState);

    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schemeId: scheme.id }),
      });
      const data = await res.json();
      setIsBookmarked(data.bookmarked);
      if (onBookmarkToggle) {
        onBookmarkToggle(scheme.id, data.bookmarked);
      }
    } catch (err) {
      setIsBookmarked(!newState);
    } finally {
      setIsBookmarking(false);
    }
  };

  const title = language === 'hi' && scheme.titleHi ? scheme.titleHi : scheme.titleEn;
  const description = language === 'hi' && scheme.descriptionHi ? scheme.descriptionHi : scheme.descriptionEn;
  const department = language === 'hi' && scheme.departmentHi ? scheme.departmentHi : scheme.departmentEn;
  const categoryName = scheme.category
    ? (language === 'hi' ? scheme.category.nameHi : scheme.category.nameEn)
    : 'Government Welfare';

  const IconComponent = scheme.category?.icon && CATEGORY_ICONS[scheme.category.icon]
    ? CATEGORY_ICONS[scheme.category.icon]
    : Building2;

  // Format criteria pills
  const ageString =
    criteria.minAge !== undefined && criteria.maxAge !== undefined
      ? `${criteria.minAge}-${criteria.maxAge} Yrs`
      : criteria.minAge !== undefined
      ? `${criteria.minAge}+ Yrs`
      : 'All Ages';

  const genderString = criteria.gender === 'Female' ? 'Women Only' : criteria.gender === 'Male' ? 'Men Only' : 'All Genders';
  
  const incomeString = criteria.maxIncome
    ? `< ₹${(criteria.maxIncome / 100000).toFixed(1)}L/yr`
    : 'No Income Cap';

  // Last Verified Trust Badge (90-day threshold)
  const updatedDate = new Date(scheme.updatedAt || scheme.createdAt || Date.now());
  const diffDays = Math.floor((Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
  const isVerifiedRecent = diffDays <= 90;
  const formattedVerifiedDate = updatedDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-govNavy-300 shadow-soft-sm hover:shadow-soft-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
      {/* Card Body */}
      <div className="p-5 sm:p-6">
        {/* Category Header Bar */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-xl bg-govNavy-50 text-govNavy-800 border border-govNavy-100/80">
              <IconComponent className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-govNavy-900 tracking-tight">
              {categoryName}
            </span>
            {scheme.state === 'Maharashtra' ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-saffron-500 animate-pulse"></span>
                <span>{language === 'hi' ? 'महाराष्ट्र' : 'Maharashtra'}</span>
              </span>
            ) : scheme.level?.toUpperCase() === 'STATE' ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                {language === 'hi' ? (scheme.state || 'राज्य') : (scheme.state || 'State')}
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                {language === 'hi' ? 'केंद्रीय' : 'Central'}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Match Score (if evaluated) */}
            {showMatchScore && scheme.matchScore !== undefined && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  scheme.matchScore >= 80
                    ? 'bg-govEmerald-50 text-govEmerald-700 border-govEmerald-200'
                    : scheme.matchScore >= 60
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                {scheme.matchScore}% Match
              </span>
            )}

            {/* Bookmark button */}
            <button
              onClick={handleBookmark}
              disabled={isBookmarking}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Save scheme'}
              title={isBookmarked ? t('saved') : t('bookmark')}
              className={`p-2 rounded-xl transition-smooth ${
                isBookmarked
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <Link href={`/schemes/${scheme.id}`} className="block mb-2 group-hover:text-govNavy-800">
          <h3 className="text-base sm:text-lg font-bold text-govNavy-900 group-hover:text-govNavy-800 transition-smooth line-clamp-2 leading-snug">
            {title}
          </h3>
        </Link>

        {/* Ministry / Department */}
        <p className="text-xs text-slate-500 line-clamp-1 mb-2.5 flex items-center">
          <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
          <span className="truncate">{department}</span>
        </p>

        {/* Deadline Badge */}
        <div className="mb-3">
          <DeadlineBadge
            deadline={scheme.deadline}
            closeDate={scheme.closeDate}
            deadlineNote={scheme.deadlineNote}
            deadlineVerifiedAt={scheme.deadlineVerifiedAt}
            lastVerified={scheme.lastVerified}
            updatedAt={scheme.updatedAt}
            showVerifiedDate={true}
          />
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {description}
        </p>

        {/* Key Benefit Tag (Soft Emerald Green Badge) */}
        {scheme.benefitAmount ? (
          <div className="p-3 rounded-xl bg-govEmerald-50 border border-govEmerald-200/80 mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-govEmerald-500 animate-pulse shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-govEmerald-800 tracking-tight">
                {scheme.benefitAmount}
              </span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-govEmerald-700 border border-govEmerald-200">
              {scheme.benefitType}
            </span>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-govEmerald-50/60 border border-govEmerald-200/60 mb-4 text-xs font-semibold text-govEmerald-800 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-govEmerald-600 shrink-0" />
            <span>{scheme.benefitType || 'Direct Welfare'} Benefit Program</span>
          </div>
        )}

        {/* Eligibility Criteria Tags (Age, Gender, Income limit, Docs, and Last Verified Badge) */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-600">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700">
            <Calendar className="w-3 h-3 mr-1 text-slate-400" />
            {ageString}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700">
            <Users className="w-3 h-3 mr-1 text-slate-400" />
            {genderString}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700">
            <IndianRupee className="w-3 h-3 mr-1 text-slate-400" />
            {incomeString}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-500 text-[10px]">
            <FileText className="w-3 h-3 mr-1" />
            {docsCount} Docs
          </span>

          {/* Last Verified Trust Badge */}
          {isVerifiedRecent ? (
            <span
              title={`Verified on ${formattedVerifiedDate} against official ministry guidelines`}
              className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold"
            >
              <BadgeCheck className="w-3 h-3 mr-1 text-emerald-600 shrink-0" />
              ✓ {language === 'hi' ? `सत्यापित: ${formattedVerifiedDate}` : `Verified on ${formattedVerifiedDate}`}
            </span>
          ) : (
            <span
              title="This scheme has not been reviewed in over 90 days. Verification in progress."
              className="inline-flex items-center px-2 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold"
            >
              <AlertTriangle className="w-3 h-3 mr-1 text-amber-600 shrink-0" />
              ⚠ {language === 'hi' ? 'समीक्षा आवश्यक' : 'Recheck needed'}
            </span>
          )}
        </div>
      </div>

      {/* Dual Action Buttons Footer */}
      <div className="p-4 bg-slate-50/80 border-t border-slate-100 grid grid-cols-2 gap-2.5">
        {/* Check Eligibility / View Details Button */}
        <Link
          href={`/schemes/${scheme.id}`}
          className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-govNavy-900 hover:text-govNavy-800 bg-white hover:bg-slate-100 border border-slate-200 text-center transition-smooth flex items-center justify-center space-x-1.5 shadow-sm"
        >
          <span>{language === 'en' ? 'View Details' : 'विवरण देखें'}</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        {/* Apply Now on Official Portal / Check Eligibility */}
        {showMatchScore && scheme.officialLink ? (
          <a
            href={scheme.officialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-saffron-500 hover:bg-saffron-600 active:bg-saffron-700 text-govNavy-950 text-center shadow-soft-sm transition-smooth flex items-center justify-center space-x-1.5"
          >
            <span>{language === 'en' ? 'Apply Now' : 'आवेदन करें'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <Link
            href="/eligibility"
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-govNavy-900 hover:bg-govNavy-800 active:bg-govNavy-950 text-white text-center shadow-soft-sm transition-smooth flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-saffron-300" />
            <span>{language === 'en' ? 'Check Eligibility' : 'पात्रता जांचें'}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
