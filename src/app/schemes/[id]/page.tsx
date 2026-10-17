'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/context/LanguageContext';
import { SchemeItem, EligibilityCriteria, ApplicationStep } from '@/types';
import {
  Building2,
  ExternalLink,
  Bookmark,
  Share2,
  Printer,
  CheckCircle2,
  FileText,
  Calendar,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  BadgePercent,
  Check,
  Clock,
  Layers,
  ArrowUpRight,
  Bell,
} from 'lucide-react';
import DeadlineBadge from '@/components/DeadlineBadge';
import RemindMeModal from '@/components/RemindMeModal';

export default function SchemeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { language, t } = useLanguage();

  const [scheme, setScheme] = useState<SchemeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string>('NONE');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [remindModalOpen, setRemindModalOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/schemes/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.scheme) {
            setScheme(data.scheme);
            setIsBookmarked(data.scheme.isBookmarked || false);
            if (data.scheme.applicationStatus) {
              setApplicationStatus(data.scheme.applicationStatus);
            }
          }
        })
        .catch((err) => console.error('Failed to load scheme details:', err))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  const handleBookmarkToggle = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schemeId: scheme?.id }),
      });
      const data = await res.json();
      setIsBookmarked(data.bookmarked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setUpdatingStatus(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemeId: scheme?.id,
          status: newStatus,
          notes: `Updated status from scheme details page on ${new Date().toLocaleDateString()}`,
        }),
      });
      if (res.ok) {
        setApplicationStatus(newStatus);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: scheme?.titleEn,
        text: scheme?.descriptionEn,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse mb-6" />
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Scheme Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">The requested welfare scheme does not exist or may have been updated.</p>
        <Link href="/schemes" className="px-5 py-2.5 bg-govNavy-900 hover:bg-govNavy-800 text-white font-bold text-xs rounded-xl shadow-soft-sm transition-smooth">
          Browse All Schemes
        </Link>
      </div>
    );
  }

  // Parse structured data safely
  let criteria: EligibilityCriteria = {};
  let documents: string[] = [];
  let steps: ApplicationStep[] = [];

  try {
    criteria = JSON.parse(scheme.eligibilityJson || '{}');
  } catch {}
  try {
    documents = JSON.parse(scheme.documentsRequired || '[]');
  } catch {}
  try {
    steps = JSON.parse(scheme.applicationProcess || '[]');
  } catch {}

  const title = language === 'hi' && scheme.titleHi ? scheme.titleHi : scheme.titleEn;
  const description = language === 'hi' && scheme.descriptionHi ? scheme.descriptionHi : scheme.descriptionEn;
  const benefits = language === 'hi' && scheme.benefitsHi ? scheme.benefitsHi : scheme.benefitsEn;
  const department = language === 'hi' && scheme.departmentHi ? scheme.departmentHi : scheme.departmentEn;
  const categoryName = scheme.category
    ? (language === 'hi' ? scheme.category.nameHi : scheme.category.nameEn)
    : 'Government Scheme';

  // Target deadline calculation
  const targetDeadline = scheme.deadline || scheme.closeDate;
  let hasActiveFutureDeadline = false;
  let daysLeft = 0;
  let formattedDeadlineStr = '';
  if (targetDeadline) {
    const d = new Date(targetDeadline);
    const diffMs = d.getTime() - Date.now();
    daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    hasActiveFutureDeadline = daysLeft >= 0;
    formattedDeadlineStr = d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <div className="mb-6 no-print">
          <Link
            href="/schemes"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-govNavy-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{language === 'en' ? 'Back to Schemes Discovery' : 'योजना खोज पर वापस जाएं'}</span>
          </Link>
        </div>

        {/* Scheme Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-govNavy-50 text-govNavy-900 border border-govNavy-100 text-xs font-bold uppercase tracking-wider">
                {categoryName}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-govEmerald-50 text-govEmerald-800 border border-govEmerald-200 text-xs font-semibold">
                🟢 {scheme.status}
              </span>

              {scheme.state === 'Maharashtra' ? (
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-saffron-500 animate-pulse"></span>
                  <span>{language === 'hi' ? 'महाराष्ट्र शासन (Maha DBT)' : 'Maharashtra State (Maha DBT)'}</span>
                </span>
              ) : scheme.level?.toUpperCase() === 'STATE' ? (
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                  {scheme.state || 'State'}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                  {language === 'hi' ? 'केंद्रीय योजना' : 'Central Scheme'}
                </span>
              )}

              {/* Last Verified Trust Badge (90-day threshold) */}
              {(() => {
                const updatedDate = new Date(scheme.updatedAt || scheme.createdAt || Date.now());
                const diffDays = Math.floor((Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
                const isVerifiedRecent = diffDays <= 90;
                const formattedVerifiedDate = updatedDate.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return isVerifiedRecent ? (
                  <span
                    title={`Scheme verified against official gazette on ${formattedVerifiedDate}`}
                    className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{language === 'hi' ? `✓ सत्यापित: ${formattedVerifiedDate}` : `✓ Verified on ${formattedVerifiedDate}`}</span>
                  </span>
                ) : (
                  <span
                    title="This scheme was last updated over 90 days ago. Verification check pending."
                    className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold flex items-center space-x-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{language === 'hi' ? '⚠ समीक्षा आवश्यक (90+ दिन)' : '⚠ Recheck needed (90+ days)'}</span>
                  </span>
                );
              })()}
            </div>

            {/* Actions: Remind Me, Save, Share, Print */}
            <div className="flex items-center space-x-2 no-print">
              {hasActiveFutureDeadline && (
                <button
                  onClick={() => {
                    if (!session) {
                      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
                      return;
                    }
                    setRemindModalOpen(true);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-govNavy-950 shadow-soft-sm transition-all"
                  title={language === 'hi' ? 'अंतिम तिथि रिमाइंडर सेट करें' : 'Set Deadline Reminder'}
                >
                  <Bell className="w-3.5 h-3.5 fill-current" />
                  <span>{language === 'hi' ? 'रिमाइंडर (Remind Me)' : 'Remind Me'}</span>
                </button>
              )}

              <button
                onClick={handleBookmarkToggle}
                className={`p-2.5 rounded-xl border transition-smooth ${
                  isBookmarked
                    ? 'bg-amber-50 text-amber-600 border-amber-300'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
                title={isBookmarked ? t('saved') : t('bookmark')}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-smooth relative"
                title={t('shareScheme')}
              >
                <Share2 className="w-4 h-4" />
                {copied && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow whitespace-nowrap">
                    {t('copiedLink')}
                  </span>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-smooth"
                title={t('printPage')}
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl font-black text-govNavy-900 tracking-tight leading-snug mb-3">
            {title}
          </h1>

          {/* Ministry / Department */}
          <p className="text-xs sm:text-sm text-slate-600 flex items-center mb-3">
            <Building2 className="w-4 h-4 mr-1.5 text-slate-400 shrink-0" />
            <span className="font-semibold">{department}</span>
          </p>

          {/* Deadline Badge */}
          <div className="mb-6">
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

          {/* Benefit Highlight Box */}
          {scheme.benefitAmount && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-govEmerald-50 to-teal-50 border border-govEmerald-200/80 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-govEmerald-800 uppercase tracking-wider block">
                  {t('benefitBadge')} Highlight
                </span>
                <span className="text-lg sm:text-2xl font-black text-govEmerald-950">
                  {scheme.benefitAmount}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-white text-govEmerald-800 font-bold text-xs border border-govEmerald-200 shadow-soft-sm">
                {scheme.benefitType}
              </span>
            </div>
          )}

          {/* Apply External CTA Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href={scheme.officialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3.5 px-6 rounded-xl bg-govNavy-900 hover:bg-govNavy-800 text-white font-bold text-sm text-center shadow-soft-sm hover:shadow-soft-md transition-smooth flex items-center justify-center space-x-2"
            >
              <span>{t('applyNowDirect')}</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {scheme.sourceUrl && (
              <a
                href={scheme.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs text-center border border-slate-200 transition-smooth flex items-center justify-center space-x-1.5 shrink-0"
                title="View Official Source & Guidelines"
              >
                <span>{language === 'hi' ? 'आधिकारिक स्रोत' : 'Source Portal'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Self Application Tracker Dropdown */}
            {session && (
              <div className="sm:w-64 relative no-print">
                <select
                  value={applicationStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-govNavy-800"
                >
                  <option value="NONE">Status: Not Applied</option>
                  <option value="APPLIED">Status: Applied</option>
                  <option value="IN_PROGRESS">Status: In Progress</option>
                  <option value="APPROVED">Status: Approved</option>
                  <option value="REJECTED">Status: Action Needed</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Security & Official Portal Redirect Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 mb-8 flex items-start space-x-3 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <h4 className="font-bold mb-1">{t('officialDisclaimerTitle')}</h4>
            <p className="text-amber-800">{t('officialDisclaimerDesc')}</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8">
          {/* 1. Scheme Overview */}
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm">
            <h2 className="text-lg sm:text-xl font-black text-govNavy-900 mb-3 flex items-center">
              <span className="w-2 h-5 bg-govNavy-800 rounded-full mr-2.5" />
              {t('overviewTab')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </section>

          {/* 2. Key Benefits Detailed */}
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm">
            <h2 className="text-lg sm:text-xl font-black text-govNavy-900 mb-3 flex items-center">
              <span className="w-2 h-5 bg-govEmerald-600 rounded-full mr-2.5" />
              {t('benefitsTab')}
            </h2>
            <div className="p-5 bg-govEmerald-50/60 rounded-2xl border border-govEmerald-200/80 text-xs sm:text-sm text-govEmerald-950 font-medium leading-relaxed">
              {benefits}
            </div>
          </section>

          {/* 3. Structured Eligibility Criteria Checklist */}
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm">
            <h2 className="text-lg sm:text-xl font-black text-govNavy-900 mb-4 flex items-center">
              <span className="w-2 h-5 bg-blue-600 rounded-full mr-2.5" />
              {t('eligibilityTab')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Age Qualification
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-900">
                  {criteria.minAge !== undefined && criteria.maxAge !== undefined
                    ? `${criteria.minAge} to ${criteria.maxAge} years`
                    : criteria.minAge !== undefined
                    ? `Minimum ${criteria.minAge} years`
                    : 'Open to all age groups'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Target Gender
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-900">
                  {criteria.gender || 'All Genders (Male, Female, Transgender)'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Family Income Ceiling
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-900">
                  {criteria.maxIncome
                    ? `Up to ₹${criteria.maxIncome.toLocaleString('en-IN')} per annum`
                    : 'No income ceiling restriction'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Applicable States / Region
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-900">
                  {criteria.states && !criteria.states.includes('All')
                    ? criteria.states.join(', ')
                    : 'All 28 Indian States & 8 Union Territories'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Social Category / Caste
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-900">
                  {criteria.categories && !criteria.categories.includes('All')
                    ? criteria.categories.join(', ')
                    : 'All Social Categories (General, OBC, SC, ST, EWS)'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Occupation / Profession
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-900">
                  {criteria.occupations && !criteria.occupations.includes('All')
                    ? criteria.occupations.join(', ')
                    : 'All occupations & unemployed citizens'}
                </span>
              </div>
            </div>
          </section>

          {/* 4. Required Documents Checklist */}
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm">
            <h2 className="text-lg sm:text-xl font-black text-govNavy-900 mb-4 flex items-center">
              <span className="w-2 h-5 bg-govEmerald-600 rounded-full mr-2.5" />
              {t('documentsTab')}
            </h2>

            {documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80"
                  >
                    <CheckCircle2 className="w-4 h-4 text-govEmerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-medium text-slate-800">{doc}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Standard KYC documents (Aadhaar, Bank passbook, Passport photograph).</p>
            )}
          </section>

          {/* 5. Step-by-Step Application Process */}
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm">
            <h2 className="text-lg sm:text-xl font-black text-govNavy-900 mb-6 flex items-center">
              <span className="w-2 h-5 bg-govNavy-800 rounded-full mr-2.5" />
              {t('processTab')}
            </h2>

            {steps.length > 0 ? (
              <div className="space-y-4">
                {steps.map((step) => (
                  <div
                    key={step.step}
                    className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80"
                  >
                    <div className="w-8 h-8 rounded-full bg-govNavy-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-soft-sm">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-govNavy-900 mb-1">
                        {language === 'hi' && step.titleHi ? step.titleHi : step.titleEn}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {language === 'hi' && step.descHi ? step.descHi : step.descEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Apply via the official government portal link provided above.</p>
            )}
          </section>
        </div>

        {/* Remind Me Dialog */}
        <RemindMeModal
          schemeId={scheme.id}
          schemeTitle={title}
          deadlineFormatted={formattedDeadlineStr}
          daysLeft={daysLeft}
          isOpen={remindModalOpen}
          onClose={() => setRemindModalOpen(false)}
        />
      </div>
    </div>
  );
}
