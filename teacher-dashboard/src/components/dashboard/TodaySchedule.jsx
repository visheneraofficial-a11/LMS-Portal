import React from 'react';
import Badge from '../common/Badge';
import { Video, ExternalLink, Clock } from 'lucide-react';

export default function TodaySchedule({ schedule }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-600" />
          Today's Schedule
        </h3>
        <span className="text-xs text-gray-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {schedule.map((item) => (
            <div
              key={item.id}
              className="border border-gray-100 rounded-lg p-4 hover:border-primary-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{item.subject}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{item.topic}</p>
                </div>
                <Badge
                  variant={item.status.toLowerCase()}
                  dot={item.status === 'Live'}
                >
                  {item.status}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-3">
                <span className="bg-gray-100 px-2 py-0.5 rounded">Class {item.class}</span>
                <Badge variant={item.language.toLowerCase()}>{item.language}</Badge>
                <span>{item.time} - {item.endTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{item.students} students</span>
                <a
                  href={item.youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    item.status === 'Live'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : item.status === 'Upcoming'
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {item.status === 'Live' ? (
                    <><Video className="w-3.5 h-3.5" /> Join Live</>
                  ) : item.status === 'Upcoming' ? (
                    <><ExternalLink className="w-3.5 h-3.5" /> Join Class</>
                  ) : (
                    <><Video className="w-3.5 h-3.5" /> Watch</>
                  )}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
