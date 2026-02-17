import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle, Mail, Phone, MessageCircle, ExternalLink, ChevronDown,
  ChevronUp, BookOpen, Shield, Clock, AlertCircle, Send, CheckCircle
} from 'lucide-react';

// ─── Admin-configurable contact info ───
// In production, these values would come from a Django API endpoint
// (e.g., /api/system-config/contact-info/) so admins can update them
// from the admin panel without touching frontend code.
const contactConfig = {
  adminEmail: 'admin@enfschool.edu.in',
  supportEmail: 'support@enfschool.edu.in',
  phoneNumber: '+91-9876543210',
  whatsappNumber: '+919876543210',
  whatsappMessage: 'Hi, I need help with the Student Portal.',
  officeHours: 'Mon–Sat, 9:00 AM – 5:00 PM IST',
  address: 'ENF School Campus, Education City, State - 500001',
  portalVersion: '2.1.0',
};

const faqs = [
  {
    q: 'How do I reset my password?',
    a: 'Go to the login page and click "Forgot Password." Enter your registered email/phone, and you will receive a reset link. If you don\'t receive it, contact your class teacher or the admin office.',
  },
  {
    q: 'Why is my attendance showing incorrectly?',
    a: 'Attendance is synced from your school\'s biometric/manual records. If there is a discrepancy, please raise it with your class teacher who can request the admin to correct the record.',
  },
  {
    q: 'How do I access video lectures offline?',
    a: 'Currently, video lectures require an internet connection. However, you can download study materials (PDFs) from the Resources section for offline reading.',
  },
  {
    q: 'How are AI-generated study plans created?',
    a: 'The AI analyzes your test scores, attendance patterns, and learning progress to generate personalized study plans. These plans adapt as you complete more tests and activities.',
  },
  {
    q: 'Can I change my profile details?',
    a: 'Student profile information is managed by the school administration. If you need to update your personal details (address, phone, guardian info), please submit a request to the admin office.',
  },
  {
    q: 'How do I contact my teacher directly?',
    a: 'Use the Communication module (if enabled) to send messages to teachers. Alternatively, your teachers\' contact information may be available in the Class section.',
  },
  {
    q: 'What browsers are supported?',
    a: 'We recommend using the latest version of Chrome, Firefox, Safari, or Edge. The portal is fully responsive and works on phones, tablets, and desktops.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

export default function HelpSupport() {
  const [openFaq, setOpenFaq] = useState(null);
  const [ticketForm, setTicketForm] = useState({ subject: '', message: '' });
  const [ticketSent, setTicketSent] = useState(false);

  const handleTicket = (e) => {
    e.preventDefault();
    // In production, POST to /api/student/support-ticket/
    setTicketSent(true);
    setTicketForm({ subject: '', message: '' });
    setTimeout(() => setTicketSent(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <HelpCircle className="w-7 h-7 text-indigo-500" /> Help & Support
        </h1>
        <p className="text-slate-500 text-sm mt-1">Find answers, get in touch, or raise a support ticket</p>
      </motion.div>

      {/* Contact Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Mail, label: 'Email Support', value: contactConfig.supportEmail,
            href: `mailto:${contactConfig.supportEmail}`, color: 'text-blue-600', bg: 'bg-blue-50',
            desc: 'Get a response within 24 hours'
          },
          {
            icon: Phone, label: 'Phone', value: contactConfig.phoneNumber,
            href: `tel:${contactConfig.phoneNumber}`, color: 'text-green-600', bg: 'bg-green-50',
            desc: contactConfig.officeHours
          },
          {
            icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us',
            href: `https://wa.me/${contactConfig.whatsappNumber}?text=${encodeURIComponent(contactConfig.whatsappMessage)}`,
            color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Quick responses on WhatsApp'
          },
          {
            icon: Clock, label: 'Office Hours', value: contactConfig.officeHours,
            color: 'text-amber-600', bg: 'bg-amber-50', desc: contactConfig.address
          },
        ].map((card, i) => (
          <motion.div key={card.label} custom={i + 1} variants={fadeUp} initial="hidden" animate="visible"
            className={`${card.bg} rounded-xl p-4 border border-slate-100`}>
            <card.icon className={`w-6 h-6 ${card.color} mb-2`} />
            <p className="text-sm font-semibold text-slate-700">{card.label}</p>
            {card.href ? (
              <a href={card.href} target={card.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className={`text-sm ${card.color} font-medium hover:underline flex items-center gap-1`}>
                {card.value} <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <p className="text-sm font-medium text-slate-800">{card.value}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">{card.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible"
        className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-indigo-500" /> Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-slate-100 rounded-lg overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 transition-colors">
                <span className="text-sm font-medium text-slate-700">{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {openFaq === idx && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  className="px-3 pb-3">
                  <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Support Ticket */}
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <Send className="w-4 h-4 text-indigo-500" /> Raise a Support Ticket
          </h2>
          {ticketSent ? (
            <div className="flex flex-col items-center justify-center py-8 text-green-600">
              <CheckCircle className="w-12 h-12 mb-2" />
              <p className="font-semibold">Ticket Submitted!</p>
              <p className="text-sm text-slate-500 mt-1">We'll respond within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleTicket} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Subject</label>
                <input type="text" required value={ticketForm.subject}
                  onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="Brief description of your issue" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Message</label>
                <textarea required rows={4} value={ticketForm.message}
                  onChange={e => setTicketForm({ ...ticketForm, message: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                  placeholder="Describe your issue in detail..." />
              </div>
              <button type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Submit Ticket
              </button>
            </form>
          )}
        </motion.div>

        {/* Quick Info */}
        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible"
          className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-indigo-500" /> Important Information
            </h2>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                Never share your login credentials with anyone.
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                Report any unauthorized access or suspicious activity immediately.
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                Profile changes require admin approval. Contact your class teacher first.
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                For technical issues, include screenshots when raising support tickets.
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
            <p className="text-sm font-semibold mb-1">Admin Contact</p>
            <p className="text-xs opacity-80 mb-2">For account-related issues (password reset, enrollment, profile update):</p>
            <p className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" /> {contactConfig.adminEmail}
            </p>
            <p className="text-sm font-medium flex items-center gap-2 mt-1">
              <Phone className="w-4 h-4" /> {contactConfig.phoneNumber}
            </p>
            <p className="text-[10px] opacity-60 mt-3">Portal Version {contactConfig.portalVersion}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
