import React from 'react';
import { X, Clock } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

interface WeeklyScheduleProps {
    isOpen: boolean;
    onClose: () => void;
    // In a real app, you might pass 'classId' or 'userId' here
}

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({ isOpen, onClose }) => {
    // Mock Schedule Data
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
    const HOUR_HEIGHT_REM = 5; // Height in rem units per hour slot

    const scheduleData: Record<string, { subject: string; room: string; color: string; start: number; duration: number }[]> = {
        'Monday': [
            { subject: 'Mathematics', room: '101', color: 'bg-blue-200 text-blue-800', start: 0, duration: 1 },
            { subject: 'History', room: '204', color: 'bg-amber-200 text-amber-800', start: 1, duration: 1 },
            { subject: 'Physics', room: 'Lab 1', color: 'bg-indigo-200 text-indigo-800', start: 3, duration: 1 },
        ],
        'Tuesday': [
            { subject: 'English', room: '105', color: 'bg-emerald-200 text-emerald-800', start: 0, duration: 2 },
            { subject: 'Physical Ed.', room: 'Gym', color: 'bg-rose-200 text-rose-800', start: 4, duration: 1 },
        ],
        'Wednesday': [
            { subject: 'Mathematics', room: '101', color: 'bg-blue-200 text-blue-800', start: 0, duration: 1 },
            { subject: 'Chemistry', room: 'Lab 2', color: 'bg-teal-200 text-teal-800', start: 2, duration: 1 },
            { subject: 'Art', room: 'Studio', color: 'bg-purple-200 text-purple-800', start: 5, duration: 1 },
        ],
        'Thursday': [
            { subject: 'History', room: '204', color: 'bg-amber-200 text-amber-800', start: 1, duration: 1 },
            { subject: 'Computer Sci.', room: 'Lab A', color: 'bg-slate-200 text-slate-800', start: 2, duration: 2 },
        ],
        'Friday': [
            { subject: 'Physics', room: 'Lab 1', color: 'bg-indigo-200 text-indigo-800', start: 0, duration: 1 },
            { subject: 'English', room: '105', color: 'bg-emerald-200 text-emerald-800', start: 2, duration: 1 },
            { subject: 'Assembly', room: 'Hall', color: 'bg-gray-200 text-gray-800', start: 4, duration: 1 },
        ]
    };

    return (
        <Transition show={isOpen} as={React.Fragment}>
            <Dialog onClose={onClose} className="relative z-50">
                {/* Backdrop */}
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl border border-white/50 p-6 shadow-2xl transition-all">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Clock className="text-indigo-500" />
                                        Weekly Schedule
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-black/5 rounded-full text-gray-500 transition-colors"
                                        aria-label="Close weekly schedule"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-6 gap-4 min-w-[800px] overflow-x-auto">
                                    {/* Time Column */}
                                    <div className="space-y-4 pt-12">
                                        {times.map((time, i) => (
                                            <div key={i} className="h-20 text-xs text-gray-400 font-medium text-right pr-4 -mt-2">
                                                {time}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Days Columns */}
                                    {days.map(day => (
                                        <div key={day} className="bg-white/40 rounded-xl p-2 min-h-[600px]">
                                            <div className="text-center font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200/50">
                                                {day}
                                            </div>
                                            <div className="relative">
                                                {scheduleData[day]?.map((cls, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`absolute w-full rounded-lg p-3 shadow-sm border border-black/5 ${cls.color} hover:scale-[1.02] transition-transform cursor-pointer`}
                                                        style={{
                                                            top: `${cls.start * HOUR_HEIGHT_REM}rem`,
                                                            height: `${cls.duration * HOUR_HEIGHT_REM - 0.5}rem`
                                                        }}
                                                        role="button"
                                                        tabIndex={0}
                                                        aria-label={`${cls.subject} in ${cls.room} at ${times[cls.start]}`}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.preventDefault();
                                                                // Add click handler logic here if needed
                                                            }
                                                        }}
                                                    >
                                                        <p className="font-bold text-sm truncate">{cls.subject}</p>
                                                        <p className="text-xs opacity-80">{cls.room}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
