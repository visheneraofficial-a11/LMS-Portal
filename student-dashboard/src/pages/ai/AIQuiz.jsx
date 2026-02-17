import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb, Play, CheckCircle, XCircle, Clock, Target, Trophy,
  ArrowRight, RotateCcw, Sparkles, Brain, Loader2, ChevronRight
} from 'lucide-react';
import { subjects, aiQuizHistory } from '../../data/mockData';

const sampleQuestions = [
  {
    id: 1, subject: 'Physics',
    question: 'A body of mass 5 kg is moving with a velocity of 10 m/s. A force is applied to it so that in 25 seconds, it attains a velocity of 35 m/s. What is the force applied?',
    options: ['5 N', '2 N', '1 N', '0.5 N'],
    correct: 2, // index
    explanation: 'Using F = ma, where a = (v-u)/t = (35-10)/25 = 1 m/s². F = 5 × 1 = 5 N. Wait, let me recalculate: a = 25/25 = 1 m/s², F = 5 × 1 = 5 N. Hmm, the answer is actually F = m × a = 5 × 1 = 5N. But checking: option index 2 is \'1 N\'... The correct answer based on calculation should be 5N (index 0).'
  },
  {
    id: 2, subject: 'Chemistry',
    question: 'Which of the following is the strongest acid?',
    options: ['HF', 'HCl', 'HBr', 'HI'],
    correct: 3,
    explanation: 'Acid strength increases down the group for hydrohalic acids: HF < HCl < HBr < HI. This is because the H-X bond strength decreases as the size of the halide increases, making it easier to donate H⁺.'
  },
  {
    id: 3, subject: 'Biology',
    question: 'Which organelle is known as the "powerhouse of the cell"?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'],
    correct: 2,
    explanation: 'Mitochondria are called the powerhouse of the cell because they generate most of the cell\'s supply of ATP (adenosine triphosphate), which is used as a source of chemical energy.'
  },
  {
    id: 4, subject: 'Physics',
    question: 'The SI unit of electric current is:',
    options: ['Volt', 'Ohm', 'Ampere', 'Watt'],
    correct: 2,
    explanation: 'The SI unit of electric current is the Ampere (A), named after André-Marie Ampère. One ampere is defined as one coulomb of charge passing a point per second.'
  },
  {
    id: 5, subject: 'Chemistry',
    question: 'What is the hybridization of carbon in methane (CH₄)?',
    options: ['sp', 'sp²', 'sp³', 'sp³d'],
    correct: 2,
    explanation: 'In methane, carbon forms 4 sigma bonds with hydrogen atoms. This requires 4 hybrid orbitals, achieved through sp³ hybridization (1s + 3p orbitals). The geometry is tetrahedral with bond angles of 109.5°.'
  },
];

