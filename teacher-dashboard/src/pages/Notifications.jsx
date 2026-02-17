import React, { useState } from 'react';
import { notifications as initialNotifications } from '../data/mockData';
import {
  Bell, Check, CheckCheck, Trash2, AlertTriangle, Info,
  AlertCircle, Clock, Filter, MailOpen
} from 'lucide-react';

const typeIcons = {
  warning: AlertTriangle,
  alert: AlertCircle,
  info: Info,
};

const typeColors = {
  warning: 'text-amber-600 bg-amber-50 border-amber-200',
  alert: 'text-red-600 bg-red-50 border-red-200',
  info: 'text-blue-600 bg-blue-50 border-blue-200',
};

// Generate more notifications
const allNotifications = [
  ...initialNotifications,
  { id: 5, title: 'Assignment Submitted', message: 'Aarav Sharma submitted Physics assignment', time: '3 days ago', read: true, type: 'info', date: '2026-02-14' },
  { id: 6, title: 'Low Test Score Alert', message: '5 students scored below 40% in Weekly Quiz', time: '4 days ago', read: true, type: 'alert', date: '2026-02-13' },
  { id: 7, title: 'System Maintenance', message: 'LMS will be under maintenance on Feb 22, 10PM-12AM', time: '5 days ago', read: true, type: 'warning', date: '2026-02-12' },
  { id: 8, title: 'New Batch Assigned', message: 'You have been assigned to 9th English batch', time: '1 week ago', read: true, type: 'info', date: '2026-02-10' },
  { id: 9, title: 'Parent Meeting Request', message: "Parent of Vivaan Patel requested a meeting", time: '1 week ago', read: true, type: 'info', date: '2026-02-10' },
  { id: 10, title: 'Holiday Notice', message: 'School closed on Feb 26 - Republic Day', time: '1 week ago', read: true, type: 'warning', date: '2026-02-10' },
  { id: 11, title: 'Report Cards Due', message: 'Submit term report cards by Feb 28', time: '2 weeks ago', read: true, type: 'alert', date: '2026-02-03' },
  { id: 12, title: 'Training Workshop', message: 'Digital teaching tools workshop scheduled for Feb 25', time: '2 weeks ago', read: true, type: 'info', date: '2026-02-03' },
];

export default function Notifications() {
  const [notifs, setNotifs] = useState(allNotifications);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifs.filter(n => !n.read).length;

  const filtered = notifs.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'alerts') return n.type === 'alert';
    if (filter === 'warnings') return n.type === 'warning';
    return true;
  });

  const markRead = (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotif = (id) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifs(prev => prev.filter(n => !n.read));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium hover:bg-primary-100 transition-colors"
            >
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </button>
          )}
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All', count: notifs.length },
          { id: 'unread', label: 'Unread', count: unreadCount },
          { id: 'alerts', label: 'Alerts', count: notifs.filter(n => n.type === 'alert').length },
          { id: 'warnings', label: 'Warnings', count: notifs.filter(n => n.type === 'warning').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              filter === tab.id ? 'bg-white/20' : 'bg-gray-200'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <MailOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-700 mb-1">No notifications</h3>
          <p className="text-xs text-gray-500">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => {
            const TypeIcon = typeIcons[n.type] || Info;
            const colorClass = typeColors[n.type] || typeColors.info;
            return (
              <div
                key={n.id}
                className={`bg-white rounded-lg shadow-sm border overflow-hidden transition-all hover:shadow-md ${
                  !n.read ? 'border-primary-200 bg-primary-50/30' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start gap-3 p-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${colorClass}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`text-sm font-semibold ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</h3>
                        <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {n.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!n.read && (
                          <button
                            onClick={() => markRead(n.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-green-600 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotif(n.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0 mt-2" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
