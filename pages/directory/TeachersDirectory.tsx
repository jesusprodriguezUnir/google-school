import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useApp } from '../../services/store';
import { userService } from '../../services/api';
import { UserRole } from '../../types';
import { Search, Mail, BookOpen, Edit2, X, Save } from 'lucide-react';

export const TeachersDirectory: React.FC = () => {
    const { data } = useApp();
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        specialization: '',
        max_weekly_hours: 20
    });

    const teachers = data.users.filter(u => u.role === UserRole.TEACHER);

    const filteredTeachers = teachers.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getAssignedClasses = (teacherId: string) => {
        // Classes where they are the main tutor
        const tutorClasses = data.classes.filter(c => c.teacher_id === teacherId);
        return tutorClasses;
    };

    const openEdit = (teacher: any) => {
        setSelectedTeacher(teacher);
        setEditForm({
            name: teacher.name,
            email: teacher.email,
            specialization: teacher.specialization || '',
            max_weekly_hours: teacher.max_weekly_hours || 20
        });
        setIsEditOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await userService.update(selectedTeacher.id, editForm);
            alert("Teacher updated successfully. Please reload to see changes.");
            setIsEditOpen(false);
            window.location.reload(); // Simple reload to refresh context
        } catch (error) {
            console.error(error);
            alert("Failed to update teacher");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Directorio de Profesores</h2>
                    <p className="text-gray-500">Gestiona al equipo docente</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar profesores..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {filteredTeachers.map(teacher => {
                        const myClasses = getAssignedClasses(teacher.id);
                        return (
                            <div key={teacher.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all bg-white group relative">
                                <button
                                    onClick={() => openEdit(teacher)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 p-1 bg-gray-50 rounded-full"
                                >
                                    <Edit2 size={14} />
                                </button>

                                <div className="flex items-start gap-4">
                                    <img src={teacher.avatar || "https://picsum.photos/200"} alt="" className="w-12 h-12 rounded-full object-cover bg-gray-100" />
                                    <div className="flex-1 overflow-hidden pr-6">
                                        <h3 className="font-bold text-gray-900 truncate">{teacher.name}</h3>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                            <Mail size={12} />
                                            <span className="truncate">{teacher.email}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {teacher.specialization ? (
                                                <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-medium border border-purple-100">
                                                    {teacher.specialization}
                                                </span>
                                            ) : <span className="text-xs text-gray-400 italic">Sin especialidad</span>}
                                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-medium border border-blue-100">
                                                Max: {teacher.max_weekly_hours}h
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Tutor de:</h4>
                                    {myClasses.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {myClasses.map(c => (
                                                <span key={c.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                    {c.name} ({c.level})
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">No es tutor de ninguna clase</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Edit Modal */}
            <Transition appear show={isEditOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsEditOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                                    >
                                        Editar Profesor
                                        <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </Dialog.Title>
                                    <form onSubmit={handleSave} className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                                value={editForm.name}
                                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input
                                                type="email"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                                value={editForm.email}
                                                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Especialidad</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ej. Matemáticas"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                                    value={editForm.specialization}
                                                    onChange={e => setEditForm({ ...editForm, specialization: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Horas Max.</label>
                                                <input
                                                    type="number"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                                    value={editForm.max_weekly_hours}
                                                    onChange={e => setEditForm({ ...editForm, max_weekly_hours: Number(e.target.value) })}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                                onClick={() => setIsEditOpen(false)}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
                                            >
                                                <Save className="w-4 h-4 mr-2" /> Guardar
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};
