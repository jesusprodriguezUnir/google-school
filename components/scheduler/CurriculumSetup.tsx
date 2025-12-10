import React, { useState, useEffect } from 'react';
import { ClassSubject, User } from '../../types';
import { scheduleService } from '../../services/scheduleService';

interface Props {
    classId: string;
    teachers: User[];
}

const CurriculumSetup: React.FC<Props> = ({ classId, teachers }) => {
    const [subjects, setSubjects] = useState<ClassSubject[]>([]);
    // removed local teachers state as it is passed as prop
    const [newName, setNewName] = useState('');
    const [newHours, setNewHours] = useState(1);
    const [selectedTeacher, setSelectedTeacher] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [classId]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch current curriculum
            const cur = await scheduleService.getCurriculum(classId);
            setSubjects(cur);
            // Ideally fetch teachers to assign specific ones. 
        } finally {
            setLoading(false);
        }
    };

    const addSubject = () => {
        if (!newName) return;
        const newItem: ClassSubject = {
            id: `temp-${Date.now()}`, // Temp ID
            class_id: classId,
            name: newName,
            teacher_id: selectedTeacher || undefined,
            hours_weekly: newHours
        };
        setSubjects([...subjects, newItem]);
        setNewName('');
        setNewHours(1);
        setSelectedTeacher('');
    };

    const removeSubject = (index: number) => {
        const copy = [...subjects];
        copy.splice(index, 1);
        setSubjects(copy);
    };

    const saveCurriculum = async () => {
        // prepare for API
        // The API expects a list of objects.
        setLoading(true);
        try {
            await scheduleService.setCurriculum(classId, subjects.map(s => ({
                name: s.name,
                hours_weekly: s.hours_weekly,
                teacher_id: s.teacher_id // If we had a selector
            })));
            await loadData(); // Reload real IDs
            alert('Curriculum guardado');
        } catch (e) {
            console.error(e);
            alert('Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Cargando curriculum...</div>;

    return (
        <div className="p-4 bg-white rounded-lg shadow space-y-4">
            <h3 className="text-lg font-bold">Configurar Asignaturas</h3>

            <div className="flex gap-2 items-end">
                <div>
                    <label className="block text-sm font-medium">Asignatura</label>
                    <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="border p-2 rounded"
                        placeholder="e.g. Matemáticas"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Horas/Semana</label>
                    <input
                        type="number"
                        value={newHours}
                        onChange={e => setNewHours(Number(e.target.value))}
                        className="border p-2 rounded w-20"
                        min={1}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Profesor</label>
                    <select
                        value={selectedTeacher}
                        onChange={e => setSelectedTeacher(e.target.value)}
                        className="border p-2 rounded w-40"
                    >
                        <option value="">(Clase)</option>
                        {teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
                <button onClick={addSubject} className="bg-blue-600 text-white px-4 py-2 rounded">
                    Añadir
                </button>
            </div>

            <ul className="space-y-2">
                {subjects.map((sub, i) => {
                    const tName = teachers.find(t => t.id === sub.teacher_id)?.name || 'Tutor';
                    return (
                        <li key={i} className="flex justify-between items-center border-b pb-2">
                            <span>{sub.name} ({sub.hours_weekly}h) - <span className="text-gray-500 text-sm">{tName}</span></span>
                            <button onClick={() => removeSubject(i)} className="text-red-500">Eliminar</button>
                        </li>
                    );
                })}
            </ul>

            <div className="pt-4 border-t">
                <button onClick={saveCurriculum} className="w-full bg-green-600 text-white py-2 rounded font-bold">
                    Guardar Configuración
                </button>
            </div>
        </div >
    );
};

export default CurriculumSetup;
