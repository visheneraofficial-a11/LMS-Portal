import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { studentProfile } from '../../data/mockData';
import {
  LayoutDashboard, Tv, CalendarDays, BookOpen, PlayCircle,
  ClipboardList, BarChart3, Bot, Trophy, HelpCircle,
  LogOut, ChevronLeft, ChevronRight, ChevronDown, Brain,
  Calendar, Lightbulb, Sparkles, X, Home
} from 'lucide-react';

const mainNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/live-classes', icon: Tv, label: 'Live Classes' },
  { to: '/schedule', icon: CalendarDays, label: 'My Schedule' },
  { to: '/resources', icon: BookOpen, label: 'E-Books & Resources' },
  { to: '/video-lectures', icon: PlayCircle, label: 'Video Lectures' },
  { to: '/exams', icon: ClipboardList, label: 'Exams & Tests' },
  { to: '/attendance', icon: BarChart3, label: 'My Attendance' },
];

const aiSubNav = [
  { to: '/ai-tools/doubts', icon: Brain, label: 'Doubt Solver' },
  { to: '/ai-tools/planner', icon: Calendar, label: 'Study Planner' },
  { to: '/ai-tools/quiz', icon: Lightbulb, label: 'Practice Quiz' },
  { to: '/ai-tools/insights', icon: Sparkles, label: 'Performance Insights' },
];

const bottomNav = [
  { to: '/achievements', icon: Trophy, label: 'Achievements' },
];

export default function StudentSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const [aiOpen, setAiOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAiRoute = location.pathname.startsWith('/student/dashboard/ai-tools') || location.pathname.startsWith('/ai-tools');

  React.useEffect(() => {
    if (isAiRoute) setAiOpen(true);
  }, [isAiRoute]);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
    }`;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Home button area */}
      <div className="p-4 border-b border-slate-700/50">
        <NavLink to="/dashboard" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
          <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center text-white flex-shrink-0 group-hover:bg-primary-500 transition-colors shadow-lg shadow-primary-600/30">
            <Home className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">Student Dashboard</p>
              <p className="text-[10px] text-slate-400 truncate">EMRS Online</p>
            </div>
          )}
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {!collapsed && <p className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Student Panel</p>}
        {mainNav.map(item => (
          <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setMobileOpen(false)}
            title={collapsed ? item.label : undefined}>
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}

        {/* AI Tools dropdown */}
        <div>
          <button
            onClick={() => setAiOpen(!aiOpen)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full ${
              isAiRoute ? 'bg-primary-600/30 text-primary-300' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            <Bot className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="truncate flex-1 text-left">AI Study Tools</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${aiOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
          {aiOpen && !collapsed && (
            <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-slate-700 pl-3">
              {aiSubNav.map(item => (
                <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setMobileOpen(false)}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate text-xs">{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {!collapsed && <div className="my-3 border-t border-slate-700/50" />}

        {bottomNav.map(item => (
          <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setMobileOpen(false)}
            title={collapsed ? item.label : undefined}>
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-slate-700/50 space-y-1">
        <NavLink to="/help" className={linkClass} onClick={() => setMobileOpen(false)}
          title={collapsed ? 'Help & Support' : undefined}>
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="truncate">Help & Support</span>}
        </NavLink>
        <button
          onClick={() => window.location.href = '/logout/'}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-slate-800 border-r border-slate-700/50 transition-all duration-300 fixed inset-y-0 left-0 z-30 ${collapsed ? 'w-16' : 'w-64'}`}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 bg-slate-700 hover:bg-slate-600 text-white rounded-full p-1 shadow-lg border border-slate-600 z-50"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-slate-800 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
              <span className="text-white font-semibold text-sm">ENF - Student Panel</span>
              <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