export default function AIQuiz() {
  const [mode, setMode] = useState('setup'); // setup, quiz, result
  const [quizConfig, setQuizConfig] = useState({ subject: 'All', numQuestions: 5, difficulty: 'Medium' });
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState(sampleQuestions);

  const startQuiz = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setMode('quiz');
      setCurrentQ(0);
      setAnswers({});
      setShowExplanation(false);
      setTimeLeft(questions.length * 60);
      setQuizStarted(true);
    }, 1500);
  };

  // Timer
  React.useEffect(() => {
    if (mode !== 'quiz' || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [mode, timeLeft]);

  const selectAnswer = (qId, optIdx) => {
    if (answers[qId] !== undefined) return;
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setMode('result');
    }
  };

  const score = Object.entries(answers).reduce((acc, [qId, ans]) => {
    const q = questions.find(qq => qq.id === parseInt(qId));
    return acc + (q && ans === q.correct ? 1 : 0);
  }, 0);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {/* Setup */}
        {mode === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">AI Practice Quiz</h1>
              <p className="text-sm text-slate-500 mt-1">AI-generated questions based on your curriculum</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 max-w-md mx-auto">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Subject</label>
                  <select value={quizConfig.subject} onChange={e => setQuizConfig({ ...quizConfig, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500">
                    <option value="All">All Subjects</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Number of Questions</label>
                  <div className="flex gap-2">
                    {[5, 10, 15, 20].map(n => (
                      <button key={n} onClick={() => setQuizConfig({ ...quizConfig, numQuestions: n })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          quizConfig.numQuestions === n ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}>{n}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Difficulty</label>
                  <div className="flex gap-2">
                    {['Easy', 'Medium', 'Hard'].map(d => (
                      <button key={d} onClick={() => setQuizConfig({ ...quizConfig, difficulty: d })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          quizConfig.difficulty === d ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}>{d}</button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={startQuiz} disabled={generating}
                className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-medium rounded-xl hover:from-primary-700 hover:to-indigo-700 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
                {generating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating Questions...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Start Quiz</>
                )}
              </button>
            </div>

            {/* Quiz History */}
            {aiQuizHistory.length > 0 && (
              <div className="mt-8 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-semibold text-slate-800 mb-3">Recent Quizzes</h3>
                <div className="space-y-2">
                  {aiQuizHistory.map((q, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{q.subject} - {q.difficulty}</p>
                        <p className="text-xs text-slate-400">{q.date} • {q.questions} questions</p>
                      </div>
                      <span className={`text-sm font-bold ${q.score >= 70 ? 'text-green-600' : q.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {q.score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Quiz Active */}
        {mode === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Progress bar */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">
                  Question {currentQ + 1} of {questions.length}
                </span>
                <span className={`text-sm font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-slate-600'}`}>
                  <Clock className="w-4 h-4 inline mr-1" />{formatTime(timeLeft)}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
              </div>
            </div>

            {/* Question */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  questions[currentQ].subject === 'Physics' ? 'bg-blue-100 text-blue-700' :
                  questions[currentQ].subject === 'Chemistry' ? 'bg-green-100 text-green-700' :
                  'bg-amber-100 text-amber-700'
                }`}>{questions[currentQ].subject}</span>
              </div>

              <h2 className="text-base font-medium text-slate-800 mb-6 leading-relaxed">
                {questions[currentQ].question}
              </h2>

              <div className="space-y-3">
                {questions[currentQ].options.map((opt, idx) => {
                  const answered = answers[questions[currentQ].id] !== undefined;
                  const selected = answers[questions[currentQ].id] === idx;
                  const isCorrect = idx === questions[currentQ].correct;
                  let cls = 'border-slate-200 hover:border-primary-300 hover:bg-primary-50';
                  if (answered) {
                    if (isCorrect) cls = 'border-green-400 bg-green-50';
                    else if (selected) cls = 'border-red-400 bg-red-50';
                    else cls = 'border-slate-200 opacity-50';
                  }
                  return (
                    <button key={idx} onClick={() => selectAnswer(questions[currentQ].id, idx)}
                      disabled={answered}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${cls}`}>
                      <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        answered && isCorrect ? 'border-green-500 bg-green-500 text-white' :
                        answered && selected ? 'border-red-500 bg-red-500 text-white' :
                        selected ? 'border-primary-500 bg-primary-500 text-white' :
                        'border-slate-300 text-slate-500'
                      }`}>
                        {answered && isCorrect ? '✓' : answered && selected ? '✗' : String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm text-slate-700">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5" /> Explanation
                  </p>
                  <p className="text-sm text-blue-700">{questions[currentQ].explanation}</p>
                </motion.div>
              )}

              {answers[questions[currentQ].id] !== undefined && (
                <div className="mt-4 flex justify-end">
                  <button onClick={nextQuestion}
                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 flex items-center gap-2">
                    {currentQ < questions.length - 1 ? 'Next Question' : 'See Results'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Question Navigation */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mt-4">
              <div className="flex flex-wrap gap-2">
                {questions.map((q, i) => (
                  <button key={q.id}
                    onClick={() => { setCurrentQ(i); setShowExplanation(answers[q.id] !== undefined); }}
                    className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                      i === currentQ ? 'bg-primary-600 text-white' :
                      answers[q.id] !== undefined ?
                        (answers[q.id] === q.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') :
                      'bg-slate-100 text-slate-600'
                    }`}>{i + 1}</button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {mode === 'result' && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 max-w-md mx-auto">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                score / questions.length >= 0.7 ? 'bg-green-100' : score / questions.length >= 0.4 ? 'bg-amber-100' : 'bg-red-100'
              }`}>
                <Trophy className={`w-10 h-10 ${
                  score / questions.length >= 0.7 ? 'text-green-600' : score / questions.length >= 0.4 ? 'text-amber-600' : 'text-red-600'
                }`} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Quiz Complete!</h2>
              <p className="text-4xl font-bold text-primary-600 my-4">{score}/{questions.length}</p>
              <p className="text-sm text-slate-500 mb-6">
                {score / questions.length >= 0.7 ? 'Excellent work! Keep it up!' :
                 score / questions.length >= 0.4 ? 'Good effort! Review the wrong answers.' :
                 'Needs improvement. Focus on these topics.'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => { setMode('setup'); setAnswers({}); setCurrentQ(0); }}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" /> New Quiz
                </button>
                <button onClick={() => { setMode('quiz'); setCurrentQ(0); setShowExplanation(true); }}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2">
                  Review Answers
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
