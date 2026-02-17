import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, ClipboardCheck, FileText,
  Video, BookOpen, CalendarDays, LogOut, X, Home
} from 'lucide-react';
import { teacherProfile } from '../../data/mockData';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My Schedule', path: '/schedule', icon: Calendar },
  { label: 'Students', path: '/students', icon: Users },
  { label: 'Attendance', path: '/attendance', icon: ClipboardCheck },
  { label: 'Tests & Marks', path: '/tests', icon: FileText },
  { label: 'Live Classes', path: '/live-classes', icon: Video },
  { label: 'Resources', path: '/resources', icon: BookOpen },
  { label: 'Class Schedule', path: '/class-schedule', icon: CalendarDays },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();
  const linkBase = 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150';
  const linkActive = 'bg-primary-600 text-white';
  const linkInactive = 'text-gray-300 hover:bg-gray-700 hover:text-white';

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-9 h-9 rounded-lg bg-primary-600 hover:bg-primary-500 flex items-center justify-center text-white transition-colors"
            title="Go to Dashboard"
          >
            <Home className="w-5 h-5" />
          </button>
          {!collapsed && <span className="text-white font-semibold text-lg">Teacher Dashboard</span>}
        </div>
        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Teacher Profile */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
              {teacherProfile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{teacherProfile.name}</p>
              <p className="text-gray-400 text-xs truncate">{teacherProfile.subject} Teacher</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive} ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-700">
        <a
          href="/logout/"
          className={`${linkBase} ${linkInactive} ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </a>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 flex flex-col transform transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-gray-900 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
