import React from 'react';
import { ClipboardCheck, Edit, Video, Upload, Activity } from 'lucide-react';

const iconMap = {
  'clipboard-check': ClipboardCheck,
  'edit': Edit,
  'video': Video,
  'upload': Upload,
};

export default function RecentActivity({ activities }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-600" />
          Recent Activity
        </h3>
      </div>
      <div className="divide-y divide-gray-50">
        {activities.map((item) => {
          const Icon = iconMap[item.icon] || Activity;
          return (
            <div key={item.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-primary-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-900">{item.action}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.time} · {item.date}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
