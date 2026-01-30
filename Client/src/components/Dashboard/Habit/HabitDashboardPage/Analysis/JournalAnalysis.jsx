import React, { useMemo, useState } from 'react';
import { Book, Calendar, X } from "lucide-react";
import dayjs from "dayjs";

const JournalAnalysis = ({
    habitData,
    fromDate,
    toDate
}) => {
    const [selectedEntry, setSelectedEntry] = useState(null);

    const totalDaysInRange = useMemo(() => {
        if (!fromDate || !toDate) return 0;
        return dayjs(toDate).diff(dayjs(fromDate), 'day') + 1;
    }, [fromDate, toDate]);

    const { journalEntries, totalJournals } = useMemo(() => {
        if (!habitData || habitData.length === 0) return { journalEntries: [], totalJournals: 0 };

        const entries = habitData
            .filter(entry => entry.journal && entry.journal.trim().length > 0)
            .map(entry => ({
                date: entry.date,
                text: entry.journal,
                mood: entry.mood || null
            }));

        return { journalEntries: entries, totalJournals: entries.length };
    }, [habitData]);

    const getMoodEmoji = (moodName) => {
        if (!moodName) return '';
        const lower = moodName.toLowerCase();
        if (lower.includes('amazing')) return '🤩';
        if (lower.includes('good') || lower.includes('happy')) return '🙂';
        if (lower.includes('average') || lower.includes('okay')) return '😐';
        if (lower.includes('sad')) return '😔';
        if (lower.includes('depress')) return '😞';
        if (lower.includes('product')) return '🚀';
        if (lower.includes('excit')) return '😃';
        if (lower.includes('tir')) return '😫';
        if (lower.includes('angry')) return '😡';
        return '🔹';
    };

    return (
        <div className="mb-12 animate-fade-in-up">
            <div className="py-3 text-2xl text-primary font-semibold divider mb-8">
                Journal Analysis ✍️
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-base-100 rounded-2xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs opacity-70">Journal Entries 📖</p>
                            <p className="text-2xl font-bold mt-1 text-primary">{totalJournals}</p>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                            <Book size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-base-100 rounded-2xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs opacity-70">Total Days 📅</p>
                            <p className="text-2xl font-bold mt-1 text-accent">{totalDaysInRange}</p>
                        </div>
                        <div className="p-2 bg-accent/10 rounded-full text-accent">
                            <Calendar size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Journal Cards Grid */}
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                Your Entries 🗂️
            </h3>
            
            {totalJournals > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {journalEntries.map((entry) => (
                            <div 
                                key={entry.date} 
                                onClick={() => setSelectedEntry(entry)}
                                className="bg-base-100 rounded-xl shadow-md p-5 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer border border-base-200 flex flex-col h-64"
                            >
                                <div className="flex items-center justify-between mb-3 border-b border-base-200 pb-2">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-lg text-primary">{dayjs(entry.date).format('MMM D, YYYY')}</span>
                                        <span className="text-xs opacity-50">{dayjs(entry.date).format('dddd')}</span>
                                    </div>
                                    {entry.mood && (
                                        <div className="badge badge-accent badge-outline gap-1 p-3">
                                            {getMoodEmoji(entry.mood)} {entry.mood}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden relative">
                                    <p className="text-sm leading-relaxed opacity-80 whitespace-pre-wrap line-clamp-6">
                                        {entry.text}
                                    </p>
                                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-base-100 to-transparent pointer-events-none"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                     {/* View Modal */}
                    {selectedEntry && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[100] p-4" onClick={() => setSelectedEntry(null)}>
                            <div 
                                className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-scale-up border border-base-300"
                                onClick={(e) => e.stopPropagation()} // Prevent close on inner click
                            >
                                {/* Header */}
                                <div className="bg-base-200/50 backdrop-blur-md border-b border-base-300 p-4 flex justify-between items-center sticky top-0 z-10">
                                    <div className="flex flex-col">
                                        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                                            {dayjs(selectedEntry.date).format('MMMM D, YYYY')} 🗓️
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm opacity-60">{dayjs(selectedEntry.date).format('dddd')}</span>
                                            {selectedEntry.mood && (
                                                <span className="badge badge-sm badge-ghost">
                                                    {getMoodEmoji(selectedEntry.mood)} {selectedEntry.mood}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedEntry(null)} 
                                        className="btn btn-sm btn-ghost btn-circle hover:bg-base-300"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                                
                                {/* Content */}
                                <div className="p-8 overflow-y-auto custom-scrollbar">
                                    <p className="text-lg leading-relaxed whitespace-pre-wrap text-base-content/90 font-serif">
                                        {selectedEntry.text} 
                                        {/* Note: If we had a markdown parser we would render it here, 
                                            but since we just inserted raw chars, displaying as text is mostly fine. 
                                            For a "Pro" feel, we could use a lightweight markdown viewer, 
                                            but raw text is safe and requested requirements "pop out with content" are met.
                                        */}
                                    </p>
                                </div>

                                {/* Footer */}
                                <div className="bg-base-200/50 p-4 border-t border-base-300 text-center">
                                     <span className="text-xs opacity-40 italic">Click outside to close</span>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-base-100 rounded-2xl p-12 text-center border-2 border-dashed border-base-300">
                    <Book className="w-12 h-12 mx-auto text-base-content/20 mb-4" />
                    <h3 className="text-lg font-semibold opacity-60">No journal entries found</h3>
                    <p className="text-sm opacity-40 mt-1">Start writing your thoughts in the daily entry table!</p>
                </div>
            )}
        </div>
    );
};

export default JournalAnalysis;
