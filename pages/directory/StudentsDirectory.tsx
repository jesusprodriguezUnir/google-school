import React, { useState, Fragment } from 'react';
import { useApp } from '../../services/store';
import { UserRole, Student } from '../../types';
import { Search, ChevronLeft, ChevronRight, Filter, Edit2, X, Save, GraduationCap } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';

export const StudentsDirectory: React.FC = () => {
    const { data, updateUser } = useApp();
    const [selectedClassId, setSelectedClassId] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', classId: '' });

    const classes = data.classes;
    const allStudents = data.users.filter(u => u.role === UserRole.STUDENT);

    // Filter Logic
    const filteredStudents = allStudents.filter(s => {
        // Fix: Access class_id, fallback to classId if exists in old data, or undefined
        const studentClassId = s.class_id || (s as any).classId;

        const matchesClass = selectedClassId === 'all' || studentClassId === selectedClassId;
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesClass && matchesSearch;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const getClassName = (classId?: string) => {
        if (!classId) return 'No Class';
        return classes.find(c => c.id === classId)?.name || 'Unknown Class';
    };

    const openEditModal = (student: any) => {
        // cast to Student or any to safely access properties
        setSelectedStudent(student);
        setFormData({
            name: student.name,
            email: student.email,
            classId: student.class_id || student.classId || ''
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!selectedStudent) return;

        // Construct update object. 
        // Note: The store's updateUser might expect a full object or partial. 
        // Assuming it handles the update via API call we implemented (userService.update) or the store's mock logic.
        // We'll use the store's updateUser for now which likely updates local state, 
        // but for persistence we might want to call the API directly if store doesn't.
        // The previous implementation used `updateUser` from store.

        const updatedStudent = {
            ...selectedStudent,
            name: formData.name,
            email: formData.email,
            class_id: formData.classId // Ensure we update the snake_case property
        };

        // If the store expects specific fields, we ensure we pass what's needed.
        // We'll try to update both to be safe if types are mixed
        (updatedStudent as any).classId = formData.classId;

        await updateUser(updatedStudent as Student);
        setIsModalOpen(false);
        toast.success("Estudiante actualizado correctamente");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Directorio de Estudiantes</h2>
                    <p className="text-gray-500">Gestionando {allStudents.length} alumnos</p>
                </div>
                <div className="flex gap-2 items-center bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-sm font-medium">
                    <GraduationCap size={16} />
                    <span>Total: {filteredStudents.length}</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Filter by Class */}
                <div className="relative min-w-[200px]">
                    <Filter className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <select
                        value={selectedClassId}
                        onChange={(e) => { setSelectedClassId(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
                    >
                        <option value="all">Todas las Clases</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedStudents.map(student => {
                    const sClassId = student.class_id || (student as any).classId;
                    return (
                        <div key={student.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col items-center text-center group relative">
                            <button
                                onClick={() => openEditModal(student)}
                                className="absolute top-4 right-4 text-gray-300 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                            >
                                <Edit2 size={16} />
                            </button>

                            <img
                                src={student.avatar || "https://picsum.photos/200"}
                                alt={student.name}
                                className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 mb-3"
                            />
                            <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{student.name}</h3>
                            <p className="text-sm text-gray-500 mb-3">{student.email}</p>

                            <div className="mt-auto pt-3 w-full border-t border-gray-100 flex justify-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sClassId ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {getClassName(sClassId)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredStudents.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron estudiantes</h3>
                    <p className="mt-1 text-sm text-gray-500">Intenta cambiar los filtros.</p>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {/* Edit Modal */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
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
                                        Editar Estudiante
                                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </Dialog.Title>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input
                                                type="email"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Clase Asignada</label>
                                            <select
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white"
                                                value={formData.classId}
                                                onChange={e => setFormData({ ...formData, classId: e.target.value })}
                                            >
                                                <option value="">Sin Asignar</option>
                                                {classes.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mt-6 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                                onClick={() => setIsModalOpen(false)}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
                                                onClick={handleSave}
                                            >
                                                <Save className="w-4 h-4 mr-2" /> Guardar
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};
