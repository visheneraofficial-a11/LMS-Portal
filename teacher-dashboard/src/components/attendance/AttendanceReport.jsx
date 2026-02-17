import React, { useState, useMemo } from 'react';
import { attendanceData, classOptions } from '../../data/mockData';
import StudentAttendanceDetail from './StudentAttendanceDetail';
import { Download, Calendar, Eye, UserCheck, UserX, TrendingUp } from 'lucide-react';

const months = [
  { value: '2026-02', label: 'February 2026' },
  { value: '2026-01', label: 'January 2026' },
];

export default function AttendanceReport() {
  const [selectedClass, setSelectedClass] = useState('11th-Hindi');
  const [selectedMonth, setSelectedMonth] = useState('2026-02');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const data = attendanceData[selectedClass] || [];
  const daysInMonth = selectedMonth === '2026-02' ? 28 : 31;
  const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const summaryData = useMemo(() => {
    let result = data.map(student => {
      let present = 0, absent = 0, holidays = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const val = student.days[d];
        if (val === 'present') present++;
        else if (val === 'absent') absent++;
        else if (val === 'holiday') holidays++;
      }
      const workingDays = present + absent;
      const percentage = workingDays > 0 ? Math.round((present / workingDays) * 100) : 0;
      return { ...student, present, absent, holidays, percentage };
    });

    if (sortField) {
      result.sort((a, b) => {
        const va = a[sortField], vb = b[sortField];
        if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
        return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
      });
    }

    return result;
  }, [data, daysInMonth, sortField, sortDir]);

  // Class-level stats
  const classStats = useMemo(() => {
    if (summaryData.length === 0) return { avg: 0, above75: 0, below75: 0, perfect: 0 };
    const avg = Math.round(summaryData.reduce((s, st) => s + st.percentage, 0) / summaryData.length);
    const above75 = summaryData.filter(s => s.percentage >= 75).length;
    const below75 = summaryData.filter(s => s.percentage < 75).length;
    const perfect = summaryData.filter(s => s.percentage === 100).length;
    return { avg, above75, below75, perfect };
  }, [summaryData]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleExport = () => {
    let csv = 'Roll No,Student Name,';
    dayHeaders.forEach(d => { csv += `Day ${d},`; });
    csv += 'Present,Absent,Percentage\n';

    summaryData.forEach(s => {
      csv += `${s.rollNo},"${s.studentName}",`;
      dayHeaders.forEach(d => {
        const v = s.days[d];
        csv += `${v === 'present' ? 'P' : v === 'absent' ? 'A' : v === 'holiday' ? 'H' : '-'},`;
      });
      csv += `${s.present},${s.absent},${s.percentage}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedClass}_${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cellColor = (val) => {
    if (val === 'present') return 'bg-green-500 text-white';
    if (val === 'absent') return 'bg-red-500 text-white';
    if (val === 'holiday') return 'bg-gray-300 text-gray-600';
    return 'bg-gray-100 text-gray-400';
  };

  const SortIcon = ({ field }) => (
    <span className="ml-1 inline-flex flex-col text-[8px] leading-none">
      <span className={sortField === field && sortDir === 'asc' ? 'text-indigo-600' : 'text-gray-300'}>▲</span>
      <span className={sortField === field && sortDir === 'desc' ? 'text-indigo-600' : 'text-gray-300'}>▼</span>
    </span>
  );

  return (
    <div>
      {selectedStudent && (
        <StudentAttendanceDetail student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}

      {/* Class-level Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-blue-700">{classStats.avg}%</p>
            <p className="text-[10px] text-blue-600">Class Average</p>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-green-700">{classStats.above75}</p>
            <p className="text-[10px] text-green-600">Above 75%</p>
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
            <UserX className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-red-700">{classStats.below75}</p>
            <p className="text-[10px] text-red-600">Below 75%</p>
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-purple-700">{classStats.perfect}</p>
            <p className="text-[10px] text-purple-600">100% Attendance</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          {classOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          {months.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors ml-auto"
        >
          <Download className="w-4 h-4" /> Export to Excel
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-green-500" /> Present
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-red-500" /> Absent
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-gray-300" /> Holiday
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-gray-100" /> No Data
        </span>
        <span className="flex items-center gap-1.5 ml-4 text-indigo-600 font-medium">
          <Eye className="w-3.5 h-3.5" /> Click student name for 30-day detail
        </span>
      </div>

      {/* Attendance Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-3 py-2 text-left font-medium text-gray-500 sticky left-0 bg-gray-50 z-10 min-w-[40px] cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('rollNo')}
              >
                # <SortIcon field="rollNo" />
              </th>
              <th
                className="px-3 py-2 text-left font-medium text-gray-500 sticky left-[40px] bg-gray-50 z-10 min-w-[140px] cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('studentName')}
              >
                Name <SortIcon field="studentName" />
              </th>
              {dayHeaders.map(d => (
                <th key={d} className="px-1 py-2 text-center font-medium text-gray-500 min-w-[28px]">{d}</th>
              ))}
              <th className="px-2 py-2 text-center font-medium text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort('present')}>
                P <SortIcon field="present" />
              </th>
              <th className="px-2 py-2 text-center font-medium text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort('absent')}>
                A <SortIcon field="absent" />
              </th>
              <th className="px-2 py-2 text-center font-medium text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => handleSort('percentage')}>
                % <SortIcon field="percentage" />
              </th>
              <th className="px-2 py-2 text-center font-medium text-gray-500">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {summaryData.map((student) => (
              <tr key={student.studentId} className="hover:bg-blue-50/50 group">
                <td className="px-3 py-2 text-gray-600 sticky left-0 bg-white z-10 group-hover:bg-blue-50/50">{student.rollNo}</td>
                <td
                  className="px-3 py-2 font-medium text-indigo-700 sticky left-[40px] bg-white z-10 truncate max-w-[140px] cursor-pointer hover:underline group-hover:bg-blue-50/50"
                  onClick={() => setSelectedStudent(student)}
                  title="Click to view 30-day attendance detail"
                >
                  {student.studentName}
                </td>
                {dayHeaders.map(d => (
                  <td key={d} className="px-0.5 py-1 text-center">
                    <span className={`inline-block w-6 h-6 rounded text-[10px] leading-6 font-medium ${cellColor(student.days[d])}`}>
                      {student.days[d] === 'present' ? 'P' : student.days[d] === 'absent' ? 'A' : student.days[d] === 'holiday' ? 'H' : '-'}
                    </span>
                  </td>
                ))}
                <td className="px-2 py-2 text-center font-medium text-green-700">{student.present}</td>
                <td className="px-2 py-2 text-center font-medium text-red-700">{student.absent}</td>
                <td className={`px-2 py-2 text-center font-bold ${student.percentage >= 75 ? 'text-green-700' : 'text-red-700'}`}>
                  {student.percentage}%
                </td>
                <td className="px-2 py-2 text-center">
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                    title="View 30-day login/logout details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
