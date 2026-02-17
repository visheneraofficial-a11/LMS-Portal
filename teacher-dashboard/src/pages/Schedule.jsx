import React, { useState, useMemo } from 'react';
import { weeklySchedule } from '../data/mockData';
import Badge from '../components/common/Badge';
import { Calendar, ExternalLink, ChevronLeft, ChevronRight, Grid3X3, CalendarDays } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const shortDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const grid = [];
  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    grid.push({ day: daysInPrevMonth - i, inMonth: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push({ day: d, inMonth: true, date: new Date(year, month, d) });
  }
  // Fill remaining to complete grid
  const remaining = 42 - grid.length;
  for (let d = 1; d <= remaining; d++) {
    grid.push({ day: d, inMonth: false });
  }
  return grid;
}

function getWeekOfDate(date) {
  const d = new Date(date);
  const dayNum = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (dayNum === 0 ? 6 : dayNum - 1));
  return monday;
}

export default function Schedule() {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => getWeekOfDate(new Date()));

  const monthDays = useMemo(() => getMonthDays(calYear, calMonth), [calYear, calMonth]);

  const filterSchedule = (slots) => {
    let result = slots;
    if (selectedClass !== 'all') result = result.filter(s => s.class === selectedClass);
    if (selectedSubject !== 'all') result = result.filter(s => s.subject === selectedSubject);
    return result;
  };

  const uniqueSubjects = useMemo(() => {
    const subs = new Set();
    Object.values(weeklySchedule).forEach(daySlots => {
      daySlots.forEach(s => subs.add(s.subject));
    });
    return [...subs];
  }, []);

  const handleDayClick = (dayObj) => {
    if (!dayObj.inMonth || !dayObj.date) return;
    const weekStart = getWeekOfDate(dayObj.date);
    setSelectedWeekStart(weekStart);
    setShowCalendar(false);
  };

  const isInSelectedWeek = (dayObj) => {
    if (!dayObj.date) return false;
    const d = dayObj.date.getTime();
    const ws = selectedWeekStart.getTime();
    const we = ws + 6 * 86400000;
    return d >= ws && d <= we;
  };

  const isToday = (dayObj) => {
    if (!dayObj.date) return false;
    const t = new Date();
    return dayObj.date.getDate() === t.getDate() && dayObj.date.getMonth() === t.getMonth() && dayObj.date.getFullYear() === t.getFullYear();
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const weekLabel = useMemo(() => {
    const end = new Date(selectedWeekStart);
    end.setDate(end.getDate() + 5);
    return `${selectedWeekStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} — ${end.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }, [selectedWeekStart]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">Weekly timetable for your classes</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="all">All Classes</option>
            <option value="11th">Class 11th</option>
            <option value="9th">Class 9th</option>
          </select>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="all">All Subjects</option>
            {uniqueSubjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              showCalendar ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Calendar
          </button>
        </div>
      </div>

      {/* Month Calendar Picker */}
      {showCalendar && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <h3 className="text-sm font-semibold text-gray-900">{monthNames[calMonth]} {calYear}</h3>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {shortDays.map(d => (
              <div key={d} className="text-[10px] font-semibold text-gray-500 uppercase py-1">{d}</div>
            ))}
            {monthDays.map((dayObj, idx) => (
              <button
                key={idx}
                onClick={() => handleDayClick(dayObj)}
                disabled={!dayObj.inMonth}
                className={`w-8 h-8 mx-auto rounded-full text-xs font-medium transition-all ${
                  !dayObj.inMonth ? 'text-gray-300 cursor-default' :
                  isToday(dayObj) ? 'bg-primary-600 text-white font-bold' :
                  isInSelectedWeek(dayObj) ? 'bg-primary-100 text-primary-700' :
                  dayObj.date && dayObj.date.getDay() === 0 ? 'text-red-400 hover:bg-red-50' :
                  'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {dayObj.day}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Selected week: <span className="font-medium text-gray-700">{weekLabel}</span>
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500">Showing schedule for: <span className="font-medium text-gray-700">{weekLabel}</span></p>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {days.map((day) => {
          const isCurrentDay = day === dayOfWeek;
          const slots = filterSchedule(weeklySchedule[day] || []);

          return (
            <div
              key={day}
              className={`bg-white rounded-lg shadow-sm border overflow-hidden ${
                isCurrentDay ? 'border-primary-300 ring-2 ring-primary-100' : 'border-gray-100'
              }`}
            >
              <div className={`px-4 py-3 flex items-center justify-between ${
                isCurrentDay ? 'bg-primary-50' : 'bg-gray-50'
              }`}>
                <h3 className={`font-semibold text-sm ${isCurrentDay ? 'text-primary-700' : 'text-gray-700'}`}>
                  {day}
                </h3>
                {isCurrentDay && (
                  <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full font-medium">Today</span>
                )}
              </div>
              <div className="divide-y divide-gray-50">
                {slots.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">No classes</div>
                ) : (
                  slots.map((slot, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedSlot(selectedSlot === `${day}-${idx}` ? null : `${day}-${idx}`)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900">{slot.subject}</span>
                        <Badge variant={slot.language.toLowerCase()}>{slot.language}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{slot.time}</span>
                        <span>·</span>
                        <span>Class {slot.class}</span>
                      </div>
                      {selectedSlot === `${day}-${idx}` && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-600 mb-2">Topic: {slot.topic}</p>
                          <a
                            href="#"
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Join Class
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
