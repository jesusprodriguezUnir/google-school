import React from 'react';
import { DonutChart, Legend } from '@tremor/react';

export const StudentAttendanceWidget: React.FC = () => {
    const attendanceData = [
        { name: 'Present', value: 95 },
        { name: 'Absent', value: 3 },
        { name: 'Late', value: 2 },
    ];

    const valueFormatter = (number: number) => `${number}%`;

    return (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg h-full">
            <h3 className="text-gray-800 font-bold mb-4">Attendance Overview</h3>
            <div className="flex flex-col items-center">
                <DonutChart
                    data={attendanceData}
                    category="value"
                    index="name"
                    valueFormatter={valueFormatter}
                    colors={['emerald', 'rose', 'amber']}
                    className="w-40 h-40"
                />
                <Legend
                    categories={['Present', 'Absent', 'Late']}
                    colors={['emerald', 'rose', 'amber']}
                    className="mt-6"
                />
                <div className="mt-4 text-center">
                    <p className="text-sm font-medium text-gray-700">95% Attendance</p>
                    <p className="text-xs text-gray-500">3 Absences, 1 Late justification pending</p>
                </div>
            </div>
        </div>
    );
};
