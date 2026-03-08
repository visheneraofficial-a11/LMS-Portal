import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Route, Brain, Target, CheckCircle, Circle, Lock, Sparkles, ChevronRight,
  ChevronDown, ChevronUp, BookOpen, Clock, TrendingUp, Zap, Star, Award,
  BarChart3, Play, ArrowRight, RefreshCw, Shield, Crown, Flame, Eye,
  AlertTriangle, Lightbulb, GraduationCap, Layers, Compass, Settings2
} from 'lucide-react';
import { subjects, testResults, studentProfile } from '../../data/mockData';

// ── Adaptive Engine: Simulates AI-powered path generation ──────────────────
const generateAdaptivePath = (examTarget, weakAreas, completedModules) => {
  const allModules = {
    Physics: [
      {
        id: 'PHY-M1', title: 'Mechanics Foundation', subject: 'Physics', difficulty: 'Foundation',
        estimatedHours: 12, totalTopics: 8, xpReward: 250,
        description: 'Master Newton\'s Laws, Work-Energy theorem, and rotational mechanics.',
        topics: [
          { id: 'PHY-T1', name: 'Units & Dimensions', duration: '45 min', type: 'concept', status: 'completed', score: 85 },
          { id: 'PHY-T2', name: 'Kinematics (1D & 2D)', duration: '90 min', type: 'concept', status: 'completed', score: 72 },
          { id: 'PHY-T3', name: 'Newton\'s Laws of Motion', duration: '90 min', type: 'concept', status: 'in-progress', score: null },
          { id: 'PHY-T4', name: 'Friction & Circular Motion', duration: '60 min', type: 'concept', status: 'locked', score: null },
          { id: 'PHY-T5', name: 'Work, Energy & Power', duration: '90 min', type: 'concept', status: 'locked', score: null },
          { id: 'PHY-T6', name: 'Practice: Numerical MCQs', duration: '45 min', type: 'practice', status: 'locked', score: null },
          { id: 'PHY-T7', name: 'Adaptive Quiz: Mechanics', duration: '30 min', type: 'assessment', status: 'locked', score: null },
          { id: 'PHY-T8', name: 'Mastery Challenge', duration: '20 min', type: 'mastery', status: 'locked', score: null },
        ],
        prerequisites: [],
        mastery: 35,
        status: 'in-progress',
        aiInsight: 'Your kinematics score (72%) indicates conceptual gaps. AI has added extra practice problems for projectile motion.',
      },
      {
        id: 'PHY-M2', title: 'Thermodynamics & Heat', subject: 'Physics', difficulty: 'Intermediate',
        estimatedHours: 10, totalTopics: 7, xpReward: 300,
        description: 'Laws of thermodynamics, heat transfer, and kinetic theory of gases.',
        topics: [
          { id: 'PHY-T9', name: 'Thermal Equilibrium & Zeroth Law', duration: '45 min', type: 'concept', status: 'locked', score: null },
          { id: 'PHY-T10', name: 'First Law of Thermodynamics', duration: '60 min', type: 'concept', status: 'locked', score: null },
          { id: 'PHY-T11', name: 'Second Law & Entropy', duration: '75 min', type: 'concept', status: 'locked', score: null },
          { id: 'PHY-T12', name: 'Heat Engines & Refrigerators', duration: '60 min', type: 'concept', status: 'locked', score: null },
          { id: 'PHY-T13', name: 'Kinetic Theory of Gases', duration: '60 min', type: 'concept', status: 'locked', score: null },
          { id: 'PHY-T14', name: 'Adaptive Quiz: Thermodynamics', duration: '30 min', type: 'assessment', status: 'locked', score: null },
          { id: 'PHY-T15', name: 'Mastery Challenge', duration: '20 min', type: 'mastery', status: 'locked', score: null },
        ],
        prerequisites: ['PHY-M1'],
        mastery: 0,
        status: 'locked',
        aiInsight: 'Unlock after completing Mechanics Foundation with ≥60% mastery.',
      },
      {
        id: 'PHY-M3', title: 'Optics & Waves', subject: 'Physics', difficulty: 'Intermediate',
        estimatedHours: 14, totalTopics: 9, xpReward: 350,
        description: 'Wave optics, ray optics, interference, diffraction, and modern optics.',
        topics: [
          { id: 'PHY-T16', name: 'Wave Motion Basics', duration: '60 min', type: 'concept', status: 'locked', score: null },
          { id: 'PHY-T17', name: 'Superposition & Interference', duration: '75 min', type: 'concept', status: 'locked', score: null },
          { id: 'PHY-T18', name: 'Reflection & Refraction', duration: '60 min', type: 'concept', status: 'locked', score: null },
          { id: 'PHY-T19', name: 'Lenses & Mirrors', duration: '75 min', type: 'concept', status: 'locked', score: null },
          { id: 'PHY-T20', name: 'Diffraction & Polarization', duration: '60 min', type: 'concept', status: 'locked', score: null },
          { id: 'PHY-T21', name: 'Optical Instruments', duration: '45 min', type: 'concept', status: 'locked', score: null },
          { id: 'PHY-T22', name: 'Sound Waves', duration: '60 min', type: 'concept', status: 'locked', score: null },
          { id: 'PHY-T23', name: 'Adaptive Quiz: Optics', duration: '30 min', type: 'assessment', status: 'locked', score: null },
          { id: 'PHY-T24', name: 'Mastery Challenge', duration: '20 min', type: 'mastery', status: 'locked', score: null },
        ],
        prerequisites: ['PHY-M1'],
        mastery: 0,
        status: 'locked',
        aiInsight: 'Recommended after Mechanics. Wave concepts build on oscillation fundamentals.',
      },
    ],
    Chemistry: [
      {
        id: 'CHE-M1', title: 'Atomic Structure & Bonding', subject: 'Chemistry', difficulty: 'Foundation',
        estimatedHours: 11, totalTopics: 8, xpReward: 250,
        description: 'Quantum numbers, electron configuration, VSEPR theory, and molecular orbital theory.',
        topics: [
          { id: 'CHE-T1', name: 'Atomic Models & Quantum Numbers', duration: '60 min', type: 'concept', status: 'completed', score: 90 },
          { id: 'CHE-T2', name: 'Electron Configuration', duration: '45 min', type: 'concept', status: 'completed', score: 88 },
          { id: 'CHE-T3', name: 'Periodic Properties', duration: '75 min', type: 'concept', status: 'completed', score: 82 },
          { id: 'CHE-T4', name: 'Chemical Bonding - Ionic', duration: '60 min', type: 'concept', status: 'completed', score: 78 },
          { id: 'CHE-T5', name: 'Covalent Bonding & VSEPR', duration: '75 min', type: 'concept', status: 'completed', score: 85 },
          { id: 'CHE-T6', name: 'Molecular Orbital Theory', duration: '60 min', type: 'concept', status: 'completed', score: 70 },
          { id: 'CHE-T7', name: 'Adaptive Quiz: Structure & Bonding', duration: '30 min', type: 'assessment', status: 'completed', score: 80 },
          { id: 'CHE-T8', name: 'Mastery Challenge', duration: '20 min', type: 'mastery', status: 'completed', score: 76 },
        ],
        prerequisites: [],
        mastery: 82,
        status: 'completed',
        aiInsight: 'Excellent mastery! MOT score (70%) flagged for review — revisit before exam.',
      },
      {
        id: 'CHE-M2', title: 'Organic Chemistry Basics', subject: 'Chemistry', difficulty: 'Intermediate',
        estimatedHours: 16, totalTopics: 10, xpReward: 400,
        description: 'IUPAC nomenclature, isomerism, reaction mechanisms, and functional groups.',
        topics: [
          { id: 'CHE-T9', name: 'IUPAC Nomenclature', duration: '75 min', type: 'concept', status: 'completed', score: 92 },
          { id: 'CHE-T10', name: 'Structural & Stereoisomerism', duration: '90 min', type: 'concept', status: 'completed', score: 80 },
          { id: 'CHE-T11', name: 'Reaction Mechanisms (SN1, SN2)', duration: '90 min', type: 'concept', status: 'in-progress', score: null },
          { id: 'CHE-T12', name: 'Elimination Reactions', duration: '60 min', type: 'concept', status: 'locked', score: null },
          { id: 'CHE-T13', name: 'Alkanes, Alkenes, Alkynes', duration: '75 min', type: 'concept', status: 'locked', score: null },
          { id: 'CHE-T14', name: 'Aromatic Compounds', duration: '90 min', type: 'concept', status: 'locked', score: null },
          { id: 'CHE-T15', name: 'Functional Group Reactions', duration: '60 min', type: 'concept', status: 'locked', score: null },
          { id: 'CHE-T16', name: 'Named Reactions Practice', duration: '45 min', type: 'practice', status: 'locked', score: null },
          { id: 'CHE-T17', name: 'Adaptive Quiz: Organic', duration: '30 min', type: 'assessment', status: 'locked', score: null },
          { id: 'CHE-T18', name: 'Mastery Challenge', duration: '20 min', type: 'mastery', status: 'locked', score: null },
        ],
        prerequisites: ['CHE-M1'],
        mastery: 28,
        status: 'in-progress',
        aiInsight: 'Strong nomenclature skills. Focus on reaction mechanisms — this is a high-weightage NEET topic.',
      },
    ],
    Biology: [
      {
        id: 'BIO-M1', title: 'Cell Biology & Biomolecules', subject: 'Biology', difficulty: 'Foundation',
        estimatedHours: 13, totalTopics: 9, xpReward: 280,
        description: 'Cell structure, organelles, biomolecules, enzymes, and cell division.',
        topics: [
          { id: 'BIO-T1', name: 'Cell Theory & Cell Types', duration: '45 min', type: 'concept', status: 'completed', score: 88 },
          { id: 'BIO-T2', name: 'Cell Organelles', duration: '75 min', type: 'concept', status: 'completed', score: 75 },
          { id: 'BIO-T3', name: 'Biomolecules Overview', duration: '60 min', type: 'concept', status: 'completed', score: 82 },
          { id: 'BIO-T4', name: 'Enzymes & Metabolism', duration: '75 min', type: 'concept', status: 'in-progress', score: null },
          { id: 'BIO-T5', name: 'Cell Cycle & Mitosis', duration: '60 min', type: 'concept', status: 'locked', score: null },
          { id: 'BIO-T6', name: 'Meiosis & Genetic Variation', duration: '75 min', type: 'concept', status: 'locked', score: null },
          { id: 'BIO-T7', name: 'Cell Transport Mechanisms', duration: '45 min', type: 'concept', status: 'locked', score: null },
          { id: 'BIO-T8', name: 'Adaptive Quiz: Cell Biology', duration: '30 min', type: 'assessment', status: 'locked', score: null },
          { id: 'BIO-T9', name: 'Mastery Challenge', duration: '20 min', type: 'mastery', status: 'locked', score: null },
        ],
        prerequisites: [],
        mastery: 40,
        status: 'in-progress',
        aiInsight: 'Cell organelles score (75%) needs reinforcement. AI scheduled a micro-review before enzymes.',
      },
      {
        id: 'BIO-M2', title: 'Human Physiology', subject: 'Biology', difficulty: 'Intermediate',
        estimatedHours: 18, totalTopics: 11, xpReward: 450,
        description: 'Digestive, respiratory, circulatory, excretory, nervous and endocrine systems.',
        topics: [
          { id: 'BIO-T10', name: 'Digestive System', duration: '75 min', type: 'concept', status: 'locked', score: null },
          { id: 'BIO-T11', name: 'Respiratory System', duration: '60 min', type: 'concept', status: 'locked', score: null },
          { id: 'BIO-T12', name: 'Circulatory System', duration: '90 min', type: 'concept', status: 'locked', score: null },
          { id: 'BIO-T13', name: 'Excretory System', duration: '60 min', type: 'concept', status: 'locked', score: null },
          { id: 'BIO-T14', name: 'Nervous System', duration: '90 min', type: 'concept', status: 'locked', score: null },
          { id: 'BIO-T15', name: 'Endocrine System', duration: '60 min', type: 'concept', status: 'locked', score: null },
          { id: 'BIO-T16', name: 'Musculoskeletal System', duration: '45 min', type: 'concept', status: 'locked', score: null },
          { id: 'BIO-T17', name: 'Body Fluids & Immunity', duration: '60 min', type: 'concept', status: 'locked', score: null },
          { id: 'BIO-T18', name: 'Practice: Diagram-based MCQs', duration: '45 min', type: 'practice', status: 'locked', score: null },
          { id: 'BIO-T19', name: 'Adaptive Quiz: Physiology', duration: '30 min', type: 'assessment', status: 'locked', score: null },
          { id: 'BIO-T20', name: 'Mastery Challenge', duration: '20 min', type: 'mastery', status: 'locked', score: null },
        ],
        prerequisites: ['BIO-M1'],
        mastery: 0,
        status: 'locked',
        aiInsight: 'High-weightage module for NEET (~30 questions). Unlock after Cell Biology mastery ≥50%.',
      },
    ],
  };
  return allModules;
};

