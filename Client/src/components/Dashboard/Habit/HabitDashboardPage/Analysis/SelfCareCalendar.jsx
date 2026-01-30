import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { ChevronRight, Dumbbell, BookOpen, Flower2, Footprints, Droplets, Moon, PenLine, Sparkles, Zap } from 'lucide-react';

const SelfCareCalendar = ({ habitData = [], selfCareList = [], year = dayjs().year() }) => {
    const [selectedActivity, setSelectedActivity] = useState(selfCareList[0] || '');

    // Helper to get icon for habit
    const getHabitIcon = (habitName) => {
        if (!habitName) return <Zap size={16} />;
        const lower = habitName.toLowerCase();
        const iconProps = { size: 16 };

        if (lower.includes('workout') || lower.includes('gym') || lower.includes('exercise')) return <Dumbbell {...iconProps} />;
        if (lower.includes('read') || lower.includes('book')) return <BookOpen {...iconProps} />;
        if (lower.includes('meditat')) return <Flower2 {...iconProps} />;
        if (lower.includes('yoga')) return <Flower2 {...iconProps} />;
        if (lower.includes('run') || lower.includes('jog')) return <Footprints {...iconProps} />;
        if (lower.includes('walk')) return <Footprints {...iconProps} />;
        if (lower.includes('water') || lower.includes('drink')) return <Droplets {...iconProps} />;
        if (lower.includes('sleep') || lower.includes('nap')) return <Moon {...iconProps} />;
        if (lower.includes('journal') || lower.includes('writ')) return <PenLine {...iconProps} />;
        if (lower.includes('skin') || lower.includes('face')) return <Sparkles {...iconProps} />;
        return <Zap {...iconProps} />;
    };

    // Calculate active days for the selected activity
    const activeDates = useMemo(() => {
        if (!selectedActivity || !habitData.length) return new Set();

        const dates = new Set();
        const activityChar = selectedActivity[0].toUpperCase();

        habitData.forEach(entry => {
            if (entry.selfcare && entry.selfcare.includes(activityChar)) {
               // Verify it matches the specific activity index if needed, 
               // but based on previous logic, we check existence of char.
               // However, SelfCareAnalysis checked index. Let's try to be consistent if possible.
               // But usually selfcare string is just concatenated chars? 
               // Wait, SelfCareAnalysis logic:
               // for (let i = 0; i < selfCareList.length; i++) ... if (i < selfcareStr.length) ...
               // This implies positional mapping. 
               // Let's assume simplest check for now: if user follows the positional rule.
               // We need the index of selectedActivity in the selfCareList.
               
               const index = selfCareList.indexOf(selectedActivity);
               if (index !== -1 && index < entry.selfcare.length) {
                   if (entry.selfcare[index] === activityChar) {
                       dates.add(dayjs(entry.date).format('YYYY-MM-DD'));
                   }
               }
            }
        });
        return dates;
    }, [selectedActivity, habitData, selfCareList]);

    const months = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => {
            return dayjs().year(year).month(i).startOf('month');
        });
    }, [year]);

    return (
        <div className="flex flex-col md:flex-row gap-6 bg-base-100 rounded-2xl shadow-md p-6 animate-fade-in-up">
            {/* Left Sidebar: Activities List */}
            <div className="w-full md:w-[20%] space-y-2">
                <h3 className="text-lg font-semibold mb-4 opacity-70">Activities</h3>
                <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {selfCareList.map((activity) => (
                        <button
                            key={activity}
                            onClick={() => setSelectedActivity(activity)}
                            className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left ${
                                selectedActivity === activity
                                    ? 'bg-primary text-primary-content shadow-md'
                                    : 'bg-base-200 hover:bg-base-300 opacity-70 hover:opacity-100'
                            }`}
                        >
                            <span className="font-medium truncate flex items-center gap-2">
                                <span>{getHabitIcon(activity)}</span>
                                {activity}
                            </span>
                            {selectedActivity === activity && <ChevronRight size={16} />}
                        </button>
                    ))}
                    {selfCareList.length === 0 && (
                        <p className="text-sm opacity-50">No activities found.</p>
                    )}
                </div>
            </div>

            {/* Right Content: Year Calendar */}
            <div className="w-full md:w-[80%]">
                <div className="flex items-center justify-between mb-6">
                     <h3 className="text-lg font-semibold flex items-center gap-2">
                        {getHabitIcon(selectedActivity)} {selectedActivity} <span className="opacity-50 text-sm font-normal">in {year}</span>
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

export default SelfCareCalendar;
