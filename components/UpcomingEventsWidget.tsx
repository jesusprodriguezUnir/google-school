import React from 'react';
import { FileText, BookOpen, Bus, Calendar } from 'lucide-react';

export const UpcomingEventsWidget: React.FC = () => {
    // Mock Events
    const events = [
        { id: 1, title: 'Math Midterm', date: 'Oct 15, Fri', type: 'EXAM', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { id: 2, title: 'History Essay Due', date: 'Oct 18, Mon', type: 'HOMEWORK', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-100' },
        { id: 3, title: 'Science Museum Trip', date: 'Oct 20, Wed', type: 'TRIP', icon: Bus, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    ];

    return (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg h-full">
            <h3 className="text-gray-800 font-bold mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-blue-500" />
                Upcoming Events
            </h3>
            <div className="space-y-4">
                {events.map((event, idx) => (
                    <div key={event.id} className="flex gap-4 items-start relative">
                        {/* Timeline Line */}
                        {idx !== events.length - 1 && (
                            <div className="absolute left-[19px] top-10 bottom-[-16px] w-0.5 bg-gray-200"></div>
                        )}

                        <div className={`w-10 h-10 rounded-full ${event.bg} flex items-center justify-center shrink-0 z-10`}>
                            <event.icon size={18} className={event.color} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{event.date}</p>
                            <h4 className="font-bold text-gray-800 text-sm leading-tight">{event.title}</h4>
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded mt-1 inline-block">
                                {event.type}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <button className="w-full mt-6 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                View Full Calendar
            </button>
        </div>
    );
};
