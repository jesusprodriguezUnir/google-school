import React from 'react';
import { format } from 'date-fns';

const events = [
    { title: 'Parent Meeting', date: new Date(), type: 'meeting', color: 'bg-blue-100 text-blue-700' },
    { title: 'Science Fair', date: new Date(new Date().setDate(new Date().getDate() + 2)), type: 'event', color: 'bg-indigo-100 text-indigo-700' },
    { title: 'School Board Review', date: new Date(new Date().setDate(new Date().getDate() + 5)), type: 'review', color: 'bg-purple-100 text-purple-700' },
];

export const CalendarWidget: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="font-bold text-gray-800 mb-4">Upcoming Events</h3>
            <div className="space-y-4">
                {events.map((event, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-gray-100 border border-gray-200`}>
                            <span className="text-xs font-semibold text-gray-500 uppercase">{format(event.date, 'MMM')}</span>
                            <span className="text-lg font-bold text-gray-900">{format(event.date, 'dd')}</span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{event.title}</p>
                            <span className={`inline-block px-2 py-0.5 mt-1 rounded text-xs font-medium ${event.color}`}>
                                {event.type}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
