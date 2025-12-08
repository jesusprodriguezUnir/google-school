import React from 'react';
import { DonutChart, Legend } from '@tremor/react';

export const AttendanceWidget: React.FC = () => {
    // Mock data for today's attendance
    const attendanceData = [
        { name: 'Present', value: 450 },
        { name: 'Absent', value: 25 },
    ];

    const valueFormatter = (number: number) => `${number} Students`;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="font-bold text-gray-800 mb-4">Today's Attendance</h3>
            <div className="flex flex-col items-center justify-center">
                <DonutChart
                    data={attendanceData}
                    variant="donut"
                    valueFormatter={valueFormatter}
                    onValueChange={(v) => console.log(v)}
                    colors={["emerald", "rose"]}
                    className="w-40 h-40"
                    showLabel={true}
                    label="95%"
                />
                <div className="mt-4">
                    <Legend
                        categories={['Present', 'Absent']}
                        colors={["emerald", "rose"]}
                    />
                </div>
            </div>
        </div>
    );
};
