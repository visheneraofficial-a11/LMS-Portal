import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tv, Clock, User, Globe, Play, Video, Search, Filter,
  Calendar, ArrowRight, ExternalLink, Download, ChevronDown
} from 'lucide-react';
import { todayLiveClasses, upcomingClasses, pastRecordings, subjects } from '../data/mockData';

const tabs = ['Today', 'Upcoming', 'Recordings'];

export default function LiveClasses() {
  const [activeTab, setActiveTab] = useState('Today');
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');

  const filterData = (data) => {
    return data.filter(item => {
      const matchSearch = !search || item.subject.toLowerCase().includes(search.toLowerCase()) ||
        (item.teacher && item.teacher.toLowerCase().includes(search.toLowerCase()));
      const matchSubject = subjectFilter === 'All' || item.subject.includes(subjectFilter);
      return matchSearch && matchSubject;
    });
  };

  const todayFiltered = filterData(todayLiveClasses);
  const upcomingFiltered = filterData(upcomingClasses);
  const recordingsFiltered = filterData(pastRecordings);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> LIVE
        </span>;
      case 'upcoming':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">UPCOMING</span>;
      case 'completed':
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">COMPLETED</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Live Classes</h1>
          <p className="text-sm text-slate-500 mt-1">Join live sessions and watch recordings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {tab}
            {tab === 'Today' && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-primary-100 text-primary-700 text-[10px] rounded-full font-bold">
                {todayLiveClasses.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search classes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={subjectFilter}
          onChange={e => setSubjectFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="All">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'Today' && (
          <motion.div
            key="today"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {todayFiltered.map(cls => (
              <div key={cls.id} className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                cls.status === 'live' ? 'border-green-200 ring-1 ring-green-100' : 'border-slate-100'
              }`}>
                <div className={`h-1.5 ${
                  cls.status === 'live' ? 'bg-green-500' :
                  cls.status === 'upcoming' ? 'bg-primary-500' : 'bg-slate-300'
                }`} />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-800 text-sm truncate">{cls.subject}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{cls.topic}</p>
                    </div>
                    {getStatusBadge(cls.status)}
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {cls.teacher}</p>
                    <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {cls.time} • {cls.duration}</p>
                    <p className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> {cls.language}</p>
                  </div>
                  <div className="mt-4">
                    {cls.status === 'live' ? (
                      <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <Play className="w-4 h-4" fill="white" /> Join Live Class
                      </button>
                    ) : cls.status === 'upcoming' ? (
                      <button className="w-full px-4 py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-lg hover:bg-primary-100 transition-colors">
                        Set Reminder
                      </button>
                    ) : (
                      <button className="w-full px-4 py-2 bg-slate-50 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                        <Video className="w-4 h-4" /> Watch Recording
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {todayFiltered.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                <Tv className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">No classes found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'Upcoming' && (
          <motion.div
            key="upcoming"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Subject</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Teacher</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Time</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Language</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingFiltered.map(cls => (
                    <tr key={cls.id} className="border-t border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{cls.subject}</p>
                        <p className="text-xs text-slate-500">{cls.topic}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{cls.teacher}</td>
                      <td className="px-4 py-3 text-slate-600">{cls.date}</td>
                      <td className="px-4 py-3 text-slate-600">{cls.time}</td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{cls.language}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {upcomingFiltered.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">No upcoming classes</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'Recordings' && (
          <motion.div
            key="recordings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {recordingsFiltered.map(rec => (
              <div key={rec.id} className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <div className="relative bg-slate-800 h-36 flex items-center justify-center">
                  <Video className="w-12 h-12 text-slate-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="absolute bottom-2 right-2 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded">{rec.duration}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-slate-800 text-sm truncate">{rec.subject}: {rec.topic}</h3>
                  <p className="text-xs text-slate-500 mt-1">{rec.teacher} • {rec.date}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="flex-1 px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-lg hover:bg-primary-100 transition-colors flex items-center justify-center gap-1">
                      <Play className="w-3 h-3" /> Watch
                    </button>
                    <button className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs rounded-lg hover:bg-slate-100 transition-colors">
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {recordingsFiltered.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                <Video className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">No recordings found</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
