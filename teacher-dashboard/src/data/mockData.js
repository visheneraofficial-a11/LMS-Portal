// Mock data for Teacher Dashboard
// Teacher: Rajesh Kumar, Physics & Chemistry, Classes 9th & 11th

export const teacherProfile = {
  id: 'T001',
  name: 'Rajesh Kumar',
  email: 'rajesh.kumar@emrs.edu.in',
  phone: '+91 98765 43210',
  subject: 'Physics',
  classes: ['9th', '11th'],
  avatar: null,
  department: 'Science',
  employeeId: 'EMRS-TCH-045',
  joiningDate: '2023-08-01',
};

export const todaySchedule = [
  { id: 1, subject: 'Physics', topic: 'Newton\'s Laws of Motion', class: '11th', language: 'Hindi', time: '09:00 AM', endTime: '10:00 AM', status: 'Completed', youtubeLink: 'https://youtube.com/live/abc123', students: 18 },
  { id: 2, subject: 'Physics', topic: 'Newton\'s Laws of Motion', class: '11th', language: 'English', time: '10:15 AM', endTime: '11:15 AM', status: 'Live', youtubeLink: 'https://youtube.com/live/def456', students: 16 },
  { id: 3, subject: 'Chemistry', topic: 'Chemical Bonding', class: '11th', language: 'Hindi', time: '11:30 AM', endTime: '12:30 PM', status: 'Upcoming', youtubeLink: 'https://youtube.com/live/ghi789', students: 18 },
  { id: 4, subject: 'Chemistry', topic: 'Chemical Bonding', class: '11th', language: 'English', time: '02:00 PM', endTime: '03:00 PM', status: 'Upcoming', youtubeLink: 'https://youtube.com/live/jkl012', students: 16 },
  { id: 5, subject: 'Physics', topic: 'Kinematics', class: '9th', language: 'Hindi', time: '03:30 PM', endTime: '04:30 PM', status: 'Upcoming', youtubeLink: 'https://youtube.com/live/mno345', students: 20 },
  { id: 6, subject: 'Physics', topic: 'Kinematics', class: '9th', language: 'English', time: '04:45 PM', endTime: '05:45 PM', status: 'Upcoming', youtubeLink: 'https://youtube.com/live/pqr678', students: 17 },
];

export const quickStats = {
  totalStudents: 71,
  todayAttendance: 87,
  upcomingTests: 3,
  liveClassesToday: 6,
};

export const recentActivity = [
  { id: 1, action: 'Marked attendance for 11th Hindi', time: '09:55 AM', date: 'Feb 17, 2026', icon: 'clipboard-check' },
  { id: 2, action: 'Updated Physics test marks - 11th', time: '08:30 AM', date: 'Feb 17, 2026', icon: 'edit' },
  { id: 3, action: 'Completed live class: Newton\'s Laws (Hindi)', time: '10:00 AM', date: 'Feb 17, 2026', icon: 'video' },
  { id: 4, action: 'Uploaded study material: Kinematics Ch-3', time: '04:00 PM', date: 'Feb 16, 2026', icon: 'upload' },
  { id: 5, action: 'Marked attendance for 9th English', time: '03:30 PM', date: 'Feb 16, 2026', icon: 'clipboard-check' },
];

export const classSummary = [
  { className: '11th - Hindi Medium', students: 18, section: 'A' },
  { className: '11th - English Medium', students: 16, section: 'B' },
  { className: '9th - Hindi Medium', students: 20, section: 'A' },
  { className: '9th - English Medium', students: 17, section: 'B' },
];

// Students Data
const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Priya', 'Ananya', 'Diya', 'Saanvi', 'Myra', 'Aadhya', 'Riya', 'Kavya', 'Pooja', 'Neha'];
const lastNames = ['Sharma', 'Verma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Joshi', 'Mishra', 'Yadav', 'Chauhan', 'Tiwari', 'Pandey', 'Rajput', 'Thakur', 'Meena', 'Nagar', 'Bairwa', 'Saini', 'Choudhary', 'Rathore'];

