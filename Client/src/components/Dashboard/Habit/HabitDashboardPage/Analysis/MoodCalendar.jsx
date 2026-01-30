import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { ChevronRight, Smile, Frown, Meh, Angry, BatteryLow, Coffee, PartyPopper, AlertCircle, Zap } from 'lucide-react';

const MoodCalendar = ({ habitData = [], moodList = [], year = dayjs().year() }) => {
    const [selectedMood, setSelectedMood] = useState(moodList[0] || '');

    // Helper to get icon for mood
    const getMoodIcon = (moodName) => {
        if (!moodName) return <Zap size={16} />;
        const lower = moodName.toLowerCase();
        const iconProps = { size: 16 };

        if (lower.includes('happy') || lower.includes('good')) return <Smile {...iconProps} className="text-success" />;
        if (lower.includes('sad') || lower.includes('bad')) return <Frown {...iconProps} className="text-error" />;
        if (lower.includes('average') || lower.includes('okay') || lower.includes('neutral')) return <Meh {...iconProps} className="text-warning" />;
        if (lower.includes('angry')) return <Angry {...iconProps} className="text-error" />;
        if (lower.includes('tired') || lower.includes('exhausted')) return <BatteryLow {...iconProps} className="text-gray-400" />;
        if (lower.includes('relaxed') || lower.includes('calm')) return <Coffee {...iconProps} className="text-info" />;
        if (lower.includes('excited') || lower.includes('amazing')) return <PartyPopper {...iconProps} className="text-secondary" />;
        if (lower.includes('stressed') || lower.includes('anxious')) return <AlertCircle {...iconProps} className="text-warning" />;
        
        return <Zap {...iconProps} />;
    };

    // Calculate active days for the selected mood
    const activeDates = useMemo(() => {
        if (!selectedMood || !habitData.length) return new Set();

        const dates = new Set();
        // Mood is stored as a string "Happy", "Sad", etc. directly in entry.mood
        habitData.forEach(entry => {
            if (entry.mood === selectedMood) {
                dates.add(dayjs(entry.date).format('YYYY-MM-DD'));
            }
        });
        return dates;
    }, [selectedMood, habitData]);

    const months = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => {
            return dayjs().year(year).month(i).startOf('month');
        });
    }, [year]);

    return (
        <div className="flex flex-col md:flex-row gap-6 bg-base-100 rounded-2xl shadow-md p-6 animate-fade-in-up">
            {/* Left Sidebar: Mood List */}
            <div className="w-full md:w-[20%] space-y-2">
                <h3 className="text-lg font-semibold mb-4 opacity-70">Moods</h3>
                <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {moodList.map((mood) => (
                        <button
                            key={mood}
                            onClick={() => setSelectedMood(mood)}
                            className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left ${
                                selectedMood === mood
                                    ? 'bg-primary text-primary-content shadow-md'
                                    : 'bg-base-200 hover:bg-base-300 opacity-70 hover:opacity-100'
                            }`}
                        >
                            <span className="font-medium truncate flex items-center gap-2">
                                <span>{getMoodIcon(mood)}</span>
                                {mood}
                            </span>
                            {selectedMood === mood && <ChevronRight size={16} />}
                        </button>
                    ))}
                    {moodList.length === 0 && (
                        <p className="text-sm opacity-50">No moods found.</p>
                    )}
                </div>
            </div>

            {/* Right Content: Year Calendar */}
            <div className="w-full md:w-[80%]">
                 <div className="flex items-center justify-between mb-6">
                     <h3 className="text-lg font-semibold flex items-center gap-2">
                        {getMoodIcon(selectedMood)} {selectedMood} <span className="opacity-50 text-sm font-normal">in {year}</span>
                    </h3>
                    <div className="flex items-center gap-2 text-xs opacity-60">
                         <div className="w-3 h-3 rounded bg-base-300"></div> <span>Empty</span>
                         <div className="w-3 h-3 rounded bg-success"></div> <span>Recorded</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {months.map((monthStart) => {
                        const daysInMonth = monthStart.daysInMonth();
                        const startDayOfWeek = monthStart.day(); // 0 (Sun) - 6 (Sat)
                        // Array of empty slots for padding
                        const padding = Array.from({ length: startDayOfWeek });
                        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

                        return (
                            <div key={monthStart.toString()} className="bg-base-200/50 rounded-xl p-3">
                                <h4 className="font-semibold text-center mb-2 text-sm opacity-80">{monthStart.format('MMMM')}</h4>
                                <div className="grid grid-cols-7 gap-1 text-center">
                                    {/* Weekday headers can be skipped or small */}
                                    {['S','M','T','W','T','F','S'].map((d, i) => (
                                        <span key={i} className="text-[10px] opacity-40 font-bold">{d}</span>
                                    ))}
                                    
                                    {/* Padding */}
                                    {padding.map((_, i) => (
                                        <div key={`pad-${i}`} />
                                    ))}

                                    {/* Days */}
                                    {days.map(day => {
                                        const dateStr = monthStart.date(day).format('YYYY-MM-DD');
                                        const isActive = activeDates.has(dateStr);
                                        return (
                                            <div
                                                key={day}
                                                className={`aspect-square flex items-center justify-center text-[10px] rounded-sm transition-colors ${
                                                    isActive 
                                                        ? 'bg-success text-success-content font-bold shadow-sm' 
                                                        : 'bg-base-100 opacity-50 hover:opacity-100'
                                                }`}
                                                title={isActive ? `Recorded on ${dateStr}` : dateStr}
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
            </div>
        </div>
    );
};

export default MoodCalendar;
