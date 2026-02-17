import React from 'react';

const badgeStyles = {
  live: 'bg-red-100 text-red-700 border-red-200',
  upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  ended: 'bg-gray-100 text-gray-600 border-gray-200',
  hindi: 'bg-orange-100 text-orange-700 border-orange-200',
  english: 'bg-blue-100 text-blue-700 border-blue-200',
  pass: 'bg-green-100 text-green-700 border-green-200',
  fail: 'bg-red-100 text-red-700 border-red-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  graded: 'bg-green-100 text-green-700 border-green-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  alert: 'bg-red-100 text-red-700 border-red-200',
};

const dotStyles = {
  live: 'bg-red-500',
  upcoming: 'bg-blue-500',
};

export default function Badge({ variant = 'info', children, dot = false, className = '' }) {
  const key = variant.toLowerCase();
  const style = badgeStyles[key] || badgeStyles.info;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotStyles[key] || ''}`} />}
      {children}
    </span>
  );
}
