import React, { useState, useMemo } from 'react';
import { getStudentSessionData } from '../../data/mockData';
import { X, Calendar, Clock, Monitor, Wifi, ChevronLeft, ChevronRight, LogIn, LogOut, TrendingUp, AlertTriangle } from 'lucide-react';

export default function StudentAttendanceDetail({ student, onClose }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const sessionData = useMemo(() => getStudentSessionData(student.studentId), [student.studentId]);

  // Calculate summary stats
  const stats = useMemo(() => {
    let present = 0, absent = 0, holidays = 0, totalSessions = 0;
    sessionData.forEach(d => {
      if (d.status === 'present') { present++; totalSessions += d.sessions.length; }
      else if (d.status === 'absent') absent++;
      else if (d.status === 'holiday') holidays++;
    });
    const workingDays = present + absent;
    const percentage = workingDays > 0 ? Math.round((present / workingDays) * 100) : 0;
    // Streak
    let currentStreak = 0;
    for (let i = sessionData.length - 1; i >= 0; i--) {
      if (sessionData[i].status === 'present') currentStreak++;
      else if (sessionData[i].status === 'absent') break;
    }
    return { present, absent, holidays, percentage, totalSessions, currentStreak, workingDays };
  }, [sessionData]);

  const statusColor = (status) => {
    if (status === 'present') return 'bg-green-500';
    if (status === 'absent') return 'bg-red-500';
    if (status === 'holiday') return 'bg-gray-300';
    return 'bg-gray-100';
  };

  const statusBorder = (status) => {
    if (status === 'present') return 'ring-2 ring-green-400';
    if (status === 'absent') return 'ring-2 ring-red-400';
    return '';
  };

  const selectedDayData = selectedDate ? sessionData.find(d => d.date === selectedDate) : null;

  // Group by weeks for calendar layout
  const calendarWeeks = useMemo(() => {
    const weeks = [];
    let currentWeek = [];
    sessionData.forEach((day, i) => {
      const d = new Date(day.date);
      const dow = d.getDay();
      if (i === 0) {
        // Pad beginning
        for (let p = 0; p < dow; p++) currentWeek.push(null);
      }
      currentWeek.push(day);
      if (dow === 6 || i === sessionData.length - 1) {
        // Pad end
        while (currentWeek.length < 7) currentWeek.push(null);
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    return weeks;
  }, [sessionData]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{student.studentName}</h2>
              <p className="text-indigo-200 text-sm mt-1">Roll No: {student.rollNo} • 30-Day Attendance Report</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{stats.present}</p>
              <p className="text-xs text-green-600 mt-1">Days Present</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-red-700">{stats.absent}</p>
              <p className="text-xs text-red-600 mt-1">Days Absent</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className={`text-3xl font-bold ${stats.percentage >= 75 ? 'text-blue-700' : 'text-red-700'}`}>{stats.percentage}%</p>
              <p className="text-xs text-blue-600 mt-1">Attendance Rate</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-purple-700">{stats.currentStreak}</p>
              <p className="text-xs text-purple-600 mt-1">Current Streak</p>
            </div>
          </div>

          {/* Attendance Warning */}
          {stats.percentage < 75 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">Low Attendance Warning</p>
                <p className="text-xs text-red-600 mt-1">
                  This student's attendance ({stats.percentage}%) is below the required 75% threshold. 
                  They need {Math.ceil((0.75 * stats.workingDays - stats.present) / (1 - 0.75))} more consecutive present days to reach 75%.
                </p>
              </div>
            </div>
          )}

          {/* 30-Day Calendar Heatmap */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              30-Day Attendance Calendar
              <span className="text-xs font-normal text-gray-400">(Click a day to see login details)</span>
            </h3>

            <div className="bg-gray-50 rounded-xl p-4">
              {/* Day labels */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center text-xs font-medium text-gray-400">{d}</div>
                ))}
              </div>
              {/* Calendar grid */}
              {calendarWeeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
                  {week.map((day, di) => (
                    <div key={di} className="aspect-square flex items-center justify-center">
                      {day ? (
                        <button
                          onClick={() => day.status !== 'future' && setSelectedDate(day.date === selectedDate ? null : day.date)}
                          className={`w-full h-full max-w-[40px] max-h-[40px] rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all
                            ${day.status === 'present' ? 'bg-green-500 text-white hover:bg-green-600' : ''}
                            ${day.status === 'absent' ? 'bg-red-500 text-white hover:bg-red-600' : ''}
                            ${day.status === 'holiday' ? 'bg-gray-200 text-gray-500' : ''}
                            ${day.status === 'future' ? 'bg-gray-50 text-gray-300 cursor-default' : 'cursor-pointer'}
                            ${day.date === selectedDate ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''}
                          `}
                          disabled={day.status === 'future'}
                        >
                          {new Date(day.date).getDate()}
                        </button>
                      ) : (
                        <div className="w-full h-full" />
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {/* Legend */}
              <div className="flex gap-4 mt-3 pt-3 border-t border-gray-200">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded bg-green-500" /> Present
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded bg-red-500" /> Absent
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded bg-gray-200" /> Holiday
                </span>
              </div>
            </div>
          </div>

          {/* Selected Day Login/Logout Details */}
          {selectedDayData && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Session Details — {new Date(selectedDayData.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  selectedDayData.status === 'present' ? 'bg-green-100 text-green-700' :
                  selectedDayData.status === 'absent' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {selectedDayData.status.charAt(0).toUpperCase() + selectedDayData.status.slice(1)}
                </span>
              </div>

              {selectedDayData.status === 'absent' ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <X className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Student was absent on this day</p>
                  <p className="text-xs text-gray-400 mt-1">No login sessions recorded</p>
                </div>
              ) : selectedDayData.status === 'holiday' ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Holiday</p>
                  <p className="text-xs text-gray-400 mt-1">No sessions on holidays</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {selectedDayData.sessions.map((session, si) => (
                    <div key={si} className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded">
                          Session {si + 1}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <LogIn className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Login</p>
                            <p className="text-sm font-semibold text-gray-900">{session.loginTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <LogOut className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Logout</p>
                            <p className="text-sm font-semibold text-gray-900">{session.logoutTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Duration</p>
                            <p className="text-sm font-semibold text-gray-900">{session.duration}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Monitor className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Device</p>
                            <p className="text-sm font-semibold text-gray-900">{session.device}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                        <Wifi className="w-3 h-3" />
                        IP: {session.ip}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Session Activity Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Recent Activity Log
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 max-h-48 overflow-y-auto">
              {sessionData.filter(d => d.status === 'present' || d.status === 'absent').slice(-10).reverse().map((day, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${day.status === 'present' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-gray-500 text-xs w-24 flex-shrink-0">
                    {new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className={`text-xs font-medium ${day.status === 'present' ? 'text-green-700' : 'text-red-700'}`}>
                    {day.status === 'present' ? `Present — ${day.sessions.length} session(s)` : 'Absent'}
                  </span>
                  {day.sessions.length > 0 && (
                    <span className="text-xs text-gray-400 ml-auto">
                      {day.sessions[0].loginTime} - {day.sessions[day.sessions.length - 1].logoutTime}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
