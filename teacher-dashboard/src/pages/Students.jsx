import React, { useState, useMemo } from 'react';
import { students, classOptions } from '../data/mockData';
import ColumnFilter from '../components/common/ColumnFilter';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import StudentAIAnalysis from '../components/students/StudentAIAnalysis';
import { Users, ChevronLeft, ChevronRight, Search, Brain, X } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

export default function Students() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Column filters
  const [filters, setFilters] = useState({
    class: null,
    language: null,
    attendanceBucket: null,
  });

  const setFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setPage(1);
  };

  // Bucketed attendance for filtering
  const attendanceBuckets = (pct) => {
    if (pct >= 90) return '90%+';
    if (pct >= 75) return '75-89%';
    if (pct >= 60) return '60-74%';
    return 'Below 60%';
  };

  const filtered = useMemo(() => {
    let result = [...students];
    if (filters.class && filters.class.length > 0) {
      result = result.filter(s => filters.class.includes(s.class));
    }
    if (filters.language && filters.language.length > 0) {
      result = result.filter(s => filters.language.includes(s.language));
    }
    if (filters.attendanceBucket && filters.attendanceBucket.length > 0) {
      result = result.filter(s => filters.attendanceBucket.includes(attendanceBuckets(s.attendancePercent)));
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        String(s.rollNo).includes(q) ||
        s.class.includes(q)
      );
    }
    return result;
  }, [search, filters]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const activeFilterCount = Object.values(filters).filter(v => v !== null && v.length > 0).length;

  const clearAllFilters = () => {
    setFilters({ class: null, language: null, attendanceBucket: null });
    setSearch('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and view student information · Click name for AI analysis</p>
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name, roll number..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* AI Analysis Modal */}
      {selectedStudent && (
        <StudentAIAnalysis student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}

      {/* Students Table with Column Filters */}
      {paginated.length === 0 ? (
        <EmptyState title="No students found" description="Try adjusting your search or filter criteria" icon={Users} />
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left">
                      <ColumnFilter
                        column="class"
                        label="Class"
                        data={students.map(s => s.class)}
                        selected={filters.class}
                        onChange={v => setFilter('class', v)}
                      />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <ColumnFilter
                        column="language"
                        label="Language"
                        data={students.map(s => s.language)}
                        selected={filters.language}
                        onChange={v => setFilter('language', v)}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Contact</th>
                    <th className="px-4 py-3 text-center">
                      <ColumnFilter
                        column="attendance"
                        label="Attendance %"
                        data={students.map(s => attendanceBuckets(s.attendancePercent))}
                        selected={filters.attendanceBucket}
                        onChange={v => setFilter('attendanceBucket', v)}
                        align="right"
                      />
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Last Test</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Analysis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{student.rollNo}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="text-sm font-medium text-primary-700 hover:text-primary-800 hover:underline text-left"
                        >
                          {student.name}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{student.class}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={student.language.toLowerCase()}>{student.language}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{student.contact}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-medium ${student.attendancePercent >= 75 ? 'text-green-700' : 'text-red-700'}`}>
                          {student.attendancePercent}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-gray-700">{student.lastTestScore}%</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors"
                        >
                          <Brain className="w-3.5 h-3.5" />
                          AI View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} students
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
