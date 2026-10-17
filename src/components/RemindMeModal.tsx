'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Bell, Mail, X, Check, Clock, ShieldCheck, Loader2, Info, Calendar } from 'lucide-react';

interface RemindMeModalProps {
  schemeId: string;
  schemeTitle: string;
  deadlineFormatted?: string;
  daysLeft?: number;
  isOngoing?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RemindMeModal({
  schemeId,
  schemeTitle,
  deadlineFormatted,
  daysLeft,
  isOngoing = false,
  isOpen,
  onClose,
  onSuccess,
}: RemindMeModalProps) {
  const { language } = useLanguage();

  const [remind7Days, setRemind7Days] = useState(true);
  const [remind3Days, setRemind3Days] = useState(true);
  const [remind1Day, setRemind1Day] = useState(true);
  const [customRemindDate, setCustomRemindDate] = useState<string>('');
  const [channelEmail, setChannelEmail] = useState(true);
  const [channelInApp, setChannelInApp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scheme has a verified fixed deadline if deadlineFormatted is provided or daysLeft >= 0 and not marked ongoing
  const hasVerifiedDeadline = !isOngoing && Boolean(deadlineFormatted || (daysLeft !== undefined && daysLeft >= 0));

  // Load existing reminders for this scheme
  useEffect(() => {
    if (isOpen && schemeId) {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Default custom date: 7 days from today
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      const defaultDateStr = defaultDate.toISOString().split('T')[0];

      fetch(`/api/reminders?schemeId=${schemeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.reminders && data.reminders.length > 0) {
            // Check for custom date reminder
            const customRem = data.reminders.find(
              (r: any) => r.remindOn || r.daysBefore === 0
            );
            if (customRem && customRem.remindOn) {
              const dStr = new Date(customRem.remindOn).toISOString().split('T')[0];
              setCustomRemindDate(dStr);
            } else {
              setCustomRemindDate(defaultDateStr);
            }

            const daysSet = new Set(data.reminders.map((r: any) => r.daysBefore));
            setRemind7Days(daysSet.has(7));
            setRemind3Days(daysSet.has(3));
            setRemind1Day(daysSet.has(1));
            const first = data.reminders[0];
            setChannelEmail(first.channelEmail ?? true);
            setChannelInApp(first.channelInApp ?? true);
          } else {
            setCustomRemindDate(defaultDateStr);
            setRemind7Days(daysLeft === undefined || daysLeft >= 7);
            setRemind3Days(daysLeft === undefined || daysLeft >= 3);
            setRemind1Day(true);
            setChannelEmail(true);
            setChannelInApp(true);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen, schemeId, daysLeft, isOngoing]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const todayStr = new Date().toISOString().split('T')[0];

    try {
      if (!hasVerifiedDeadline) {
        // Ongoing scheme with custom user-chosen date
        if (!customRemindDate) {
          setError(
            language === 'hi'
              ? 'कृपया रिमाइंडर की तिथि चुनें'
              : 'Please select a reminder date'
          );
          setSaving(false);
          return;
        }

        if (customRemindDate < todayStr) {
          setError(
            language === 'hi'
              ? 'रिमाइंडर की तिथि भूतकाल में नहीं हो सकती'
              : 'Reminder date cannot be in the past'
          );
          setSaving(false);
          return;
        }

        const res = await fetch('/api/reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schemeId,
            remindOn: customRemindDate,
            channelEmail,
            channelInApp,
            replaceAllForScheme: true,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to save reminder');
        }
      } else {
        // Scheme with verified deadline: 7 / 3 / 1 days milestones
        const selectedDays: number[] = [];
        if (remind7Days) selectedDays.push(7);
        if (remind3Days) selectedDays.push(3);
        if (remind1Day) selectedDays.push(1);

        if (selectedDays.length === 0) {
          await fetch(`/api/reminders?schemeId=${schemeId}`, {
            method: 'DELETE',
          });
        } else {
          const res = await fetch('/api/reminders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              schemeId,
              daysBefore: selectedDays,
              channelEmail,
              channelInApp,
              replaceAllForScheme: true,
            }),
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to save reminders');
          }
        }
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error configuring reminder');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-soft-2xl border border-slate-200 p-6 sm:p-7 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tricolor Stripe Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-saffron-500 via-govNavy-700 to-govEmerald-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-govNavy-900 leading-tight">
              {language === 'hi' ? 'रिमाइंडर सेट करें' : 'Set Reminder'}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-1 max-w-[260px]">
              {schemeTitle}
            </p>
          </div>
        </div>

        {/* Status / Deadline Summary Box */}
        {hasVerifiedDeadline && deadlineFormatted ? (
          <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl mb-5 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-govNavy-700" />
              {language === 'hi' ? 'अंतिम तिथि:' : 'Official Deadline:'}
            </span>
            <span className="font-bold text-govNavy-900">
              {deadlineFormatted} {daysLeft !== undefined ? `(${daysLeft}d left)` : ''}
            </span>
          </div>
        ) : (
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl mb-5 flex items-center justify-between text-xs font-semibold">
            <span className="text-amber-800 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
              {language === 'hi' ? 'योजना स्थिति:' : 'Scheme Status:'}
            </span>
            <span className="font-bold text-amber-950 px-2.5 py-0.5 rounded-full bg-white border border-amber-200 text-[11px]">
              {language === 'hi' ? 'निरंतर (Ongoing)' : 'Ongoing Scheme'}
            </span>
          </div>
        )}

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-govNavy-800 mb-2" />
            <span>{language === 'hi' ? 'लोड हो रहा है...' : 'Loading existing settings...'}</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            {/* 1. Milestone Checkboxes OR Custom Date Picker */}
            {hasVerifiedDeadline ? (
              <div>
                <label className="block text-xs font-bold text-govNavy-900 uppercase tracking-wider mb-2.5">
                  {language === 'hi' ? 'कब सूचित करें (Milestones):' : 'When to notify:'}
                </label>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 cursor-pointer transition-colors">
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={remind7Days}
                        onChange={(e) => setRemind7Days(e.target.checked)}
                        className="w-4 h-4 rounded text-govNavy-900 focus:ring-govNavy-800 border-slate-300"
                      />
                      <span className="text-sm font-semibold text-slate-800">
                        {language === 'hi' ? '7 दिन पहले' : '7 days before deadline'}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      7d
                    </span>
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 cursor-pointer transition-colors">
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={remind3Days}
                        onChange={(e) => setRemind3Days(e.target.checked)}
                        className="w-4 h-4 rounded text-govNavy-900 focus:ring-govNavy-800 border-slate-300"
                      />
                      <span className="text-sm font-semibold text-slate-800">
                        {language === 'hi' ? '3 दिन पहले' : '3 days before deadline'}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      3d
                    </span>
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 cursor-pointer transition-colors">
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={remind1Day}
                        onChange={(e) => setRemind1Day(e.target.checked)}
                        className="w-4 h-4 rounded text-govNavy-900 focus:ring-govNavy-800 border-slate-300"
                      />
                      <span className="text-sm font-semibold text-slate-800">
                        {language === 'hi' ? '1 दिन पहले (अंतिम चेतावनी)' : '1 day before (Final Call)'}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                      1d
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-govNavy-900 uppercase tracking-wider mb-2">
                  {language === 'hi' ? 'मुझे याद दिलाएं (Remind me on):' : 'Remind me on:'}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={customRemindDate}
                    onChange={(e) => setCustomRemindDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-govNavy-800 focus:ring-1 focus:ring-govNavy-800 text-sm font-semibold text-slate-800 bg-white shadow-soft-sm outline-none"
                    required
                  />
                </div>
                {/* Note for ongoing scheme */}
                <div className="mt-2.5 p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-start space-x-2 text-xs text-blue-900">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">
                    {language === 'hi'
                      ? 'यह योजना निरंतर (Ongoing) है, इसलिए आप स्वयं चुनें कि आपको कब याद दिलाया जाए।'
                      : 'This scheme is ongoing, so you choose when to be reminded.'}
                  </span>
                </div>
              </div>
            )}

            {/* 2. Notification Channels */}
            <div>
              <label className="block text-xs font-bold text-govNavy-900 uppercase tracking-wider mb-2.5">
                {language === 'hi' ? 'रिमाइंडर चैनल:' : 'Notification Channels:'}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <label
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    channelEmail
                      ? 'bg-govNavy-50 border-govNavy-300 text-govNavy-900'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center space-x-2 text-xs font-bold">
                    <Mail className="w-4 h-4" />
                    <span>{language === 'hi' ? 'ईमेल अलर्ट' : 'Email Alert'}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={channelEmail}
                    onChange={(e) => setChannelEmail(e.target.checked)}
                    className="w-4 h-4 rounded text-govNavy-900 focus:ring-govNavy-800"
                  />
                </label>

                <label
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    channelInApp
                      ? 'bg-govNavy-50 border-govNavy-300 text-govNavy-900'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center space-x-2 text-xs font-bold">
                    <Bell className="w-4 h-4" />
                    <span>{language === 'hi' ? 'इन-ऐप अलर्ट' : 'In-App Bell'}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={channelInApp}
                    onChange={(e) => setChannelInApp(e.target.checked)}
                    className="w-4 h-4 rounded text-govNavy-900 focus:ring-govNavy-800"
                  />
                </label>
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {error}
              </p>
            )}

            {success && (
              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center space-x-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{language === 'hi' ? 'रिमाइंडर सफलतापूर्वक सेट हो गया!' : 'Reminder saved successfully!'}</span>
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="w-1/2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-1/2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-govNavy-900 hover:bg-govNavy-800 active:bg-govNavy-950 transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    <span>{language === 'hi' ? 'सेव हो रहा है...' : 'Saving...'}</span>
                  </>
                ) : (
                  <span>{language === 'hi' ? 'रिमाइंडर सेव करें' : 'Save Reminder'}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
