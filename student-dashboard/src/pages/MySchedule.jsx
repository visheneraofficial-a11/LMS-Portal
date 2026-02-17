import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, ChevronLeft, ChevronRight, MapPin, User, Globe } from 'lucide-react';
import { weeklySchedule } from '../data/mockData';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const subjectColors = {
  'Physics': 'bg-blue-100 border-blue-300 text-blue-800',
  'Chemistry': 'bg-green-100 border-green-300 text-green-800',
  'Mathematics': 'bg-purple-100 border-purple-300 text-purple-800',
  'Biology': 'bg-amber-100 border-amber-300 text-amber-800',
  'English': 'bg-pink-100 border-pink-300 text-pink-800',
  'Hindi': 'bg-orange-100 border-orange-300 text-orange-800',
};

const getSubjectColor = (subject) => {
  for (const [key, val] of Object.entries(subjectColors)) {
    if (subject.includes(key)) return val;
  }
  return 'bg-slate-100 border-slate-300 text-slate-800';
};

export default function MySchedule() {
  const todayIdx = new Date().getDay() - 1; // 0=Mon
  const [selectedDay, setSelectedDay] = useState(todayIdx >= 0 && todayIdx < 6 ? todayIdx : 0);
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const isCurrentSlot = (timeStr) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return false;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    const slotTime = h * 60 + m;
    return Math.abs(currentTime - slotTime) < 60;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Schedule</h1>
          <p className="text-sm text-slate-500 mt-1">Weekly class timetable</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-primary-700' : 'text-slate-600'}`}
            >
              Week View
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'day' ? 'bg-white shadow-sm text-primary-700' : 'text-slate-600'}`}
            >
              Day View
            </button>
          </div>
        </div>
      </div>

      {/* Day selector for day view */}
      {viewMode === 'day' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {days.map((day, i) => (
            <button
              key={day}
              onClick={() => setSelectedDay(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedDay === i
                  ? 'bg-primary-600 text-white shadow-sm'
                  : i === todayIdx
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {day} {i === todayIdx && selectedDay !== i && <span className="text-[10px] ml-1">(Today)</span>}
            </button>
          ))}
        </div>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 text-left w-24">Time</th>
                  {days.map((day, i) => (
                    <th key={day} className={`px-3 py-3 text-xs font-semibold text-center ${
                      i === todayIdx ? 'text-primary-700 bg-primary-50/50' : 'text-slate-500'
                    }`}>
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{dayShort[i]}</span>
                      {i === todayIdx && <span className="block text-[10px] text-primary-500 font-normal">Today</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeklySchedule.timeSlots.map((slot, slotIdx) => (
                  <tr key={slotIdx} className="border-t border-slate-50">
                    <td className="px-4 py-3 text-xs text-slate-500 font-medium whitespace-nowrap align-top">
                      {slot.time}
                    </td>
                    {days.map((day, dayIdx) => {
                      const cell = weeklySchedule.schedule[day]?.find(s => s.time === slot.time);
                      const isNow = dayIdx === todayIdx && isCurrentSlot(slot.time);
                      if (cell?.type === 'break') {
                        return (
                          <td key={day} className="px-2 py-2 text-center">
                            <div className="bg-slate-50 rounded-lg px-2 py-2 text-xs text-slate-400 italic">
                              {cell.label || 'Break'}
                            </div>
                          </td>
                        );
                      }
                      if (!cell) {
                        return <td key={day} className="px-2 py-2" />;
                      }
                      return (
                        <td key={day} className="px-2 py-2">
                          <div className={`rounded-lg border px-2 py-2 text-xs ${getSubjectColor(cell.subject)} ${
                            isNow ? 'ring-2 ring-primary-400 ring-offset-1' : ''
                          }`}>
                            <p className="font-semibold truncate">{cell.subject}</p>
                            <p className="text-[10px] opacity-70 truncate mt-0.5">{cell.teacher}</p>
                            {cell.room && <p className="text-[10px] opacity-60 mt-0.5">{cell.room}</p>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-3"
        >
          {weeklySchedule.schedule[days[selectedDay]]?.map((slot, i) => {
            const isNow = selectedDay === todayIdx && isCurrentSlot(slot.time);
            if (slot.type === 'break') {
              return (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-20 text-xs text-slate-400 font-medium text-right">{slot.time}</div>
                  <div className="flex-1 border-t border-dashed border-slate-200" />
                  <span className="text-xs text-slate-400 italic px-3">{slot.label || 'Break'}</span>
                  <div className="flex-1 border-t border-dashed border-slate-200" />
                </div>
              );
            }
            return (
              <div key={i} className={`flex items-start gap-3 ${isNow ? 'relative' : ''}`}>
                {isNow && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-full" />}
                <div className="w-20 text-xs text-slate-500 font-medium text-right pt-3 flex-shrink-0">{slot.time}</div>
                <div className={`flex-1 rounded-xl border p-4 ${getSubjectColor(slot.subject)} ${
                  isNow ? 'ring-2 ring-primary-400 shadow-md' : ''
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{slot.subject}</h3>
                      {slot.topic && <p className="text-xs opacity-70 mt-0.5">{slot.topic}</p>}
                    </div>
                    {isNow && (
                      <span className="px-2 py-0.5 bg-primary-600 text-white text-[10px] font-bold rounded-full">NOW</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[11px] opacity-70">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {slot.teacher}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {slot.duration || '1 hr'}</span>
                    {slot.room && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {slot.room}</span>}
                    {slot.language && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {slot.language}</span>}
                  </div>
                </div>
              </div>
            );
          })}
          {(!weeklySchedule.schedule[days[selectedDay]] || weeklySchedule.schedule[days[selectedDay]].length === 0) && (
            <div className="text-center py-16 text-slate-500">
              <CalendarDays className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">No classes scheduled</p>
              <p className="text-sm mt-1">Enjoy your day off!</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-slate-500 mb-2">Subject Colors</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(subjectColors).map(([subject, colorClass]) => (
            <span key={subject} className={`px-2.5 py-1 rounded-md border text-xs font-medium ${colorClass}`}>
              {subject}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
