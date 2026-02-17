import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlayCircle, Clock, Eye, Search, Filter, BookmarkPlus, Bookmark,
  Play, CheckCircle, BarChart3, ChevronRight
} from 'lucide-react';
import { videoLectures, subjects } from '../data/mockData';

export default function VideoLectures() {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [bookmarked, setBookmarked] = useState(new Set());

  const filtered = videoLectures.filter(item => {
    const matchSearch = !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.subject.toLowerCase().includes(search.toLowerCase());
    const matchSubject = subjectFilter === 'All' || item.subject === subjectFilter;
    const matchStatus = statusFilter === 'All' ||
      (statusFilter === 'Completed' && item.progress === 100) ||
      (statusFilter === 'In Progress' && item.progress > 0 && item.progress < 100) ||
      (statusFilter === 'Not Started' && item.progress === 0);
    return matchSearch && matchSubject && matchStatus;
  });

  const continueWatching = videoLectures.filter(v => v.progress > 0 && v.progress < 100);
  const totalWatched = videoLectures.filter(v => v.progress === 100).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Video Lectures</h1>
        <p className="text-sm text-slate-500 mt-1">{videoLectures.length} lectures • {totalWatched} completed</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Lectures', value: videoLectures.length, color: 'bg-blue-500' },
          { label: 'Completed', value: totalWatched, color: 'bg-green-500' },
          { label: 'In Progress', value: continueWatching.length, color: 'bg-amber-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <PlayCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Play className="w-4 h-4 text-primary-500" /> Continue Watching
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {continueWatching.map(vid => (
              <div key={vid.id} className="min-w-[280px] max-w-[280px] bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden group flex-shrink-0">
                <div className="relative bg-slate-800 h-36 flex items-center justify-center">
                  <PlayCircle className="w-12 h-12 text-slate-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="white" />
                  </div>
                  <span className="absolute bottom-2 right-2 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded">{vid.duration}</span>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
                    <div className="h-full bg-primary-500" style={{ width: `${vid.progress}%` }} />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-slate-800 text-sm truncate">{vid.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{vid.subject} • {vid.teacher}</p>
                  <p className="text-[10px] text-primary-600 font-medium mt-1">{vid.progress}% completed</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search lectures..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
          <option value="All">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
          <option value="All">All Status</option>
          <option value="Completed">Completed</option>
          <option value="In Progress">In Progress</option>
          <option value="Not Started">Not Started</option>
        </select>
      </div>

      {/* All Lectures Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((vid, i) => (
          <motion.div
            key={vid.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
          >
            <div className="relative bg-slate-800 h-36 flex items-center justify-center">
              <PlayCircle className="w-12 h-12 text-slate-500" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="white" />
              </div>
              <span className="absolute bottom-2 right-2 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded">{vid.duration}</span>
              {vid.progress === 100 && (
                <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Done
                </span>
              )}
              <button
                onClick={() => {
                  setBookmarked(prev => {
                    const next = new Set(prev);
                    next.has(vid.id) ? next.delete(vid.id) : next.add(vid.id);
                    return next;
                  });
                }}
                className="absolute top-2 left-2 p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
              >
                <Bookmark className={`w-4 h-4 ${bookmarked.has(vid.id) ? 'fill-amber-400 text-amber-400' : 'text-white'}`} />
              </button>
              {vid.progress > 0 && vid.progress < 100 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
                  <div className="h-full bg-primary-500" style={{ width: `${vid.progress}%` }} />
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-medium text-slate-800 text-sm truncate" title={vid.title}>{vid.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{vid.subject} • {vid.teacher}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {vid.duration}</span>
                  <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {vid.views}</span>
                </div>
                {vid.progress > 0 && (
                  <span className={`text-[10px] font-medium ${vid.progress === 100 ? 'text-green-600' : 'text-primary-600'}`}>
                    {vid.progress}%
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <PlayCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No lectures found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
