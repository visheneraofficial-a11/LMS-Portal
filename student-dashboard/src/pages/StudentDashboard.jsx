import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Tv, CalendarDays, BookOpen, PlayCircle, ClipboardList, BarChart3,
  Trophy, Clock, TrendingUp, Target, Flame, ArrowRight, Star,
  Users, Zap, ChevronRight, Brain, Award, Activity, BookMarked
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, Cell } from 'recharts';
import {
  studentProfile, dashboardStats, todayLiveClasses, testResults,
  recentActivity, motivationalQuotes, attendanceSummary, videoLectures
} from '../data/mockData';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

function CircularProgress({ value, size = 48, stroke = 4, color = '#6366f1' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-1000" />
    </svg>
  );
}

export default function StudentDashboard() {
  const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const quickStats = [
    { label: 'Classes Today', value: dashboardStats.classesToday, icon: Tv, color: 'bg-blue-500', pct: null },
    { label: 'Attendance', value: `${dashboardStats.attendance}%`, icon: BarChart3, color: 'bg-green-500', pct: dashboardStats.attendance },
    { label: 'Next Exam', value: `${dashboardStats.nextExamIn} days`, icon: ClipboardList, color: 'bg-orange-500', pct: null },
    { label: 'Class Rank', value: `#${dashboardStats.rank}/${dashboardStats.totalStudents}`, icon: Trophy, color: 'bg-purple-500', pct: ((dashboardStats.totalStudents - dashboardStats.rank) / dashboardStats.totalStudents) * 100 },
  ];

  const upcomingClasses = todayLiveClasses.filter(c => c.status === 'upcoming' || c.status === 'live').slice(0, 4);
  const recentTests = testResults.slice(0, 4);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-800 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute right-20 bottom-0 w-24 h-24 bg-white/5 rounded-full" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{greeting}, {studentProfile.name.split(' ')[0]}! 👋</h1>
              <p className="text-primary-100 mt-1 text-sm max-w-lg">"{quote}"</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-medium">
                  <Flame className="w-3.5 h-3.5 text-orange-300" /> {dashboardStats.streak}-day streak
                </span>
                <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-medium">
                  <Star className="w-3.5 h-3.5 text-yellow-300" /> Rank #{dashboardStats.rank}
                </span>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm text-primary-200">{studentProfile.class} • {studentProfile.stream}</p>
              <p className="text-xs text-primary-300 mt-1">Roll No: {studentProfile.rollNo} • {studentProfile.center}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
              </div>
              {stat.pct !== null ? (
                <div className="relative">
                  <CircularProgress value={stat.pct} color={stat.color.replace('bg-', '#').replace('-500', '')} />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-600">
                    {Math.round(stat.pct)}%
                  </span>
                </div>
              ) : (
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Classes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Tv className="w-4 h-4 text-primary-500" /> Today's Classes
              </h2>
              <Link to="/live-classes" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {upcomingClasses.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No more classes today!</p>
              ) : (
                upcomingClasses.map(cls => (
                  <div key={cls.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className={`w-1.5 h-12 rounded-full ${cls.status === 'live' ? 'bg-green-500 animate-pulse' : 'bg-primary-300'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{cls.subject}</p>
                      <p className="text-xs text-slate-500">{cls.teacher} • {cls.language}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-600">{cls.time}</p>
                      {cls.status === 'live' ? (
                        <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 font-semibold rounded-full">LIVE</span>
                      ) : (
                        <span className="text-[10px] text-slate-400">{cls.duration}</span>
                      )}
                    </div>
                    {cls.status === 'live' && (
                      <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">
                        Join
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Recent Test Scores */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-500" /> Recent Scores
              </h2>
              <Link to="/exams" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-4 space-y-2">
              {recentTests.map(test => {
                const pct = Math.round((test.obtained / test.total) * 100);
                const color = pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600';
                return (
                  <div key={test.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{test.name}</p>
                      <p className="text-xs text-slate-400">{test.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${color}`}>{test.obtained}/{test.total}</p>
                      <p className="text-[10px] text-slate-400">{pct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-green-500" /> Attendance
            </h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <CircularProgress value={attendanceSummary.percentage} size={64} stroke={6} color="#22c55e" />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700">
                  {attendanceSummary.percentage}%
                </span>
              </div>
              <div className="text-sm">
                <p className="text-slate-600">Present: <span className="font-semibold text-green-600">{attendanceSummary.present}</span>/{attendanceSummary.totalDays}</p>
                <p className="text-slate-600">Absent: <span className="font-semibold text-red-600">{attendanceSummary.absent}</span></p>
                <Link to="/attendance" className="text-xs text-primary-600 hover:underline mt-1 inline-block">View Details →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" /> Recent Activity
          </h2>
        </div>
        <div className="p-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentActivity.map((act, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  act.type === 'class' ? 'bg-blue-100 text-blue-600' :
                  act.type === 'test' ? 'bg-orange-100 text-orange-600' :
                  act.type === 'resource' ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {act.type === 'class' ? <Tv className="w-4 h-4" /> :
                   act.type === 'test' ? <ClipboardList className="w-4 h-4" /> :
                   act.type === 'resource' ? <BookOpen className="w-4 h-4" /> :
                   <PlayCircle className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-slate-700 truncate">{act.title}</p>
                  <p className="text-xs text-slate-400">{act.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/schedule', icon: CalendarDays, label: 'My Schedule', color: 'from-blue-500 to-blue-600' },
          { to: '/resources', icon: BookOpen, label: 'Resources', color: 'from-green-500 to-green-600' },
          { to: '/video-lectures', icon: PlayCircle, label: 'Video Lectures', color: 'from-purple-500 to-purple-600' },
          { to: '/ai-tools/doubts', icon: Zap, label: 'AI Study Tools', color: 'from-amber-500 to-orange-600' },
        ].map((link, i) => (
          <Link key={link.to} to={link.to}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-gradient-to-br ${link.color} rounded-xl p-4 text-white cursor-pointer shadow-sm hover:shadow-md transition-shadow`}
            >
              <link.icon className="w-6 h-6 mb-2" />
              <p className="text-sm font-medium">{link.label}</p>
              <ChevronRight className="w-4 h-4 mt-1 opacity-70" />
            </motion.div>
          </Link>
        ))}
      </div>

      {/* ─── Performance Analytics Section ─── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Score Trend Chart */}
        <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> Score Trend
            </h2>
            <Link to="/exams" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View All →</Link>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={testResults.slice(0, 6).map(t => ({
              name: t.name.length > 10 ? t.name.slice(0, 10) + '…' : t.name,
              score: Math.round((t.obtained / t.total) * 100),
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }} formatter={(v) => [`${v}%`, 'Score']} />
              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Subject-wise Radar */}
        <motion.div custom={9} variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" /> Subject Strength
            </h2>
            <Link to="/ai-tools/insights" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">AI Insights →</Link>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={attendanceSummary.subjectWise.map(s => ({
              subject: s.subject,
              attendance: s.percentage,
              fullMark: 100
            }))}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar name="Attendance" dataKey="attendance" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ─── Study Progress & Learning Stats ─── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Videos Completed', value: videoLectures.filter(v => v.progress === 100).length,
            total: videoLectures.length, icon: PlayCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Videos In Progress', value: videoLectures.filter(v => v.progress > 0 && v.progress < 100).length,
            total: videoLectures.length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Tests Average', value: `${Math.round(testResults.reduce((a, t) => a + (t.obtained / t.total) * 100, 0) / testResults.length)}%`,
            icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Best Rank', value: `#${Math.min(...testResults.filter(t => t.rank).map(t => t.rank))}`,
            icon: Trophy, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <motion.div key={stat.label} custom={i + 10} variants={fadeUp} initial="hidden" animate="visible"
            className={`${stat.bg} rounded-xl p-4 border border-slate-100`}>
            <div className="flex items-center gap-3">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className="text-xl font-bold text-slate-800">{stat.value}{stat.total ? <span className="text-sm text-slate-400 font-normal">/{stat.total}</span> : null}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Subject-wise Attendance Bars */}
      <motion.div custom={14} variants={fadeUp} initial="hidden" animate="visible"
        className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-indigo-500" /> Subject-wise Attendance
          </h2>
          <Link to="/attendance" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Full Report →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {attendanceSummary.subjectWise.map(sw => (
            <div key={sw.subject} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">{sw.subject}</span>
                <span className={`text-sm font-bold ${sw.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>{sw.percentage}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className={`h-full rounded-full transition-all duration-1000 ${sw.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${sw.percentage}%` }} />
              </div>
              <p className="text-[10px] text-slate-400">{sw.attended}/{sw.total} classes attended</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Monthly Attendance Trend */}
      <motion.div custom={15} variants={fadeUp} initial="hidden" animate="visible"
        className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-teal-500" /> Monthly Attendance Trend
        </h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={attendanceSummary.monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }} formatter={(v) => [`${v}%`, 'Attendance']} />
            <Bar dataKey="pct" radius={[4, 4, 0, 0]} name="Attendance %">
              {attendanceSummary.monthlyTrend.map((entry, idx) => (
                <Cell key={idx} fill={entry.pct >= 85 ? '#22c55e' : entry.pct >= 75 ? '#f59e0b' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
