import React, { useState, useMemo } from 'react';
import { liveClasses, subjectOptions } from '../data/mockData';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import ColumnFilter from '../components/common/ColumnFilter';
import { Video, ExternalLink, ChevronDown, ChevronUp, Clock, Users, Filter } from 'lucide-react';

export default function LiveClasses() {
  const [showPast, setShowPast] = useState(true);

  // Column filters for today's cards
  const [todaySubjectFilter, setTodaySubjectFilter] = useState(null);

  // Column filters for past table
  const [pastFilters, setPastFilters] = useState({
    subject: null,
    class: null,
    language: null,
  });

  const todayClasses = useMemo(() => {
    let classes = liveClasses.filter(c => !c.date);
    if (todaySubjectFilter) {
      classes = classes.filter(c => todaySubjectFilter.includes(c.subject));
    }
    return classes;
  }, [todaySubjectFilter]);

  const allPastClasses = useMemo(() => liveClasses.filter(c => c.date), []);

  const pastClasses = useMemo(() => {
    let classes = [...allPastClasses];
    if (pastFilters.subject) classes = classes.filter(c => pastFilters.subject.includes(c.subject));
    if (pastFilters.class) classes = classes.filter(c => pastFilters.class.includes(c.class));
    if (pastFilters.language) classes = classes.filter(c => pastFilters.language.includes(c.language));
    return classes;
  }, [allPastClasses, pastFilters]);

  const hasActiveFilters = Object.values(pastFilters).some(v => v !== null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Classes</h1>
          <p className="text-sm text-gray-500 mt-1">Today's live sessions and recent classes</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Filter today:</span>
          <ColumnFilter
            column="subject"
            label="Subject"
            data={liveClasses.filter(c => !c.date).map(c => c.subject)}
            selected={todaySubjectFilter}
            onChange={setTodaySubjectFilter}
          />
        </div>
      </div>

      {/* Today's Classes */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-600" />
          Today's Classes
          <span className="text-sm font-normal text-gray-500">
            ({new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })})
          </span>
        </h2>

        {todayClasses.length === 0 ? (
          <EmptyState title="No classes today" description="No live classes scheduled for today matching your filter" icon={Video} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {todayClasses.map((cls) => (
              <div
                key={cls.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      cls.subject === 'Physics' ? 'bg-blue-100 text-blue-600' :
                      cls.subject === 'Chemistry' ? 'bg-purple-100 text-purple-600' :
                      cls.subject === 'Maths' ? 'bg-green-100 text-green-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{cls.subject}</h3>
                      <p className="text-xs text-gray-500">{cls.topic}</p>
                    </div>
                  </div>
                  <Badge variant={cls.status.toLowerCase()} dot={cls.status === 'Live'}>
                    {cls.status}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {cls.time} - {cls.endTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      {cls.students} students
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">Class {cls.class}</span>
                    <Badge variant={cls.language.toLowerCase()}>{cls.language}</Badge>
                  </div>
                </div>

                <a
                  href={cls.youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    cls.status === 'Live'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : cls.status === 'Upcoming'
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                  {cls.status === 'Live' ? 'Join Live' : cls.status === 'Upcoming' ? 'Join Class' : 'Watch Recording'}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Classes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <button
          onClick={() => setShowPast(!showPast)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Video className="w-5 h-5 text-gray-500" />
            Past Classes (Last 7 Days)
            <span className="text-sm font-normal text-gray-400">({pastClasses.length})</span>
          </h2>
          {showPast ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {showPast && (
          <div className="border-t border-gray-100">
            {/* Clear filters */}
            {hasActiveFilters && (
              <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
                <span className="text-xs text-indigo-600">
                  <Filter className="w-3 h-3 inline mr-1" />
                  Filters active — showing {pastClasses.length} of {allPastClasses.length} classes
                </span>
                <button
                  onClick={() => setPastFilters({ subject: null, class: null, language: null })}
                  className="text-xs font-medium text-indigo-700 hover:text-indigo-900"
                >
                  Clear All
                </button>
              </div>
            )}
            {pastClasses.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">No past classes matching filters</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center gap-1">
                        Subject
                        <ColumnFilter
                          column="subject"
                          label="Subject"
                          data={allPastClasses.map(c => c.subject)}
                          selected={pastFilters.subject}
                          onChange={(val) => setPastFilters(p => ({ ...p, subject: val }))}
                        />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Topic</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center justify-center gap-1">
                        Class
                        <ColumnFilter
                          column="class"
                          label="Class"
                          data={allPastClasses.map(c => c.class)}
                          selected={pastFilters.class}
                          onChange={(val) => setPastFilters(p => ({ ...p, class: val }))}
                        />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center justify-center gap-1">
                        Language
                        <ColumnFilter
                          column="language"
                          label="Language"
                          data={allPastClasses.map(c => c.language)}
                          selected={pastFilters.language}
                          onChange={(val) => setPastFilters(p => ({ ...p, language: val }))}
                        />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Students</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pastClasses.map((cls) => (
                    <tr key={cls.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{cls.subject}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{cls.topic}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{cls.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{cls.time}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{cls.class}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={cls.language.toLowerCase()}>{cls.language}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{cls.students}</td>
                      <td className="px-4 py-3 text-center">
                        <a
                          href={cls.youtubeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Watch
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
