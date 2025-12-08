import React from 'react';
import { ProgressCircle, SparkAreaChart } from '@tremor/react';
import {
    Flame,
    TrendingUp,
    AlertTriangle,
    Medal
} from 'lucide-react';
import { Grade } from '../types';

interface Props {
    grade: Grade;
}

export const GradeCard: React.FC<Props> = ({ grade }) => {
    // Determine status based on score
    const isHigh = grade.score >= 8;
    const isMid = grade.score >= 5 && grade.score < 8;
    const isLow = grade.score < 5;

    const color = isHigh ? 'emerald' : isMid ? 'amber' : 'rose';

    // Mock sparkline data to simulate historical performance.
    // The scores are generated relative to the current grade to create a trend for the sparkline chart.
    const sparklineData = [
        { date: 'Quiz 1', score: Math.max(0, grade.score - 2) },
        { date: 'Midterm', score: Math.max(0, grade.score - 1) },
        { date: 'Project', score: grade.score + 0.5 },
        { date: 'Final', score: grade.score },
    ];

    return (
        <div className="relative overflow-hidden rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 p-5 group">
            {/* Decorative gradient blob */}
            <div
                className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl transition-all ${
                    isHigh ? 'bg-emerald-400/20 group-hover:bg-emerald-400/30' :
                    isMid ? 'bg-amber-400/20 group-hover:bg-amber-400/30' :
                    'bg-rose-400/20 group-hover:bg-rose-400/30'
                }`}
            ></div>

            <div className="flex justify-between items-start z-10 relative">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">{grade.subject}</h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">{grade.date}</p>

                    {/* Badge for High Performers */}
                    {isHigh && (
                        <div className="mt-2 inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-bold border border-yellow-200">
                            <Medal size={12} />
                            <span>Expert</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center">
                    <div className="relative">
                        <ProgressCircle
                            value={(grade.score / 10) * 100}
                            size="md"
                            color={color as any}
                            strokeWidth={6}
                        >
                            <span className={`text-sm font-bold ${
                                isHigh ? 'text-emerald-600' :
                                isMid ? 'text-amber-600' :
                                'text-rose-600'
                            }`}>{grade.score}</span>
                        </ProgressCircle>
                        {/* Floating Icon */}
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
                            {isHigh && <Flame size={14} className="text-orange-500 fill-orange-500" />}
                            {isMid && <TrendingUp size={14} className="text-amber-500" />}
                            {isLow && <AlertTriangle size={14} className="text-red-500" />}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 z-10 relative">
                <div className="flex justify-between items-end">
                    <p className="text-sm text-gray-600 italic max-w-[70%]">"{grade.feedback}"</p>
                    <div className="w-20 h-10">
                        {/* Sparkline */}
                        <SparkAreaChart
                            data={sparklineData}
                            categories={['score']}
                            index="date"
                            colors={[color]}
                            className="h-full w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
