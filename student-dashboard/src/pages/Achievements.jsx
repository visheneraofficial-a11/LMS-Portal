import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Flame, Star, Medal, Target, Zap, Award, Lock,
  Crown, TrendingUp, BookOpen, Users, ChevronUp, ChevronDown
} from 'lucide-react';
import { achievements, leaderboard, studentProfile, dashboardStats } from '../data/mockData';

const tabs = ['Badges', 'Leaderboard', 'Streaks'];

export default function Achievements() {
  const [activeTab, setActiveTab] = useState('Badges');

  const earned = achievements.filter(a => a.earned);
  const locked = achievements.filter(a => !a.earned);

  const streakData = {
    current: dashboardStats.streak,
    longest: 15,
    totalDays: 120,
    weekData: [
      { day: 'Mon', active: true }, { day: 'Tue', active: true },
      { day: 'Wed', active: true }, { day: 'Thu', active: true },
      { day: 'Fri', active: true }, { day: 'Sat', active: false },
      { day: 'Sun', active: false },
    ]
  };

  const getIconForAchievement = (icon) => {
    const icons = { star: Star, trophy: Trophy, flame: Flame, medal: Medal, target: Target, zap: Zap, crown: Crown, book: BookOpen };
    return icons[icon] || Award;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Achievements</h1>
        <p className="text-sm text-slate-500 mt-1">Your badges, streaks, and rankings</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Badges Earned', value: earned.length, total: achievements.length, icon: Award, color: 'bg-amber-500' },
          { label: 'Current Streak', value: `${streakData.current} days`, icon: Flame, color: 'bg-orange-500' },
          { label: 'Class Rank', value: `#${dashboardStats.rank}`, icon: Trophy, color: 'bg-purple-500' },
          { label: 'XP Points', value: '2,450', icon: Zap, color: 'bg-blue-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">{stat.value}</p>
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

      {/* Badges Tab */}
      {activeTab === 'Badges' && (
        <div className="space-y-6">
          {/* Earned */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Earned ({earned.length})
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {earned.map((badge, i) => {
                const Icon = getIconForAchievement(badge.icon);
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        badge.rarity === 'gold' ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                        badge.rarity === 'silver' ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                        'bg-gradient-to-br from-orange-300 to-orange-500'
                      }`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 text-sm">{badge.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{badge.description}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Earned: {badge.date}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Locked */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" /> Locked ({locked.length})
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locked.map((badge, i) => {
                const Icon = getIconForAchievement(badge.icon);
                return (
                  <div key={badge.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 opacity-60">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-700 text-sm">{badge.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{badge.description}</p>
                        {badge.progress !== undefined && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-slate-400">Progress</span>
                              <span className="text-[10px] font-medium text-slate-500">{badge.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                              <div className="h-full bg-primary-400 rounded-full" style={{ width: `${badge.progress}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'Leaderboard' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Class Leaderboard</h2>
            <p className="text-xs text-slate-500 mt-0.5">Based on overall test performance</p>
          </div>
          <div className="divide-y divide-slate-50">
            {leaderboard.map((student, i) => {
              const isMe = student.rollNo === studentProfile.rollNo;
              return (
                <div key={i} className={`px-5 py-3 flex items-center gap-4 ${isMe ? 'bg-primary-50/50' : 'hover:bg-slate-50'}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-amber-400 text-white' :
                    i === 1 ? 'bg-slate-400 text-white' :
                    i === 2 ? 'bg-orange-400 text-white' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {i < 3 ? <Crown className="w-4 h-4" /> : i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isMe ? 'text-primary-700' : 'text-slate-800'}`}>
                      {student.name} {isMe && <span className="text-[10px] bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded ml-1">You</span>}
                    </p>
                    <p className="text-xs text-slate-400">Roll #{student.rollNo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-700">{student.score}%</p>
                    <p className="text-[10px] text-slate-400">{student.tests} tests</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Streaks Tab */}
      {activeTab === 'Streaks' && (
        <div className="space-y-6">
          {/* Current Streak */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Current Streak</p>
                <p className="text-5xl font-bold mt-1">{streakData.current}</p>
                <p className="text-orange-200 text-sm mt-1">consecutive days</p>
              </div>
              <Flame className="w-16 h-16 text-white/30" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">This Week</h3>
              <div className="flex items-center justify-between">
                {streakData.weekData.map((day, i) => (
                  <div key={i} className="text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                      day.active ? 'bg-green-100' : 'bg-slate-100'
                    }`}>
                      {day.active ? (
                        <Flame className="w-5 h-5 text-orange-500" />
                      ) : (
                        <span className="w-2 h-2 bg-slate-300 rounded-full" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Streak Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Longest Streak</span>
                  <span className="font-bold text-slate-800">{streakData.longest} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total Active Days</span>
                  <span className="font-bold text-slate-800">{streakData.totalDays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Streak Rank</span>
                  <span className="font-bold text-primary-600">#3 in class</span>
                </div>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Streak Milestones</h3>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {[3, 7, 14, 21, 30, 60, 100].map(milestone => {
                const achieved = streakData.longest >= milestone;
                return (
                  <div key={milestone} className={`flex-shrink-0 w-20 text-center p-3 rounded-xl border ${
                    achieved ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50 opacity-50'
                  }`}>
                    <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${
                      achieved ? 'bg-amber-400' : 'bg-slate-200'
                    }`}>
                      {achieved ? <Flame className="w-5 h-5 text-white" /> : <Lock className="w-4 h-4 text-slate-400" />}
                    </div>
                    <p className="text-sm font-bold text-slate-700 mt-2">{milestone}</p>
                    <p className="text-[10px] text-slate-400">days</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
