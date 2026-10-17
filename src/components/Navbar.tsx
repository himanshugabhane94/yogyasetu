'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage } from '@/context/LanguageContext';
import { NotificationItem } from '@/types';
import {
  Search,
  Bell,
  User as UserIcon,
  Menu,
  X,
  ShieldAlert,
  Bookmark,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Sparkles,
  Globe,
  ArrowRight,
  Clock,
  CheckCheck,
} from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);
  const [bannerDismissed, setBannerDismissed] = useState(true);

  const notificationRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const res = await fetch('/api/notifications?limit=10');
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
      if (data.unreadCount !== undefined) {
        setUnreadNotifications(data.unreadCount);
      }
    } catch {
      // silent
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();

      // Check deadline banner
      const isDismissed =
        typeof window !== 'undefined' &&
        sessionStorage.getItem('dismissed_deadline_banner') === 'true';

      if (!isDismissed) {
        fetch('/api/reminders')
          .then((res) => res.json())
          .then((data) => {
            if (data.reminders) {
              const urgent = data.reminders.filter(
                (r: any) =>
                  r.status === 'ACTIVE' &&
                  r.daysLeft !== null &&
                  r.daysLeft >= 0 &&
                  r.daysLeft <= 7
              );
              const uniqueSchemes = new Set(
                urgent.map((r: any) => r.scheme?.id || r.schemeId)
              );
              if (uniqueSchemes.size > 0) {
                setUrgentCount(uniqueSchemes.size);
                setBannerDismissed(false);
              }
            }
          })
          .catch(() => {});
      }
    }
  }, [session]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setUnreadNotifications(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead && !notif.read) {
      try {
        await fetch('/api/notifications/read', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: notif.id }),
        });
        setUnreadNotifications((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true, read: true } : n))
        );
      } catch (e) {
        console.error(e);
      }
    }
    setNotificationsOpen(false);
  };

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    try {
      sessionStorage.setItem('dismissed_deadline_banner', 'true');
    } catch {}
  };

  const navLinks = [
    { href: '/', label: t('navHome') },
    { href: '/schemes', label: t('navSchemes') },
    { href: '/scholarships', label: t('navScholarships') },
    { href: '/eligibility', label: t('navEligibility') },
    { href: '/about#how-it-works', label: t('navHowItWorks') },
    { href: '/about', label: t('navAbout') },
  ];

  const user = session?.user as any;
  const isAdminOrOfficer = user && ['ADMIN', 'VERIFIED_OFFICER'].includes(user.role);

  return (
    <header className="sticky top-0 z-50 transition-all">
      {/* 1. Top Aggregator Disclaimer Strip */}
      <div className="bg-govNavy-950 text-slate-300 py-1.5 px-4 sm:px-6 lg:px-8 border-b border-govNavy-900 text-[11px]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-saffron-500" />
            <span className="font-semibold text-slate-200">
              {language === 'en'
                ? 'Government Scheme Information Aggregator · Not an official government website'
                : 'सरकारी योजना सूचना एग्रीगेटर · यह आधिकारिक सरकारी वेबसाइट नहीं है'}
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-3 text-slate-400 text-[10px]">
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-govEmerald-400" />
              <span>
                {language === 'en'
                  ? 'Verified against official portals'
                  : 'आधिकारिक पोर्टलों द्वारा सत्यापित'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* GovTech Accent Line */}
      <div className="gov-accent-bar w-full" />

      {/* 2. Main Navbar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-soft-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo (🟧 Saffron Badge + Bridge Motif + YogyaSetu Wordmark) */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-saffron-500 to-saffron-600 flex items-center justify-center shadow-soft-sm group-hover:scale-105 transition-smooth border border-saffron-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-govNavy-950"
                >
                  {/* Bridge / Setu Motif */}
                  <path d="M3 17c3-5 8-8 13-5 2.5 1.5 4 3.5 5 5" />
                  <path d="M4 17v4" />
                  <path d="M9 14v7" />
                  <path d="M15 13v8" />
                  <path d="M20 17v4" />
                  <circle cx="12" cy="7" r="2" fill="#0B3D91" />
                </svg>
              </div>

              <div className="flex flex-col">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-govNavy-900">
                    {language === 'en' ? 'Yogya' : 'योग्य'}
                    <span className="text-saffron-600">{language === 'en' ? 'Setu' : 'सेतु'}</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 bg-govNavy-50 text-govNavy-800 text-[10px] font-bold rounded-md border border-govNavy-200/60 uppercase tracking-wider">
                    GovTech
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium tracking-tight hidden sm:block">
                  {language === 'en' ? 'Aapke Liye Sahi Yojana, Ab Ek Hi Jagah.' : 'आपके लिए सही योजना, अब एक ही जगह।'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-smooth ${
                      isActive
                        ? 'text-govNavy-900 bg-govNavy-50 font-bold border border-govNavy-200/50'
                        : 'text-slate-600 hover:text-govNavy-900 hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Controls: Bilingual Switcher, Solid Saffron Login CTA, User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Bilingual Toggle Switch Pill */}
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-bold shadow-inner">
                <button
                  type="button"
                  onClick={() => language !== 'en' && toggleLanguage()}
                  aria-label="Switch to English"
                  className={`px-2.5 py-1 rounded-lg transition-smooth text-[11px] ${
                    language === 'en'
                      ? 'bg-govNavy-900 text-white shadow-soft-sm font-black'
                      : 'text-slate-600 hover:text-govNavy-900 font-medium'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => language !== 'hi' && toggleLanguage()}
                  aria-label="Switch to Hindi"
                  className={`px-2.5 py-1 rounded-lg transition-smooth text-[11px] ${
                    language === 'hi'
                      ? 'bg-govNavy-900 text-white shadow-soft-sm font-black'
                      : 'text-slate-600 hover:text-govNavy-900 font-medium'
                  }`}
                >
                  हिन्दी
                </button>
              </div>

              {/* User Session Menu or Solid Saffron CTA Button */}
              {session ? (
                <div className="flex items-center space-x-2">
                  {/* Notification Bell with Dropdown */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !notificationsOpen;
                        setNotificationsOpen(next);
                        if (next) {
                          setUserDropdownOpen(false);
                          fetchNotifications();
                        }
                      }}
                      className="relative p-2 text-slate-600 hover:text-govNavy-900 rounded-xl hover:bg-slate-100 transition-smooth focus:outline-none"
                      title={t('notificationsTitle')}
                      aria-label="Open notifications"
                      aria-expanded={notificationsOpen}
                    >
                      <Bell className="w-5 h-5" />
                      {unreadNotifications > 0 && (
                        <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                          {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </span>
                      )}
                    </button>

                    {notificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-soft-xl border border-slate-200/90 py-2 z-50 text-sm overflow-hidden">
                        {/* Header */}
                        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                          <div className="flex items-center space-x-2">
                            <Bell className="w-4 h-4 text-govNavy-900" />
                            <span className="font-bold text-slate-900 text-sm">
                              {t('notificationsTitle')}
                            </span>
                            {unreadNotifications > 0 && (
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-full border border-rose-200">
                                {unreadNotifications}
                              </span>
                            )}
                          </div>
                          {unreadNotifications > 0 && (
                            <button
                              type="button"
                              onClick={handleMarkAllRead}
                              className="text-[11px] font-semibold text-saffron-700 hover:text-saffron-800 flex items-center space-x-1 transition-colors"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>{t('markAllAsRead')}</span>
                            </button>
                          )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                          {loadingNotifications && notifications.length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-400">Loading...</div>
                          ) : notifications.length === 0 ? (
                            <div className="py-8 px-4 text-center">
                              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                              <p className="text-xs font-semibold text-slate-600">{t('noNotifications')}</p>
                            </div>
                          ) : (
                            notifications.slice(0, 10).map((n) => {
                              const isRead = n.isRead || n.read;
                              const title =
                                language === 'hi'
                                  ? n.title_hi || n.titleHi || n.title_en || n.titleEn || 'सूचना'
                                  : n.title_en || n.titleEn || 'Notification';
                              const body =
                                language === 'hi'
                                  ? n.body_hi || n.messageHi || n.body_en || n.messageEn || ''
                                  : n.body_en || n.messageEn || '';

                              const itemContent = (
                                <div
                                  className={`p-3.5 flex items-start space-x-3 transition-colors hover:bg-slate-50 cursor-pointer ${
                                    !isRead ? 'bg-amber-50/40' : ''
                                  }`}
                                  onClick={() => handleNotificationClick(n)}
                                >
                                  <div className="shrink-0 mt-0.5">
                                    {!isRead ? (
                                      <span className="w-2.5 h-2.5 rounded-full bg-saffron-600 block shadow-sm" />
                                    ) : (
                                      <span className="w-2.5 h-2.5 rounded-full bg-slate-200 block" />
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p
                                      className={`text-xs ${
                                        !isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                                      } leading-snug`}
                                    >
                                      {title}
                                    </p>
                                    {body && (
                                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                        {body}
                                      </p>
                                    )}
                                    <p className="text-[10px] text-slate-400 mt-1">
                                      {new Date(n.createdAt).toLocaleDateString(
                                        language === 'hi' ? 'hi-IN' : 'en-IN',
                                        {
                                          day: 'numeric',
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        }
                                      )}
                                    </p>
                                  </div>
                                  {n.link && (
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 self-center" />
                                  )}
                                </div>
                              );

                              if (n.link) {
                                return (
                                  <Link key={n.id} href={n.link} className="block">
                                    {itemContent}
                                  </Link>
                                );
                              }
                              return <div key={n.id}>{itemContent}</div>;
                            })
                          )}
                        </div>

                        {/* Footer */}
                        <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-govNavy-900">
                          <Link
                            href="/reminders"
                            onClick={() => setNotificationsOpen(false)}
                            className="flex items-center space-x-1 hover:text-saffron-700 transition-colors"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{t('navReminders')}</span>
                          </Link>
                          <Link
                            href="/dashboard?tab=notifications"
                            onClick={() => setNotificationsOpen(false)}
                            className="hover:text-saffron-700 transition-colors"
                          >
                            {t('viewAllNotifications')} →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Dropdown */}
                  <div className="relative" ref={userDropdownRef}>
                    <button
                      onClick={() => {
                        const next = !userDropdownOpen;
                        setUserDropdownOpen(next);
                        if (next) setNotificationsOpen(false);
                      }}
                      className="flex items-center space-x-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-smooth focus:ring-2 focus:ring-govNavy-800"
                      aria-expanded={userDropdownOpen}
                    >
                      <div className="w-8 h-8 rounded-lg bg-govNavy-900 text-white font-bold flex items-center justify-center text-xs shadow-inner">
                        {user.name ? user.name[0].toUpperCase() : 'U'}
                      </div>
                      <span className="hidden md:block text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                        {user.name}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden md:block" />
                    </button>

                    {userDropdownOpen && (
                      <div
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-soft-lg border border-slate-200/80 py-1.5 z-50 text-sm"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-govNavy-50 text-govNavy-800 text-[10px] font-bold rounded">
                            {user.role}
                          </span>
                        </div>

                        <Link
                          href="/dashboard"
                          className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <LayoutDashboard className="w-4 h-4 mr-2.5 text-slate-500" />
                          {t('navDashboard')}
                        </Link>

                        <Link
                          href="/reminders"
                          className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <Clock className="w-4 h-4 mr-2.5 text-slate-500" />
                          {t('navReminders')}
                        </Link>

                        <Link
                          href="/dashboard?tab=saved"
                          className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <Bookmark className="w-4 h-4 mr-2.5 text-slate-500" />
                          {t('tabSaved')}
                        </Link>

                        {isAdminOrOfficer && (
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-2 text-indigo-700 hover:bg-indigo-50 font-semibold"
                          >
                            <ShieldAlert className="w-4 h-4 mr-2.5 text-indigo-600" />
                            {t('navAdmin')}
                          </Link>
                        )}

                        <div className="border-t border-slate-100 my-1" />

                        <button
                          onClick={() => signOut({ callbackUrl: '/' })}
                          className="w-full text-left flex items-center px-4 py-2 text-rose-600 hover:bg-rose-50 font-medium"
                        >
                          <LogOut className="w-4 h-4 mr-2.5 text-rose-500" />
                          {t('navLogout')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {/* Single Solid Saffron Button for Auth */}
                  <Link
                    href="/login"
                    className="px-4 py-2.5 text-xs sm:text-sm font-bold text-govNavy-950 bg-saffron-500 hover:bg-saffron-600 active:bg-saffron-700 rounded-xl shadow-soft-sm hover:shadow-soft-md transition-smooth flex items-center space-x-1.5"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>{t('navLogin')} / {t('navRegister')}</span>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Dismissible Deadline Banner (Logged-in users) */}
      {!bannerDismissed && urgentCount > 0 && (
        <div className="bg-amber-400 text-govNavy-950 px-4 py-2.5 text-xs font-semibold border-b border-amber-500 shadow-sm transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5 min-w-0">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-govNavy-950 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-govNavy-950"></span>
              </span>
              <p className="truncate">
                <span className="font-bold">
                  {language === 'hi' ? 'समय-सीमा अलर्ट: ' : 'Deadline Alert: '}
                </span>
                {language === 'hi'
                  ? `आपके पास अगले 7 दिनों में ${urgentCount} योजना ${urgentCount > 1 ? 'समय-सीमाएं' : 'समय-सीमा'} हैं।`
                  : `You have ${urgentCount} ${urgentCount === 1 ? 'scheme deadline' : 'scheme deadlines'} in the next 7 days.`}
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <Link
                href="/reminders"
                className="px-2.5 py-1 bg-govNavy-950 hover:bg-govNavy-900 text-white rounded-lg text-[11px] font-bold shadow-soft-sm transition-smooth"
              >
                {language === 'hi' ? 'रिमाइंडर देखें' : 'View Reminders'}
              </Link>
              <button
                type="button"
                onClick={handleDismissBanner}
                aria-label="Dismiss banner"
                className="p-1 text-govNavy-950 hover:bg-amber-500/50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-soft-lg">
          <Link
            href="/eligibility"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center space-x-2 w-full py-3 bg-govEmerald-600 text-white rounded-xl font-bold text-sm mb-3 shadow-soft-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>{language === 'en' ? 'Check My Eligibility' : 'पात्रता जांचें'}</span>
          </Link>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-800 hover:bg-slate-100"
            >
              {link.label}
            </Link>
          ))}

          {session ? (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-govNavy-900"
              >
                {t('navDashboard')}
              </Link>
              <Link
                href="/reminders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-govNavy-900"
              >
                {t('navReminders')}
              </Link>
              {isAdminOrOfficer && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-indigo-700"
                >
                  {t('navAdmin')}
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="block w-full text-left px-3 py-2 text-sm font-semibold text-rose-600"
              >
                {t('navLogout')}
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 text-sm font-bold bg-saffron-500 hover:bg-saffron-600 text-govNavy-950 rounded-xl shadow-soft-sm"
              >
                {t('navLogin')} / {t('navRegister')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
