'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/context/LanguageContext';
import { ReminderItem } from '@/types';
import DeadlineBadge from '@/components/DeadlineBadge';
import RemindMeModal from '@/components/RemindMeModal';
import {
  Bell,
  Clock,
  Trash2,
  Edit2,
  Calendar,
  Building2,
  ExternalLink,
  ArrowRight,
  Mail,
  ShieldCheck,
  AlertCircle,
  Inbox,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function RemindersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language } = useLanguage();

  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingScheme, setEditingScheme] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchReminders = async () => {
    try {
      const res = await fetch('/api/reminders');
      if (res.ok) {
        const data = await res.json();
        setReminders(data.reminders || []);
      }
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/reminders');
    } else if (status === 'authenticated') {
      fetchReminders();
    }
  }, [status, router]);

  const handleDelete = async (schemeId: string, schemeTitle: string) => {
    if (
      !confirm(
        language === 'hi'
          ? `क्या आप "${schemeTitle}" का रिमाइंडर हटाना चाहते हैं?`
          : `Delete reminder for "${schemeTitle}"?`
      )
    ) {
      return;
    }

    setDeletingId(schemeId);
    try {
      const res = await fetch(`/api/reminders?schemeId=${schemeId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setReminders((prev) => prev.filter((r) => r.schemeId !== schemeId));
        setToastMessage(language === 'hi' ? 'रिमाइंडर हटा दिया गया' : 'Reminder deleted');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error('Delete reminder error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Group reminders by scheme
  const groupedReminders = React.useMemo(() => {
    const map = new Map<string, any>();
    reminders.forEach((r) => {
      const schemeId = r.schemeId;
      if (!map.has(schemeId)) {
        map.set(schemeId, {
          scheme: r.scheme,
          schemeId,
          daysLeft: r.daysLeft,
          isPast: r.isPast,
          deadlineFormatted: r.deadlineFormatted,
          remindersList: [],
        });
      }
      map.get(schemeId).remindersList.push(r);
    });
    return Array.from(map.values());
  }, [reminders]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-white rounded-3xl border border-slate-200 animate-pulse p-6" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-govNavy-900 text-white px-4 py-3 rounded-2xl shadow-soft-xl flex items-center space-x-2 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-govEmerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold mb-2">
              <Bell className="w-3.5 h-3.5 fill-current" />
              <span>{language === 'hi' ? 'अंतिम तिथि सतर्कता' : 'Deadline Alerts'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-govNavy-900 tracking-tight">
              {language === 'hi' ? 'मेरे रिमाइंडर (My Reminders)' : 'My Reminders'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {language === 'hi'
                ? 'आपके द्वारा सहेजी गई योजनाओं की अंतिम तिथि की निगरानी और स्वचालित सूचनाएं'
                : 'Monitor upcoming deadlines and automated notifications for your tracked schemes'}
            </p>
          </div>

          <Link
            href="/schemes"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-govNavy-900 hover:bg-govNavy-800 text-white text-xs font-bold shadow-soft-sm transition-all shrink-0"
          >
            <span>{language === 'hi' ? 'अन्य योजनाएं खोजें' : 'Explore More Schemes'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Reminders List */}
        {groupedReminders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-soft-sm">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {language === 'hi' ? 'कोई सक्रिय रिमाइंडर नहीं मिला' : 'No Active Reminders Found'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
              {language === 'hi'
                ? 'आपने अभी तक किसी योजना के लिए रिमाइंडर सेट नहीं किया है। योजनाओं के विवरण पृष्ठ या कार्ड पर दिए गए घंटी बटन पर जाकर रिमाइंडर सेट करें।'
                : 'You have not configured any reminders yet. Visit any scheme detail page or click the bell icon on scheme cards to set reminders.'}
            </p>
            <Link
              href="/schemes"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-govNavy-950 text-xs font-bold shadow-soft-sm transition-colors"
            >
              <span>{language === 'hi' ? 'योजनाएं देखें' : 'Browse Schemes'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedReminders.map((group) => {
              const scheme = group.scheme;
              const title = language === 'hi' && scheme.titleHi ? scheme.titleHi : scheme.titleEn;
              const department = language === 'hi' && scheme.departmentHi ? scheme.departmentHi : scheme.departmentEn;
              
              // Check if this scheme has a custom chosen reminder date
              const customReminder = group.remindersList.find(
                (r: any) => r.remindOn || r.daysBefore === 0
              );
              const isCustomDate = Boolean(customReminder && customReminder.remindOn);

              const milestones = group.remindersList
                .filter((r: any) => r.daysBefore > 0)
                .map((r: any) => `${r.daysBefore}d`)
                .join(', ');

              const hasEmail = group.remindersList.some((r: any) => r.channelEmail);
              const hasInApp = group.remindersList.some((r: any) => r.channelInApp);

              return (
                <div
                  key={group.schemeId}
                  className="bg-white rounded-3xl border border-slate-200/90 hover:border-slate-300 p-5 sm:p-6 shadow-soft-sm transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Top Tag & Deadline Badge */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {scheme.category && (
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {language === 'hi' ? scheme.category.nameHi : scheme.category.nameEn}
                          </span>
                        )}
                        <DeadlineBadge
                          deadline={scheme.deadline}
                          closeDate={scheme.closeDate}
                          deadlineNote={scheme.deadlineNote}
                          deadlineVerifiedAt={scheme.deadlineVerifiedAt}
                          lastVerified={scheme.lastVerified}
                          showVerifiedDate={false}
                        />
                      </div>

                      {/* Scheme Title */}
                      <Link href={`/schemes/${scheme.id}`} className="group block mb-1">
                        <h3 className="text-base sm:text-lg font-bold text-govNavy-900 group-hover:text-govNavy-700 transition-colors">
                          {title}
                        </h3>
                      </Link>

                      {/* Ministry / Department */}
                      <p className="text-xs text-slate-500 flex items-center mb-4">
                        <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                        <span>{department}</span>
                      </p>

                      {/* Configured Milestones / Custom Date & Channels */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {isCustomDate ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 font-bold text-[11px]">
                            <Calendar className="w-3 h-3 mr-1 text-blue-600" />
                            <span>
                              {language === 'hi'
                                ? `रिमाइंडर तिथि: ${
                                    customReminder.remindOnFormatted ||
                                    new Date(customReminder.remindOn).toLocaleDateString('hi-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  }`
                                : `Reminder set for: ${
                                    customReminder.remindOnFormatted ||
                                    new Date(customReminder.remindOn).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  }`}
                              {customReminder.daysLeft !== null && customReminder.daysLeft !== undefined
                                ? ` (${customReminder.daysLeft >= 0 ? `in ${customReminder.daysLeft}d` : 'past'})`
                                : ''}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px]">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>
                              {language === 'hi' ? `अलर्ट: ${milestones} पहले` : `Alerts: ${milestones} before`}
                            </span>
                          </span>
                        )}

                        {hasEmail && (
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
                            title="Email alerts active"
                          >
                            <Mail className="w-3 h-3 mr-1 text-govNavy-700" />
                            <span>Email</span>
                          </span>
                        )}

                        {hasInApp && (
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
                            title="In-App bell notifications active"
                          >
                            <Bell className="w-3 h-3 mr-1 text-amber-600" />
                            <span>In-App</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions: Edit, Delete, Apply */}
                    <div className="flex items-center space-x-2 pt-2 sm:pt-0 shrink-0">
                      <button
                        onClick={() =>
                          setEditingScheme({
                            ...scheme,
                            deadlineFormatted: group.deadlineFormatted,
                            daysLeft: group.daysLeft,
                          })
                        }
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                        title={language === 'hi' ? 'रिमाइंडर संपादित करें' : 'Edit Reminders'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(group.schemeId, title)}
                        disabled={deletingId === group.schemeId}
                        className="p-2.5 rounded-xl border border-rose-200 hover:border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                        title={language === 'hi' ? 'रिमाइंडर हटाएं' : 'Delete Reminder'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {scheme.officialLink && (
                        <a
                          href={scheme.officialLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2.5 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-govNavy-950 text-xs font-bold shadow-soft-sm transition-colors flex items-center space-x-1"
                        >
                          <span>{language === 'hi' ? 'आवेदन' : 'Apply'}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Modal */}
        {editingScheme && (
          <RemindMeModal
            schemeId={editingScheme.id}
            schemeTitle={
              language === 'hi' && editingScheme.titleHi ? editingScheme.titleHi : editingScheme.titleEn
            }
            deadlineFormatted={editingScheme.deadlineFormatted}
            daysLeft={editingScheme.daysLeft}
            isOngoing={!editingScheme.deadline && !editingScheme.closeDate}
            isOpen={true}
            onClose={() => setEditingScheme(null)}
            onSuccess={() => {
              fetchReminders();
              setEditingScheme(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
