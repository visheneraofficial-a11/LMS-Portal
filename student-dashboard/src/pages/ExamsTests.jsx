import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Clock, Award, TrendingUp, AlertTriangle, ChevronRight,
  Play, CheckCircle, XCircle, Timer, BarChart3, Target, ArrowRight,
  Calendar, FileText, Star, Minus, X, Brain, Sparkles, ArrowUpRight,
  ArrowDownRight, Lightbulb, BookOpen, Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { testResults, upcomingExams } from '../data/mockData';

const tabs = ['Results', 'Upcoming', 'Analytics'];

// AI-powered analysis generation (simulated - in production this calls LLM API)
function generateAIAnalysis(test) {
  const pct = Math.round((test.obtained / test.total) * 100);
  const subjectAnalysis = [
    { subject: 'Physics', obtained: Math.round(test.obtained * 0.25), total: Math.round(test.total * 0.25), strength: pct > 30 ? 'Mechanics basics' : 'Needs improvement', weakness: 'Thermodynamics & Waves' },
    { subject: 'Chemistry', obtained: Math.round(test.obtained * 0.25), total: Math.round(test.total * 0.25), strength: 'Periodic Table', weakness: pct > 30 ? 'Organic Reactions' : 'All areas need focus' },
    { subject: 'Biology', obtained: Math.round(test.obtained * 0.30), total: Math.round(test.total * 0.30), strength: 'Cell Biology', weakness: 'Human Physiology' },
    { subject: 'Zoology', obtained: Math.round(test.obtained * 0.20), total: Math.round(test.total * 0.20), strength: 'Animal Kingdom', weakness: 'Genetics & Evolution' },
  ];

  const recommendations = [];
  if (pct < 30) {
    recommendations.push({ priority: 'Critical', icon: 'alert', text: 'Focus on NCERT textbooks first. Build strong fundamentals before attempting MCQs.', subject: 'General' });
    recommendations.push({ priority: 'High', icon: 'book', text: 'Spend 2 hours daily on Physics numerical practice. Start from basic problems.', subject: 'Physics' });
    recommendations.push({ priority: 'High', icon: 'brain', text: 'Use flashcards for Biology terminology. Revise diagrams from NCERT daily.', subject: 'Biology' });
  } else if (pct < 60) {
    recommendations.push({ priority: 'High', icon: 'target', text: 'Good progress! Focus on weak subjects identified below to improve overall score.', subject: 'General' });
    recommendations.push({ priority: 'Medium', icon: 'book', text: 'Practice previous year questions for Organic Chemistry reactions.', subject: 'Chemistry' });
  } else {
    recommendations.push({ priority: 'Medium', icon: 'star', text: 'Excellent performance! Focus on time management to reduce negative marking.', subject: 'General' });
    recommendations.push({ priority: 'Low', icon: 'zap', text: 'Try solving full-length mock tests under timed conditions.', subject: 'General' });
  }

  const studyPlan = [
    { day: 'Week 1', focus: `Revise weak topics: ${subjectAnalysis.find(s => s.obtained / s.total < 0.3)?.weakness || 'Mixed revision'}`, hours: '3 hrs/day' },
    { day: 'Week 2', focus: 'Solve 50 MCQs daily from identified weak areas', hours: '4 hrs/day' },
    { day: 'Week 3', focus: 'Full-length mock test + analysis. Focus on negative marking reduction.', hours: '5 hrs/day' },
  ];

  return { pct, subjectAnalysis, recommendations, studyPlan };
}

