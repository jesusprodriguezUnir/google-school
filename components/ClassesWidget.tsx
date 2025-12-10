import React from 'react';
import { ClassGroup, User, UserRole } from '../types';
import { Users } from 'lucide-react';

interface ClassesWidgetProps {
    classes: ClassGroup[];
    users: User[]; // To find teachers and count students
    onManage: () => void;
    onSchedule: (classId: string, teacherId: string) => void;
}

export const ClassesWidget: React.FC<ClassesWidgetProps> = ({ classes, users, onManage, onSchedule }) => {
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
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Teacher</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Students</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {classes.length > 0 ? (
                            classes.map((cls) => (
                                <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-900">{cls.name}</td>
                                    <td className="p-4 text-gray-600">{cls.level || 'N/A'}</td>
                                    <td className="p-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                {getTeacherName(cls.teacher_id).charAt(0)}
                                            </div>
                                            <span className="truncate max-w-[120px]" title={getTeacherName(cls.teacher_id)}>
                                                {getTeacherName(cls.teacher_id)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Users size={14} className="text-gray-400" />
                                            <span>{getStudentCount(cls.id)}</span>
                                            <span>{getStudentCount(cls.id)}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600 text-right">
                                        <button
                                            onClick={() => onSchedule(cls.id, cls.teacher_id)}
                                            className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100"
                                        >
                                            Horario
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400">
                                    No classes found. Click "Manage Classes" to add one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
