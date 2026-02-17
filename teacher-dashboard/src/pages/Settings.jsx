import React, { useState } from 'react';
import {
  Settings as SettingsIcon, Bell, Shield, Palette, Globe, Monitor,
  Moon, Sun, Save, ToggleLeft, ToggleRight, Lock, Eye, EyeOff
} from 'lucide-react';

const Toggle = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <div>
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    <button onClick={() => onChange(!enabled)} className="flex-shrink-0">
      {enabled ? (
        <ToggleRight className="w-8 h-8 text-primary-600" />
      ) : (
        <ToggleLeft className="w-8 h-8 text-gray-300" />
      )}
    </button>
  </div>
);

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('notifications');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifs: true,
    smsNotifs: false,
    pushNotifs: true,
    whatsappNotifs: true,
    attendanceAlerts: true,
    testReminders: true,
    parentMessages: true,
    systemUpdates: false,
    quietHoursEnabled: false,
    quietStart: '22:00',
    quietEnd: '07:00',
    theme: 'light',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    twoFactor: false,
    sessionTimeout: '240',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sections = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
          Settings saved successfully!
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="md:w-56 flex-shrink-0">
          <nav className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${
                  activeSection === s.id
                    ? 'bg-primary-50 text-primary-700 border-l-2 border-l-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <s.icon className="w-4 h-4" />
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            {activeSection === 'notifications' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary-600" /> Notification Settings
                </h2>
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Channels</h3>
                  <Toggle label="Email Notifications" description="Receive notifications via email" enabled={settings.emailNotifs} onChange={v => updateSetting('emailNotifs', v)} />
                  <Toggle label="SMS Notifications" description="Receive notifications via SMS" enabled={settings.smsNotifs} onChange={v => updateSetting('smsNotifs', v)} />
                  <Toggle label="Push Notifications" description="Browser push notifications" enabled={settings.pushNotifs} onChange={v => updateSetting('pushNotifs', v)} />
                  <Toggle label="WhatsApp Notifications" description="Receive updates on WhatsApp" enabled={settings.whatsappNotifs} onChange={v => updateSetting('whatsappNotifs', v)} />
                </div>
                <div className="mt-6 space-y-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Alert Types</h3>
                  <Toggle label="Attendance Alerts" description="When students fall below threshold" enabled={settings.attendanceAlerts} onChange={v => updateSetting('attendanceAlerts', v)} />
                  <Toggle label="Test Reminders" description="Upcoming test notifications" enabled={settings.testReminders} onChange={v => updateSetting('testReminders', v)} />
                  <Toggle label="Parent Messages" description="Messages from parents" enabled={settings.parentMessages} onChange={v => updateSetting('parentMessages', v)} />
                  <Toggle label="System Updates" description="Platform updates and maintenance alerts" enabled={settings.systemUpdates} onChange={v => updateSetting('systemUpdates', v)} />
                </div>
                <div className="mt-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quiet Hours</h3>
                  <Toggle label="Enable Quiet Hours" description="Mute notifications during specified hours" enabled={settings.quietHoursEnabled} onChange={v => updateSetting('quietHoursEnabled', v)} />
                  {settings.quietHoursEnabled && (
                    <div className="flex items-center gap-3 mt-3 pl-1">
                      <div>
                        <label className="text-xs text-gray-500">From</label>
                        <input type="time" value={settings.quietStart} onChange={e => updateSetting('quietStart', e.target.value)} className="block mt-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">To</label>
                        <input type="time" value={settings.quietEnd} onChange={e => updateSetting('quietEnd', e.target.value)} className="block mt-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary-600" /> Appearance
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'system', label: 'System', icon: Monitor },
                      ].map(t => (
                        <button
                          key={t.value}
                          onClick={() => updateSetting('theme', t.value)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                            settings.theme === t.value
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <t.icon className={`w-6 h-6 ${settings.theme === t.value ? 'text-primary-600' : 'text-gray-400'}`} />
                          <span className={`text-xs font-medium ${settings.theme === t.value ? 'text-primary-700' : 'text-gray-600'}`}>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-600" /> Security
                </h2>
                <Toggle label="Two-Factor Authentication" description="Add an extra layer of security to your account" enabled={settings.twoFactor} onChange={v => updateSetting('twoFactor', v)} />
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Session Timeout</h3>
                  <p className="text-xs text-gray-500 mb-3">Automatically log out after inactivity</p>
                  <select
                    value={settings.sessionTimeout}
                    onChange={e => updateSetting('sessionTimeout', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="240">4 hours</option>
                    <option value="480">8 hours</option>
                  </select>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Change Password
                  </h3>
                  <div className="space-y-3 max-w-sm">
                    <div className="relative">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        value={settings.oldPassword}
                        onChange={e => updateSetting('oldPassword', e.target.value)}
                        placeholder="Current Password"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      />
                      <button onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={settings.newPassword}
                        onChange={e => updateSetting('newPassword', e.target.value)}
                        placeholder="New Password"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      />
                      <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <input
                      type="password"
                      value={settings.confirmPassword}
                      onChange={e => updateSetting('confirmPassword', e.target.value)}
                      placeholder="Confirm New Password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    />
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'preferences' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary-600" /> Preferences
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Language</label>
                    <select
                      value={settings.language}
                      onChange={e => updateSetting('language', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 bg-white w-full max-w-xs"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Date Format</label>
                    <select
                      value={settings.dateFormat}
                      onChange={e => updateSetting('dateFormat', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 bg-white w-full max-w-xs"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Time Format</label>
                    <div className="flex gap-3">
                      {['12h', '24h'].map(f => (
                        <button
                          key={f}
                          onClick={() => updateSetting('timeFormat', f)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                            settings.timeFormat === f
                              ? 'border-primary-600 bg-primary-50 text-primary-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {f === '12h' ? '12-Hour' : '24-Hour'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