// ── Skill Assessment Data ──────────────────────────────────────────────────
const skillRadarData = {
  Physics: { conceptual: 65, numerical: 55, application: 45, speed: 70, accuracy: 60 },
  Chemistry: { conceptual: 78, numerical: 70, application: 65, speed: 72, accuracy: 75 },
  Biology: { conceptual: 72, numerical: 50, application: 68, speed: 65, accuracy: 70 },
};

const learnerProfile = {
  learningStyle: 'Visual-Kinesthetic',
  preferredPace: 'Moderate',
  strongestTime: '6 AM - 10 AM',
  weakestAreas: ['Physics Numericals', 'Organic Mechanisms', 'Genetics'],
  recommendedDaily: '6-7 hours',
  currentStreak: 7,
  totalXP: 2840,
  level: 12,
  nextLevelXP: 3200,
  adaptiveScore: 68,
  lastCalibration: '2026-03-07',
};

// ── Milestone data ─────────────────────────────────────────────────────────
const milestones = [
  { id: 1, title: 'NEET Basics Complete', target: 'Complete all Foundation modules', progress: 52, xp: 500, deadline: '2026-04-15', status: 'in-progress' },
  { id: 2, title: 'First Mock Test Ready', target: 'Reach 60% mastery across all subjects', progress: 35, xp: 750, deadline: '2026-05-01', status: 'in-progress' },
  { id: 3, title: 'Intermediate Mastery', target: 'Complete 5 Intermediate modules', progress: 10, xp: 1200, deadline: '2026-07-15', status: 'not-started' },
  { id: 4, title: 'NEET Ready', target: 'All modules at ≥75% mastery', progress: 0, xp: 2500, deadline: '2026-09-30', status: 'not-started' },
];

