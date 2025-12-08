import React, { useState } from 'react';
import { useApp } from '../services/store';
import { Grade, UserRole } from '../types';
import { Users, Save, Search, BookOpen } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { data, currentUser, updateGrade } = useApp();
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  if (!currentUser || currentUser.role !== UserRole.TEACHER) return null;

  // Get classes assigned to this teacher
  const myClasses = data.classes.filter(c => c.teacherId === currentUser.id);

  // Default to first class if not selected
  if (!selectedClassId && myClasses.length > 0) {
    setSelectedClassId(myClasses[0].id);
  }

  const selectedClass = myClasses.find(c => c.id === selectedClassId);
  
  // Get students in the selected class
  const students = data.users.filter(u => 
    u.role === UserRole.STUDENT && (u as any).classId === selectedClassId
  );

  const handleScoreChange = (studentId: string, subject: string, newScore: string) => {
    const numScore = Math.min(10, Math.max(0, Number(newScore)));
    // Find existing grade to keep ID stable or create new ID
    const existingGrade = data.grades.find(g => g.studentId === studentId && g.subject === subject);
    
    const gradePayload: Grade = {
      id: existingGrade ? existingGrade.id : `new_${studentId}_${subject}`,
      studentId,
      subject,
      score: numScore,
      feedback: existingGrade ? existingGrade.feedback : '',
      date: new Date().toISOString().split('T')[0]
    };
    
    updateGrade(gradePayload);
  };

  const getScore = (studentId: string, subject: string) => {
    return data.grades.find(g => g.studentId === studentId && g.subject === subject)?.score || 0;
  };

  const subjects = ["Matemáticas", "Lengua", "Historia"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h2>
          <p className="text-gray-500">Manage your classes and grades</p>
        </div>
      </div>

      {/* Class Selector */}
      <div className="flex gap-4 mb-6">
        {myClasses.map(cls => (
          <button
            key={cls.id}
            onClick={() => setSelectedClassId(cls.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
              selectedClassId === cls.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <BookOpen size={18} />
            <span className="font-medium">{cls.name}</span>
          </button>
        ))}
      </div>

      {/* Gradebook Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Users size={20} className="text-blue-500" />
            Gradebook: {selectedClass?.name}
          </h3>
          <div className="text-sm text-gray-500">
            {students.length} Students Enrolled
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="p-4 font-medium w-1/4">Student Name</th>
                {subjects.map(sub => (
                  <th key={sub} className="p-4 font-medium text-center">{sub}</th>
                ))}
                <th className="p-4 font-medium text-right">Average</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map(student => {
                const scores = subjects.map(s => getScore(student.id, s));
                const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);

                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={student.avatar} alt="" className="w-8 h-8 rounded-full bg-gray-200" />
                        <span className="font-medium text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    {subjects.map(subject => (
                      <td key={subject} className="p-4 text-center">
                        <input 
                          type="number" 
                          min="0" 
                          max="10"
                          value={getScore(student.id, subject)}
                          onChange={(e) => handleScoreChange(student.id, subject, e.target.value)}
                          className="w-16 text-center border border-gray-200 rounded-md py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-gray-700"
                        />
                      </td>
                    ))}
                    <td className="p-4 text-right">
                      <span className={`px-2 py-1 rounded-md font-bold ${
                        Number(avg) >= 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {avg}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};