import React, { useState } from 'react';
import { classScheduleData } from '../data/mockData';
import { CalendarDays } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const subjectColors = {
  Physics: 'bg-blue-50 border-blue-200 text-blue-800',
  Chemistry: 'bg-purple-50 border-purple-200 text-purple-800',
  Maths: 'bg-green-50 border-green-200 text-green-800',
  Biology: 'bg-amber-50 border-amber-200 text-amber-800',
  'Doubt Session': 'bg-gray-50 border-gray-200 text-gray-700',
};

const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });

export default function ClassSchedule() {
  const [selectedClass, setSelectedClass] = useState('11th');
  const schedule = classScheduleData[selectedClass] || {};

  // Get all unique time slots across all days
  const allTimeSlots = [];
  days.forEach(day => {
    (schedule[day] || []).forEach(slot => {
      if (!allTimeSlots.find(t => t.period === slot.period)) {
        allTimeSlots.push({ period: slot.period, time: slot.time });
      }
    });
  });
  allTimeSlots.sort((a, b) => a.period - b.period);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">Weekly timetable for selected class</p>
        </div>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white w-48"
        >
          <option value="11th">Class 11th</option>
          <option value="9th">Class 9th</option>
        </select>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b border-r border-gray-200 min-w-[100px]">
                Period / Time
              </th>
              {days.map(day => (
                <th
                  key={day}
                  className={`px-4 py-3 text-center text-xs font-medium uppercase border-b border-r border-gray-200 min-w-[140px] ${
                    day === dayOfWeek
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-500'
                  }`}
                >
                  {day}
                  {day === dayOfWeek && (
                    <span className="block text-[10px] font-normal text-primary-500 mt-0.5">Today</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allTimeSlots.map((timeSlot) => (
              <tr key={timeSlot.period} className="border-b border-gray-100">
                <td className="px-4 py-3 border-r border-gray-200 bg-gray-50">
                  <div className="text-xs font-medium text-gray-500">Period {timeSlot.period}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{timeSlot.time}</div>
                </td>
                {days.map(day => {
                  const slot = (schedule[day] || []).find(s => s.period === timeSlot.period);
                  const isToday = day === dayOfWeek;
                  const colorClass = slot ? (subjectColors[slot.subject] || subjectColors['Doubt Session']) : '';

                  return (
                    <td
                      key={day}
                      className={`px-2 py-2 border-r border-gray-200 ${isToday ? 'bg-primary-50/30' : ''}`}
                    >
                      {slot ? (
                        <div className={`rounded-lg border p-2.5 ${colorClass}`}>
                          <div className="font-medium text-sm">{slot.subject}</div>
                          <div className="text-xs opacity-75 mt-0.5">{slot.teacher}</div>
                        </div>
                      ) : (
                        <div className="text-center text-xs text-gray-300 py-3">—</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(subjectColors).map(([subject, colorClass]) => (
          <div key={subject} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${colorClass}`}>
            {subject}
          </div>
        ))}
      </div>
    </div>
  );
}
