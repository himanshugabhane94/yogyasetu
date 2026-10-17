'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Clock, CheckCircle2, AlertTriangle, XCircle, Infinity as InfinityIcon } from 'lucide-react';

interface DeadlineBadgeProps {
  deadline?: string | null | Date;
  closeDate?: string | null | Date;
  deadlineNote?: string | null;
  deadlineVerifiedAt?: string | null | Date;
  lastVerified?: string | null | Date;
  updatedAt?: string | null | Date;
  showVerifiedDate?: boolean;
  className?: string;
}

export default function DeadlineBadge({
  deadline,
  closeDate,
  deadlineNote,
  deadlineVerifiedAt,
  lastVerified,
  updatedAt,
  showVerifiedDate = true,
  className = '',
}: DeadlineBadgeProps) {
  const { language } = useLanguage();

  const targetDate = deadline || closeDate;
  const verifiedDateVal = deadlineVerifiedAt || lastVerified || updatedAt || new Date();
  const formattedVerifiedDate = new Date(verifiedDateVal).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (!targetDate) {
    const noteText = deadlineNote || (language === 'hi' ? 'निरंतर / जारी' : 'Ongoing');
    return (
      <div className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
          <InfinityIcon className="w-3.5 h-3.5 mr-1 text-slate-500" />
          <span>{noteText}</span>
        </span>
        {showVerifiedDate && (
          <span className="text-[11px] text-slate-500 font-medium">
            {language === 'hi' ? `अंतिम तिथि सत्यापन: ${formattedVerifiedDate}` : `Deadline last verified: ${formattedVerifiedDate}`}
          </span>
        )}
      </div>
    );
  }

  const d = new Date(targetDate);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // Determine badge color & status:
  // past -> grey "Closed"
  // <= 3 -> red
  // 4-14 -> amber
  // > 14 -> green
  let badgeClasses = '';
  let IconComponent = Clock;
  let label = '';

  if (daysLeft < 0) {
    badgeClasses = 'bg-slate-100 text-slate-600 border-slate-300';
    IconComponent = XCircle;
    label = language === 'hi' ? 'आवेदन बंद (Closed)' : 'Closed';
  } else if (daysLeft <= 3) {
    badgeClasses = 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse';
    IconComponent = AlertTriangle;
    label = language === 'hi' ? `⚠️ केवल ${daysLeft} दिन शेष` : `⚠️ ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`;
  } else if (daysLeft <= 14) {
    badgeClasses = 'bg-amber-50 text-amber-800 border-amber-300';
    IconComponent = Clock;
    label = language === 'hi' ? `⏳ ${daysLeft} दिन शेष` : `⏳ ${daysLeft} days left`;
  } else {
    badgeClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    IconComponent = CheckCircle2;
    label = language === 'hi' ? `📅 ${daysLeft} दिन शेष` : `📅 ${daysLeft} days left`;
  }

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${badgeClasses}`}>
        <IconComponent className="w-3.5 h-3.5 mr-1.5 shrink-0" />
        <span>{label}</span>
      </span>
      {showVerifiedDate && (
        <span className="text-[11px] text-slate-500 font-medium">
          {language === 'hi' ? `अंतिम तिथि सत्यापन: ${formattedVerifiedDate}` : `Deadline last verified: ${formattedVerifiedDate}`}
        </span>
      )}
    </div>
  );
}
