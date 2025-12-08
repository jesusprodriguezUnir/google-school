import React, { useState } from 'react';
import { useApp } from '../services/store';
import { Grade, UserRole } from '../types';
import { BookOpen, Search, Filter } from 'lucide-react';
import { ClassAnalytics } from '../components/ClassAnalytics';
import { SmartGradebook } from '../components/SmartGradebook';

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

  // Get grades for these students
  const classGrades = data.grades.filter(g =>
    students.some(s => s.id === g.studentId)
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

  const subjects = ["Matemáticas", "Lengua", "Historia"];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Command Center</h2>
            <p className="text-gray-500 font-medium">Academic Year 2024-2025</p>
          </div>

          {/* Class Selector Tabs */}
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {myClasses.map(cls => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${selectedClassId === cls.id
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {cls.name}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Section */}
        <ClassAnalytics
          students={students}
          grades={classGrades}
        />

        {/* Action Toolbar (Mock) */}
        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm">
              <BookOpen size={16} /> Export Report
            </button>
          </div>
        </div>

        {/* Smart Gradebook */}
        <SmartGradebook
          students={students}
          grades={classGrades}
          subjects={subjects}
          onUpdateGrade={handleScoreChange}
        />

      </div>
    </div>
  );
};