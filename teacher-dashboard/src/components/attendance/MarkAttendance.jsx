import React, { useState, useMemo } from 'react';
import { students, classOptions } from '../../data/mockData';
import Toggle from '../common/Toggle';
import { useToast } from '../common/Toast';
import { Save, CheckSquare, XSquare, CalendarDays } from 'lucide-react';

export default function MarkAttendance() {
  const [selectedClass, setSelectedClass] = useState('11th-Hindi');
  const { showToast, ToastComponent } = useToast();

  const filteredStudents = useMemo(() => {
    const [cls, lang] = selectedClass.split('-');
    return students.filter(s => s.class === cls && s.language === lang);
  }, [selectedClass]);

  const [attendanceState, setAttendanceState] = useState(() => {
    const state = {};
    students.forEach(s => { state[s.id] = true; });
    return state;
  });

  const handleToggle = (studentId, value) => {
    setAttendanceState(prev => ({ ...prev, [studentId]: value }));
  };

  const markAll = (value) => {
    const newState = { ...attendanceState };
    filteredStudents.forEach(s => { newState[s.id] = value; });
    setAttendanceState(newState);
  };

  const presentCount = filteredStudents.filter(s => attendanceState[s.id]).length;
  const absentCount = filteredStudents.length - presentCount;

  const handleSave = () => {
    showToast(`Attendance saved for ${classOptions.find(c => c.value === selectedClass)?.label}! (${presentCount} present, ${absentCount} absent)`);
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div>
      {ToastComponent}
      {/* Date banner */}
      <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-4 flex items-center gap-3">
        <CalendarDays className="w-5 h-5 text-primary-600" />
        <div>
          <p className="text-sm font-medium text-primary-900">Today's Date</p>
          <p className="text-lg font-bold text-primary-700">{today}</p>
        </div>
      </div>

      {/* Class selector + bulk actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          {classOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => markAll(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckSquare className="w-4 h-4" /> Mark All Present
          </button>
          <button
            onClick={() => markAll(false)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            <XSquare className="w-4 h-4" /> Mark All Absent
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">{filteredStudents.length}</p>
          <p className="text-xs text-blue-600">Total</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{presentCount}</p>
          <p className="text-xs text-green-600">Present</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-700">{absentCount}</p>
          <p className="text-xs text-red-600">Absent</p>
        </div>
      </div>

      {/* Student list */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attendance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">{student.rollNo}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    attendanceState[student.id]
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {attendanceState[student.id] ? 'Present' : 'Absent'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Toggle
                    checked={attendanceState[student.id]}
                    onChange={(val) => handleToggle(student.id, val)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" /> Save Attendance
        </button>
      </div>
    </div>
  );
}
