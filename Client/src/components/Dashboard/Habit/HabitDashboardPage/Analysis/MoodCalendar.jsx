import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { ChevronRight, Smile, Frown, Meh, Angry, BatteryLow, Coffee, PartyPopper, AlertCircle, Zap } from 'lucide-react';

const MoodCalendar = ({ habitData = [], moodList = [], year = dayjs().year(), moodColors = {} }) => {
    const [selectedMood, setSelectedMood] = useState('All');

    // Helper to get icon for mood
    const getMoodIcon = (moodName) => {
        if (moodName === 'All') return <Zap size={16} />;
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

    // Helper for mood color (Matched with Frequency Chart)
    const getMoodColor = (moodName) => {
        if (!moodName) return null;
        if (moodName === 'All') return '#374151'; 
        
        // Use passed moodColors if available (Primary Source of Truth now)
        if (moodColors[moodName]) {
            return moodColors[moodName];
        }

        // Fallback for standalone usage or missing props
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

    // Calculate Active Days & Mood Counts
    // For 'All', we map date -> mood
    // moodCounts: { 'Happy': 12, 'Sad': 2, ... }
    const { activeData, moodCounts, totalCount } = useMemo(() => {
        if (!habitData.length) return { activeData: new Map(), moodCounts: {}, totalCount: 0 };

        const map = new Map();
        const counts = {};
        let total = 0;

        // Initialize counts
        moodList.forEach(m => counts[m] = 0);

        habitData.forEach(entry => {
            if (entry.mood) {
                // Count globally
                const moodKey = moodList.find(m => m === entry.mood) || entry.mood;
                counts[moodKey] = (counts[moodKey] || 0) + 1;
                total++;

                // Map for Calendar Display
                if (selectedMood === 'All' || entry.mood === selectedMood) {
                    map.set(dayjs(entry.date).format('YYYY-MM-DD'), entry.mood);
                }
            }
        });
        return { activeData: map, moodCounts: counts, totalCount: total };
    }, [selectedMood, habitData, moodList]);

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
                    
                    {/* All Option */}
                     <button
                        onClick={() => setSelectedMood('All')}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left ${
                            selectedMood === 'All'
                                ? 'bg-primary text-primary-content shadow-md'
                                : 'bg-base-200 hover:bg-base-300 opacity-70 hover:opacity-100'
                        }`}
                    >
                        <span className="font-medium truncate flex items-center gap-2">
                            <span><Zap size={16} /></span>
                            All
                        </span>
                        <div className="flex items-center gap-2">
                             <span className="text-xs opacity-80 font-bold bg-base-100/20 px-2 py-0.5 rounded-full">{totalCount}</span>
                             {selectedMood === 'All' && <ChevronRight size={16} />}
                        </div>
                    </button>

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
                            <div className="flex items-center gap-2">
                                <span className={`text-xs opacity-80 font-bold px-2 py-0.5 rounded-full ${selectedMood === mood ? 'bg-base-100/20' : 'bg-base-300'}`}>
                                    {moodCounts[mood] || 0}
                                </span>
                                {selectedMood === mood && <ChevronRight size={16} />}
                            </div>
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
                    <div className="flex items-center gap-3 text-xs opacity-60 flex-wrap justify-end">
                         <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-base-300"></div> <span>Empty</span></div>
                         
                         {selectedMood === 'All' ? (
                            // Show full legend when 'All' is selected
                            moodList.map((mood) => {
                                const color = getMoodColor(mood);
                                if (!color) return null;
                                return (
                                   <div key={mood} className="flex items-center gap-1">
                                       <div className="w-3 h-3 rounded" style={{backgroundColor: color}}></div>
                                       <span>{mood}</span>
                                   </div>
                                );
                            })
                         ) : (
                            // Show only selected mood
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded" style={{backgroundColor: getMoodColor(selectedMood) || '#10B981'}}></div>
                                <span>{selectedMood}</span>
                            </div>
                         )}
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
                                        const mood = activeData.get(dateStr);
                                        const isActive = !!mood;
                                        const moodColor = isActive ? getMoodColor(mood) : null;
                                        const textColor = moodColor ? getTextColor(moodColor) : null;

                                        return (
                                            <div
                                                key={day}
                                                className={`aspect-square flex items-center justify-center text-[10px] rounded-sm transition-colors ${
                                                    isActive 
                                                        ? 'font-bold shadow-sm' 
                                                        : 'bg-base-100 opacity-50 hover:opacity-100'
                                                }`}
                                                style={isActive && moodColor ? { backgroundColor: moodColor, color: textColor } : {}}
                                                title={isActive ? `Recorded on ${dateStr}: ${mood}` : dateStr}
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
