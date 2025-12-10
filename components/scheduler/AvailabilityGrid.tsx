import React, { useState, useEffect } from 'react';
import { TeacherAvailability } from '../../types';
import { scheduleService } from '../../services/scheduleService';

interface Props {
    teacherId: string;
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8];

const AvailabilityGrid: React.FC<Props> = ({ teacherId }) => {
    const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAvailability();
    }, [teacherId]);

    const fetchAvailability = async () => {
        setLoading(true);
        try {
            const data = await scheduleService.getTeacherAvailability(teacherId);
            setAvailability(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const isAvailable = (day: string, slot: number) => {
        return availability.some(a => a.day_of_week === day && a.slot_index === slot);
    };

    const toggleSlot = async (day: string, slot: number) => {
        const available = isAvailable(day, slot);
        try {
            if (available) {
                // Remove
                await scheduleService.removeAvailability(teacherId, day, slot);
                setAvailability(availability.filter(a => !(a.day_of_week === day && a.slot_index === slot)));
            } else {
                // Add
                const newAvail = await scheduleService.setAvailability(teacherId, day, slot);
                setAvailability([...availability, newAvail]);
            }
        } catch (e) {
            console.error("Failed to toggle", e);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Disponibilidad del Profesor</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot</th>
                            {DAYS.map(day => (
                                <th key={day} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {SLOTS.map(slot => (
                            <tr key={slot}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Período {slot}
                                </td>
                                {DAYS.map(day => (
                                    <td key={`${day}-${slot}`} className="px-1 py-1">
                                        <button
                                            onClick={() => toggleSlot(day, slot)}
                                            className={`w-full h-10 rounded transition-colors ${isAvailable(day, slot)
                                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                                    : 'bg-red-100 hover:bg-red-200 text-red-500'
                                                }`}
                                        >
                                            {isAvailable(day, slot) ? 'Disponible' : 'Ocupado'}
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="mt-2 text-sm text-gray-500">Haz clic en las celdas para marcar disponibilidad.</p>
        </div>
    );
};

export default AvailabilityGrid;