export default function ExamsTests() {
  const [activeTab, setActiveTab] = useState('Results');
  const [selectedTest, setSelectedTest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const openTestDetail = (test) => {
    setSelectedTest(test);
    setShowDetailModal(true);
    setAiLoading(true);
    setAiAnalysis(null);
    // Simulate AI analysis loading
    setTimeout(() => {
      setAiAnalysis(generateAIAnalysis(test));
      setAiLoading(false);
    }, 1500);
  };

  // Analytics data
  const chartData = testResults.map(t => ({
    name: t.name.length > 12 ? t.name.slice(0, 12) + '…' : t.name,
    score: Math.round((t.obtained / t.total) * 100),
    obtained: t.obtained,
    total: t.total
  }));

  const avgScore = Math.round(testResults.reduce((acc, t) => acc + (t.obtained / t.total) * 100, 0) / testResults.length);
  const bestScore = Math.max(...testResults.map(t => Math.round((t.obtained / t.total) * 100)));
  const worstScore = Math.min(...testResults.map(t => Math.round((t.obtained / t.total) * 100)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Exams & Tests</h1>
        <p className="text-sm text-slate-500 mt-1">Results, upcoming exams, and AI-powered performance analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tests Taken', value: testResults.length, icon: ClipboardList, color: 'bg-blue-500' },
          { label: 'Average Score', value: `${avgScore}%`, icon: Target, color: 'bg-green-500' },
          { label: 'Best Score', value: `${bestScore}%`, icon: Award, color: 'bg-amber-500' },
          { label: 'Upcoming', value: upcomingExams.length, icon: Calendar, color: 'bg-purple-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}>{tab}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Results Tab */}
        {activeTab === 'Results' && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Test Name</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Subject</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Score</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">%</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Rank</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Status</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults.map(test => {
                      const pct = Math.round((test.obtained / test.total) * 100);
                      const color = pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600';
                      const bgColor = pct >= 70 ? 'bg-green-50' : pct >= 50 ? 'bg-amber-50' : 'bg-red-50';
                      return (
                        <tr key={test.id} className="border-t border-slate-50 hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <button onClick={() => openTestDetail(test)} className="text-left hover:text-primary-600 transition-colors">
                              <p className="font-medium text-slate-800 hover:text-primary-600">{test.name}</p>
                              <p className="text-xs text-slate-400">{test.type}</p>
                            </button>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{test.date}</td>
                          <td className="px-4 py-3 text-slate-600">{test.subject}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-bold ${color}`}>{test.obtained}</span>
                            <span className="text-slate-400">/{test.total}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${bgColor} ${color}`}>{pct}%</span>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-600">
                            {test.rank ? `#${test.rank}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {pct >= 70 ? (
                              <span className="flex items-center gap-1 justify-center text-green-600 text-xs"><CheckCircle className="w-3.5 h-3.5" /> Pass</span>
                            ) : pct >= 40 ? (
                              <span className="flex items-center gap-1 justify-center text-amber-600 text-xs"><AlertTriangle className="w-3.5 h-3.5" /> Average</span>
                            ) : (
                              <span className="flex items-center gap-1 justify-center text-red-600 text-xs"><XCircle className="w-3.5 h-3.5" /> Below Avg</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => openTestDetail(test)}
                              className="px-3 py-1 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 mx-auto">
                              <Brain className="w-3 h-3" /> AI Analysis
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Upcoming Tab */}
        {activeTab === 'Upcoming' && (
          <motion.div key="upcoming" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {upcomingExams.map(exam => {
              const daysLeft = Math.ceil((new Date(exam.dateRaw) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <div key={exam.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">{exam.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">{exam.subject}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      daysLeft <= 3 ? 'bg-red-100 text-red-700' : daysLeft <= 7 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Today!'}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-4 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {exam.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {exam.time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FileText className="w-4 h-4 text-slate-400" />
                      {exam.totalMarks} marks
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Timer className="w-4 h-4 text-slate-400" />
                      {exam.duration}
                    </div>
                  </div>
                  {exam.syllabus && (
                    <div className="mt-3 text-xs text-slate-500">
                      <span className="font-medium">Syllabus:</span> {exam.syllabus}
                    </div>
                  )}
                </div>
              );
            })}
            {upcomingExams.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">No upcoming exams</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'Analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Score Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} formatter={(value) => [`${value}%`, 'Score']} />
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Score Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} formatter={(value) => [`${value}%`, 'Score']} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.score >= 70 ? '#22c55e' : entry.score >= 50 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ AI Test Analysis Modal ═══ */}
      {showDetailModal && selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-800 px-6 py-5 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full" />
              <button onClick={() => setShowDetailModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Brain className="w-5 h-5" /> AI Test Analysis
                  </h2>
                  <p className="text-primary-100 text-sm mt-1">{selectedTest.name}</p>
                  <p className="text-primary-200 text-xs mt-0.5">{selectedTest.date} • {selectedTest.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{selectedTest.obtained}<span className="text-lg text-primary-200">/{selectedTest.total}</span></p>
                  <p className="text-primary-200 text-sm">{Math.round((selectedTest.obtained / selectedTest.total) * 100)}% Score</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-500">Marks Obtained</p>
                  <p className="text-2xl font-bold text-slate-800">{selectedTest.obtained}/{selectedTest.total}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-500">Percentage</p>
                  <p className="text-2xl font-bold text-primary-600">{Math.round((selectedTest.obtained / selectedTest.total) * 100)}%</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-500">Negative Marks</p>
                  <p className="text-2xl font-bold text-red-600">-{selectedTest.negative || 0}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-500">Rank</p>
                  <p className="text-2xl font-bold text-amber-600">#{selectedTest.rank || 'N/A'}</p>
                </div>
              </div>

              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary-500" />
                    AI is analyzing your performance...
                  </p>
                </div>
              ) : aiAnalysis && (
                <>
                  {/* Subject-wise Analysis with Radar Chart */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-slate-100 p-5">
                      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary-500" /> Subject-wise Performance
                      </h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={aiAnalysis.subjectAnalysis.map(s => ({
                          subject: s.subject,
                          score: s.total > 0 ? Math.round((s.obtained / s.total) * 100) : 0,
                          fullMark: 100
                        }))}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                          <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-100 p-5">
                      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4 text-orange-500" /> Subject Breakdown
                      </h3>
                      <div className="space-y-4">
                        {aiAnalysis.subjectAnalysis.map(s => {
                          const sPct = s.total > 0 ? Math.round((s.obtained / s.total) * 100) : 0;
                          return (
                            <div key={s.subject}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-slate-700">{s.subject}</span>
                                <span className={`text-sm font-bold ${sPct >= 50 ? 'text-green-600' : sPct >= 30 ? 'text-amber-600' : 'text-red-600'}`}>{s.obtained}/{s.total} ({sPct}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div className={`h-full rounded-full transition-all duration-1000 ${sPct >= 50 ? 'bg-green-500' : sPct >= 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                                  style={{ width: `${sPct}%` }} />
                              </div>
                              <div className="flex justify-between mt-1">
                                <span className="text-[10px] text-green-600 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> {s.strength}</span>
                                <span className="text-[10px] text-red-500 flex items-center gap-0.5"><ArrowDownRight className="w-3 h-3" /> {s.weakness}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  <div className="bg-gradient-to-r from-primary-50 to-indigo-50 rounded-xl border border-primary-100 p-5">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary-500" /> AI Recommendations
                      <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">Powered by AI</span>
                    </h3>
                    <div className="space-y-3">
                      {aiAnalysis.recommendations.map((rec, i) => (
                        <div key={i} className={`bg-white rounded-lg p-4 border-l-4 ${
                          rec.priority === 'Critical' ? 'border-l-red-500' :
                          rec.priority === 'High' ? 'border-l-amber-500' :
                          rec.priority === 'Medium' ? 'border-l-blue-500' : 'border-l-green-500'
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              rec.priority === 'Critical' ? 'bg-red-100 text-red-600' :
                              rec.priority === 'High' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {rec.icon === 'alert' ? <AlertTriangle className="w-4 h-4" /> :
                               rec.icon === 'book' ? <BookOpen className="w-4 h-4" /> :
                               rec.icon === 'brain' ? <Brain className="w-4 h-4" /> :
                               rec.icon === 'target' ? <Target className="w-4 h-4" /> :
                               rec.icon === 'star' ? <Star className="w-4 h-4" /> :
                               <Zap className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  rec.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                  rec.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                                  rec.priority === 'Medium' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                }`}>{rec.priority} Priority</span>
                                <span className="text-[10px] text-slate-400">{rec.subject}</span>
                              </div>
                              <p className="text-sm text-slate-700">{rec.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Study Plan */}
                  <div className="bg-white rounded-xl border border-slate-100 p-5">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" /> AI-Generated Study Plan
                    </h3>
                    <div className="space-y-3">
                      {aiAnalysis.studyPlan.map((plan, i) => (
                        <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-slate-50">
                          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-slate-700">{plan.day}</p>
                              <span className="text-xs text-primary-600 font-medium">{plan.hours}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{plan.focus}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Info Banner */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-500">
                        <p className="font-semibold text-slate-600 mb-1">How AI Analysis Works</p>
                        <p>This analysis is generated using AI that evaluates your test performance patterns, identifies subject-wise strengths and weaknesses, and creates personalized study recommendations. The AI considers your score distribution, negative marking patterns, and historical performance to generate actionable insights. In production, this is powered by an LLM (Large Language Model) API integrated via the backend.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