// ── Premium feature flags ──────────────────────────────────────────────────
const premiumFeatures = {
  adaptiveQuizzes: true,
  aiInsights: true,
  customPacing: true,
  skillRadar: true,
  predictiveScoring: true,
  weaknessTargeting: true,
  spaceRepetition: true,
  examSimulator: true,
};

// ── Component ──────────────────────────────────────────────────────────────
export default function LearningPath() {
  const [activeSubject, setActiveSubject] = useState('All');
  const [expandedModule, setExpandedModule] = useState('PHY-M1');
  const [activeTab, setActiveTab] = useState('path'); // path | skills | milestones | settings
  const [pathData, setPathData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showPremiumBanner, setShowPremiumBanner] = useState(true);
  const [difficulty, setDifficulty] = useState('adaptive');
  const [showRecalibrate, setShowRecalibrate] = useState(false);

  useEffect(() => {
    setPathData(generateAdaptivePath('NEET', [], []));
  }, []);

  const handleRecalibrate = useCallback(() => {
    setShowRecalibrate(true);
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setShowRecalibrate(false);
    }, 3000);
  }, []);

  const getSubjectColor = (subj) => {
    const colors = {
      Physics: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', accent: 'bg-blue-500', light: 'bg-blue-100', gradient: 'from-blue-500 to-blue-600' },
      Chemistry: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', accent: 'bg-emerald-500', light: 'bg-emerald-100', gradient: 'from-emerald-500 to-emerald-600' },
      Biology: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', accent: 'bg-amber-500', light: 'bg-amber-100', gradient: 'from-amber-500 to-amber-600' },
      Maths: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', accent: 'bg-purple-500', light: 'bg-purple-100', gradient: 'from-purple-500 to-purple-600' },
    };
    return colors[subj] || colors.Physics;
  };

  const getTopicIcon = (type) => {
    switch (type) {
      case 'concept': return BookOpen;
      case 'practice': return Target;
      case 'assessment': return BarChart3;
      case 'mastery': return Award;
      default: return BookOpen;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', ring: 'ring-green-200' };
      case 'in-progress': return { icon: Play, color: 'text-primary-600', bg: 'bg-primary-50', ring: 'ring-primary-200' };
      case 'locked': return { icon: Lock, color: 'text-slate-300', bg: 'bg-slate-50', ring: 'ring-slate-200' };
      default: return { icon: Circle, color: 'text-slate-400', bg: 'bg-slate-50', ring: 'ring-slate-200' };
    }
  };

  const allModules = pathData ? Object.values(pathData).flat() : [];
  const filteredModules = activeSubject === 'All'
    ? allModules
    : allModules.filter(m => m.subject === activeSubject);

  const overallMastery = allModules.length > 0
    ? Math.round(allModules.reduce((sum, m) => sum + m.mastery, 0) / allModules.length)
    : 0;

  const completedModules = allModules.filter(m => m.status === 'completed').length;
  const inProgressModules = allModules.filter(m => m.status === 'in-progress').length;

  const totalXPEarned = allModules
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + m.xpReward, 0);

  if (!pathData) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* ── Premium Banner ─────────────────────────────────────────────── */}
      {showPremiumBanner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-xl p-4 text-white shadow-lg shadow-purple-600/20"
        >
          <button onClick={() => setShowPremiumBanner(false)} className="absolute top-2 right-3 text-white/60 hover:text-white text-sm">✕</button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-2">
                Premium AI Learning Path <span className="px-1.5 py-0.5 bg-yellow-400/20 text-yellow-200 text-[10px] rounded-full font-semibold">PRO</span>
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                Adaptive difficulty, skill radar analysis, spaced repetition, and AI-calibrated exam predictions — powered by your performance data.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary-600" />
            AI Learning Path
          </h1>
          <p className="text-sm text-slate-500 mt-1">Personalized adaptive curriculum powered by AI analysis of your performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRecalibrate}
            disabled={generating}
            className="px-3 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-xs font-medium rounded-lg hover:from-primary-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {generating ? (
              <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Recalibrating...</>
            ) : (
              <><RefreshCw className="w-3.5 h-3.5" /> Recalibrate Path</>
            )}
          </button>
        </div>
      </div>

      {/* ── Stats Bar ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Overall Mastery', value: `${overallMastery}%`, icon: Brain, color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Modules Done', value: `${completedModules}/${allModules.length}`, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'XP Earned', value: totalXPEarned.toLocaleString(), icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Adaptive Score', value: `${learnerProfile.adaptiveScore}/100`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-slate-100 shadow-sm p-3.5"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Tab Navigation ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {[
            { key: 'path', label: 'Learning Path', icon: Route },
            { key: 'skills', label: 'Skill Radar', icon: BarChart3 },
            { key: 'milestones', label: 'Milestones', icon: Target },
            { key: 'settings', label: 'Path Settings', icon: Settings2 },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ═══ TAB: Learning Path ═══════════════════════════════════════ */}
          {activeTab === 'path' && (
            <div className="space-y-5">
              {/* Subject Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {['All', ...subjects.filter(s => s !== 'Maths')].map(subj => (
                  <button
                    key={subj}
                    onClick={() => setActiveSubject(subj)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeSubject === subj
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>

              {/* AI Insight Bar */}
              <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-lg p-3 flex items-start gap-3">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-violet-800">AI Path Analysis</p>
                  <p className="text-xs text-violet-600 mt-0.5">
                    Based on your AIET-5 score (65/720) and recent quiz patterns, the AI has prioritized Physics Mechanics and Biology Cell Division.
                    Your Chemistry foundation is strong (82% mastery) — path adjusted to advance Organic Chemistry faster.
                    Estimated NEET readiness: <strong>42%</strong> → Target: <strong>85%</strong> by Sep 2026.
                  </p>
                </div>
              </div>

              {/* Module Cards */}
              <div className="space-y-4">
                {filteredModules.map((module, idx) => {
                  const colors = getSubjectColor(module.subject);
                  const isExpanded = expandedModule === module.id;
                  const completedTopics = module.topics.filter(t => t.status === 'completed').length;
                  const StatusIcon = getStatusStyle(module.status).icon;

                  return (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`rounded-xl border ${module.status === 'locked' ? 'border-slate-200 opacity-75' : colors.border} overflow-hidden`}
                    >
                      {/* Module Header */}
                      <button
                        onClick={() => setExpandedModule(isExpanded ? null : module.id)}
                        className={`w-full flex items-center gap-3 p-4 text-left ${module.status === 'locked' ? 'bg-slate-50' : colors.bg} transition-colors hover:brightness-95`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${module.status === 'locked' ? 'bg-slate-200' : colors.light}`}>
                          <StatusIcon className={`w-5 h-5 ${getStatusStyle(module.status).color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-bold ${module.status === 'locked' ? 'text-slate-400' : 'text-slate-800'}`}>
                              {module.title}
                            </h3>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              module.difficulty === 'Foundation' ? 'bg-green-100 text-green-700' :
                              module.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {module.difficulty}
                            </span>
                            {module.status === 'completed' && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium flex items-center gap-0.5">
                                <CheckCircle className="w-3 h-3" /> Mastered
                              </span>
                            )}
                          </div>
                          <p className={`text-xs mt-0.5 ${module.status === 'locked' ? 'text-slate-400' : 'text-slate-500'}`}>
                            {module.subject} · {completedTopics}/{module.totalTopics} topics · {module.estimatedHours}h est.
                          </p>
                          {/* Mastery Bar */}
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${module.mastery}%` }}
                                transition={{ duration: 0.8, delay: idx * 0.05 }}
                                className={`h-full rounded-full bg-gradient-to-r ${colors.gradient}`}
                              />
                            </div>
                            <span className={`text-[10px] font-bold ${module.status === 'locked' ? 'text-slate-400' : colors.text}`}>
                              {module.mastery}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Zap className="w-3 h-3" /> +{module.xpReward} XP
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>

                      {/* Expanded: Topics + AI Insight */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            {/* AI Insight for this module */}
                            {module.aiInsight && (
                              <div className="mx-4 mt-3 p-2.5 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-lg border border-indigo-100">
                                <p className="text-[11px] text-indigo-700 flex items-start gap-1.5">
                                  <Lightbulb className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                  <span><strong>AI Insight:</strong> {module.aiInsight}</span>
                                </p>
                              </div>
                            )}

                            {/* Topic List */}
                            <div className="px-4 py-3 space-y-1">
                              {module.topics.map((topic, ti) => {
                                const TopicIcon = getTopicIcon(topic.type);
                                const topicStatus = getStatusStyle(topic.status);

                                return (
                                  <div
                                    key={topic.id}
                                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                                      topic.status === 'locked' ? 'opacity-50' :
                                      topic.status === 'in-progress' ? 'bg-primary-50 ring-1 ring-primary-100' :
                                      'hover:bg-slate-50'
                                    }`}
                                  >
                                    {/* Connection Line */}
                                    <div className="relative flex flex-col items-center">
                                      <div className={`w-7 h-7 rounded-full ring-2 ${topicStatus.ring} ${topicStatus.bg} flex items-center justify-center`}>
                                        <topicStatus.icon className={`w-3.5 h-3.5 ${topicStatus.color}`} />
                                      </div>
                                      {ti < module.topics.length - 1 && (
                                        <div className={`w-0.5 h-4 mt-1 ${
                                          topic.status === 'completed' ? 'bg-green-300' : 'bg-slate-200'
                                        }`} />
                                      )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <TopicIcon className={`w-3.5 h-3.5 ${topic.status === 'locked' ? 'text-slate-300' : 'text-slate-500'}`} />
                                        <span className={`text-xs font-medium ${
                                          topic.status === 'locked' ? 'text-slate-400' :
                                          topic.status === 'completed' ? 'text-slate-600' :
                                          'text-slate-800'
                                        }`}>
                                          {topic.name}
                                        </span>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                                          topic.type === 'concept' ? 'bg-blue-50 text-blue-600' :
                                          topic.type === 'practice' ? 'bg-orange-50 text-orange-600' :
                                          topic.type === 'assessment' ? 'bg-purple-50 text-purple-600' :
                                          'bg-yellow-50 text-yellow-700'
                                        }`}>
                                          {topic.type}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                          <Clock className="w-2.5 h-2.5" /> {topic.duration}
                                        </span>
                                        {topic.score !== null && (
                                          <span className={`text-[10px] font-semibold ${
                                            topic.score >= 80 ? 'text-green-600' :
                                            topic.score >= 60 ? 'text-amber-600' : 'text-red-600'
                                          }`}>
                                            Score: {topic.score}%
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action Button */}
                                    {topic.status === 'in-progress' && (
                                      <button className="px-2.5 py-1 bg-primary-600 text-white text-[10px] font-medium rounded-md hover:bg-primary-700 transition-colors flex items-center gap-1">
                                        <Play className="w-3 h-3" /> Continue
                                      </button>
                                    )}
                                    {topic.status === 'completed' && topic.score !== null && topic.score < 70 && (
                                      <button className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-medium rounded-md hover:bg-amber-200 transition-colors flex items-center gap-1">
                                        <RefreshCw className="w-3 h-3" /> Review
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Module Footer */}
                            <div className="px-4 pb-3 flex items-center justify-between">
                              <p className="text-[10px] text-slate-400">
                                {module.prerequisites.length > 0
                                  ? `Prerequisites: ${module.prerequisites.join(', ')}`
                                  : 'No prerequisites'}
                              </p>
                              {module.status !== 'locked' && (
                                <button className="text-[10px] text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                                  View detailed analytics <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ TAB: Skill Radar ═════════════════════════════════════════ */}
          {activeTab === 'skills' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-lg p-3 flex items-start gap-2">
                <Crown className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-violet-700"><strong>Premium Feature:</strong> AI Skill Radar continuously calibrates based on quiz responses, time-per-question, and error patterns.</p>
              </div>

              {/* Learner Profile Card */}
              <div className="bg-white rounded-xl border border-slate-100 p-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <GraduationCap className="w-4 h-4 text-primary-600" /> Your Learner Profile
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-500 uppercase font-medium">Learning Style</p>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{learnerProfile.learningStyle}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-500 uppercase font-medium">Optimal Study Time</p>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{learnerProfile.strongestTime}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-500 uppercase font-medium">Current Level</p>
                    <p className="text-sm font-semibold text-slate-800 mt-1">Level {learnerProfile.level}</p>
                    <div className="mt-1.5 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style={{ width: `${(learnerProfile.totalXP / learnerProfile.nextLevelXP) * 100}%` }} />
                    </div>
                    <p className="text-[9px] text-slate-400 mt-0.5">{learnerProfile.totalXP}/{learnerProfile.nextLevelXP} XP</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-500 uppercase font-medium">Daily Streak</p>
                    <p className="text-sm font-semibold text-orange-600 mt-1 flex items-center gap-1">
                      <Flame className="w-4 h-4" /> {learnerProfile.currentStreak} days
                    </p>
                  </div>
                </div>
              </div>

              {/* Skill Radar per Subject */}
              <div className="grid sm:grid-cols-3 gap-4">
                {Object.entries(skillRadarData).map(([subject, skills]) => {
                  const colors = getSubjectColor(subject);
                  const avg = Math.round(Object.values(skills).reduce((a, b) => a + b, 0) / Object.values(skills).length);

                  return (
                    <div key={subject} className={`rounded-xl border ${colors.border} ${colors.bg} p-4`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className={`text-sm font-bold ${colors.text}`}>{subject}</h4>
                        <span className={`text-xs font-bold ${avg >= 70 ? 'text-green-600' : avg >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                          Avg: {avg}%
                        </span>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(skills).map(([skill, value]) => (
                          <div key={skill}>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[10px] text-slate-600 capitalize">{skill}</span>
                              <span className={`text-[10px] font-bold ${value >= 70 ? 'text-green-600' : value >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                {value}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${value}%` }}
                                transition={{ duration: 1 }}
                                className={`h-full rounded-full bg-gradient-to-r ${colors.gradient}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Weakness Targeting */}
              <div className="bg-white rounded-xl border border-slate-100 p-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> AI-Detected Weak Areas
                </h3>
                <div className="space-y-2">
                  {learnerProfile.weakestAreas.map((area, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-red-50 border border-red-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full" />
                        <span className="text-xs font-medium text-red-800">{area}</span>
                      </div>
                      <button className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-medium rounded hover:bg-red-200 transition-colors flex items-center gap-1">
                        <Target className="w-3 h-3" /> Focus Drill
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spaced Repetition Queue */}
              <div className="bg-white rounded-xl border border-slate-100 p-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-indigo-500" /> Spaced Repetition Queue
                  <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] rounded-full font-semibold">PREMIUM</span>
                </h3>
                <div className="space-y-2">
                  {[
                    { topic: 'Molecular Orbital Theory', subject: 'Chemistry', lastReview: '3 days ago', nextReview: 'Today', retention: 62, urgency: 'high' },
                    { topic: 'Cell Organelles', subject: 'Biology', lastReview: '5 days ago', nextReview: 'Tomorrow', retention: 70, urgency: 'medium' },
                    { topic: 'Kinematics (2D)', subject: 'Physics', lastReview: '7 days ago', nextReview: 'Today', retention: 58, urgency: 'high' },
                    { topic: 'Periodic Properties', subject: 'Chemistry', lastReview: '10 days ago', nextReview: 'In 2 days', retention: 75, urgency: 'low' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        item.urgency === 'high' ? 'bg-red-400' : item.urgency === 'medium' ? 'bg-amber-400' : 'bg-green-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-slate-800">{item.topic}</span>
                        <p className="text-[10px] text-slate-500">{item.subject} · Last: {item.lastReview} · Retention: {item.retention}%</p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        item.nextReview === 'Today' ? 'bg-red-100 text-red-700' :
                        item.nextReview === 'Tomorrow' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {item.nextReview}
                      </span>
                      <button className="px-2 py-1 bg-primary-100 text-primary-700 text-[10px] font-medium rounded hover:bg-primary-200 transition-colors">
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ TAB: Milestones ══════════════════════════════════════════ */}
          {activeTab === 'milestones' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-lg p-3 flex items-start gap-2">
                <Target className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  <strong>Your NEET Journey:</strong> AI has set adaptive milestones based on your current pace.
                  Complete milestones to unlock bonus XP and premium study materials.
                </p>
              </div>

              {/* Milestone Timeline */}
              <div className="space-y-4">
                {milestones.map((ms, i) => (
                  <motion.div
                    key={ms.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`relative rounded-xl border p-4 ${
                      ms.status === 'in-progress' ? 'border-primary-200 bg-primary-50/30' :
                      ms.status === 'completed' ? 'border-green-200 bg-green-50/30' :
                      'border-slate-200 bg-slate-50/30'
                    }`}
                  >
                    {/* Connector */}
                    {i < milestones.length - 1 && (
                      <div className="absolute left-7 top-full w-0.5 h-4 bg-slate-200" />
                    )}

                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        ms.status === 'in-progress' ? 'bg-primary-100' :
                        ms.status === 'completed' ? 'bg-green-100' : 'bg-slate-100'
                      }`}>
                        {ms.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : ms.status === 'in-progress' ? (
                          <Target className="w-5 h-5 text-primary-600" />
                        ) : (
                          <Lock className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-800">{ms.title}</h4>
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5" /> +{ms.xp} XP
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{ms.target}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Deadline: {ms.deadline}</p>

                        {/* Progress */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${ms.progress}%` }}
                              transition={{ duration: 1, delay: i * 0.1 }}
                              className={`h-full rounded-full ${
                                ms.status === 'in-progress' ? 'bg-gradient-to-r from-primary-500 to-indigo-500' :
                                ms.status === 'completed' ? 'bg-green-500' : 'bg-slate-300'
                              }`}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-600">{ms.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* NEET Score Prediction */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4">
                <h3 className="text-sm font-bold text-indigo-800 flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4" /> AI Score Prediction
                  <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] rounded-full font-semibold">PREMIUM</span>
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <p className="text-[10px] text-slate-500">Current Predicted</p>
                    <p className="text-2xl font-bold text-indigo-700 mt-1">285</p>
                    <p className="text-[10px] text-slate-400">/720 marks</p>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <p className="text-[10px] text-slate-500">If Follow Path</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">520</p>
                    <p className="text-[10px] text-slate-400">/720 marks</p>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <p className="text-[10px] text-slate-500">Confidence</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">73%</p>
                    <p className="text-[10px] text-slate-400">based on trend</p>
                  </div>
                </div>
                <p className="text-[10px] text-indigo-600 mt-3">
                  * Prediction recalibrates weekly based on quiz performance, study hours, and module completion rate.
                  Last calibrated: {learnerProfile.lastCalibration}
                </p>
              </div>
            </div>
          )}

          {/* ═══ TAB: Settings ════════════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <div className="space-y-5 max-w-2xl">
              <h3 className="text-sm font-bold text-slate-800">Path Configuration</h3>

              {/* Difficulty Mode */}
              <div className="bg-white rounded-xl border border-slate-100 p-4">
                <h4 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary-500" /> Difficulty Mode
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'guided', label: 'Guided', desc: 'Step-by-step with AI hints' },
                    { key: 'adaptive', label: 'Adaptive', desc: 'AI adjusts in real-time' },
                    { key: 'challenge', label: 'Challenge', desc: 'Maximum difficulty' },
                  ].map(mode => (
                    <button
                      key={mode.key}
                      onClick={() => setDifficulty(mode.key)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        difficulty === mode.key
                          ? 'border-primary-300 bg-primary-50 ring-1 ring-primary-200'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className={`text-xs font-semibold ${difficulty === mode.key ? 'text-primary-700' : 'text-slate-700'}`}>
                        {mode.label}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{mode.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exam Target */}
              <div className="bg-white rounded-xl border border-slate-100 p-4">
                <h4 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-500" /> Exam Target
                </h4>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                  <option value="NEET">NEET 2026</option>
                  <option value="JEE_MAINS">JEE Mains 2026</option>
                  <option value="JEE_ADV">JEE Advanced 2026</option>
                  <option value="BOARDS">Board Exams</option>
                </select>
              </div>

              {/* Study Preferences */}
              <div className="bg-white rounded-xl border border-slate-100 p-4">
                <h4 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-500" /> Study Preferences
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">Daily Study Hours</label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                      <option>4-5 hours</option>
                      <option>5-6 hours</option>
                      <option selected>6-7 hours</option>
                      <option>7-8 hours</option>
                      <option>8-10 hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">Preferred Study Time</label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                      <option selected>Early Morning (5-10 AM)</option>
                      <option>Morning (8 AM - 1 PM)</option>
                      <option>Afternoon (12-5 PM)</option>
                      <option>Evening (4-9 PM)</option>
                      <option>Night (8 PM - 1 AM)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">Content Language</label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                      <option>Hindi</option>
                      <option>English</option>
                      <option selected>Bilingual (Hindi + English)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Premium Features Toggle */}
              <div className="bg-white rounded-xl border border-slate-100 p-4">
                <h4 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-purple-500" /> Premium Features
                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[9px] rounded-full font-semibold">PRO</span>
                </h4>
                <div className="space-y-2">
                  {[
                    { key: 'adaptiveQuizzes', label: 'Adaptive Quiz Difficulty', desc: 'Questions adjust based on your real-time performance' },
                    { key: 'spaceRepetition', label: 'Spaced Repetition System', desc: 'AI schedules reviews at optimal memory intervals' },
                    { key: 'predictiveScoring', label: 'Predictive Score Analysis', desc: 'AI predicts your exam score based on current trajectory' },
                    { key: 'weaknessTargeting', label: 'Weakness Auto-Targeting', desc: 'Path auto-adjusts to reinforce weak areas' },
                    { key: 'examSimulator', label: 'AI Exam Simulator', desc: 'Simulates real exam conditions with adaptive difficulty' },
                  ].map(feat => (
                    <div key={feat.key} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-xs font-medium text-slate-800">{feat.label}</p>
                        <p className="text-[10px] text-slate-500">{feat.desc}</p>
                      </div>
                      <div className={`w-9 h-5 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${
                        premiumFeatures[feat.key] ? 'bg-green-500' : 'bg-slate-300'
                      }`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                          premiumFeatures[feat.key] ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button className="w-full px-4 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-primary-700 hover:to-indigo-700 transition-all shadow-sm">
                Save Path Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
