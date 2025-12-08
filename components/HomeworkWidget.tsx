import React, { useState } from 'react';
import { CheckSquare, Plus } from 'lucide-react';

export const HomeworkWidget: React.FC = () => {
    // Mock Tasks
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Math: Algebra Pages 40-42', completed: false, due: 'Tomorrow' },
        { id: 2, text: 'History: Read Chapter 5', completed: true, due: 'Today' },
        { id: 3, text: 'Science: Project Proposal', completed: false, due: 'Fri' },
    ]);

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    return (
        <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 shadow-lg p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-800 font-bold flex items-center gap-2">
                    <CheckSquare className="text-indigo-500" size={18} />
                    My Tasks
                </h3>
                <button className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-indigo-600">
                    <Plus size={18} />
                </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`group flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer border ${task.completed
                                ? 'bg-gray-50/50 border-transparent opacity-60'
                                : 'bg-white border-indigo-50 hover:border-indigo-200 hover:shadow-sm'
                            }`}
                    >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 group-hover:border-indigo-400'
                            }`}>
                            {task.completed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-medium transition-colors ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                {task.text}
                            </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${task.due === 'Tomorrow' || task.due === 'Today' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                            }`}>
                            {task.due}
                        </span>
                    </div>
                ))}
            </div>

            {/* Progress Bar (Gamification) */}
            <div className="mt-4 pt-4 border-t border-gray-100/50">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};
