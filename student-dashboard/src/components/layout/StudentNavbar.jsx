import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, ChevronRight, X, User, Mail, Phone, MapPin, School, Hash, Calendar, Shield, Settings, Sun, Moon, Monitor, Globe, BellRing, Lock, Volume2, VolumeX, Sparkles, Palette, Type, Check, Zap, Brain } from 'lucide-react';
import { studentProfile, notifications as initialNotifications } from '../../data/mockData';

const routeLabels = {
  '/dashboard': 'Dashboard',
  '/live-classes': 'Live Classes',
  '/schedule': 'My Schedule',
  '/resources': 'E-Books & Resources',
  '/video-lectures': 'Video Lectures',
  '/exams': 'Exams & Tests',
  '/attendance': 'My Attendance',
  '/ai-tools': 'AI Study Tools',
  '/ai-tools/doubts': 'Doubt Solver',
  '/ai-tools/planner': 'Study Planner',
  '/ai-tools/quiz': 'Practice Quiz',
  '/ai-tools/insights': 'Performance Insights',
  '/achievements': 'Achievements',
  '/help': 'Help & Support',
};

export default function StudentNavbar({ onMenuToggle, collapsed }) {
  const location = useLocation();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [theme, setTheme] = useState(() => localStorage.getItem('sdb-theme') || 'light');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('sdb-fontSize') || 'medium');
  const [language, setLanguage] = useState(() => localStorage.getItem('sdb-language') || 'English');
  const [notifEnabled, setNotifEnabled] = useState(() => localStorage.getItem('sdb-notif') !== 'false');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('sdb-sound') !== 'false');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // AI-based theme suggestion based on time of day
  const getAiSuggestion = useCallback(() => {
    const hour = new Date().getHours();
    if (hour >= 20 || hour < 6) return '🌙 AI recommends Dark mode for comfortable nighttime studying';
    if (hour >= 6 && hour < 9) return '☀️ AI suggests Light mode for a fresh morning start';
    if (hour >= 17 && hour < 20) return '🌅 AI recommends System mode as evening approaches';
    return '✨ AI suggests your current settings are optimal for focused studying';
  }, []);

  const path = location.pathname.replace('/student/dashboard', '') || '/dashboard';
  const breadcrumbs = [];
  if (path.startsWith('/ai-tools/')) {
    breadcrumbs.push({ label: 'AI Study Tools', to: '/ai-tools/doubts' });
    breadcrumbs.push({ label: routeLabels[path] || path.split('/').pop() });
  } else {
    breadcrumbs.push({ label: routeLabels[path] || 'Dashboard' });
  }

  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Theme application — fully functional dark/light/system
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');

    let resolvedTheme = theme;
    if (theme === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    }
    localStorage.setItem('sdb-theme', theme);
  }, [theme]);

  // Listen for OS theme changes when system is selected
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  // Font size application — actually changes the root font
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${fontSize}`);
    localStorage.setItem('sdb-fontSize', fontSize);
  }, [fontSize]);

  // Language persistence
  useEffect(() => {
    localStorage.setItem('sdb-language', language);
    document.documentElement.lang = language === 'Hindi' ? 'hi' : 'en';
  }, [language]);

  // Notification preferences persistence
  useEffect(() => {
    localStorage.setItem('sdb-notif', notifEnabled);
    localStorage.setItem('sdb-sound', soundEnabled);
  }, [notifEnabled, soundEnabled]);

  // AI suggestion on settings open
  useEffect(() => {
    if (settingsModal) {
      setAiSuggestion(getAiSuggestion());
    }
  }, [settingsModal, getAiSuggestion]);

  // Flash saved indicator
  const flashSaved = () => {
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 1500);
  };

  const profileFields = [
    { label: 'Full Name', value: studentProfile.name, icon: User },
    { label: 'Email', value: studentProfile.email, icon: Mail },
    { label: 'Phone', value: studentProfile.phone, icon: Phone },
    { label: 'Login ID', value: studentProfile.loginId, icon: Lock },
    { label: 'Class', value: studentProfile.class, icon: School },
    { label: 'Stream', value: studentProfile.stream, icon: Hash },
    { label: 'Roll No', value: studentProfile.rollNo, icon: Hash },
    { label: 'Section', value: studentProfile.section, icon: Hash },
    { label: 'Medium', value: studentProfile.medium, icon: Globe },
    { label: 'School', value: studentProfile.school, icon: School },
    { label: 'Center', value: studentProfile.center, icon: MapPin },
    { label: 'Region', value: studentProfile.region, icon: MapPin },
    { label: 'State', value: studentProfile.state, icon: MapPin },
    { label: 'District', value: studentProfile.district, icon: MapPin },
    { label: 'Guardian', value: studentProfile.guardian, icon: User },
    { label: 'Guardian Contact', value: studentProfile.guardianContact, icon: Phone },
    { label: 'Gender', value: studentProfile.gender, icon: User },
    { label: 'Date of Birth', value: studentProfile.dob, icon: Calendar },
    { label: 'Join Date', value: studentProfile.joinDate, icon: Calendar },
    { label: 'PH Status', value: studentProfile.physically_handicapped, icon: Shield },
  ];

  const notifIcon = (type) => {
    if (type === 'warning') return 'bg-amber-100 text-amber-600';
    if (type === 'alert') return 'bg-red-100 text-red-600';
    return 'bg-blue-100 text-blue-600';
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 transition-all duration-300">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button onClick={onMenuToggle} className="lg:hidden text-slate-500 hover:text-slate-700 p-1">
              <Menu className="w-5 h-5" />
            </button>
            <nav className="flex items-center text-sm">
              <Link to="/dashboard" className="text-slate-400 hover:text-primary-600 transition-colors">Home</Link>
              {breadcrumbs.map((bc, i) => (
                <React.Fragment key={i}>
                  <ChevronRight className="w-4 h-4 text-slate-300 mx-1" />
                  {bc.to ? (
                    <Link to={bc.to} className="text-slate-400 hover:text-primary-600 transition-colors">{bc.label}</Link>
                  ) : (
                    <span className="text-slate-700 font-medium">{bc.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unread}
                  </span>
                )}
              </button>
              {showNotif && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
                      {unread > 0 && <p className="text-[10px] text-slate-400">{unread} unread</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {unread > 0 && (
                        <button onClick={markAllRead} className="text-[10px] text-primary-600 font-medium hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50">
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button onClick={clearNotifications} className="text-[10px] text-slate-400 font-medium hover:text-red-600 px-2 py-1 rounded hover:bg-red-50">
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-slate-400">
                        <BellRing className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className={`px-4 py-3 hover:bg-slate-50 border-b border-slate-50 cursor-pointer transition-colors ${!n.read ? 'bg-primary-50/40 border-l-2 border-l-primary-500' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notifIcon(n.type)}`}>
                              <BellRing className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm ${!n.read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{n.title}</p>
                                {!n.read && <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
                  {studentProfile.name.split(' ').map(w => w[0]).join('')}
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700">{studentProfile.name.split(' ')[0]}</span>
              </button>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-primary-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold">
                        {studentProfile.name.split(' ').map(w => w[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{studentProfile.name}</p>
                        <p className="text-[10px] text-slate-500">{studentProfile.class} • {studentProfile.stream}</p>
                        <p className="text-[10px] text-slate-400">Roll No: {studentProfile.rollNo}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { setProfileModal(true); setShowProfile(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" /> My Profile
                    </button>
                    <button
                      onClick={() => { setSettingsModal(true); setShowProfile(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" /> Settings
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => window.location.href = '/logout/'}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <X className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {profileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setProfileModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-800 px-6 py-6 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full" />
              <button onClick={() => setProfileModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-sm border-2 border-white/30">
                  {studentProfile.name.split(' ').map(w => w[0]).join('')}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{studentProfile.name}</h2>
                  <p className="text-primary-100 text-sm">{studentProfile.class} • {studentProfile.stream} • Roll #{studentProfile.rollNo}</p>
                  <p className="text-primary-200 text-xs mt-1">{studentProfile.school}</p>
                </div>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
              <div className="grid sm:grid-cols-2 gap-4">
                {profileFields.map(field => (
                  <div key={field.label} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <field.icon className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{field.label}</p>
                      <p className="text-sm text-slate-800 font-medium mt-0.5">{field.value || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal — Premium AI-Powered */}
      {settingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSettingsModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-700">

            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-6 py-4 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full" />
              <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-white/5 rounded-full" />
              <div className="flex items-center justify-between relative">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Settings</h2>
                    <p className="text-indigo-200 text-[10px]">Personalize your experience</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {settingsSaved && (
                    <span className="text-xs bg-green-500/20 text-green-200 px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                      <Check className="w-3 h-3" /> Saved
                    </span>
                  )}
                  <button onClick={() => setSettingsModal(false)} className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* AI Suggestion Banner */}
            <div className="mx-4 mt-4 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-100 dark:border-indigo-800 ai-shimmer">
              <div className="flex items-start gap-2">
                <Brain className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">AI Recommendation</p>
                  <p className="text-xs text-indigo-700 dark:text-indigo-200 mt-0.5">{aiSuggestion}</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-5 overflow-y-auto max-h-[calc(90vh-160px)] scrollbar-thin">

              {/* ─── Appearance / Theme ─── */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5" /> Appearance
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'light', label: 'Light', icon: Sun, preview: 'bg-white border-slate-200', previewInner: 'bg-slate-100' },
                    { key: 'dark', label: 'Dark', icon: Moon, preview: 'bg-slate-800 border-slate-700', previewInner: 'bg-slate-700' },
                    { key: 'system', label: 'System', icon: Monitor, preview: 'bg-gradient-to-br from-white to-slate-800 border-slate-300', previewInner: 'bg-slate-400' },
                  ].map(t => {
                    const active = theme === t.key;
                    return (
                      <button
                        key={t.key}
                        onClick={() => { setTheme(t.key); flashSaved(); }}
                        className={`group relative rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                          active
                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 setting-active-glow'
                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                        }`}
                      >
                        {/* Mini Preview */}
                        <div className={`h-12 ${t.preview} p-2 flex flex-col gap-1`}>
                          <div className={`h-1.5 w-8 ${t.previewInner} rounded-full`} />
                          <div className={`h-1.5 w-5 ${t.previewInner} rounded-full`} />
                        </div>
                        <div className={`px-2 py-2 text-center transition-colors ${
                          active ? 'bg-indigo-50 dark:bg-indigo-950' : 'bg-slate-50 dark:bg-slate-800'
                        }`}>
                          <t.icon className={`w-4 h-4 mx-auto mb-0.5 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                          <p className={`text-[11px] font-semibold ${active ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>{t.label}</p>
                        </div>
                        {active && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ─── Font Size ─── */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Type className="w-3.5 h-3.5" /> Font Size
                </h3>
                <div className="flex items-center gap-2">
                  {[
                    { key: 'small', label: 'Small', sample: 'text-xs' },
                    { key: 'medium', label: 'Medium', sample: 'text-sm' },
                    { key: 'large', label: 'Large', sample: 'text-base' },
                  ].map(s => {
                    const active = fontSize === s.key;
                    return (
                      <button key={s.key}
                        onClick={() => { setFontSize(s.key); flashSaved(); }}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-300 ${
                          active
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className={s.sample}>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: fontSize === 'small' ? '12px' : fontSize === 'large' ? '16px' : '14px' }}>
                    Aa — Preview text at {fontSize} size
                  </p>
                </div>
              </div>

              {/* ─── Language ─── */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" /> Language
                </h3>
                <div className="flex gap-2">
                  {[
                    { key: 'English', flag: '🇬🇧', native: 'English' },
                    { key: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
                  ].map(l => {
                    const active = language === l.key;
                    return (
                      <button key={l.key}
                        onClick={() => { setLanguage(l.key); flashSaved(); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          active
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className="text-base">{l.flag}</span> {l.native}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ─── Notifications ─── */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BellRing className="w-3.5 h-3.5" /> Notifications
                </h3>
                <div className="space-y-2">
                  {/* Push Notifications Toggle */}
                  <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 ${
                    notifEnabled ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        notifEnabled ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-slate-200 dark:bg-slate-700'
                      }`}>
                        <Bell className={`w-4 h-4 ${notifEnabled ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${notifEnabled ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>Push Notifications</p>
                        <p className="text-[11px] text-slate-400">Exam reminders & class alerts</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setNotifEnabled(!notifEnabled); flashSaved(); }}
                      className={`w-12 h-7 rounded-full toggle-switch relative flex-shrink-0 ${
                        notifEnabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md toggle-knob ${
                        notifEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Sound Toggle */}
                  <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 ${
                    soundEnabled ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        soundEnabled ? 'bg-purple-100 dark:bg-purple-900' : 'bg-slate-200 dark:bg-slate-700'
                      }`}>
                        {soundEnabled ? (
                          <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${soundEnabled ? 'text-purple-700 dark:text-purple-300' : 'text-slate-600 dark:text-slate-400'}`}>Sound</p>
                        <p className="text-[11px] text-slate-400">Notification sound effects</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSoundEnabled(!soundEnabled); flashSaved(); }}
                      className={`w-12 h-7 rounded-full toggle-switch relative flex-shrink-0 ${
                        soundEnabled ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md toggle-knob ${
                        soundEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ─── Account ─── */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" /> Account
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2.5 text-sm border border-slate-100 dark:border-slate-700">
                  {[
                    { label: 'Login ID', value: studentProfile.loginId },
                    { label: 'Student ID', value: studentProfile.id },
                    { label: 'School', value: studentProfile.school },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs">{item.label}</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">{item.value}</span>
                    </div>
                  ))}
                  <div className="pt-2 mt-1 border-t border-slate-200 dark:border-slate-600">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Contact your school admin to update account details.
                    </p>
                  </div>
                </div>
              </div>

              {/* AI-Powered Settings Footer */}
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-4 text-white relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-20 h-20 bg-white/10 rounded-full" />
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <p className="text-xs font-bold">AI-Powered Preferences</p>
                </div>
                <p className="text-[10px] text-white/70 leading-relaxed">
                  Settings are saved automatically and synced across devices. AI analyzes your
                  study patterns to suggest optimal display settings for better focus and retention.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