function generateStudents(className, language, count, startRoll) {
  return Array.from({ length: count }, (_, i) => {
    const fn = firstNames[(startRoll + i) % firstNames.length];
    const ln = lastNames[(startRoll + i + 3) % lastNames.length];
    const attendance = Math.floor(Math.random() * 25 + 70);
    const lastScore = Math.floor(Math.random() * 40 + 55);
    return {
      id: `S${String(startRoll + i + 1).padStart(3, '0')}`,
      rollNo: startRoll + i + 1,
      name: `${fn} ${ln}`,
      class: className,
      language,
      contact: `+91 ${String(Math.floor(Math.random() * 9000000000 + 1000000000))}`,
      parentContact: `+91 ${String(Math.floor(Math.random() * 9000000000 + 1000000000))}`,
      attendancePercent: attendance,
      lastTestScore: lastScore,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@student.emrs.in`,
    };
  });
}

export const students = [
  ...generateStudents('11th', 'Hindi', 18, 0),
  ...generateStudents('11th', 'English', 16, 18),
  ...generateStudents('9th', 'Hindi', 20, 34),
  ...generateStudents('9th', 'English', 17, 54),
];

// Attendance data for current month (Feb 2026)
function generateAttendanceData(studentList) {
  const daysInMonth = 28; // Feb 2026
  const holidays = [1, 8, 15, 22]; // Sundays
  return studentList.map(s => {
    const days = {};
    for (let d = 1; d <= daysInMonth; d++) {
      if (holidays.includes(d)) {
        days[d] = 'holiday';
      } else if (d > 17) {
        days[d] = null; // future
      } else {
        days[d] = Math.random() > 0.15 ? 'present' : 'absent';
      }
    }
    return { studentId: s.id, studentName: s.name, rollNo: s.rollNo, days };
  });
}

export const attendanceData = {
  '11th-Hindi': generateAttendanceData(students.filter(s => s.class === '11th' && s.language === 'Hindi')),
  '11th-English': generateAttendanceData(students.filter(s => s.class === '11th' && s.language === 'English')),
  '9th-Hindi': generateAttendanceData(students.filter(s => s.class === '9th' && s.language === 'Hindi')),
  '9th-English': generateAttendanceData(students.filter(s => s.class === '9th' && s.language === 'English')),
};

// Tests
export const tests = [
  { id: 'T001', name: 'Unit Test 1 - Mechanics', class: '11th', subject: 'Physics', totalMarks: 100, date: '2026-02-05', status: 'Graded' },
  { id: 'T002', name: 'Weekly Quiz - Chemical Bonding', class: '11th', subject: 'Chemistry', totalMarks: 50, date: '2026-02-10', status: 'Graded' },
  { id: 'T003', name: 'Unit Test 1 - Kinematics', class: '9th', subject: 'Physics', totalMarks: 100, date: '2026-02-12', status: 'Pending' },
  { id: 'T004', name: 'Mid-Term Exam - Physics', class: '11th', subject: 'Physics', totalMarks: 200, date: '2026-02-20', status: 'Upcoming' },
];

function generateTestMarks(test, studentList) {
  return studentList.map((s, i) => {
    const marks = test.status === 'Upcoming' ? null : Math.floor(Math.random() * (test.totalMarks * 0.5) + test.totalMarks * 0.3);
    return {
      studentId: s.id,
      studentName: s.name,
      rollNo: s.rollNo,
      marks: marks,
      totalMarks: test.totalMarks,
      percentage: marks ? Math.round((marks / test.totalMarks) * 100) : null,
      status: marks ? (marks >= test.totalMarks * 0.33 ? 'Pass' : 'Fail') : null,
    };
  });
}

export const testMarks = {
  T001: generateTestMarks(tests[0], students.filter(s => s.class === '11th')),
  T002: generateTestMarks(tests[1], students.filter(s => s.class === '11th')),
  T003: generateTestMarks(tests[2], students.filter(s => s.class === '9th')),
  T004: generateTestMarks(tests[3], students.filter(s => s.class === '11th')),
};

// Weekly Schedule (Mon-Sat)
export const weeklySchedule = {
  Monday: [
    { time: '09:00 - 10:00', subject: 'Physics', class: '11th', language: 'Hindi', topic: 'Mechanics' },
    { time: '10:15 - 11:15', subject: 'Physics', class: '11th', language: 'English', topic: 'Mechanics' },
    { time: '11:30 - 12:30', subject: 'Chemistry', class: '11th', language: 'Hindi', topic: 'Chemical Bonding' },
    { time: '02:00 - 03:00', subject: 'Chemistry', class: '11th', language: 'English', topic: 'Chemical Bonding' },
    { time: '03:30 - 04:30', subject: 'Physics', class: '9th', language: 'Hindi', topic: 'Kinematics' },
    { time: '04:45 - 05:45', subject: 'Physics', class: '9th', language: 'English', topic: 'Kinematics' },
  ],
  Tuesday: [
    { time: '09:00 - 10:00', subject: 'Physics', class: '9th', language: 'Hindi', topic: 'Force & Motion' },
    { time: '10:15 - 11:15', subject: 'Physics', class: '9th', language: 'English', topic: 'Force & Motion' },
    { time: '11:30 - 12:30', subject: 'Physics', class: '11th', language: 'Hindi', topic: 'Thermodynamics' },
    { time: '02:00 - 03:00', subject: 'Physics', class: '11th', language: 'English', topic: 'Thermodynamics' },
    { time: '03:30 - 04:30', subject: 'Chemistry', class: '9th', language: 'Hindi', topic: 'Atoms & Molecules' },
    { time: '04:45 - 05:45', subject: 'Chemistry', class: '9th', language: 'English', topic: 'Atoms & Molecules' },
  ],
  Wednesday: [
    { time: '09:00 - 10:00', subject: 'Physics', class: '11th', language: 'Hindi', topic: 'Work, Energy & Power' },
    { time: '10:15 - 11:15', subject: 'Physics', class: '11th', language: 'English', topic: 'Work, Energy & Power' },
    { time: '11:30 - 12:30', subject: 'Chemistry', class: '11th', language: 'Hindi', topic: 'States of Matter' },
    { time: '02:00 - 03:00', subject: 'Chemistry', class: '11th', language: 'English', topic: 'States of Matter' },
    { time: '03:30 - 04:30', subject: 'Physics', class: '9th', language: 'Hindi', topic: 'Gravitation' },
    { time: '04:45 - 05:45', subject: 'Physics', class: '9th', language: 'English', topic: 'Gravitation' },
  ],
  Thursday: [
    { time: '09:00 - 10:00', subject: 'Chemistry', class: '9th', language: 'Hindi', topic: 'Structure of Atom' },
    { time: '10:15 - 11:15', subject: 'Chemistry', class: '9th', language: 'English', topic: 'Structure of Atom' },
    { time: '11:30 - 12:30', subject: 'Physics', class: '11th', language: 'Hindi', topic: 'Rotational Motion' },
    { time: '02:00 - 03:00', subject: 'Physics', class: '11th', language: 'English', topic: 'Rotational Motion' },
    { time: '03:30 - 04:30', subject: 'Physics', class: '9th', language: 'Hindi', topic: 'Sound' },
    { time: '04:45 - 05:45', subject: 'Physics', class: '9th', language: 'English', topic: 'Sound' },
  ],
  Friday: [
    { time: '09:00 - 10:00', subject: 'Physics', class: '11th', language: 'Hindi', topic: 'Oscillations' },
    { time: '10:15 - 11:15', subject: 'Physics', class: '11th', language: 'English', topic: 'Oscillations' },
    { time: '11:30 - 12:30', subject: 'Chemistry', class: '11th', language: 'Hindi', topic: 'Equilibrium' },
    { time: '02:00 - 03:00', subject: 'Chemistry', class: '11th', language: 'English', topic: 'Equilibrium' },
    { time: '03:30 - 04:30', subject: 'Physics', class: '9th', language: 'Hindi', topic: 'Light' },
    { time: '04:45 - 05:45', subject: 'Physics', class: '9th', language: 'English', topic: 'Light' },
  ],
  Saturday: [
    { time: '09:00 - 10:00', subject: 'Physics', class: '11th', language: 'Hindi', topic: 'Revision & Doubt Session' },
    { time: '10:15 - 11:15', subject: 'Physics', class: '11th', language: 'English', topic: 'Revision & Doubt Session' },
    { time: '11:30 - 12:30', subject: 'Physics', class: '9th', language: 'Hindi', topic: 'Revision & Doubt Session' },
    { time: '02:00 - 03:00', subject: 'Physics', class: '9th', language: 'English', topic: 'Revision & Doubt Session' },
  ],
};

// Live classes (past 7 days + today)
export const liveClasses = [
  ...todaySchedule,
  { id: 7, subject: 'Physics', topic: 'Projectile Motion', class: '11th', language: 'Hindi', time: '09:00 AM', endTime: '10:00 AM', date: '2026-02-16', status: 'Ended', youtubeLink: 'https://youtube.com/watch?v=past1', students: 17 },
  { id: 8, subject: 'Physics', topic: 'Projectile Motion', class: '11th', language: 'English', time: '10:15 AM', endTime: '11:15 AM', date: '2026-02-16', status: 'Ended', youtubeLink: 'https://youtube.com/watch?v=past2', students: 15 },
  { id: 9, subject: 'Chemistry', topic: 'Periodic Table', class: '11th', language: 'Hindi', time: '11:30 AM', endTime: '12:30 PM', date: '2026-02-16', status: 'Ended', youtubeLink: 'https://youtube.com/watch?v=past3', students: 18 },
  { id: 10, subject: 'Physics', topic: 'Laws of Motion', class: '9th', language: 'Hindi', time: '03:30 PM', endTime: '04:30 PM', date: '2026-02-15', status: 'Ended', youtubeLink: 'https://youtube.com/watch?v=past4', students: 19 },
  { id: 11, subject: 'Physics', topic: 'Laws of Motion', class: '9th', language: 'English', time: '04:45 PM', endTime: '05:45 PM', date: '2026-02-15', status: 'Ended', youtubeLink: 'https://youtube.com/watch?v=past5', students: 16 },
  { id: 12, subject: 'Chemistry', topic: 'Atomic Structure', class: '9th', language: 'Hindi', time: '09:00 AM', endTime: '10:00 AM', date: '2026-02-14', status: 'Ended', youtubeLink: 'https://youtube.com/watch?v=past6', students: 20 },
  { id: 13, subject: 'Physics', topic: 'Units & Measurement', class: '11th', language: 'Hindi', time: '09:00 AM', endTime: '10:00 AM', date: '2026-02-13', status: 'Ended', youtubeLink: 'https://youtube.com/watch?v=past7', students: 17 },
  { id: 14, subject: 'Physics', topic: 'Units & Measurement', class: '11th', language: 'English', time: '10:15 AM', endTime: '11:15 AM', date: '2026-02-13', status: 'Ended', youtubeLink: 'https://youtube.com/watch?v=past8', students: 16 },
  { id: 15, subject: 'Chemistry', topic: 'Mole Concept', class: '11th', language: 'Hindi', time: '11:30 AM', endTime: '12:30 PM', date: '2026-02-12', status: 'Ended', youtubeLink: 'https://youtube.com/watch?v=past9', students: 18 },
  { id: 16, subject: 'Physics', topic: 'Motion in a Plane', class: '9th', language: 'English', time: '04:45 PM', endTime: '05:45 PM', date: '2026-02-11', status: 'Ended', youtubeLink: 'https://youtube.com/watch?v=past10', students: 15 },
];

// E-Books
export const ebooks = [
  { id: 1, class: '11th', subject: 'Physics', chapter: 'Ch 1 - Physical World', author: 'NCERT', pages: 24, fileUrl: '#' },
  { id: 2, class: '11th', subject: 'Physics', chapter: 'Ch 2 - Units and Measurement', author: 'NCERT', pages: 32, fileUrl: '#' },
  { id: 3, class: '11th', subject: 'Physics', chapter: 'Ch 3 - Motion in a Straight Line', author: 'NCERT', pages: 28, fileUrl: '#' },
  { id: 4, class: '11th', subject: 'Physics', chapter: 'Ch 4 - Motion in a Plane', author: 'NCERT', pages: 30, fileUrl: '#' },
  { id: 5, class: '11th', subject: 'Physics', chapter: 'Ch 5 - Laws of Motion', author: 'NCERT', pages: 34, fileUrl: '#' },
  { id: 6, class: '11th', subject: 'Chemistry', chapter: 'Ch 1 - Some Basic Concepts', author: 'NCERT', pages: 26, fileUrl: '#' },
  { id: 7, class: '11th', subject: 'Chemistry', chapter: 'Ch 2 - Structure of Atom', author: 'NCERT', pages: 38, fileUrl: '#' },
  { id: 8, class: '11th', subject: 'Chemistry', chapter: 'Ch 3 - Classification of Elements', author: 'NCERT', pages: 22, fileUrl: '#' },
  { id: 9, class: '9th', subject: 'Physics', chapter: 'Ch 1 - Motion', author: 'NCERT', pages: 20, fileUrl: '#' },
  { id: 10, class: '9th', subject: 'Physics', chapter: 'Ch 2 - Force and Laws of Motion', author: 'NCERT', pages: 22, fileUrl: '#' },
  { id: 11, class: '9th', subject: 'Physics', chapter: 'Ch 3 - Gravitation', author: 'NCERT', pages: 18, fileUrl: '#' },
  { id: 12, class: '9th', subject: 'Chemistry', chapter: 'Ch 1 - Matter in Surroundings', author: 'NCERT', pages: 16, fileUrl: '#' },
  { id: 13, class: '9th', subject: 'Chemistry', chapter: 'Ch 2 - Is Matter Around Us Pure', author: 'NCERT', pages: 24, fileUrl: '#' },
];

// Video Lectures
export const videoLectures = [
  { id: 1, class: '11th', subject: 'Physics', chapter: 'Units & Measurement', title: 'Introduction to SI Units', duration: '45 min', videoUrl: 'https://youtube.com/watch?v=v1', date: '2026-02-01' },
  { id: 2, class: '11th', subject: 'Physics', chapter: 'Motion in a Straight Line', title: 'Speed, Velocity & Acceleration', duration: '52 min', videoUrl: 'https://youtube.com/watch?v=v2', date: '2026-02-03' },
  { id: 3, class: '11th', subject: 'Physics', chapter: 'Motion in a Plane', title: 'Projectile Motion Basics', duration: '48 min', videoUrl: 'https://youtube.com/watch?v=v3', date: '2026-02-05' },
  { id: 4, class: '11th', subject: 'Physics', chapter: 'Laws of Motion', title: "Newton's First & Second Law", duration: '55 min', videoUrl: 'https://youtube.com/watch?v=v4', date: '2026-02-07' },
  { id: 5, class: '11th', subject: 'Chemistry', chapter: 'Some Basic Concepts', title: 'Mole Concept & Stoichiometry', duration: '50 min', videoUrl: 'https://youtube.com/watch?v=v5', date: '2026-02-02' },
  { id: 6, class: '11th', subject: 'Chemistry', chapter: 'Structure of Atom', title: 'Bohr Model & Quantum Numbers', duration: '58 min', videoUrl: 'https://youtube.com/watch?v=v6', date: '2026-02-04' },
  { id: 7, class: '11th', subject: 'Chemistry', chapter: 'Chemical Bonding', title: 'Ionic & Covalent Bonds', duration: '46 min', videoUrl: 'https://youtube.com/watch?v=v7', date: '2026-02-08' },
  { id: 8, class: '9th', subject: 'Physics', chapter: 'Motion', title: 'Distance, Displacement & Speed', duration: '40 min', videoUrl: 'https://youtube.com/watch?v=v8', date: '2026-02-01' },
  { id: 9, class: '9th', subject: 'Physics', chapter: 'Force and Laws of Motion', title: 'Introduction to Forces', duration: '42 min', videoUrl: 'https://youtube.com/watch?v=v9', date: '2026-02-06' },
  { id: 10, class: '9th', subject: 'Physics', chapter: 'Gravitation', title: 'Universal Law of Gravitation', duration: '38 min', videoUrl: 'https://youtube.com/watch?v=v10', date: '2026-02-09' },
  { id: 11, class: '9th', subject: 'Chemistry', chapter: 'Matter in Surroundings', title: 'States of Matter', duration: '35 min', videoUrl: 'https://youtube.com/watch?v=v11', date: '2026-02-03' },
  { id: 12, class: '9th', subject: 'Chemistry', chapter: 'Is Matter Around Us Pure', title: 'Mixtures and Solutions', duration: '44 min', videoUrl: 'https://youtube.com/watch?v=v12', date: '2026-02-10' },
];

// Class Schedule (for the class-schedule page - timetable view)
export const classScheduleData = {
  '11th': {
    Monday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Physics', teacher: 'Rajesh Kumar' },
      { period: 2, time: '09:45 - 10:30', subject: 'Chemistry', teacher: 'Rajesh Kumar' },
      { period: 3, time: '10:45 - 11:30', subject: 'Maths', teacher: 'Suresh Verma' },
      { period: 4, time: '11:30 - 12:15', subject: 'Biology', teacher: 'Priya Sharma' },
      { period: 5, time: '02:00 - 02:45', subject: 'Physics', teacher: 'Rajesh Kumar' },
      { period: 6, time: '02:45 - 03:30', subject: 'Maths', teacher: 'Suresh Verma' },
    ],
    Tuesday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Chemistry', teacher: 'Rajesh Kumar' },
      { period: 2, time: '09:45 - 10:30', subject: 'Maths', teacher: 'Suresh Verma' },
      { period: 3, time: '10:45 - 11:30', subject: 'Physics', teacher: 'Rajesh Kumar' },
      { period: 4, time: '11:30 - 12:15', subject: 'Biology', teacher: 'Priya Sharma' },
      { period: 5, time: '02:00 - 02:45', subject: 'Chemistry', teacher: 'Rajesh Kumar' },
      { period: 6, time: '02:45 - 03:30', subject: 'Biology', teacher: 'Priya Sharma' },
    ],
    Wednesday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Maths', teacher: 'Suresh Verma' },
      { period: 2, time: '09:45 - 10:30', subject: 'Physics', teacher: 'Rajesh Kumar' },
      { period: 3, time: '10:45 - 11:30', subject: 'Chemistry', teacher: 'Rajesh Kumar' },
      { period: 4, time: '11:30 - 12:15', subject: 'Maths', teacher: 'Suresh Verma' },
      { period: 5, time: '02:00 - 02:45', subject: 'Biology', teacher: 'Priya Sharma' },
      { period: 6, time: '02:45 - 03:30', subject: 'Physics', teacher: 'Rajesh Kumar' },
    ],
    Thursday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Biology', teacher: 'Priya Sharma' },
      { period: 2, time: '09:45 - 10:30', subject: 'Chemistry', teacher: 'Rajesh Kumar' },
      { period: 3, time: '10:45 - 11:30', subject: 'Maths', teacher: 'Suresh Verma' },
      { period: 4, time: '11:30 - 12:15', subject: 'Physics', teacher: 'Rajesh Kumar' },
      { period: 5, time: '02:00 - 02:45', subject: 'Maths', teacher: 'Suresh Verma' },
      { period: 6, time: '02:45 - 03:30', subject: 'Chemistry', teacher: 'Rajesh Kumar' },
    ],
    Friday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Physics', teacher: 'Rajesh Kumar' },
      { period: 2, time: '09:45 - 10:30', subject: 'Biology', teacher: 'Priya Sharma' },
      { period: 3, time: '10:45 - 11:30', subject: 'Chemistry', teacher: 'Rajesh Kumar' },
      { period: 4, time: '11:30 - 12:15', subject: 'Maths', teacher: 'Suresh Verma' },
      { period: 5, time: '02:00 - 02:45', subject: 'Physics', teacher: 'Rajesh Kumar' },
      { period: 6, time: '02:45 - 03:30', subject: 'Biology', teacher: 'Priya Sharma' },
    ],
    Saturday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Physics', teacher: 'Rajesh Kumar' },
      { period: 2, time: '09:45 - 10:30', subject: 'Chemistry', teacher: 'Rajesh Kumar' },
      { period: 3, time: '10:45 - 11:30', subject: 'Doubt Session', teacher: 'All' },
      { period: 4, time: '11:30 - 12:15', subject: 'Doubt Session', teacher: 'All' },
    ],
  },
  '9th': {
    Monday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Maths', teacher: 'Suresh Verma' },
      { period: 2, time: '09:45 - 10:30', subject: 'Physics', teacher: 'Rajesh Kumar' },
      { period: 3, time: '10:45 - 11:30', subject: 'Biology', teacher: 'Priya Sharma' },
      { period: 4, time: '11:30 - 12:15', subject: 'Chemistry', teacher: 'Rajesh Kumar' },
      { period: 5, time: '02:00 - 02:45', subject: 'Maths', teacher: 'Suresh Verma' },
      { period: 6, time: '02:45 - 03:30', subject: 'Physics', teacher: 'Rajesh Kumar' },
    ],
    Tuesday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Physics', teacher: 'Rajesh Kumar' },
      { period: 2, time: '09:45 - 10:30', subject: 'Maths', teacher: 'Suresh Verma' },
      { period: 3, time: '10:45 - 11:30', subject: 'Chemistry', teacher: 'Rajesh Kumar' },
      { period: 4, time: '11:30 - 12:15', subject: 'Biology', teacher: 'Priya Sharma' },
      { period: 5, time: '02:00 - 02:45', subject: 'Physics', teacher: 'Rajesh Kumar' },
      { period: 6, time: '02:45 - 03:30', subject: 'Maths', teacher: 'Suresh Verma' },
    ],
    Wednesday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Chemistry', teacher: 'Rajesh Kumar' },
      { period: 2, time: '09:45 - 10:30', subject: 'Physics', teacher: 'Rajesh Kumar' },
      { period: 3, time: '10:45 - 11:30', subject: 'Maths', teacher: 'Suresh Verma' },
      { period: 4, time: '11:30 - 12:15', subject: 'Biology', teacher: 'Priya Sharma' },
      { period: 5, time: '02:00 - 02:45', subject: 'Chemistry', teacher: 'Rajesh Kumar' },
      { period: 6, time: '02:45 - 03:30', subject: 'Physics', teacher: 'Rajesh Kumar' },
    ],
    Thursday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Biology', teacher: 'Priya Sharma' },
      { period: 2, time: '09:45 - 10:30', subject: 'Physics', teacher: 'Rajesh Kumar' },
      { period: 3, time: '10:45 - 11:30', subject: 'Maths', teacher: 'Suresh Verma' },
      { period: 4, time: '11:30 - 12:15', subject: 'Chemistry', teacher: 'Rajesh Kumar' },
      { period: 5, time: '02:00 - 02:45', subject: 'Biology', teacher: 'Priya Sharma' },
      { period: 6, time: '02:45 - 03:30', subject: 'Maths', teacher: 'Suresh Verma' },
    ],
    Friday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Physics', teacher: 'Rajesh Kumar' },
      { period: 2, time: '09:45 - 10:30', subject: 'Chemistry', teacher: 'Rajesh Kumar' },
      { period: 3, time: '10:45 - 11:30', subject: 'Biology', teacher: 'Priya Sharma' },
      { period: 4, time: '11:30 - 12:15', subject: 'Maths', teacher: 'Suresh Verma' },
      { period: 5, time: '02:00 - 02:45', subject: 'Physics', teacher: 'Rajesh Kumar' },
      { period: 6, time: '02:45 - 03:30', subject: 'Chemistry', teacher: 'Rajesh Kumar' },
    ],
    Saturday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Physics', teacher: 'Rajesh Kumar' },
      { period: 2, time: '09:45 - 10:30', subject: 'Maths', teacher: 'Suresh Verma' },
      { period: 3, time: '10:45 - 11:30', subject: 'Doubt Session', teacher: 'All' },
      { period: 4, time: '11:30 - 12:15', subject: 'Doubt Session', teacher: 'All' },
    ],
  },
};

// Notifications
export const notifications = [
  { id: 1, title: 'Test Reminder', message: 'Mid-Term Exam scheduled for Feb 20', time: '2 hours ago', read: false, type: 'warning' },
  { id: 2, title: 'Attendance Alert', message: '3 students below 75% attendance in 11th', time: '5 hours ago', read: false, type: 'alert' },
  { id: 3, title: 'New Material Uploaded', message: 'Admin uploaded new Chemistry reference', time: '1 day ago', read: true, type: 'info' },
  { id: 4, title: 'Schedule Change', message: 'Saturday doubt session moved to 10 AM', time: '2 days ago', read: true, type: 'info' },
];

// Student Login/Logout session data (last 30 days)
function generateStudentSessions(student) {
  const sessions = [];
  const today = new Date(2026, 1, 17); // Feb 17, 2026
  const holidays = [1, 8, 15, 22]; // Sundays

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const day = date.getDate();
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0) {
      sessions.push({ date: date.toISOString().split('T')[0], status: 'holiday', sessions: [] });
      continue;
    }

    if (date > today) {
      sessions.push({ date: date.toISOString().split('T')[0], status: 'future', sessions: [] });
      continue;
    }

    // Use student id as seed for deterministic randomness
    const seed = parseInt(student.id.replace('S', '')) + day * 7;
    const isPresent = (seed * 17 + day * 31) % 100 > 15;

    if (!isPresent) {
      sessions.push({ date: date.toISOString().split('T')[0], status: 'absent', sessions: [] });
      continue;
    }

    // Generate login/logout sessions
    const loginHour = 8 + (seed % 2);
    const loginMin = (seed * 3) % 60;
    const logoutHour = 16 + (seed % 3);
    const logoutMin = (seed * 7) % 60;
    const totalMinutes = (logoutHour - loginHour) * 60 + (logoutMin - loginMin);

    const daySessions = [
      {
        loginTime: `${String(loginHour).padStart(2, '0')}:${String(loginMin).padStart(2, '0')}`,
        logoutTime: `${String(logoutHour).padStart(2, '0')}:${String(logoutMin).padStart(2, '0')}`,
        duration: `${Math.floor(totalMinutes / 60)}h ${Math.abs(totalMinutes % 60)}m`,
        device: seed % 3 === 0 ? 'Mobile' : seed % 3 === 1 ? 'Laptop' : 'Tablet',
        ip: `192.168.${(seed % 5) + 1}.${(seed * 13) % 255}`,
      },
    ];

    // Some days have multiple sessions (re-login)
    if (seed % 5 === 0) {
      const reLoginHour = 12 + (seed % 2);
      const reLoginMin = (seed * 11) % 60;
      const reLogoutHour = 14 + (seed % 2);
      const reLogoutMin = (seed * 5) % 60;
      const reDur = (reLogoutHour - reLoginHour) * 60 + (reLogoutMin - reLoginMin);
      daySessions.push({
        loginTime: `${String(reLoginHour).padStart(2, '0')}:${String(reLoginMin).padStart(2, '0')}`,
        logoutTime: `${String(reLogoutHour).padStart(2, '0')}:${String(reLogoutMin).padStart(2, '0')}`,
        duration: `${Math.floor(reDur / 60)}h ${Math.abs(reDur % 60)}m`,
        device: 'Mobile',
        ip: `192.168.${(seed % 5) + 1}.${(seed * 17) % 255}`,
      });
    }

    sessions.push({ date: date.toISOString().split('T')[0], status: 'present', sessions: daySessions });
  }

  return sessions;
}

export function getStudentSessionData(studentId) {
  const student = students.find(s => s.id === studentId);
  if (!student) return [];
  return generateStudentSessions(student);
}

export const classOptions = [
  { value: '11th-Hindi', label: '11th - Hindi Medium' },
  { value: '11th-English', label: '11th - English Medium' },
  { value: '9th-Hindi', label: '9th - Hindi Medium' },
  { value: '9th-English', label: '9th - English Medium' },
];

export const subjectOptions = [
  { value: 'Physics', label: 'Physics' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Maths', label: 'Maths' },
  { value: 'Biology', label: 'Biology' },
];
