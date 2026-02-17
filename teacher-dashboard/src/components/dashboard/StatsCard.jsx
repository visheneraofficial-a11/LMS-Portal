import React from 'react';

const iconColors = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  amber: 'bg-amber-100 text-amber-600',
  red: 'bg-red-100 text-red-600',
  purple: 'bg-purple-100 text-purple-600',
};

export default function StatsCard({ title, value, icon: Icon, color = 'blue', suffix = '' }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">
          {value}{suffix}
        </p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </div>
  );
}
