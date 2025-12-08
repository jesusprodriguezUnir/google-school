import React from 'react';

import { Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { User, Grade } from '../types';

interface Props {
    students: User[];
    grades: Grade[];
}

export const ClassAnalytics: React.FC<Props> = ({ students, grades }) => {
    // Calculate Metrics
    const totalStudents = students.length;
    if (totalStudents === 0) return null;

    // Calculate Student Averages
    const studentAverages = students.map(student => {
        const studentGrades = grades.filter(g => g.studentId === student.id);
        if (studentGrades.length === 0) return 0;
        return studentGrades.reduce((acc, curr) => acc + curr.score, 0) / studentGrades.length;
    });

    const classAverage = (studentAverages.reduce((acc, curr) => acc + curr, 0) / (studentAverages.length || 1)).toFixed(1);
    const atRiskCount = studentAverages.filter(avg => avg < 5).length;
    // Mock Attendance calculation (random between 85-100% for demo)
    const attendanceRate = "94%";
    const pendingTasks = 12; // Mock

    const metrics = [
        {
            title: "Class Average",
            value: classAverage,
            icon: Users,
            color: Number(classAverage) >= 7 ? "text-emerald-600" : Number(classAverage) >= 5 ? "text-amber-600" : "text-rose-600",
            bg: Number(classAverage) >= 7 ? "bg-emerald-50" : Number(classAverage) >= 5 ? "bg-amber-50" : "bg-rose-50",
            delta: "+0.3",
            deltaType: "increase"
        },
        {
            title: "Students At Risk",
            value: atRiskCount.toString(),
            icon: AlertTriangle,
            color: atRiskCount > 0 ? "text-rose-600" : "text-emerald-600",
            bg: atRiskCount > 0 ? "bg-rose-50" : "bg-emerald-50",
            delta: atRiskCount > 2 ? "Needs Attention" : "Low Risk",
            deltaType: atRiskCount > 0 ? "decrease" : "increase"
        },
        {
            title: "Attendance Today",
            value: attendanceRate,
            icon: CheckCircle,
            color: "text-blue-600",
            bg: "bg-blue-50",
            delta: "Stable",
            deltaType: "increase"
        },
        {
            title: "Pending Tasks",
            value: pendingTasks.toString(),
            icon: Clock,
            color: "text-purple-600",
            bg: "bg-purple-50",
            delta: "From 3 assignments",
            deltaType: "unchanged"
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((item) => (
                <div key={item.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <div className={`p-2 rounded-lg ${item.bg}`}>
                            <item.icon size={20} className={item.color} />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.deltaType === 'increase' ? 'bg-green-50 text-green-700' :
                            item.deltaType === 'decrease' ? 'bg-red-50 text-red-700' :
                                'bg-gray-50 text-gray-600'
                            }`}>
                            {item.delta}
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">{item.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{item.value}</h3>
                </div>
            ))}
        </div>
    );
};
