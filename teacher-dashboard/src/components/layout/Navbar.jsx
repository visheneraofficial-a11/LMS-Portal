import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, ChevronRight, User, Settings, LogOut } from 'lucide-react';
import { teacherProfile, notifications } from '../../data/mockData';

const breadcrumbMap = {
  '/dashboard': ['Dashboard'],
  '/schedule': ['My Schedule'],
  '/students': ['Students'],
  '/attendance': ['Attendance'],
  '/tests': ['Tests & Marks'],
  '/live-classes': ['Live Classes'],
  '/resources': ['Resources'],
  '/class-schedule': ['Class Schedule'],
  '/profile': ['My Profile'],
  '/notifications': ['Notifications'],
  '/settings': ['Settings'],
};

export default function Navbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const breadcrumbs = breadcrumbMap[location.pathname] || ['Dashboard'];
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-6 h-16 flex items-center justify-between">
      {/* Left: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <Menu className="w-5 h-5" />
        </button>
        <nav className="flex items-center gap-1 text-sm">
          <span className="text-gray-500">Teacher</span>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium">{crumb}</span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-96 overflow-y-auto">
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                <button
                  onClick={() => { setShowNotifications(false); navigate('/notifications'); }}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  View All
                </button>
              </div>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 ${!n.read ? 'bg-blue-50/50' : ''}`}
                >
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold">
              {teacherProfile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">{teacherProfile.name}</span>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{teacherProfile.name}</p>
                <p className="text-xs text-gray-500">{teacherProfile.email}</p>
              </div>
              <button onClick={() => { setShowProfile(false); navigate('/profile'); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <User className="w-4 h-4" /> My Profile
              </button>
              <button onClick={() => { setShowProfile(false); navigate('/settings'); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Settings className="w-4 h-4" /> Settings
              </button>
              <div className="border-t border-gray-100 mt-1 pt-1">
                <a href="/logout/" className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4" /> Logout
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
