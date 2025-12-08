import React from 'react';
import { Clock, ArrowRight, MapPin } from 'lucide-react';

export const UpNextWidget: React.FC = () => {
    // Mock Schedule Data
    const schedule = {
        now: { subject: 'Mathematics', room: 'Room 304', time: '10:00 - 11:30' },
        next: { subject: 'History', room: 'Room 102', time: '11:45 - 12:45' }
    };

    return (
        <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 shadow-lg p-6">
            <h3 className="text-gray-800 font-bold mb-4 flex items-center gap-2">
                <Clock className="text-blue-500" size={18} />
                Up Next
            </h3>

            <div className="relative">
                {/* Connecting Line */}
                <div className="absolute left-[19px] top-8 bottom-4 w-0.5 bg-gradient-to-b from-blue-400 to-indigo-200"></div>

                {/* Current Class */}
                <div className="flex gap-4 mb-6 relative">
                    <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center shrink-0 z-10 shadow-sm">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Now</p>
                        <h4 className="font-bold text-gray-900 text-lg leading-tight">{schedule.now.subject}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <MapPin size={14} />
                            <span>{schedule.now.room}</span>
                            <span>•</span>
                            <span>{schedule.now.time}</span>
                        </div>
                    </div>
                </div>

                {/* Next Class */}
                <div className="flex gap-4 relative">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center shrink-0 z-10">
                        <ArrowRight size={16} className="text-indigo-400" />
                    </div>
                    <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Next</p>
                        <h4 className="font-bold text-gray-800 text-lg leading-tight">{schedule.next.subject}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <MapPin size={14} />
                            <span>{schedule.next.room}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
