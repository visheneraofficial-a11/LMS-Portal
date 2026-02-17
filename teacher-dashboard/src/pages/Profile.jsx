import React, { useState } from 'react';
import { teacherProfile } from '../data/mockData';
import {
  User, Mail, Phone, Briefcase, Award, Calendar, Building2,
  Shield, Camera, Save, BookOpen, GraduationCap
} from 'lucide-react';

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: teacherProfile.name,
    email: teacherProfile.email,
    phone: teacherProfile.phone,
    department: teacherProfile.department,
    subject: teacherProfile.subject,
    employeeId: teacherProfile.employeeId,
    joiningDate: teacherProfile.joiningDate,
    classes: teacherProfile.classes,
    qualification: 'M.Sc. Physics, B.Ed.',
    specialization: 'Mechanics & Thermodynamics',
    experience: '8 years',
    address: 'EMRS Campus, Block A, Room 12',
    bio: 'Passionate physics educator with 8 years of experience in EMRS schools. Specialized in making complex physics concepts accessible through visual demonstrations and real-world applications.',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const InfoRow = ({ icon: Icon, label, value, field }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        {editing && field ? (
          <input
            type="text"
            value={profile[field]}
            onChange={e => setProfile(p => ({ ...p, [field]: e.target.value }))}
            className="mt-1 w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        ) : (
          <p className="text-sm text-gray-900 font-medium mt-0.5">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your profile information</p>
        </div>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            editing
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {editing ? <><Save className="w-4 h-4" /> Save Changes</> : <><User className="w-4 h-4" /> Edit Profile</>}
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
          Profile updated successfully!
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold border-4 border-white/30">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
              {editing && (
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-primary-600">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{profile.name}</h2>
              <p className="text-primary-100 text-sm">{profile.subject} Teacher · {profile.department} Dept</p>
              <p className="text-primary-200 text-xs mt-1">Employee ID: {profile.employeeId}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Bio */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">About</h3>
            {editing ? (
              <textarea
                value={profile.bio}
                onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            ) : (
              <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
            <InfoRow icon={Mail} label="Email" value={profile.email} field="email" />
            <InfoRow icon={Phone} label="Phone" value={profile.phone} field="phone" />
            <InfoRow icon={Briefcase} label="Department" value={profile.department} field="department" />
            <InfoRow icon={BookOpen} label="Subject" value={profile.subject} field="subject" />
            <InfoRow icon={GraduationCap} label="Qualification" value={profile.qualification} field="qualification" />
            <InfoRow icon={Award} label="Specialization" value={profile.specialization} field="specialization" />
            <InfoRow icon={Shield} label="Experience" value={profile.experience} field="experience" />
            <InfoRow icon={Calendar} label="Joining Date" value={new Date(profile.joiningDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} />
            <InfoRow icon={Building2} label="Address" value={profile.address} field="address" />
            <InfoRow icon={User} label="Classes Assigned" value={profile.classes.join(', ')} />
          </div>
        </div>
      </div>

      {/* Teaching Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: '71', color: 'blue' },
          { label: 'Classes/Week', value: '28', color: 'green' },
          { label: 'Tests Created', value: '12', color: 'amber' },
          { label: 'Avg. Attendance', value: '87%', color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className={`bg-${stat.color}-50 rounded-lg p-4 text-center border border-${stat.color}-100`}>
            <p className={`text-2xl font-bold text-${stat.color}-700`}>{stat.value}</p>
            <p className={`text-xs text-${stat.color}-600 mt-1`}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
