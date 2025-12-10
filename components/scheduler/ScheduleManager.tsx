import React, { useState } from 'react';
import AvailabilityGrid from './AvailabilityGrid';
import CurriculumSetup from './CurriculumSetup';
import TimetableView from './TimetableView';
import { User } from '../../types';

interface Props {
    classId: string;
    teacherId: string; // The main teacher of the class
    teachers: User[]; // All available teachers
}

const ScheduleManager: React.FC<Props> = ({ classId, teacherId, teachers }) => {
    const [tab, setTab] = useState<'view' | 'curriculum' | 'availability'>('view');

    return (
        <div className="p-6 space-y-6">
            <div className="flex gap-4 border-b">
                <button
                    onClick={() => setTab('view')}
                    className={`py-2 px-4 ${tab === 'view' ? 'border-b-2 border-indigo-600 font-bold' : ''}`}
                >
                    Ver Horario
                </button>
                <button
                    onClick={() => setTab('curriculum')}
                    className={`py-2 px-4 ${tab === 'curriculum' ? 'border-b-2 border-indigo-600 font-bold' : ''}`}
                >
                    Configurar Asignaturas
                </button>
                <button
                    onClick={() => setTab('availability')}
                    className={`py-2 px-4 ${tab === 'availability' ? 'border-b-2 border-indigo-600 font-bold' : ''}`}
                >
                    Disponibilidad Profesor
                </button>
            </div>

            <div>
                {tab === 'view' && <TimetableView classId={classId} />}
                {tab === 'curriculum' && <CurriculumSetup classId={classId} teachers={teachers} />}
                {tab === 'availability' && <AvailabilityGrid teacherId={teacherId} />}
            </div>
        </div>
    );
};

export default ScheduleManager;
