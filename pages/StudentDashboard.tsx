import React from 'react';
import { useApp } from '../services/store';
import { UserRole } from '../types';
import { Bell, FileText, Trophy } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { data, currentUser } = useApp();

  if (!currentUser || currentUser.role !== UserRole.STUDENT) return null;

  const myGrades = data.grades.filter(g => g.studentId === currentUser.id);
  const myClassId = (currentUser as any).classId;
  const myClass = data.classes.find(c => c.id === myClassId);
  
  // Global announcements or my class announcements
  const announcements = data.announcements.filter(a => 
    !a.targetClassId || a.targetClassId === myClassId
  );

  const average = myGrades.length > 0 
    ? (myGrades.reduce((acc, curr) => acc + curr.score, 0) / myGrades.length).toFixed(1)
    : '0.0';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Grades */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex justify-between items-center">
             <div>
                <h1 className="text-3xl font-bold mb-2">Hello, {currentUser.name.split(' ')[0]}!</h1>
                <p className="text-blue-100">{myClass?.name} • Student</p>
             </div>
             <div className="text-right">
                <p className="text-blue-200 text-sm uppercase tracking-wider font-medium">GPA / Average</p>
                <p className="text-4xl font-bold">{average}</p>
             </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 text-xl mb-4 flex items-center gap-2">
            <Trophy className="text-amber-500" />
            My Grades
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myGrades.map(grade => (
              <div key={grade.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-colors">
                 <div className="flex justify-between items-start mb-4">
                    <span className="font-bold text-gray-700 text-lg">{grade.subject}</span>
                    <span className={`text-xl font-bold ${grade.score >= 5 ? 'text-green-600' : 'text-red-500'}`}>
                      {grade.score}
                    </span>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 italic">"{grade.feedback}"</p>
                    <p className="text-xs text-gray-400 mt-2 text-right">{grade.date}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Announcements */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
           <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
             <Bell className="text-blue-500" size={20} />
             Notice Board
           </h3>
           <div className="space-y-4">
             {announcements.map(ann => (
               <div key={ann.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                 <p className="text-xs text-blue-600 font-semibold mb-1">{ann.date}</p>
                 <h4 className="font-medium text-gray-900 mb-1">{ann.title}</h4>
                 <p className="text-sm text-gray-500 line-clamp-3">{ann.content}</p>
               </div>
             ))}
             {announcements.length === 0 && (
               <p className="text-gray-400 text-sm text-center py-4">No new announcements</p>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};