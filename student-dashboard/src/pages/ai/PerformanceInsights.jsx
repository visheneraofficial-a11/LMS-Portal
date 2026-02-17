import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, TrendingUp, TrendingDown, Target, Brain, AlertTriangle,
  CheckCircle, BookOpen, ArrowUpRight, BarChart3, Award
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  LineChart, Line
} from 'recharts';
import { testResults, attendanceSummary } from '../../data/mockData';

export default function PerformanceInsights() {
  const [generating, setGenerating] = useState(false);

  // Subject performance from test results
  const subjectScores = {};
  testResults.forEach(t => {
    if (!subjectScores[t.subject]) subjectScores[t.subject] = { total: 0, obtained: 0, count: 0 };
    subjectScores[t.subject].total += t.total;
    subjectScores[t.subject].obtained += t.obtained;
    subjectScores[t.subject].count++;
  });

  const radarData = Object.entries(subjectScores).map(([subject, data]) => ({
    subject: subject.length > 10 ? subject.slice(0, 10) : subject,
    score: Math.round((data.obtained / data.total) * 100),
    fullMark: 100,
  }));

  const trendData = testResults.map(t => ({
    name: t.name.length > 8 ? t.name.slice(0, 8) + '…' : t.name,
    score: Math.round((t.obtained / t.total) * 100),
  }));

  const avgScore = Math.round(testResults.reduce((acc, t) => acc + (t.obtained / t.total), 0) / testResults.length * 100);

  const strengths = Object.entries(subjectScores)
    .map(([s, d]) => ({ subject: s, pct: Math.round((d.obtained / d.total) * 100) }))
    .sort((a, b) => b.pct - a.pct);

  const insights = [
    {
      type: 'strength',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-700',
      title: `Strong in ${strengths[0]?.subject || 'N/A'}`,
      desc: `Your average score is ${strengths[0]?.pct || 0}% — keep this momentum going!`
    },
    {
      type: 'weakness',
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-700',
      title: `Improve ${strengths[strengths.length - 1]?.subject || 'N/A'}`,
      desc: `Your score is ${strengths[strengths.length - 1]?.pct || 0}%. Focus on practice problems and concept clarity.`
    },
    {
      type: 'trend',
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-700',
      title: 'Performance Trending',
      desc: trendData.length >= 2
        ? (trendData[trendData.length - 1].score > trendData[trendData.length - 2].score
          ? `Your recent scores show improvement (+${trendData[trendData.length - 1].score - trendData[trendData.length - 2].score}%)`
          : `Your recent scores dipped. Consider revising weak areas.`)
        : 'Take more tests to see trends.'
    },
    {
      type: 'attendance',
      icon: BarChart3,
      color: attendanceSummary.percentage >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
      title: `Attendance: ${attendanceSummary.percentage}%`,
      desc: attendanceSummary.percentage >= 75
        ? 'Good attendance! Consistent attendance correlates with better scores.'
        : 'Your attendance is below 75%. This may impact your learning.'
    }
  ];

  const predictions = [
    { exam: 'AIET-6', predicted: '145-165', max: 200, confidence: 72 },
    { exam: 'Class Test - Physics', predicted: '35-42', max: 50, confidence: 68 },
    { exam: 'NEET (Projected)', predicted: '480-540', max: 720, confidence: 55 },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Performance Insights</h1>
          <p className="text-sm text-slate-500 mt-1">AI-powered analysis of your academic performance</p>
        </div>
        <button
          onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 2000); }}
          disabled={generating}
          className="px-4 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          {generating ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Refresh Analysis</>
          )}
        </button>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm">Overall Performance Score</p>
            <p className="text-4xl font-bold mt-1">{avgScore}%</p>
            <p className="text-primary-200 text-xs mt-1">Based on {testResults.length} tests</p>
          </div>
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center">
            <Award className="w-10 h-10 text-white/70" />
          </div>
        </div>
      </div>

      {/* AI Insights Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex gap-3"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${insight.color}`}>
              <insight.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">{insight.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{insight.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary-500" /> Subject-wise Analysis
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Score Trend */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" /> Score Trend
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Predictions */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-500" /> AI Score Predictions
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {predictions.map((pred, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 font-medium">{pred.exam}</p>
              <p className="text-xl font-bold text-primary-600 mt-1">{pred.predicted}</p>
              <p className="text-[10px] text-slate-400">out of {pred.max}</p>
              <div className="mt-2">
                <p className="text-[10px] text-slate-400 mb-1">Confidence: {pred.confidence}%</p>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pred.confidence}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-3 italic">
          * Predictions based on your test history, attendance, and study patterns. Actual results may vary.
        </p>
      </div>

      {/* Subject Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Subject Performance Details</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">Subject</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-slate-500">Tests</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-slate-500">Avg Score</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-slate-500">Progress</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {strengths.map(s => (
              <tr key={s.subject} className="border-t border-slate-50">
                <td className="px-4 py-3 font-medium text-slate-700">{s.subject}</td>
                <td className="px-4 py-3 text-center text-slate-600">{subjectScores[s.subject].count}</td>
                <td className="px-4 py-3 text-center font-bold text-slate-800">{s.pct}%</td>
                <td className="px-4 py-3">
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`h-full rounded-full ${s.pct >= 70 ? 'bg-green-500' : s.pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${s.pct}%` }} />
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  {s.pct >= 70 ? (
                    <span className="text-green-600 text-xs flex items-center justify-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Good</span>
                  ) : s.pct >= 50 ? (
                    <span className="text-amber-600 text-xs flex items-center justify-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Average</span>
                  ) : (
                    <span className="text-red-600 text-xs flex items-center justify-center gap-1"><TrendingDown className="w-3.5 h-3.5" /> Improve</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
