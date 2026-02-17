import React, { useState, useMemo } from 'react';
import { tests, testMarks, classOptions } from '../../data/mockData';
import { useToast } from '../common/Toast';
import { Save, AlertCircle } from 'lucide-react';

export default function UpdateMarks() {
  const [selectedClass, setSelectedClass] = useState('11th');
  const [selectedTest, setSelectedTest] = useState('T001');
  const { showToast, ToastComponent } = useToast();

  const availableTests = tests.filter(t => t.class === selectedClass);

  const currentTest = tests.find(t => t.id === selectedTest);
  const marksData = testMarks[selectedTest] || [];

  const [editedMarks, setEditedMarks] = useState(() => {
    const state = {};
    marksData.forEach(m => { state[m.studentId] = m.marks || ''; });
    return state;
  });
  const [errors, setErrors] = useState({});

  const handleClassChange = (cls) => {
    setSelectedClass(cls);
    const first = tests.find(t => t.class === cls);
    if (first) {
      setSelectedTest(first.id);
      const marks = testMarks[first.id] || [];
      const state = {};
      marks.forEach(m => { state[m.studentId] = m.marks || ''; });
      setEditedMarks(state);
    }
    setErrors({});
  };

  const handleTestChange = (testId) => {
    setSelectedTest(testId);
    const marks = testMarks[testId] || [];
    const state = {};
    marks.forEach(m => { state[m.studentId] = m.marks || ''; });
    setEditedMarks(state);
    setErrors({});
  };

  const handleMarkChange = (studentId, value) => {
    const numVal = value === '' ? '' : parseInt(value, 10);
    setEditedMarks(prev => ({ ...prev, [studentId]: numVal }));

    if (currentTest && numVal !== '' && numVal > currentTest.totalMarks) {
      setErrors(prev => ({ ...prev, [studentId]: `Max ${currentTest.totalMarks}` }));
    } else {
      setErrors(prev => {
        const next = { ...prev };
        delete next[studentId];
        return next;
      });
    }
  };

  const getStatus = (marks) => {
    if (marks === '' || marks === null || marks === undefined) return null;
    if (!currentTest) return null;
    return marks >= currentTest.totalMarks * 0.33 ? 'Pass' : 'Fail';
  };

  const handleSubmit = () => {
    if (Object.keys(errors).length > 0) {
      showToast('Please fix validation errors before submitting', 'error');
      return;
    }
    showToast(`Marks saved for ${currentTest?.name || 'test'} successfully!`);
  };

  return (
    <div>
      {ToastComponent}

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
          onChange={(e) => handleTestChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          {availableTests.map(t => (
            <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
          ))}
        </select>
      </div>

      {currentTest && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-sm text-blue-800">
          <strong>{currentTest.name}</strong> — {currentTest.subject} | Total Marks: {currentTest.totalMarks} | Date: {currentTest.date} |
          Status: <span className={`font-medium ${currentTest.status === 'Graded' ? 'text-green-700' : currentTest.status === 'Upcoming' ? 'text-blue-700' : 'text-yellow-700'}`}>
            {currentTest.status}
          </span>
        </div>
      )}

      {/* Marks Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Marks Obtained</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">%</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {marksData.map((student) => {
              const marks = editedMarks[student.studentId];
              const status = getStatus(marks);
              const pct = marks !== '' && marks !== null && currentTest
                ? Math.round((marks / currentTest.totalMarks) * 100)
                : null;
              const hasError = errors[student.studentId];

              return (
                <tr key={student.studentId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{student.rollNo}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.studentName}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="relative inline-block">
                      <input
                        type="number"
                        min="0"
                        max={currentTest?.totalMarks || 100}
                        value={marks}
                        onChange={(e) => handleMarkChange(student.studentId, e.target.value)}
                        className={`w-20 px-2 py-1 text-center border rounded-md text-sm focus:outline-none focus:ring-2 ${
                          hasError
                            ? 'border-red-400 focus:ring-red-300 bg-red-50'
                            : 'border-gray-300 focus:ring-primary-300'
                        }`}
                      />
                      {hasError && (
                        <div className="absolute -bottom-5 left-0 right-0 text-[10px] text-red-600 flex items-center justify-center gap-0.5">
                          <AlertCircle className="w-3 h-3" /> {hasError}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-500">{currentTest?.totalMarks}</td>
                  <td className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    {pct !== null ? `${pct}%` : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {status && (
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {status}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" /> Submit Marks
        </button>
      </div>
    </div>
  );
}
