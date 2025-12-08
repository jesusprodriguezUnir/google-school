import React, { useState } from 'react';
import { User, Grade } from '../types';
import { MoreHorizontal, Mail, FileText, User as UserIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';

interface Props {
    students: User[];
    grades: Grade[];
    subjects: string[];
    onUpdateGrade: (studentId: string, subject: string, score: string) => void;
}

export const SmartGradebook: React.FC<Props> = ({ students, grades, subjects, onUpdateGrade }) => {
    const [filter, setFilter] = useState<'all' | 'risk' | 'outstanding'>('all');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const getScore = (studentId: string, subject: string) => {
        return grades.find(g => g.studentId === studentId && g.subject === subject)?.score || 0;
    };

    const getAverage = (studentId: string) => {
        const studentGrades = subjects.map(s => getScore(studentId, s));
        const sum = studentGrades.reduce((a, b) => a + b, 0);
        return studentGrades.length > 0 ? sum / studentGrades.length : 0;
    };

    // 1. Filter Logic
    const filteredStudents = students.filter(student => {
        const avg = getAverage(student.id);
        if (filter === 'risk') return avg < 5;
        if (filter === 'outstanding') return avg >= 9;
        return true;
    });

    // 2. Sort Logic
    const sortedStudents = [...filteredStudents].sort((a, b) => {
        if (sortConfig?.key === 'average') {
            const avgA = getAverage(a.id);
            const avgB = getAverage(b.id);
            return sortConfig.direction === 'asc' ? avgA - avgB : avgB - avgA;
        }
        if (sortConfig?.key === 'name') {
            return sortConfig.direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        }
        return 0;
    });

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Heatmap Color Logic
    const getCellColor = (score: number) => {
        if (score === 0) return 'bg-gray-50 text-gray-400';
        if (score < 5) return 'bg-red-50 text-red-700';
        if (score < 7) return 'bg-yellow-50 text-yellow-700';
        if (score < 9) return 'bg-emerald-50 text-emerald-700';
        return 'bg-teal-50 text-teal-700 font-bold';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">

            {/* Filters Toolbar */}
            <div className="p-4 border-b border-gray-100 flex gap-2 overflow-x-auto">
                {[{ id: 'all', label: 'All Students' }, { id: 'risk', label: 'Needs Attention' }, { id: 'outstanding', label: 'Outstanding' }].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id as any)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${filter === f.id
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="overflow-auto flex-1">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th
                                className="p-4 font-medium w-1/4 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('name')}
                                aria-sort={sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                            >
                                Student Name
                            </th>
                            {subjects.map(sub => (
                                <th key={sub} className="p-4 font-medium text-center w-32">{sub}</th>
                            ))}
                            <th
                                className="p-4 font-medium text-right cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('average')}
                                aria-sort={sortConfig?.key === 'average' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                            >
                                Average
                            </th>
                            <th className="p-4 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedStudents.map(student => {
                            const avg = getAverage(student.id).toFixed(1);
                            const trend = Number(avg) > 6 ? 'up' : Number(avg) < 4 ? 'down' : 'flat';
                            const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
                            const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-gray-300';

                            return (
                                <tr key={student.id} className="group hover:bg-gray-50/80 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img src={student.avatar} alt="" className="w-9 h-9 rounded-full border border-gray-100 object-cover" />
                                            <span className="font-semibold text-gray-900">{student.name}</span>
                                        </div>
                                    </td>
                                    {subjects.map(subject => {
                                        const score = getScore(student.id, subject);
                                        return (
                                            <td key={subject} className="p-2 text-center">
                                                <div className={`w-16 mx-auto rounded-lg transition-colors ${getCellColor(score)} focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1`}>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        value={score}
                                                        onChange={(e) => onUpdateGrade(student.id, subject, e.target.value)}
                                                        aria-label={`${subject} grade for ${student.name}`}
                                                        className="w-full bg-transparent text-center py-2 outline-none font-medium appearance-none"
                                                    />
                                                </div>
                                            </td>
                                        );
                                    })}
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <TrendIcon size={14} className={trendColor} />
                                            <span className={`text-base font-bold ${Number(avg) >= 5 ? 'text-gray-900' : 'text-rose-600'
                                                }`}>
                                                {avg}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <Menu as="div" className="relative inline-block text-left opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Menu.Button className="p-1 hover:bg-gray-200 rounded-md text-gray-500">
                                                <MoreHorizontal size={18} />
                                            </Menu.Button>
                                            <Transition
                                                as={React.Fragment}
                                                enter="transition ease-out duration-100"
                                                enterFrom="transform opacity-0 scale-95"
                                                enterTo="transform opacity-100 scale-100"
                                                leave="transition ease-in duration-75"
                                                leaveFrom="transform opacity-100 scale-100"
                                                leaveTo="transform opacity-0 scale-95"
                                            >
                                                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                                    <div className="px-1 py-1 ">
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm gap-2`}>
                                                                    <Mail size={16} /> Email Parents
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm gap-2`}>
                                                                    <FileText size={16} /> Add Note
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                    </div>
                                                    <div className="px-1 py-1">
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm gap-2`}>
                                                                    <UserIcon size={16} /> View Profile
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                    </div>
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer / Pagination Placeholder */}
            <div className="bg-gray-50 p-2 text-xs text-gray-500 text-center border-t border-gray-100">
                Showing {sortedStudents.length} students
            </div>
        </div>
    );
};
