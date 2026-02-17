import React, { useState } from 'react';
import MarkAttendance from '../components/attendance/MarkAttendance';
import AttendanceReport from '../components/attendance/AttendanceReport';
import { ClipboardCheck, BarChart3 } from 'lucide-react';

const tabs = [
  { id: 'mark', label: 'Mark Attendance', icon: ClipboardCheck },
  { id: 'report', label: 'Attendance Report', icon: BarChart3 },
];

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('mark');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-sm text-gray-500 mt-1">Mark daily attendance and view reports</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'mark' && <MarkAttendance />}
      {activeTab === 'report' && <AttendanceReport />}
    </div>
  );
}
