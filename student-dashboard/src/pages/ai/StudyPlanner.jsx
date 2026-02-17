import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, Target, BookOpen, Plus, CheckCircle, Circle,
  Trash2, Edit2, Sparkles, ArrowRight, Brain, ChevronDown, ChevronUp
} from 'lucide-react';
import { subjects } from '../../data/mockData';

const initialPlan = {
  weeklyGoals: [
    { id: 1, text: 'Complete Mechanics (Newton\'s Laws)', done: true, subject: 'Physics' },
    { id: 2, text: 'Organic Chemistry - Reactions Ch. 5-7', done: false, subject: 'Chemistry' },
    { id: 3, text: 'Human Physiology - Digestive System', done: false, subject: 'Biology' },
    { id: 4, text: 'Solve 50 practice MCQs daily', done: true, subject: 'General' },
  ],
  todayPlan: [
    { id: 1, time: '6:00 AM - 7:30 AM', subject: 'Physics', topic: 'Newton\'s Laws - Numerical Practice', done: true, priority: 'high' },
    { id: 2, time: '8:00 AM - 9:30 AM', subject: 'Chemistry', topic: 'Organic Reactions - Mechanisms', done: true, priority: 'high' },
    { id: 3, time: '10:00 AM - 11:00 AM', subject: 'Biology', topic: 'Cell Division - Revision', done: false, priority: 'medium' },
    { id: 4, time: '2:00 PM - 3:30 PM', subject: 'Physics', topic: 'Wave Optics - Theory', done: false, priority: 'high' },
    { id: 5, time: '4:00 PM - 5:00 PM', subject: 'Chemistry', topic: 'Ionic Equilibrium', done: false, priority: 'medium' },
    { id: 6, time: '7:00 PM - 8:00 PM', subject: 'Biology', topic: 'NCERT Review + MCQs', done: false, priority: 'low' },
    { id: 7, time: '9:00 PM - 10:00 PM', subject: 'Revision', topic: 'Daily quiz + weak areas', done: false, priority: 'medium' },
  ],
  recommendations: [
    { subject: 'Physics', message: 'Focus more on Thermodynamics - your last test score was low', priority: 'high' },
    { subject: 'Chemistry', message: 'Great progress in Organic! Consider moving to Physical Chemistry', priority: 'medium' },
    { subject: 'Biology', message: 'Genetics chapter needs attention before upcoming AIET-6', priority: 'high' },
  ]
};

export default function StudyPlanner() {
  const [plan, setPlan] = useState(initialPlan);
  const [showAIGen, setShowAIGen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expandedRec, setExpandedRec] = useState(null);

  const toggleTodo = (listKey, id) => {
    setPlan(prev => ({
      ...prev,
      [listKey]: prev[listKey].map(item =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    }));
  };

  const todayProgress = Math.round(
    (plan.todayPlan.filter(t => t.done).length / plan.todayPlan.length) * 100
  );

  const generatePlan = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setShowAIGen(false);
    }, 2000);
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">AI Study Planner</h1>
          <p className="text-sm text-slate-500 mt-1">Smart study schedule personalized for you</p>
        </div>
        <button
          onClick={() => setShowAIGen(!showAIGen)}
          className="px-4 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-primary-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-sm"
        >
          <Sparkles className="w-4 h-4" /> Generate AI Plan
        </button>
      </div>

      {/* AI Generate Panel */}
      {showAIGen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gradient-to-r from-primary-50 to-indigo-50 rounded-xl border border-primary-100 p-5"
        >
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-primary-600" /> AI-Powered Plan Generation
          </h3>
          <p className="text-sm text-slate-600 mb-4">Based on your test scores, attendance, and study patterns, AI will create an optimized study plan.</p>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Exam Target</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                <option>NEET 2025</option>
                <option>AIET-6</option>
                <option>Class Tests</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Hours/Day</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                <option>6-8 hours</option>
                <option>4-6 hours</option>
                <option>8-10 hours</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Focus Area</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                <option>Weak Subjects</option>
                <option>All Balanced</option>
                <option>Revision Only</option>
              </select>
            </div>
          </div>
          <button
            onClick={generatePlan}
            disabled={generating}
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Plan</>
            )}
          </button>
        </motion.div>
      )}

      {/* Today's Progress */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Today's Progress</h2>
          <span className="text-sm font-bold text-primary-600">{todayProgress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${todayProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full"
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {plan.todayPlan.filter(t => t.done).length} of {plan.todayPlan.length} tasks completed
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Plan */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-500" /> Today's Study Plan
              </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {plan.todayPlan.map(item => (
                <div key={item.id} className={`px-5 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors ${item.done ? 'opacity-60' : ''}`}>
                  <button onClick={() => toggleTodo('todayPlan', item.id)} className="mt-0.5 flex-shrink-0">
                    {item.done ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-primary-400" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${item.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {item.topic}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.time}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    item.subject === 'Physics' ? 'bg-blue-100 text-blue-700' :
                    item.subject === 'Chemistry' ? 'bg-green-100 text-green-700' :
                    item.subject === 'Biology' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {item.subject}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Weekly Goals */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-orange-500" /> Weekly Goals
            </h3>
            <div className="space-y-2">
              {plan.weeklyGoals.map(goal => (
                <div key={goal.id} className="flex items-start gap-2">
                  <button onClick={() => toggleTodo('weeklyGoals', goal.id)} className="mt-0.5">
                    {goal.done ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300" />
                    )}
                  </button>
                  <span className={`text-sm ${goal.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {goal.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary-500" /> AI Recommendations
            </h3>
            <div className="space-y-2">
              {plan.recommendations.map((rec, i) => (
                <div key={i} className={`p-3 rounded-lg border ${
                  rec.priority === 'high' ? 'border-red-100 bg-red-50/50' : 'border-slate-100 bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold ${
                      rec.subject === 'Physics' ? 'text-blue-600' :
                      rec.subject === 'Chemistry' ? 'text-green-600' : 'text-amber-600'
                    }`}>{rec.subject}</span>
                    {rec.priority === 'high' && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-medium">Priority</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{rec.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
