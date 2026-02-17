import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Download, Eye, Search, Grid3X3, List, Star, Bookmark,
  FileText, ChevronDown, ExternalLink, Filter
} from 'lucide-react';
import { ebooks, subjects } from '../data/mockData';

export default function Resources() {
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [bookmarked, setBookmarked] = useState(new Set());

  const types = ['All', ...new Set(ebooks.map(e => e.type))];

  const filtered = ebooks.filter(item => {
    const matchSearch = !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.author?.toLowerCase().includes(search.toLowerCase());
    const matchSubject = subjectFilter === 'All' || item.subject === subjectFilter;
    const matchType = typeFilter === 'All' || item.type === typeFilter;
    return matchSearch && matchSubject && matchType;
  });

  const toggleBookmark = (id) => {
    setBookmarked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'PDF': return 'bg-red-100 text-red-700';
      case 'eBook': return 'bg-blue-100 text-blue-700';
      case 'Notes': return 'bg-green-100 text-green-700';
      case 'Question Paper': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">E-Books & Resources</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} resources available</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search resources..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
          <option value="All">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
            >
              <div className={`h-32 flex items-center justify-center relative ${
                item.subject === 'Physics' ? 'bg-gradient-to-br from-blue-50 to-blue-100' :
                item.subject === 'Chemistry' ? 'bg-gradient-to-br from-green-50 to-green-100' :
                item.subject === 'Biology' ? 'bg-gradient-to-br from-amber-50 to-amber-100' :
                item.subject === 'Mathematics' ? 'bg-gradient-to-br from-purple-50 to-purple-100' :
                'bg-gradient-to-br from-slate-50 to-slate-100'
              }`}>
                <BookOpen className={`w-10 h-10 ${
                  item.subject === 'Physics' ? 'text-blue-300' :
                  item.subject === 'Chemistry' ? 'text-green-300' :
                  item.subject === 'Biology' ? 'text-amber-300' :
                  item.subject === 'Mathematics' ? 'text-purple-300' :
                  'text-slate-300'
                }`} />
                <button
                  onClick={() => toggleBookmark(item.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked.has(item.id) ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                </button>
                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${getTypeColor(item.type)}`}>
                  {item.type}
                </span>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-slate-800 text-sm truncate" title={item.title}>{item.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{item.subject} {item.author && `• ${item.author}`}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] text-slate-400">{item.size}</span>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg bg-slate-50 hover:bg-primary-50 hover:text-primary-600 text-slate-500 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg bg-slate-50 hover:bg-primary-50 hover:text-primary-600 text-slate-500 transition-colors">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Title</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Subject</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Type</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Size</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-t border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-800">{item.title}</p>
                        {item.author && <p className="text-xs text-slate-400">{item.author}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{item.subject}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getTypeColor(item.type)}`}>{item.type}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{item.size}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleBookmark(item.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                        <Bookmark className={`w-4 h-4 ${bookmarked.has(item.id) ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">No resources found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
