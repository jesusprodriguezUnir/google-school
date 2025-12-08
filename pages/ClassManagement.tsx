import React, { useState, useEffect } from 'react';
import { useApp } from '../services/store';
import { classService, authService } from '../services/api';
import { ClassGroup, EducationLevel, UserRole } from '../types';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

export const ClassManagement: React.FC = () => {
    const { data, login } = useApp(); // We need data for teachers list
    const [classes, setClasses] = useState<ClassGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        level: EducationLevel.PRIMARIA,
        teacher_id: ''
    });

    const teachers = data.users.filter(u => u.role === UserRole.TEACHER);

    const fetchClasses = async () => {
        try {
            const res = await classService.getAll();
            setClasses(res);
        } catch (err) {
            console.error("Failed to fetch classes", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const handleOpenModal = (cls?: ClassGroup) => {
        if (cls) {
            setEditingClass(cls);
            setFormData({
                name: cls.name,
                level: cls.level || EducationLevel.PRIMARIA,
                teacher_id: cls.teacher_id || ''
            });
        } else {
            setEditingClass(null);
            setFormData({
                name: '',
                level: EducationLevel.PRIMARIA,
                teacher_id: teachers[0]?.id || ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editingClass) {
                // Map snake_case to what backend expects (it expects teacher_id, which matches now)
                await classService.update(editingClass.id, formData);
            } else {
                await classService.create(formData);
            }
            setIsModalOpen(false);
            fetchClasses();
            // Optionally reload global data if we want to sync
        } catch (error) {
            console.error("Error saving class", error);
            alert("Failed to save class");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this class?")) return;
        try {
            await classService.delete(id);
            fetchClasses();
        } catch (error) {
            console.error("Error deleting class", error);
            alert("Failed to delete class");
        }
    };

    const getTeacherName = (id: string) => {
        return teachers.find(t => t.id === id)?.name || 'Unknown Teacher';
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Class Management</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} /> Add Class
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-gray-700 text-sm">Class Name</th>
                            <th className="p-4 font-semibold text-gray-700 text-sm">Level</th>
                            <th className="p-4 font-semibold text-gray-700 text-sm">Assigned Teacher</th>
                            <th className="p-4 font-semibold text-gray-700 text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading classes...</td></tr>
                        ) : classes.map(cls => (
                            <tr key={cls.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-gray-900 font-medium">{cls.name}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold
                    ${cls.level === EducationLevel.INFANTIL ? 'bg-pink-100 text-pink-700' :
                                            cls.level === EducationLevel.SECUNDARIA ? 'bg-purple-100 text-purple-700' :
                                                'bg-blue-100 text-blue-700'}`}>
                                        {cls.level}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-600 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                        <img
                                            src={teachers.find(t => t.id === cls.teacher_id)?.avatar || `https://ui-avatars.com/api/?name=${getTeacherName(cls.teacher_id)}`}
                                            alt="avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {getTeacherName(cls.teacher_id)}
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleOpenModal(cls)}
                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                        title="Edit"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cls.id)}
                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">{editingClass ? 'Edit Class' : 'New Class'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. 3º Primaria A"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                                <select
                                    value={formData.level}
                                    onChange={e => setFormData({ ...formData, level: e.target.value as EducationLevel })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value={EducationLevel.INFANTIL}>Infantil</option>
                                    <option value={EducationLevel.PRIMARIA}>Primaria</option>
                                    <option value={EducationLevel.SECUNDARIA}>Secundaria</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                                <select
                                    value={formData.teacher_id}
                                    onChange={e => setFormData({ ...formData, teacher_id: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select a teacher...</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    You can assign any teacher to this class, even if they teach others.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
