import React from 'react';
import { X, TrendingUp, TrendingDown, Target, Brain, Sparkles, AlertTriangle, Award, BarChart3, BookOpen, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

// Generate detailed AI analysis for a student
function generateAnalysis(student) {
  const seed = student.rollNo;
  const r = (min, max) => Math.floor(((seed * 9301 + 49297) % 233280) / 233280 * (max - min) + min);
  
  const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
  const subjectScores = subjects.map((s, i) => {
    const scores = Array.from({ length: 5 }, (_, j) => r(35 + i * 5, 95 - i * 3) + j * 2);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const trend = scores[4] - scores[0];
    return { subject: s, scores, average: avg, trend, latest: scores[4] };
  });

  const overallAvg = Math.round(subjectScores.reduce((a, s) => a + s.average, 0) / subjectScores.length);
  const strengths = subjectScores.filter(s => s.average >= 70).map(s => s.subject);
  const weaknesses = subjectScores.filter(s => s.average < 55).map(s => s.subject);
  const improving = subjectScores.filter(s => s.trend > 5).map(s => s.subject);
  const declining = subjectScores.filter(s => s.trend < -5).map(s => s.subject);

  // Panic moments detection
  const panicTests = subjectScores.flatMap(s => 
    s.scores.map((score, i) => ({ subject: s.subject, test: `Test ${i + 1}`, score, avg: s.average }))
      .filter(t => t.score < t.avg - 15)
  );

  // Study patterns
  const consistencyScore = Math.round(100 - subjectScores.reduce((a, s) => {
    const variance = s.scores.reduce((v, sc) => v + Math.pow(sc - s.average, 2), 0) / s.scores.length;
    return a + Math.sqrt(variance);
  }, 0) / subjectScores.length);

  // AI Recommendations
  const recommendations = [];
  if (weaknesses.length > 0) recommendations.push(`Focus extra time on ${weaknesses.join(' and ')} - consider additional practice problems and concept revision.`);
  if (declining.length > 0) recommendations.push(`${declining.join(' and ')} scores are declining - schedule remedial sessions and identify specific weak topics.`);
  if (panicTests.length > 0) recommendations.push('Significant score drops detected in some tests - may need help with exam anxiety management and time management skills.');
  if (strengths.length > 0) recommendations.push(`Continue building on ${strengths.join(' and ')} strengths - consider advanced problems to push performance further.`);
  if (consistencyScore < 60) recommendations.push('Improve consistency by maintaining regular study schedules and daily revision habits.');
  if (student.attendancePercent < 80) recommendations.push('Attendance is below 80% - regular class attendance is correlated with better academic performance.');
  recommendations.push('Participate in weekly doubt-clearing sessions to address gaps in understanding early.');

  return {
    subjectScores,
    overallAvg,
    strengths,
    weaknesses,
    improving,
    declining,
    panicTests,
    consistencyScore,
    recommendations,
    testNames: ['Unit Test 1', 'Weekly Quiz 1', 'Mid Term', 'Unit Test 2', 'Weekly Quiz 2'],
    percentileRank: r(20, 95),
    classRank: r(1, 40),
    totalInClass: 40,
  };
}

const TrendIcon = ({ value }) => {
  if (value > 5) return <ArrowUpRight className="w-4 h-4 text-green-600" />;
  if (value < -5) return <ArrowDownRight className="w-4 h-4 text-red-600" />;
  return <Minus className="w-4 h-4 text-gray-400" />;
};

const ScoreBar = ({ score, max = 100, color = 'primary' }) => (
  <div className="w-full bg-gray-100 rounded-full h-2">
    <div
      className={`h-2 rounded-full transition-all duration-500 ${
        score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500'
      }`}
      style={{ width: `${Math.min((score / max) * 100, 100)}%` }}
    />
  </div>
);

export default function StudentAIAnalysis({ student, onClose }) {
  const analysis = React.useMemo(() => generateAnalysis(student), [student]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{student.name}</h2>
              <p className="text-xs text-gray-500">Roll No: {student.rollNo} · Class {student.class} ({student.language})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              A Data-Driven Analysis of Examination Performance
              <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">AI</span>
            </h3>
            <p className="text-xs text-gray-600 mt-1">Strengths, Weaknesses, and Pattern Identification</p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
              <p className="text-2xl font-bold text-blue-700">{analysis.overallAvg}%</p>
              <p className="text-xs text-blue-600 mt-0.5">Overall Average</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
              <p className="text-2xl font-bold text-green-700">#{analysis.classRank}</p>
              <p className="text-xs text-green-600 mt-0.5">Class Rank / {analysis.totalInClass}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
              <p className="text-2xl font-bold text-purple-700">{analysis.percentileRank}th</p>
              <p className="text-xs text-purple-600 mt-0.5">Percentile</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
              <p className="text-2xl font-bold text-amber-700">{analysis.consistencyScore}%</p>
              <p className="text-xs text-amber-600 mt-0.5">Consistency Score</p>
            </div>
          </div>

          {/* Subject-wise Performance */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-primary-600" />
              Subject-wise Score Comparison
            </h4>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase">Average</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase">Latest</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase">Trend</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {analysis.subjectScores.map((s, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            s.subject === 'Physics' ? 'bg-blue-500' :
                            s.subject === 'Chemistry' ? 'bg-purple-500' :
                            s.subject === 'Mathematics' ? 'bg-green-500' : 'bg-amber-500'
                          }`} />
                          <span className="text-sm font-medium text-gray-900">{s.subject}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-bold ${s.average >= 70 ? 'text-green-700' : s.average >= 50 ? 'text-amber-700' : 'text-red-700'}`}>
                          {s.average}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-gray-700">{s.latest}%</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <TrendIcon value={s.trend} />
                          <span className={`text-xs font-medium ${s.trend > 0 ? 'text-green-600' : s.trend < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            {s.trend > 0 ? '+' : ''}{s.trend}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell w-32">
                        <ScoreBar score={s.average} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Test-wise Trend Comparison */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary-600" />
              Test-wise Trend Comparison
            </h4>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Test</th>
                    {analysis.subjectScores.map(s => (
                      <th key={s.subject} className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase">{s.subject.substring(0, 4)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {analysis.testNames.map((test, tIdx) => (
                    <tr key={tIdx} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-sm font-medium text-gray-700">{test}</td>
                      {analysis.subjectScores.map(s => {
                        const score = s.scores[tIdx];
                        return (
                          <td key={s.subject} className="px-3 py-2.5 text-center">
                            <span className={`text-sm font-medium ${
                              score >= 80 ? 'text-green-700 bg-green-50' :
                              score >= 60 ? 'text-blue-700 bg-blue-50' :
                              score >= 40 ? 'text-amber-700 bg-amber-50' :
                              'text-red-700 bg-red-50'
                            } px-2 py-0.5 rounded`}>
                              {score}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <h4 className="text-sm font-bold text-green-800 flex items-center gap-2 mb-3">
                <Award className="w-4 h-4" /> Strengths
              </h4>
              {analysis.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-green-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Strong performance in {s}
                    </li>
                  ))}
                  {analysis.improving.length > 0 && analysis.improving.map((s, i) => (
                    <li key={`imp-${i}`} className="flex items-center gap-2 text-sm text-green-700">
                      <TrendingUp className="w-3.5 h-3.5" /> Improving steadily in {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-green-600">Needs to develop strong areas across subjects</p>
              )}
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <h4 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4" /> Weaknesses
              </h4>
              {analysis.weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {analysis.weaknesses.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-red-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Needs improvement in {s}
                    </li>
                  ))}
                  {analysis.declining.length > 0 && analysis.declining.map((s, i) => (
                    <li key={`dec-${i}`} className="flex items-center gap-2 text-sm text-red-700">
                      <TrendingDown className="w-3.5 h-3.5" /> Declining performance in {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-red-600">No critical weaknesses identified</p>
              )}
            </div>
          </div>

          {/* Panic Moments / Score Drops */}
          {analysis.panicTests.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Panic Moments — Significant Score Drops
              </h4>
              <div className="space-y-2">
                {analysis.panicTests.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.subject} — {p.test}</p>
                      <p className="text-xs text-gray-500">Score dropped {p.avg - p.score} points below average</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-red-700">{p.score}%</span>
                      <span className="text-xs text-gray-400">vs avg {p.avg}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score Difference Analysis */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-primary-600" />
              Score Difference Analysis (Latest vs Average)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {analysis.subjectScores.map((s, i) => {
                const diff = s.latest - s.average;
                return (
                  <div key={i} className={`rounded-lg p-3 border ${
                    diff >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                  }`}>
                    <p className="text-xs font-semibold text-gray-700">{s.subject}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-lg font-bold ${diff >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {diff >= 0 ? '+' : ''}{diff}
                      </span>
                      <TrendIcon value={diff} />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">{s.latest}% vs {s.average}% avg</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              AI-Powered Recommendations
              <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Smart</span>
            </h4>
            <ul className="space-y-3">
              {analysis.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700">{rec}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
