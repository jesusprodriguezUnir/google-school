import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Plus, X, Users, BookOpen, Settings, Trash2 } from 'lucide-react';
import { useApp } from '../services/store';
import api, { curriculumService } from '../services/api';

interface Teacher {
    id: string;
    name: string;
    specialization?: string;
    max_weekly_hours?: number;
}

interface ClassSubject {
    id: string;
    name: string;
    hours_weekly: number;
    teacher_id: string;
}

interface ClassGroup {
    id: string;
    name: string;
    level: string;
    teacher_id?: string;
}

interface SubjectTemplate {
    id: string;
    name: string;
    default_hours: number;
    education_level: string;
}

export default function ClassManagement() {
    const { data } = useApp();
    const [selectedClass, setSelectedClass] = useState<ClassGroup | null>(null);
    const [subjects, setSubjects] = useState<ClassSubject[]>([]);
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isStandardsModalOpen, setIsStandardsModalOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Derived state from AppContext
    const classes = data.classes || [];
    const teachers = (data.users || []).filter(u => u.role === 'TEACHER');

    // Templates State
    const [templates, setTemplates] = useState<SubjectTemplate[]>([]);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplateHours, setNewTemplateHours] = useState(1);
    const [newTemplateLevel, setNewTemplateLevel] = useState('Primaria');

    useEffect(() => {
        if (selectedClass) {
            fetchSubjects(selectedClass.id);
            // Fetch templates for this class's level to populate dropdown
            fetchTemplates(selectedClass.level);
        }
    }, [selectedClass]);

    const fetchSubjects = async (classId: string) => {
        try {
            setErrorMsg(null);
            const res = await api.get(`/classes/${classId}/subjects`);
            setSubjects(res.data);
        } catch (error) {
            console.error("Error fetching subjects", error);
            setErrorMsg("Failed to fetch subjects");
        }
    };

    const fetchTemplates = async (level?: string) => {
        try {
            const data = await curriculumService.getTemplates(level);
            // Sort by name
            setTemplates(data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
        } catch (error) {
            console.error("Error fetching templates", error);
        }
    };

    const handleUpdateClassTutor = async (classId: string, teacherId: string) => {
        try {
            await api.put(`/classes/${classId}`, { teacher_id: teacherId });
            window.location.reload();
        } catch (error) {
            console.error("Error updating tutor", error);
            setErrorMsg("Failed to update tutor");
        }
    };

    const handleUpdateSubjectTeacher = async (subject: ClassSubject, teacherId: string) => {
        try {
            await api.put(`/classes/subjects/${subject.id}`, {
                name: subject.name,
                hours_weekly: subject.hours_weekly,
                teacher_id: teacherId
            });
            fetchSubjects(selectedClass!.id);
        } catch (error) {
            console.error("Error updating subject teacher", error);
            setErrorMsg("Failed to update subject teacher");
        }
    }

    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectHours, setNewSubjectHours] = useState(1);
    const [newSubjectTeacher, setNewSubjectTeacher] = useState('');

    const handleCreateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClass) return;

        try {
            await api.post(`/classes/${selectedClass.id}/subjects`, {
                name: newSubjectName,
                hours_weekly: newSubjectHours,
                teacher_id: newSubjectTeacher || selectedClass.teacher_id
            });

            setIsClassModalOpen(false);
            setNewSubjectName('');
            setNewSubjectHours(1);
            setNewSubjectTeacher('');
            fetchSubjects(selectedClass.id);

        } catch (error) {
            console.error("Error creating subject", error);
            setErrorMsg("Failed to create subject");
        }
    }

    const handleCreateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await curriculumService.createTemplate({
                name: newTemplateName,
                default_hours: newTemplateHours,
                education_level: newTemplateLevel
            });
            setNewTemplateName('');
            fetchTemplates(); // Refresh all
        } catch (error) {
            console.error(error);
            alert("Error creating template");
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm("Delete this standard subject?")) return;
        try {
            await curriculumService.deleteTemplate(id);
            fetchTemplates();
        } catch (error) {
            console.error(error);
        }
    }

    // When selecting a template in the "New Subject" modal
    const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const tId = e.target.value;
        if (!tId) return;
        const temp = templates.find(t => t.id === tId);
        if (temp) {
            setNewSubjectName(temp.name);
            setNewSubjectHours(temp.default_hours);
        }
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Configuración de Clases</h1>
                    <p className="text-gray-600 mt-2">Gestiona tutores, asignaturas y profesores por clase.</p>
                </div>
                <button
                    onClick={() => { fetchTemplates(); setIsStandardsModalOpen(true); }}
                    className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <Settings className="w-4 h-4 mr-2" />
                    Gestionar Estándares
                </button>
            </div>

            {errorMsg && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-red-700">{errorMsg}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Classes List */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="font-semibold text-gray-700 flex items-center">
                            <Users className="w-5 h-5 mr-2 text-blue-600" /> Clases
                        </h2>
                    </div>
                    <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                        {classes.length === 0 ? (
                            <p className="p-4 text-gray-500">No se encontraron clases.</p>
                        ) : classes.map((cls) => (
                            <div
                                key={cls.id}
                                onClick={() => setSelectedClass(cls)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedClass?.id === cls.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{cls.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {cls.level} • Tutor: <span className="font-medium text-gray-700">
                                                {teachers.find(t => t.id === cls.teacher_id)?.name || "Sin asignar"}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected Class Details */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedClass ? (
                        <>
                            {/* Tutor Assignment */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">Tutor de {selectedClass.name}</h2>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <label className="text-gray-600 font-medium">Asignar Tutor:</label>
                                    <select
                                        className="form-select block w-full max-w-xs mt-1 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        value={selectedClass.teacher_id || ""}
                                        onChange={(e) => handleUpdateClassTutor(selectedClass.id, e.target.value)}
                                    >
                                        <option value="">Seleccionar Profesor...</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Subjects & Teachers */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                        <BookOpen className="w-5 h-5 mr-2 text-indigo-600" /> Asignaturas y Profesores
                                    </h2>
                                    <button
                                        onClick={() => setIsClassModalOpen(true)}
                                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Nueva Asignatura
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignatura</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas/Semana</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profesor Asignado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {subjects.map((subject) => (
                                                <tr key={subject.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.hours_weekly} h</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <select
                                                            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                            value={subject.teacher_id || ""}
                                                            onChange={(e) => handleUpdateSubjectTeacher(subject, e.target.value)}
                                                        >
                                                            <option value="">-- Asignar --</option>
                                                            <option value={selectedClass.teacher_id || ""}>Tutor (Clase)</option>
                                                            {teachers.map(t => (
                                                                <option key={t.id} value={t.id}>
                                                                    {t.name} {t.specialization ? `[${t.specialization}]` : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                            {subjects.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                                        <p>No hay asignaturas configuradas.</p>
                                                        <button
                                                            onClick={() => setIsClassModalOpen(true)}
                                                            className="mt-2 text-indigo-600 font-medium hover:underline"
                                                        >
                                                            Crear la primera asignatura
                                                        </button>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <div className="bg-blue-100 p-4 rounded-full mb-4">
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Selecciona una clase</h3>
                            <p className="text-gray-500 mt-2">Elige una clase del menú de la izquierda para gestionar su configuración.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for New Subject */}
            <Transition appear show={isClassModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsClassModalOpen(false)}>
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
                                        Nueva Asignatura
                                        <button onClick={() => setIsClassModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </Dialog.Title>
                                    <div className="mt-4">
                                        <form onSubmit={handleCreateSubject} className="space-y-4">
                                            {/* Template Selector */}
                                            <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-4">
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Cargar Estándar ({selectedClass?.level})</label>
                                                <select
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                                    onChange={handleTemplateSelect}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>-- Seleccionar Plantilla --</option>
                                                    {templates.map(t => (
                                                        <option key={t.id} value={t.id}>{t.name} ({t.default_hours}h)</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Nombre de la Asignatura</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                                    placeholder="Ej. Matemáticas"
                                                    value={newSubjectName}
                                                    onChange={(e) => setNewSubjectName(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Horas Semanales</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    max="10"
                                                    className="mt-1 block w-ful rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                                    value={newSubjectHours}
                                                    onChange={(e) => setNewSubjectHours(Number(e.target.value))}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Profesor (Opcional)</label>
                                                <select
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                                    value={newSubjectTeacher}
                                                    onChange={(e) => setNewSubjectTeacher(e.target.value)}
                                                >
                                                    <option value="">Mismo que el Tutor</option>
                                                    {teachers.map(t => (
                                                        <option key={t.id} value={t.id}>
                                                            {t.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <p className="text-xs text-gray-500 mt-1">Si se deja vacío, se asignará al tutor de la clase.</p>
                                            </div>

                                            <div className="mt-6 flex justify-end gap-3">
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                                    onClick={() => setIsClassModalOpen(false)}
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                                                >
                                                    Crear Asignatura
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Modal for Managing Standards */}
            <Transition appear show={isStandardsModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsStandardsModalOpen(false)}>
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
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                                    >
                                        Estándares de Asignaturas (Curriculum)
                                        <button onClick={() => setIsStandardsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </Dialog.Title>

                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Create New Standard Form */}
                                        <div className="col-span-1 bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-gray-700 mb-3">Nuevo Estándar</h4>
                                            <form onSubmit={handleCreateTemplate} className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500">Nombre</label>
                                                    <input
                                                        type="text" required
                                                        className="w-full border p-2 rounded text-sm"
                                                        placeholder="e.g. Lengua"
                                                        value={newTemplateName}
                                                        onChange={e => setNewTemplateName(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500">Horas</label>
                                                    <input
                                                        type="number" required min="1"
                                                        className="w-full border p-2 rounded text-sm"
                                                        value={newTemplateHours}
                                                        onChange={e => setNewTemplateHours(Number(e.target.value))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500">Nivel</label>
                                                    <select
                                                        className="w-full border p-2 rounded text-sm"
                                                        value={newTemplateLevel}
                                                        onChange={e => setNewTemplateLevel(e.target.value)}
                                                    >
                                                        <option value="Infantil">Infantil</option>
                                                        <option value="Primaria">Primaria</option>
                                                        <option value="Secundaria">Secundaria</option>
                                                    </select>
                                                </div>
                                                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700">
                                                    Crear Estándar
                                                </button>
                                            </form>
                                        </div>

                                        {/* List of Standards */}
                                        <div className="col-span-2">
                                            <div className="flex gap-2 mb-2">
                                                {['Infantil', 'Primaria', 'Secundaria'].map(l => (
                                                    <button
                                                        key={l}
                                                        onClick={() => fetchTemplates(l)}
                                                        className={`px-3 py-1 text-xs rounded-full border ${templates.length > 0 && templates[0].education_level === l ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200'}`}
                                                    >
                                                        {l}
                                                    </button>
                                                ))}
                                                <button onClick={() => fetchTemplates()} className="px-3 py-1 text-xs text-gray-500 underline">Ver Todos</button>
                                            </div>
                                            <div className="overflow-y-auto max-h-60 border rounded-lg">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Asignatura</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nivel</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Horas</th>
                                                            <th className="px-4 py-2"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {templates.map(t => (
                                                            <tr key={t.id}>
                                                                <td className="px-4 py-2 text-sm text-gray-900">{t.name}</td>
                                                                <td className="px-4 py-2 text-xs text-gray-500">{t.education_level}</td>
                                                                <td className="px-4 py-2 text-sm text-gray-500">{t.default_hours}</td>
                                                                <td className="px-4 py-2 text-right">
                                                                    <button onClick={() => handleDeleteTemplate(t.id)} className="text-red-400 hover:text-red-600">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {templates.length === 0 && (
                                                            <tr>
                                                                <td colSpan={4} className="p-4 text-center text-sm text-gray-500">No hay estándares definidos para este nivel.</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
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
}
