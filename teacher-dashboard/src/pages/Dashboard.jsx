import React, { useState, useMemo } from 'react';
import { Users, ClipboardCheck, FileText, Video, Calendar, Sparkles } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import TodaySchedule from '../components/dashboard/TodaySchedule';
import RecentActivity from '../components/dashboard/RecentActivity';
import { quickStats, todaySchedule, recentActivity, classSummary, weeklySchedule, tests } from '../data/mockData';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getNext7Days() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      date: d,
      dayName: dayNames[d.getDay()],
      shortDay: shortDayNames[d.getDay()],
      dateStr: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      isToday: i === 0,
      isSunday: d.getDay() === 0,
    });
  }
  return days;
}

export default function Dashboard() {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const next7Days = useMemo(() => getNext7Days(), []);
  const selectedDay = next7Days[selectedDayIdx];

  const daySchedule = useMemo(() => {
    if (selectedDay.isSunday) return [];
    if (selectedDay.isToday) return todaySchedule;
    return weeklySchedule[selectedDay.dayName] || [];
  }, [selectedDayIdx, selectedDay]);

  const upcomingTests = useMemo(() => {
    const today = new Date();
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);
    return tests.filter(t => {
      const td = new Date(t.date);
      return td >= today && td <= weekEnd;
    });
  }, []);

  const aiInsights = [
    { text: '3 students have attendance below 75% this week', type: 'warning' },
    { text: 'Physics scores trending up by 8% over last 3 tests', type: 'positive' },
    { text: 'Chemistry class engagement dropped 12% — consider interactive sessions', type: 'suggestion' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Students" value={quickStats.totalStudents} icon={Users} color="blue" />
        <StatsCard title="Today's Attendance" value={quickStats.todayAttendance} suffix="%" icon={ClipboardCheck} color="green" />
        <StatsCard title="Upcoming Tests" value={quickStats.upcomingTests} icon={FileText} color="amber" />
        <StatsCard title="Live Classes Today" value={quickStats.liveClassesToday} icon={Video} color="red" />
      </div>

      {/* 7-Day Planner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            Next 7 Days Overview
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {next7Days[0].dateStr} — {next7Days[6].dateStr}
          </span>
        </div>

        <div className="flex border-b border-gray-100 overflow-x-auto">
          {next7Days.map((day, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDayIdx(idx)}
              className={`flex-1 min-w-[80px] flex flex-col items-center py-3 px-2 text-center border-b-2 transition-all ${
                idx === selectedDayIdx
                  ? 'border-primary-600 bg-primary-50'
                  : day.isSunday
                  ? 'border-transparent bg-red-50/50 text-red-400'
                  : 'border-transparent hover:bg-gray-50'
              }`}
            >
              <span className={`text-[10px] uppercase tracking-wider font-semibold ${
                idx === selectedDayIdx ? 'text-primary-600' : day.isSunday ? 'text-red-400' : 'text-gray-500'
              }`}>{day.shortDay}</span>
              <span className={`text-sm font-bold mt-0.5 ${
                idx === selectedDayIdx ? 'text-primary-700' : day.isSunday ? 'text-red-400' : 'text-gray-800'
              }`}>{day.date.getDate()}</span>
              {day.isToday && <span className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-1" />}
            </button>
          ))}
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-700">
              {selectedDay.isToday ? "Today's" : selectedDay.dayName + "'s"} Schedule
              <span className="text-gray-400 font-normal ml-2">({selectedDay.dateStr})</span>
            </h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {daySchedule.length} {daySchedule.length === 1 ? 'class' : 'classes'}
            </span>
          </div>

          {selectedDay.isSunday ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🌞</div>
              <p className="text-sm text-gray-500 font-medium">Sunday — Holiday</p>
              <p className="text-xs text-gray-400 mt-1">No classes scheduled</p>
            </div>
          ) : daySchedule.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No classes scheduled</p>
            </div>
          ) : (
            <div className="space-y-2">
              {daySchedule.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={`w-1 h-10 rounded-full ${
                    slot.subject === 'Physics' ? 'bg-blue-500' :
                    slot.subject === 'Chemistry' ? 'bg-purple-500' :
                    slot.subject === 'Maths' ? 'bg-green-500' : 'bg-amber-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{slot.subject}</span>
                      {slot.status && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          slot.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          slot.status === 'Live' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{slot.status}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{slot.topic}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium text-gray-700">{slot.time}{slot.endTime ? ` - ${slot.endTime}` : ''}</p>
                    <p className="text-[10px] text-gray-400">Class {slot.class} · {slot.language}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {upcomingTests.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Upcoming Tests This Week</h5>
              <div className="space-y-2">
                {upcomingTests.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg border border-amber-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">Class {t.class} · {t.subject}</p>
                    </div>
                    <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded">{t.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-100 p-5">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          AI Insights
          <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Smart</span>
        </h3>
        <div className="space-y-3">
          {aiInsights.map((insight, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                insight.type === 'warning' ? 'bg-amber-500' :
                insight.type === 'positive' ? 'bg-green-500' : 'bg-blue-500'
              }`} />
              <p className="text-sm text-gray-700">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedDayIdx === 0 && <TodaySchedule schedule={todaySchedule} />}

      {/* Two column: Recent Activity + Class Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={recentActivity} />

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" /> Class Summary
            </h3>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Students</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {classSummary.map((cls, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">{cls.className}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{cls.section}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">{cls.students}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
