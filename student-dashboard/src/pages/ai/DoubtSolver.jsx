import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Image, Paperclip, Sparkles, Copy, ThumbsUp, ThumbsDown, Loader2, BookOpen, Eraser } from 'lucide-react';
import { aiDoubtHistory, subjects } from '../../data/mockData';

const suggestedQuestions = [
  "Explain Newton's Third Law with examples",
  "What is the difference between mitosis and meiosis?",
  "Solve: ∫(x² + 2x)dx",
  "Explain Le Chatelier's Principle",
  "What are electromagnetic waves?",
  "Derive the equation for projectile motion",
];

export default function DoubtSolver() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi Rahul! 👋 I'm your AI Study Assistant. Ask me any doubt related to your NEET preparation — Physics, Chemistry, Biology, or Maths. I'll explain step-by-step!", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', content: text.trim(), timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = {
        "newton": "**Newton's Third Law** states:\n\n> *For every action, there is an equal and opposite reaction.*\n\n**Key Points:**\n1. Forces always occur in pairs\n2. Action and reaction act on different bodies\n3. They are equal in magnitude but opposite in direction\n\n**Examples:**\n- When you walk, your foot pushes the ground backward (action), and the ground pushes your foot forward (reaction)\n- A rocket expels gas downward (action), propelling itself upward (reaction)\n- When swimming, you push water backward, water pushes you forward\n\n**Mathematical Form:** F₁₂ = -F₂₁\n\nWould you like me to solve numerical problems on this topic?",
        "mitosis": "**Mitosis vs Meiosis:**\n\n| Feature | Mitosis | Meiosis |\n|---------|---------|--------|\n| Divisions | 1 | 2 |\n| Daughter cells | 2 (identical) | 4 (genetically different) |\n| Chromosome number | Same (2n) | Halved (n) |\n| Crossing over | No | Yes |\n| Purpose | Growth/Repair | Gamete formation |\n\nWant me to explain any specific phase in detail?",
        default: "That's a great question! Let me break it down for you:\n\n**Understanding the concept:**\n\nThis topic is fundamental for NEET preparation. Here's a step-by-step explanation:\n\n1. **Basic Principle:** The concept builds on fundamental laws we've studied\n2. **Key Formula:** Apply the relevant equations carefully\n3. **Common Mistakes:** Students often confuse related concepts\n\n**Practice Tip:** Try solving 5-10 problems daily on this topic to build confidence.\n\nWould you like me to provide practice questions or explain any specific aspect in more detail?"
      };

      const lowerText = text.toLowerCase();
      let response = responses.default;
      if (lowerText.includes('newton')) response = responses.newton;
      else if (lowerText.includes('mitosis') || lowerText.includes('meiosis')) response = responses.mitosis;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setLoading(false);
    }, 1500);
  };

  const clearChat = () => {
    setMessages([messages[0]]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 160px)' }}>
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-primary-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 text-sm">AI Doubt Solver</h2>
              <p className="text-[10px] text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Online • Powered by Claude AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
              className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white">
              <option value="All">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={clearChat} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Clear chat">
              <Eraser className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-md'
                    : 'bg-slate-100 text-slate-800 rounded-bl-md'
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                </div>
                <div className={`flex items-center gap-2 mt-1 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  {msg.role === 'assistant' && i > 0 && (
                    <div className="flex items-center gap-1">
                      <button className="p-1 rounded hover:bg-slate-100"><Copy className="w-3 h-3 text-slate-400" /></button>
                      <button className="p-1 rounded hover:bg-slate-100"><ThumbsUp className="w-3 h-3 text-slate-400" /></button>
                      <button className="p-1 rounded hover:bg-slate-100"><ThumbsDown className="w-3 h-3 text-slate-400" /></button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                </div>
              </div>
            </div>
          )}

          {/* Suggested questions */}
          {messages.length <= 1 && (
            <div className="mt-4">
              <p className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Suggested Questions
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 text-xs rounded-full hover:bg-primary-100 transition-colors border border-primary-100">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-100 bg-white">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder="Ask your doubt..."
                rows={1}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
