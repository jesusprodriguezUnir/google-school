import React from 'react';
import { ClassGroup, User, UserRole } from '../types';
import { Users } from 'lucide-react';

interface ClassesWidgetProps {
    classes: ClassGroup[];
    users: User[]; // To find teachers and count students
    onManage: () => void;
}

export const ClassesWidget: React.FC<ClassesWidgetProps> = ({ classes, users, onManage }) => {
    const teachers = users.filter(u => u.role === UserRole.TEACHER);
    const students = users.filter(u => u.role === UserRole.STUDENT);

    const getTeacherName = (id: string) => {
        return teachers.find(t => t.id === id)?.name || 'Unassigned';
    };

    const getStudentCount = (classId: string) => {
        // Check both 'classId' property if it exists on user objects (from seed/schema)
        return students.filter(s => (s as any).class_id === classId || (s as any).classId === classId).length;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">Classes Overview</h3>
                    <p className="text-sm text-gray-500">{classes.length} active classes</p>
                </div>
                <button
                    onClick={onManage}
                    className="text-sm text-blue-600 font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    Manage Classes
                </button>
            </div>

            <div className="overflow-y-auto max-h-[400px] p-0">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Class Name</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Teacher</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Students</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    </div>
                    );
};
