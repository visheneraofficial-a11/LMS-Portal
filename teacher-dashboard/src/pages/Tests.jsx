import React, { useState } from 'react';
import UpdateMarks from '../components/tests/UpdateMarks';
import TestReport from '../components/tests/TestReport';
import { Edit, BarChart3 } from 'lucide-react';

const tabs = [
  { id: 'update', label: 'Update Marks', icon: Edit },
  { id: 'report', label: 'Test Report', icon: BarChart3 },
];

export default function Tests() {
  const [activeTab, setActiveTab] = useState('update');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tests & Marks</h1>
        <p className="text-sm text-gray-500 mt-1">Update test marks and view test reports</p>
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

      {activeTab === 'update' && <UpdateMarks />}
      {activeTab === 'report' && <TestReport />}
    </div>
  );
}
