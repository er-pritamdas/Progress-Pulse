import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { ChevronRight, X } from 'lucide-react';

const JournalCalendar = ({ habitData = [], moodList = [], year = dayjs().year() }) => {
    const [selectedEntry, setSelectedEntry] = useState(null);

    // Calculate active days (days with journal entries)
    // Map date -> entry data for easy retrieval
    const journalMap = useMemo(() => {
        if (!habitData.length) return new Map();
        const map = new Map();
        habitData.forEach(entry => {
            if (entry.journal && entry.journal.trim().length > 0) {
                map.set(dayjs(entry.date).format('YYYY-MM-DD'), entry);
            }
        });
        return map;
    }, [habitData]);

    const months = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => {
            return dayjs().year(year).month(i).startOf('month');
        });
    }, [year]);

    const handleDateClick = (dateStr) => {
        if (journalMap.has(dateStr)) {
            setSelectedEntry(journalMap.get(dateStr));
        }
    };

    // Helper for mood emoji in modal
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

    // Helper for mood color
    const getMoodColor = (moodName) => {
        if (!moodName) return null;
        const lower = moodName.toLowerCase();
        if (lower.includes('good') || lower.includes('happy')) return '#10B981'; // Green
        if (lower.includes('amazing') || lower.includes('great')) return '#3B82F6'; // Blue
        if (lower.includes('average') || lower.includes('okay')) return '#FBBF24'; // Yellow
        if (lower.includes('bad') || lower.includes('sad')) return '#EF4444'; // Red
        if (lower.includes('depressed')) return '#7F1D1D'; // Dark Red
        if (lower.includes('productive')) return '#8B5CF6'; // Purple
        if (lower.includes('excited')) return '#EC4899'; // Pink
        return '#374151'; // Default Gray
    };

    // Helper for contrast text color
    const getTextColor = (hexColor) => {
        if (!hexColor) return null;
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#000000' : '#ffffff';
    };

    return (
        <div className="bg-base-100 rounded-2xl shadow-md p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-semibold flex items-center gap-2">
                    Journal Calendar 📅 <span className="opacity-50 text-sm font-normal">in {year}</span>
                </h3>
                <div className="flex items-center gap-3 text-xs opacity-60 flex-wrap justify-end">
                     <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-base-300"></div> <span>Empty</span></div>
                     {/* Dynamic Legend */}
                     {moodList.map((mood) => {
                         const color = getMoodColor(mood);
                         if (!color) return null;
                         return (
                            <div key={mood} className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded" style={{backgroundColor: color}}></div>
                                <span>{mood}</span>
                            </div>
                         );
                     })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {months.map((monthStart) => {
                    const daysInMonth = monthStart.daysInMonth();
                    const startDayOfWeek = monthStart.day(); // 0 (Sun) - 6 (Sat)
                    const padding = Array.from({ length: startDayOfWeek });
                    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

                    return (
                        <div key={monthStart.toString()} className="bg-base-200/50 rounded-xl p-3">
                            <h4 className="font-semibold text-center mb-2 text-sm opacity-80">{monthStart.format('MMMM')}</h4>
                            <div className="grid grid-cols-7 gap-1 text-center">
                                {['S','M','T','W','T','F','S'].map((d, i) => (
                                    <span key={i} className="text-[10px] opacity-40 font-bold">{d}</span>
                                ))}
                                
                                {padding.map((_, i) => (
                                    <div key={`pad-${i}`} />
                                ))}

                                {days.map(day => {
                                    const dateStr = monthStart.date(day).format('YYYY-MM-DD');
                                    const entry = journalMap.get(dateStr);
                                    const hasEntry = !!entry;
                                    const moodColor = hasEntry ? getMoodColor(entry.mood) : null;
                                    const textColor = moodColor ? getTextColor(moodColor) : null;
                                    
                                    return (
                                        <div
                                            key={day}
                                            onClick={() => hasEntry && handleDateClick(dateStr)}
                                            style={hasEntry && moodColor ? { backgroundColor: moodColor, color: textColor } : {}}
                                            className={`aspect-square flex items-center justify-center text-[10px] rounded-sm transition-all duration-200 ${
                                                hasEntry 
                                                    ? 'font-bold shadow-sm cursor-pointer hover:scale-110 hover:shadow-md' 
                                                    : 'bg-base-100 opacity-50'
                                            } ${hasEntry && !moodColor ? 'bg-accent text-accent-content' : ''}`}
                                            title={hasEntry ? `Entry on ${dateStr} - ${entry.mood || 'No Mood'}` : dateStr}
                                        >
                                            {day}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* View Modal */}
            {selectedEntry && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[100] p-4" onClick={() => setSelectedEntry(null)}>
                    <div 
                        className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-scale-up border border-base-300"
                        onClick={(e) => e.stopPropagation()} 
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
                                {selectedEntry.journal} 
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="bg-base-200/50 p-4 border-t border-base-300 text-center">
                                <span className="text-xs opacity-40 italic">Click outside to close</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JournalCalendar;
