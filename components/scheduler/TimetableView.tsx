import React, { useState, useEffect } from 'react';
import { ScheduleSlot } from '../../types';
import { scheduleService } from '../../services/scheduleService';

interface Props {
    classId: string;
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8];

const TimetableView: React.FC<Props> = ({ classId }) => {
    const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSchedule();
    }, [classId]);

    const loadSchedule = async () => {
        const data = await scheduleService.getSchedule(classId);
        setSchedule(data);
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const data = await scheduleService.generateSchedule(classId);
            setSchedule(data);
            alert('Horario generado con éxito');
        } catch (e) {
            console.error(e);
            alert('Error al generar. Verifica disponibilidad del profesor.');
        } finally {
            setLoading(false);
        }
    };

    const getSlotContent = (day: string, slotIndex: number) => {
        const found = schedule.find(s => s.day_of_week === day && s.slot_index === slotIndex);
        if (found) {
            return (
                <div className="bg-blue-100 p-2 rounded text-center h-full border border-blue-200">
                    <div className="font-bold text-blue-800">{found.subject_name}</div>
                    {found.teacher_name && <div className="text-xs text-blue-600">{found.teacher_name}</div>}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Horario Semanal</h2>
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? 'Generando...' : 'Generar Automáticamente'}
                </button>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border p-2 bg-gray-50 w-16">#</th>
                            {DAYS.map(d => <th key={d} className="border p-2 bg-gray-50">{d}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {SLOTS.map(slot => (
                            <tr key={slot} className="h-24">
                                <td className="border p-2 text-center font-bold bg-gray-50">{slot}</td>
                                {DAYS.map(day => (
                                    <td key={day} className="border p-1 align-top w-1/5">
                                        {getSlotContent(day, slot)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TimetableView;
