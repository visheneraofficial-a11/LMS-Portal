import React, { useState, useMemo } from 'react';
import { tests, testMarks } from '../../data/mockData';
import { Download, Trophy, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

export default function TestReport() {
  const [selectedClass, setSelectedClass] = useState('11th');
  const [selectedTest, setSelectedTest] = useState('T001');

  const availableTests = tests.filter(t => t.class === selectedClass);
  const currentTest = tests.find(t => t.id === selectedTest);
  const marksData = testMarks[selectedTest] || [];

  const sortedMarks = useMemo(() => {
    return [...marksData]
      .filter(m => m.marks !== null)
      .sort((a, b) => (b.marks || 0) - (a.marks || 0))
      .map((m, i) => ({ ...m, rank: i + 1 }));
  }, [marksData]);

  const stats = useMemo(() => {
    const validMarks = sortedMarks.filter(m => m.marks !== null);
    if (validMarks.length === 0) return null;
    const scores = validMarks.map(m => m.marks);
    const total = scores.reduce((a, b) => a + b, 0);
    const avg = Math.round(total / scores.length);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passCount = validMarks.filter(m => m.status === 'Pass').length;
    const passPercent = Math.round((passCount / validMarks.length) * 100);
    return { avg, highest, lowest, passPercent, total: validMarks.length, passCount };
  }, [sortedMarks]);

  const handleClassChange = (cls) => {
    setSelectedClass(cls);
    const first = tests.find(t => t.class === cls);
    if (first) setSelectedTest(first.id);
  };

  const handleExport = () => {
    let csv = 'Rank,Roll No,Student Name,Marks,Total,Percentage,Status\n';
    sortedMarks.forEach(s => {
      csv += `${s.rank},${s.rollNo},"${s.studentName}",${s.marks},${s.totalMarks},${s.percentage}%,${s.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test_report_${selectedTest}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={selectedClass}
          onChange={(e) => handleClassChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="11th">Class 11th</option>
          <option value="9th">Class 9th</option>
        </select>
        <select
          value={selectedTest}
          onChange={(e) => setSelectedTest(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          {availableTests.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors ml-auto"
        >
          <Download className="w-4 h-4" /> Export to Excel
        </button>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-xl font-bold text-blue-700">{stats.avg}/{currentTest?.totalMarks}</p>
              <p className="text-xs text-blue-600">Average Score</p>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-xl font-bold text-green-700">{stats.highest}/{currentTest?.totalMarks}</p>
              <p className="text-xs text-green-600">Highest Score</p>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 flex items-center gap-3">
            <TrendingDown className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-xl font-bold text-red-700">{stats.lowest}/{currentTest?.totalMarks}</p>
              <p className="text-xs text-red-600">Lowest Score</p>
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-xl font-bold text-amber-700">{stats.passPercent}%</p>
              <p className="text-xs text-amber-600">Pass Rate ({stats.passCount}/{stats.total})</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Marks</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Percentage</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedMarks.map((student) => (
              <tr key={student.studentId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                    student.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                    student.rank === 2 ? 'bg-gray-200 text-gray-700' :
                    student.rank === 3 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {student.rank}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{student.rollNo}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.studentName}</td>
                <td className="px-4 py-3 text-center text-sm font-medium text-gray-700">{student.marks}/{student.totalMarks}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${student.percentage >= 75 ? 'bg-green-500' : student.percentage >= 33 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${student.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">{student.percentage}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    student.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {student.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
