import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, ChevronLeft, ChevronRight, CheckCircle, XCircle,
  TrendingUp, AlertTriangle, Calendar, Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateAttendance, attendanceSummary } from '../data/mockData';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export default function MyAttendance() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const attendanceData = generateAttendance(year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const getStatus = (day) => {
    if (!day) return null;
    const entry = attendanceData.find(a => a.day === day);
    return entry?.status || null;
  };

  const trendData = attendanceSummary.monthlyTrend || [
    { month: 'Sep', pct: 92 }, { month: 'Oct', pct: 88 },
    { month: 'Nov', pct: 85 }, { month: 'Dec', pct: 90 },
    { month: 'Jan', pct: 88 }, { month: 'Feb', pct: 88 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">My Attendance</h1>
        <p className="text-sm text-slate-500 mt-1">Track your daily attendance and trends</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Days', value: attendanceSummary.totalDays, icon: Calendar, color: 'bg-blue-500' },
          { label: 'Present', value: attendanceSummary.present, icon: CheckCircle, color: 'bg-green-500' },
          { label: 'Absent', value: attendanceSummary.absent, icon: XCircle, color: 'bg-red-500' },
          { label: 'Percentage', value: `${attendanceSummary.percentage}%`, icon: BarChart3, color: attendanceSummary.percentage >= 75 ? 'bg-green-500' : 'bg-red-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Low attendance alert */}
      {attendanceSummary.percentage < 75 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800 text-sm">Low Attendance Warning</p>
            <p className="text-xs text-red-600 mt-1">Your attendance is below 75%. Minimum 75% attendance is required.</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <h3 className="font-semibold text-slate-800">{monthNames[month]} {year}</h3>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const status = getStatus(day);
                const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
                return (
                  <div key={i} className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-colors ${
                    !day ? '' :
                    status === 'present' ? 'bg-green-100 text-green-800 font-medium' :
                    status === 'absent' ? 'bg-red-100 text-red-800 font-medium' :
                    status === 'late' ? 'bg-amber-100 text-amber-800 font-medium' :
                    status === 'holiday' ? 'bg-slate-100 text-slate-400' :
                    'text-slate-600 hover:bg-slate-50'
                  } ${isToday ? 'ring-2 ring-primary-400 ring-offset-1' : ''}`}>
                    {day}
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-100">
              {[
                { label: 'Present', color: 'bg-green-100' },
                { label: 'Absent', color: 'bg-red-100' },
                { label: 'Late', color: 'bg-amber-100' },
                { label: 'Holiday', color: 'bg-slate-100' },
              ].map(item => (
                <span key={item.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={`w-3 h-3 rounded ${item.color}`} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-6">
          {/* Subject-wise */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Subject-wise Attendance</h3>
            <div className="space-y-3">
              {attendanceSummary.subjectWise.map(sw => (
                <div key={sw.subject}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600">{sw.subject}</span>
                    <span className={`text-xs font-bold ${sw.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                      {sw.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`h-full rounded-full transition-all ${
                      sw.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'
                    }`} style={{ width: `${sw.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-500" /> Monthly Trend
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis domain={[60, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Line type="monotone" dataKey="pct" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} name="Attendance %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
