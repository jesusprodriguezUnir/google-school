import React, { useState } from 'react';
import { useApp } from '../../services/store';
import { UserRole } from '../../types';
import { Search, Mail, BookOpen } from 'lucide-react';

export const TeachersDirectory: React.FC = () => {
    const { data } = useApp();
    const [searchTerm, setSearchTerm] = useState('');

    const teachers = data.users.filter(u => u.role === UserRole.TEACHER);

    const filteredTeachers = teachers.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getAssignedClasses = (teacherId: string) => {
        return data.classes.filter(c => c.teacherId === teacherId).map(c => c.name).join(", ");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Teacher Directory</h2>
                    <p className="text-gray-500">Manage school faculty</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search teachers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        Total: <strong>{filteredTeachers.length}</strong>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {filteredTeachers.map(teacher => (
                        <div key={teacher.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all bg-white group">
                            <div className="flex items-start gap-4">
                                <img src={teacher.avatar} alt="" className="w-12 h-12 rounded-full object-cover bg-gray-100" />
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="font-bold text-gray-900 truncate">{teacher.name}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                        <Mail size={12} />
                                        <span className="truncate">{teacher.email}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                        <BookOpen size={12} />
                                        <span className="truncate text-blue-600 font-medium">
                                            {getAssignedClasses(teacher.id) || "No classes assigned"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                                <button className="flex-1 text-xs font-medium py-1.5 bg-gray-50 text-gray-600 rounded hover:bg-gray-100">
                                    View Schedule
                                </button>
                                <button className="flex-1 text-xs font-medium py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
                                    Message
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
