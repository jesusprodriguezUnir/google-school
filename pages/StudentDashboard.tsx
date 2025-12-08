import React, { useState, useMemo } from 'react';
import { useApp } from '../services/store';
import { UserRole } from '../types';
import { Bell, Search, Calendar } from 'lucide-react';
import { GradeCard } from '../components/GradeCard';
import { UpNextWidget } from '../components/UpNextWidget';
import { HomeworkWidget } from '../components/HomeworkWidget';
import { WeeklySchedule } from '../components/WeeklySchedule';

const MOTIVATIONAL_QUOTES = [
  "Creativity is intelligence having fun.",
  "The best way to predict the future is to create it.",
  "You are capable of amazing things.",
  "Focus on progress, not perfection."
];

export const StudentDashboard: React.FC = () => {
  const { data, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  if (!currentUser || currentUser.role !== UserRole.STUDENT) return null;

  const myGrades = data.grades.filter(g => g.studentId === currentUser.id);
  const myClassId = (currentUser as any).classId;
  const myClass = data.classes.find(c => c.id === myClassId);

  // Announcements logic
  const allAnnouncements = data.announcements.filter(a =>
    !a.targetClassId || a.targetClassId === myClassId
  ).map((a, i) => ({
    ...a,
    type: i === 0 ? 'URGENT' : i === 1 ? 'EVENT' : 'INFO'
  }));

  const filteredAnnouncements = useMemo(() => {
    return allAnnouncements.filter(a =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allAnnouncements, searchTerm]);

  const average = myGrades.length > 0
    ? (myGrades.reduce((acc, curr) => acc + curr.score, 0) / myGrades.length).toFixed(1)
    : '0.0';

  const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 relative overflow-hidden">
      {/* Background Ambient Mesh */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] bg-indigo-400/10 rounded-full blur-[100px] animate-pulse-slow delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">

        {/* Header / Banner */}
        <div className="relative rounded-3xl overflow-hidden p-8 text-white shadow-2xl group transition-all hover:scale-[1.01] duration-500">
          {/* Complex Mesh Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-500"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight">Hello, {currentUser.name.split(' ')[0]}!</h1>
              <p className="text-blue-100 text-lg font-light flex items-center gap-2">
                <span className="opacity-80">{myClass?.name}</span>
                <span className="w-1 h-1 bg-blue-200 rounded-full"></span>
                <span className="opacity-80 italic">"{randomQuote}"</span>
              </p>
            </div>

            {/* Floating Glass Orb for GPA */}
            <div className="relative group/orb cursor-default">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full blur opacity-25 group-hover/orb:opacity-75 transition duration-1000 group-hover/orb:duration-200"></div>
              <div className="relative w-32 h-32 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 flex flex-col items-center justify-center shadow-inner text-center">
                <span className="text-xs text-blue-100 uppercase tracking-widest font-semibold mb-1">GPA</span>
                <span className="text-4xl font-bold text-white drop-shadow-lg">{average}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Operations (Timeline & Homework) - Span 4 */}
          <div className="lg:col-span-4 space-y-6">
            {/* Up Next Widget with Schedule Button */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Timeline</span>
                <button
                  onClick={() => setIsScheduleOpen(true)}
                  className="text-xs bg-white/50 hover:bg-white text-indigo-600 px-3 py-1.5 rounded-full font-bold shadow-sm backdrop-blur-md transition-all flex items-center gap-1"
                >
                  <Calendar size={12} />
                  View Schedule
                </button>
              </div>
              <UpNextWidget />
            </div>

            {/* Homework Widget (Full height to fill space) */}
            <div className="h-[400px]">
              <HomeworkWidget />
            </div>
          </div>

          {/* Middle Column: Grades & Progress - Span 5 */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-gray-800 text-xl">My Progress</h3>
              <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">View All</button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {myGrades.map(grade => (
                <GradeCard key={grade.id} grade={grade} />
              ))}
            </div>
          </div>

          {/* Right Column: Notice Board & Quick Info - Span 3 */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg h-full flex flex-col">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <Bell className="text-indigo-500" size={20} />
                    Notice Board
                  </h3>
                </div>
                {/* Functional Search Bar */}
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                  <input
                    type="text"
                    placeholder="Search notices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/50 border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-6 overflow-y-auto max-h-[600px] custom-scrollbar pr-2">
                {filteredAnnouncements.length > 0 ? (
                  filteredAnnouncements.map((ann, idx) => (
                    <div key={ann.id} className="relative pl-4 border-l-2 border-indigo-100 hover:border-indigo-400 transition-colors py-1 group cursor-pointer">
                      <span className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full border-2 border-white ${ann.type === 'URGENT' ? 'bg-red-500' : ann.type === 'EVENT' ? 'bg-blue-500' : 'bg-gray-400'
                        } group-hover:scale-125 transition-transform`}></span>

                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{ann.date}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${ann.type === 'URGENT' ? 'bg-red-100 text-red-600' :
                            ann.type === 'EVENT' ? 'bg-blue-100 text-blue-600' :
                              'bg-gray-100 text-gray-600'
                          }`}>
                          {ann.type}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm mb-1 group-hover:text-indigo-600 transition-colors">{ann.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{ann.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No notices found.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Schedule Modal */}
      <WeeklySchedule isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
    </div>
  );
};