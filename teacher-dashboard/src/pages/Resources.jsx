import React, { useState, useMemo } from 'react';
import { ebooks, videoLectures } from '../data/mockData';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import ColumnFilter from '../components/common/ColumnFilter';
import { BookOpen, PlayCircle, ExternalLink, Eye, ChevronLeft, ChevronRight, Search, Filter, X } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const tabs = [
  { id: 'ebooks', label: 'E-Books', icon: BookOpen },
  { id: 'videos', label: 'Video Lectures', icon: PlayCircle },
];

export default function Resources() {
  const [activeTab, setActiveTab] = useState('ebooks');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Column filters
  const [filters, setFilters] = useState({
    class: null,
    subject: null,
  });

  const updateFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== null) || search;

  const allEbooks = ebooks;
  const allVideos = videoLectures;
  const currentSource = activeTab === 'ebooks' ? allEbooks : allVideos;

  const filteredData = useMemo(() => {
    let result = [...currentSource];
    if (filters.class) result = result.filter(e => filters.class.includes(e.class));
    if (filters.subject) result = result.filter(e => filters.subject.includes(e.subject));
    if (search) {
      const q = search.toLowerCase();
      if (activeTab === 'ebooks') {
        result = result.filter(e => e.chapter.toLowerCase().includes(q) || e.subject.toLowerCase().includes(q));
      } else {
        result = result.filter(v => v.title.toLowerCase().includes(q) || v.chapter.toLowerCase().includes(q) || v.subject.toLowerCase().includes(q));
      }
    }
    return result;
  }, [currentSource, filters, search, activeTab]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginated = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const clearAllFilters = () => {
    setFilters({ class: null, subject: null });
    setSearch('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        <p className="text-sm text-gray-500 mt-1">Access e-books and video lectures</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {(activeTab === tab.id ? filteredData : currentSource).length}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={`Search ${activeTab === 'ebooks' ? 'e-books' : 'video lectures'}...`}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <X className="w-3 h-3" /> Clear Filters
          </button>
        )}
      </div>

      {/* Filter active indicator */}
      {hasActiveFilters && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-2 flex items-center gap-2 text-xs text-indigo-600">
          <Filter className="w-3 h-3" />
          Showing {filteredData.length} of {currentSource.length} {activeTab === 'ebooks' ? 'e-books' : 'videos'}
        </div>
      )}

      {/* Content */}
      {paginated.length === 0 ? (
        <EmptyState
          title={`No ${activeTab === 'ebooks' ? 'e-books' : 'video lectures'} found`}
          description="Try adjusting your search or filter criteria"
          icon={activeTab === 'ebooks' ? BookOpen : PlayCircle}
        />
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <div className="flex items-center gap-1">
                      Class
                      <ColumnFilter
                        column="class"
                        label="Class"
                        data={currentSource.map(i => i.class)}
                        selected={filters.class}
                        onChange={(val) => updateFilter('class', val)}
                      />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <div className="flex items-center gap-1">
                      Subject
                      <ColumnFilter
                        column="subject"
                        label="Subject"
                        data={currentSource.map(i => i.subject)}
                        selected={filters.subject}
                        onChange={(val) => updateFilter('subject', val)}
                      />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {activeTab === 'ebooks' ? 'Chapter' : 'Title'}
                  </th>
                  {activeTab === 'ebooks' && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Pages</th>
                  )}
                  {activeTab === 'videos' && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Chapter</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Duration</th>
                    </>
                  )}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{item.class}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {activeTab === 'ebooks' ? item.chapter : item.title}
                    </td>
                    {activeTab === 'ebooks' && (
                      <td className="px-4 py-3 text-center text-sm text-gray-500 hidden sm:table-cell">{item.pages}</td>
                    )}
                    {activeTab === 'videos' && (
                      <>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{item.chapter}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-500 hidden sm:table-cell">{item.duration}</td>
                      </>
                    )}
                    <td className="px-4 py-3 text-center">
                      <a
                        href={activeTab === 'ebooks' ? item.fileUrl : item.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium hover:bg-primary-100 transition-colors"
                      >
                        {activeTab === 'ebooks' ? (
                          <><Eye className="w-3.5 h-3.5" /> View</>
                        ) : (
                          <><PlayCircle className="w-3.5 h-3.5" /> Watch</>
                        )}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium ${
                      page === i + 1 ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
