import React, { useState } from 'react';
import { Grade } from '../types';
import { Dialog, Transition } from '@headlessui/react';
import { X, Mail, FileText, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SparkAreaChart } from '@tremor/react';

interface Props {
    grade: Grade;
}

export const InteractiveGradeCard: React.FC<Props> = ({ grade }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Determine trend (mock logic)
    const trend = grade.score >= 8 ? 'up' : grade.score >= 5 ? 'flat' : 'down';
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-gray-400';

    const color = grade.score >= 8 ? 'border-emerald-200 bg-emerald-50/50'
        : grade.score >= 5 ? 'border-amber-200 bg-amber-50/50'
            : 'border-rose-200 bg-rose-50/50';

    const scoreColor = grade.score >= 8 ? 'text-emerald-700'
        : grade.score >= 5 ? 'text-amber-700'
            : 'text-rose-700';

    return (
        <>
            <div
                onClick={() => setIsOpen(true)}
                className={`relative group cursor-pointer overflow-hidden rounded-xl border ${color} hover:shadow-md transition-all duration-300`}
            >
                <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">{grade.subject}</h3>
                        <div className="flex items-center gap-1">
                            <span className={`text-2xl font-bold ${scoreColor}`}>{grade.score}</span>
                            <span className="text-xs text-gray-400 font-medium">/10</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                        <TrendIcon className={trendColor} size={16} />
                        <span className="text-xs text-gray-500 font-medium">
                            {trend === 'up' ? '+1.2 from last term' : trend === 'down' ? '-0.5 from last term' : 'Stable'}
                        </span>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2 italic">"{grade.feedback}"</p>
                </div>

                {/* Hover Effect Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </div>

            {/* Detail Modal */}
            <Transition show={isOpen} as={React.Fragment}>
                <Dialog onClose={() => setIsOpen(false)} className="relative z-50">
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                                            {grade.subject}
                                        </Dialog.Title>
                                        <p className="text-gray-500">Teacher: Mr. Anderson (math@school.com)</p>
                                    </div>
                                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                        <X size={20} className="text-gray-500" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                            <TrendingUp size={16} className="text-blue-500" />
                                            Performance History
                                        </h4>
                                        <div className="h-32 border border-gray-100 rounded-lg p-2 bg-gray-50">
                                            {/* Mock Chart Area */}
                                            <SparkAreaChart
                                                data={[
                                                    { date: 'Sep', score: grade.score - 1 },
                                                    { date: 'Oct', score: grade.score - 0.5 },
                                                    { date: 'Nov', score: grade.score },
                                                ]}
                                                categories={['score']}
                                                index="date"
                                                colors={['blue']}
                                                className="h-full w-full"
                                            />
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            <h4 className="font-bold text-gray-800 text-sm">Recent Grades</h4>
                                            <div className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                                                <span>Midterm Exam</span>
                                                <span className="font-bold">8.5</span>
                                            </div>
                                            <div className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                                                <span>Homework #4</span>
                                                <span className="font-bold">9.0</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                                <FileText size={16} className="text-amber-500" />
                                                Upcoming
                                            </h4>
                                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                                <p className="font-bold text-amber-900 text-sm">Unit 4 Test</p>
                                                <p className="text-xs text-amber-700">Friday, Oct 22</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-gray-800 mb-3">Actions</h4>
                                            <div className="flex gap-2">
                                                <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                                                    <Mail size={16} /> Contact Teacher
                                                </button>
                                                <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                                                    View Syllabus
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};
