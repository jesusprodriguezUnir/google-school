import React, { useState, Fragment } from 'react';
import { useApp } from '../../services/store';
import { UserRole, Student } from '../../types';
import { Search, ChevronRight, Filter, Edit2, X, Save, Eye } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';

export const StudentsDirectory: React.FC = () => {
    const { data, updateUser } = useApp();
    const [selectedClassId, setSelectedClassId] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', classId: '' });

    const classes = data.classes;

    const allStudents = data.users.filter(u => u.role === UserRole.STUDENT);

    const filteredStudents = allStudents.filter(s => {
        const matchesClass = selectedClassId === 'all' || (s as any).classId === selectedClassId;
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesClass && matchesSearch;
    });

    const getClassName = (classId: string) => {
        return classes.find(c => c.id === classId)?.name || 'Unknown Class';
    };

    const openModal = (student: Student, mode: 'view' | 'edit') => {
        setSelectedStudent(student);
        setModalMode(mode);
        setFormData({
            name: student.name,
            email: student.email,
            classId: student.classId
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!selectedStudent) return;

        const updatedStudent: Student = {
            ...selectedStudent,
            name: formData.name,
            email: formData.email,
            classId: formData.classId
        };

        updateUser(updatedStudent);
        setIsModalOpen(false);
        toast.success("Student updated successfully!");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Student Directory</h2>
                    <p className="text-gray-500">
                        Managing {allStudents.length} students across {classes.length} classes
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Visual Filter Bar */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">

                    {/* Search */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Class Filter */}
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                        <Filter size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-500 font-medium mr-1">Class:</span>
                        <div className="flex bg-white border border-gray-200 rounded-lg p-1">
                            <button
                                onClick={() => setSelectedClassId('all')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${selectedClassId === 'all'
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                All
                            </button>
                            {classes.map(cls => (
                                <button
                                    key={cls.id}
                                    onClick={() => setSelectedClassId(cls.id)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${selectedClassId === cls.id
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {cls.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="p-4 font-medium">Student</th>
                                <th className="p-4 font-medium">Class</th>
                                <th className="p-4 font-medium">Email</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img src={student.avatar} alt="" className="w-8 h-8 rounded-full bg-gray-200 object-cover" />
                                            <span className="font-medium text-gray-900">{student.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {getClassName((student as any).classId)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500">{student.email}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(student, 'view')}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => openModal(student, 'edit')}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                                                title="Edit Student"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">
                                        No students found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View/Edit Modal */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <div className="flex justify-between items-center mb-4">
                                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                            {modalMode === 'edit' ? 'Edit Student' : 'Student Details'}
                                        </Dialog.Title>
                                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-center mb-6">
                                            <img
                                                src={selectedStudent?.avatar}
                                                alt={selectedStudent?.name}
                                                className="w-24 h-24 rounded-full bg-gray-100 object-cover ring-4 ring-gray-50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                disabled={modalMode === 'view'}
                                                className={`w-full px-3 py-2 border rounded-lg outline-none ${modalMode === 'view'
                                                        ? 'bg-gray-50 border-gray-200 text-gray-500'
                                                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                                                    }`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                disabled={modalMode === 'view'}
                                                className={`w-full px-3 py-2 border rounded-lg outline-none ${modalMode === 'view'
                                                        ? 'bg-gray-50 border-gray-200 text-gray-500'
                                                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                                                    }`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Class</label>
                                            <select
                                                value={formData.classId}
                                                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                                disabled={modalMode === 'view'}
                                                className={`w-full px-3 py-2 border rounded-lg outline-none ${modalMode === 'view'
                                                        ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-default'
                                                        : 'bg-white border-gray-300 focus:ring-2 focus:ring-blue-500'
                                                    }`}
                                            >
                                                {classes.map(cls => (
                                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {modalMode === 'edit' && (
                                        <div className="mt-6 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-lg border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                                onClick={handleSave}
                                            >
                                                <Save size={16} className="mr-2" /> Save Changes
                                            </button>
                                        </div>
                                    )}
                                    {modalMode === 'view' && (
                                        <div className="mt-6 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                onClick={() => setIsModalOpen(false)}
                                            >
                                                Close
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                                onClick={() => setModalMode('edit')}
                                            >
                                                <Edit2 size={16} className="mr-2" /> Edit
                                            </button>
                                        </div>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};
