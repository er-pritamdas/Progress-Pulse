import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { 
    X, 
    BookOpen, 
    Flame, 
    Droplet, 
    Moon, 
    Utensils, 
    Heart, 
    Smile, 
    Activity, 
    Coffee, 
    Sun, 
    Apple, 
    CheckCircle2, 
    XCircle, 
    Loader2 
} from 'lucide-react';
import axiosInstance from '../../../../../Context/AxiosInstance';

const JournalCalendar = ({ habitData = [], moodList = [], year = dayjs().year() }) => {
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [foodData, setFoodData] = useState(null);
    const [loadingFood, setLoadingFood] = useState(false);

    // Get habit settings from Redux store for Self Care list
    const settingsSelfCare = useSelector((state) => state.habit?.settings?.selfcare || []);

    // Map date -> habit entry data for easy retrieval
    const habitMap = useMemo(() => {
        if (!habitData.length) return new Map();
        const map = new Map();
        habitData.forEach(entry => {
            map.set(dayjs(entry.date).format('YYYY-MM-DD'), entry);
        });
        return map;
    }, [habitData]);

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

    // Fetch Food Eaten for the selected entry's date
    useEffect(() => {
        if (!selectedEntry) {
            setFoodData(null);
            return;
        }
        let isMounted = true;
        const fetchFood = async () => {
            try {
                setLoadingFood(true);
                const dateStr = dayjs(selectedEntry.date).format('YYYY-MM-DD');
                const res = await axiosInstance.get('/v1/dashboard/habit/food/log', {
                    params: { date: dateStr }
                });
                if (isMounted) {
                    if (res.data?.data) {
                        setFoodData(res.data.data);
                    } else {
                        setFoodData(null);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch food log for popup:", err);
                if (isMounted) setFoodData(null);
            } finally {
                if (isMounted) setLoadingFood(false);
            }
        };
        fetchFood();
        return () => { isMounted = false; };
    }, [selectedEntry]);

    const handleDateClick = (dateStr) => {
        if (journalMap.has(dateStr)) {
            setSelectedEntry(journalMap.get(dateStr));
        } else if (habitMap.has(dateStr)) {
            setSelectedEntry(habitMap.get(dateStr));
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

    const hasAnyFoodLogged = (meals) => {
        if (!meals) return false;
        return Object.values(meals).some(arr => Array.isArray(arr) && arr.length > 0);
    };

    const getMealIcon = (mealType) => {
        switch (mealType) {
            case 'Breakfast': return Coffee;
            case 'Lunch': return Sun;
            case 'Dinner': return Moon;
            case 'Snacks': return Apple;
            default: return Utensils;
        }
    };

    return (
        <div className="bg-base-100 rounded-2xl shadow-md p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-semibold flex items-center gap-2">
                    Daily Overview Calendar 📅 <span className="opacity-50 text-sm font-normal">in {year}</span>
                </h3>
                <div className="flex items-center gap-3 text-xs opacity-80 flex-wrap justify-end">
                     <div className="flex items-center gap-1.5 font-semibold text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                         <span className="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-primary/40 animate-pulse"></span>
                         Today: {dayjs().format('D MMM YYYY')}
                     </div>
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
                                    const entry = journalMap.get(dateStr) || habitMap.get(dateStr);
                                    const hasEntry = !!entry;
                                    const moodColor = hasEntry ? getMoodColor(entry.mood) : null;
                                    const textColor = moodColor ? getTextColor(moodColor) : null;
                                    const isToday = dateStr === dayjs().format('YYYY-MM-DD');
                                    
                                    return (
                                        <div
                                            key={day}
                                            onClick={() => hasEntry && handleDateClick(dateStr)}
                                            style={hasEntry && moodColor ? { backgroundColor: moodColor, color: textColor } : {}}
                                            className={`aspect-square flex items-center justify-center text-[10px] rounded-sm transition-all duration-200 relative ${
                                                isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-base-100 font-extrabold z-10 scale-105 border border-primary shadow-sm' : ''
                                            } ${
                                                hasEntry 
                                                    ? 'font-bold shadow-sm cursor-pointer hover:scale-110 hover:shadow-md' 
                                                    : 'bg-base-100 opacity-50'
                                            } ${hasEntry && !moodColor ? 'bg-accent text-accent-content' : ''}`}
                                            title={(isToday ? 'Today - ' : '') + (hasEntry ? `Entry on ${dateStr} - ${entry.mood || 'No Mood'}` : dateStr)}
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

            {/* View Modal - Fixed Modal Height with Independent Section Scrollbars */}
            {selectedEntry && (
                <div 
                    className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden" 
                    onClick={() => setSelectedEntry(null)}
                >
                    <div 
                        className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-[1550px] h-[82vh] border border-base-300 flex flex-col overflow-hidden animate-scale-up"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        {/* Modal Header */}
                        <div className="bg-base-200/70 backdrop-blur-md border-b border-base-300 p-5 flex justify-between items-center shrink-0">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-2xl font-bold text-primary flex items-center gap-2">
                                        {dayjs(selectedEntry.date).format('MMMM D, YYYY')} 🗓️
                                    </h3>
                                    <span className="text-sm font-semibold opacity-70 bg-base-300/50 px-3 py-1 rounded-full">
                                        {dayjs(selectedEntry.date).format('dddd')}
                                    </span>
                                    {selectedEntry.mood && (
                                        <span className="badge badge-lg badge-primary badge-soft font-bold gap-1.5 shadow-2xs">
                                            {getMoodEmoji(selectedEntry.mood)} {selectedEntry.mood}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs opacity-60 mt-1">
                                    Comprehensive Daily Overview — Journal Note, Habit Tracking & Food Intake
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedEntry(null)} 
                                className="btn btn-sm btn-ghost btn-circle hover:bg-base-300"
                                title="Close modal"
                            >
                                <X size={22} />
                            </button>
                        </div>
                        
                        {/* Modal Body - 3 Independently Scrollable Side-by-Side Cards */}
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
                            
                            {/* SECTION 1: Journal Entry */}
                            <div className="bg-base-200/40 rounded-2xl p-5 border border-base-300 flex flex-col h-full min-h-0 overflow-hidden">
                                <div className="flex items-center justify-between border-b border-base-300/60 pb-3 mb-3 shrink-0">
                                    <h4 className="font-bold text-base text-primary flex items-center gap-2">
                                        <BookOpen size={18} /> Journal Entry
                                    </h4>
                                    {selectedEntry.mood && (
                                        <span className="badge badge-sm badge-soft badge-primary font-semibold gap-1">
                                            {getMoodEmoji(selectedEntry.mood)} {selectedEntry.mood}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                                    {selectedEntry.journal && selectedEntry.journal.trim().length > 0 ? (
                                        <div className="p-4 rounded-xl bg-base-100/90 border border-base-300 text-base-content/90 font-serif leading-relaxed text-sm whitespace-pre-wrap shadow-inner min-h-[180px]">
                                            {selectedEntry.journal}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-48 text-center opacity-50 space-y-2">
                                            <BookOpen size={32} />
                                            <p className="text-xs">No journal note recorded for this day.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SECTION 2: Habits & Daily Metrics */}
                            <div className="bg-base-200/40 rounded-2xl p-5 border border-base-300 flex flex-col h-full min-h-0 overflow-hidden">
                                <div className="flex items-center justify-between border-b border-base-300/60 pb-3 mb-3 shrink-0">
                                    <h4 className="font-bold text-base text-secondary flex items-center gap-2">
                                        <Activity size={18} /> Habits of that Day
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="badge badge-sm badge-outline font-bold text-xs">
                                            Score: {selectedEntry.score ?? 0}/7
                                        </span>
                                        <span className="badge badge-sm badge-accent font-bold text-xs">
                                            {selectedEntry.progress ?? 0}%
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                                    {/* Progress Bar */}
                                    <div className="w-full bg-base-300 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-300"
                                            style={{ width: `${selectedEntry.progress || 0}%` }}
                                        />
                                    </div>

                                    {/* Metric Cards Grid */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="p-2.5 rounded-xl bg-base-100 border border-base-200 flex items-center gap-2.5">
                                            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500"><Flame size={16} /></div>
                                            <div>
                                                <span className="opacity-50 block text-[10px]">Burned</span>
                                                <span className="font-bold text-sm">{selectedEntry.burned || 0} kcal</span>
                                            </div>
                                        </div>

                                        <div className="p-2.5 rounded-xl bg-base-100 border border-base-200 flex items-center gap-2.5">
                                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><Utensils size={16} /></div>
                                            <div>
                                                <span className="opacity-50 block text-[10px]">Intake</span>
                                                <span className="font-bold text-sm">{selectedEntry.intake || 0} kcal</span>
                                            </div>
                                        </div>

                                        <div className="p-2.5 rounded-xl bg-base-100 border border-base-200 flex items-center gap-2.5">
                                            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500"><Droplet size={16} /></div>
                                            <div>
                                                <span className="opacity-50 block text-[10px]">Water</span>
                                                <span className="font-bold text-sm">{selectedEntry.water || 0} L</span>
                                            </div>
                                        </div>

                                        <div className="p-2.5 rounded-xl bg-base-100 border border-base-200 flex items-center gap-2.5">
                                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500"><Moon size={16} /></div>
                                            <div>
                                                <span className="opacity-50 block text-[10px]">Sleep</span>
                                                <span className="font-bold text-sm">{selectedEntry.sleep || 0} hrs</span>
                                            </div>
                                        </div>

                                        <div className="p-2.5 rounded-xl bg-base-100 border border-base-200 flex items-center gap-2.5">
                                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500"><BookOpen size={16} /></div>
                                            <div>
                                                <span className="opacity-50 block text-[10px]">Read</span>
                                                <span className="font-bold text-sm">{selectedEntry.read || 0} hrs</span>
                                            </div>
                                        </div>

                                        <div className="p-2.5 rounded-xl bg-base-100 border border-base-200 flex items-center gap-2.5">
                                            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500"><Smile size={16} /></div>
                                            <div>
                                                <span className="opacity-50 block text-[10px]">Mood</span>
                                                <span className="font-bold text-sm truncate max-w-[70px] block">{selectedEntry.mood || '—'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Self Care Section */}
                                    <div className="pt-2">
                                        <span className="text-xs font-bold opacity-60 mb-2 flex items-center gap-1">
                                            <Heart size={14} className="text-pink-500" /> Self Care Acts
                                        </span>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {settingsSelfCare.map((act, idx) => {
                                                const isCompleted = selectedEntry.selfcare && selectedEntry.selfcare[idx] === act[0].toUpperCase();
                                                return (
                                                    <span 
                                                        key={act}
                                                        className={`badge badge-sm ${
                                                            isCompleted 
                                                                ? 'badge-success gap-1 text-[11px] font-semibold' 
                                                                : 'badge-ghost opacity-40 text-[11px]'
                                                        }`}
                                                    >
                                                        {isCompleted ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                        {act}
                                                    </span>
                                                );
                                            })}
                                            {(!settingsSelfCare || settingsSelfCare.length === 0) && (
                                                <span className="text-xs opacity-50 italic">No self care acts defined.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: Food Eaten on that Day */}
                            <div className="bg-base-200/40 rounded-2xl p-5 border border-base-300 flex flex-col h-full min-h-0 overflow-hidden">
                                <div className="flex items-center justify-between border-b border-base-300/60 pb-3 mb-3 shrink-0">
                                    <h4 className="font-bold text-base text-accent flex items-center gap-2">
                                        <Utensils size={18} /> All Food Eaten
                                    </h4>
                                    {foodData?.summary && (
                                        <span className="badge badge-sm badge-accent font-bold text-xs">
                                            {foodData.summary.totalCalories || 0} kcal
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                                    {loadingFood ? (
                                        <div className="flex flex-col items-center justify-center h-48 space-y-2">
                                            <Loader2 className="animate-spin text-primary" size={28} />
                                            <span className="text-xs opacity-50">Loading food logs...</span>
                                        </div>
                                    ) : foodData && hasAnyFoodLogged(foodData.meals) ? (
                                        <>
                                            {/* Summary Pills */}
                                            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                                                <div className="p-1.5 rounded-lg bg-base-100 border border-base-200">
                                                    <span className="opacity-50 block">Cals</span>
                                                    <span className="font-bold text-xs text-orange-500">{foodData.summary.totalCalories}</span>
                                                </div>
                                                <div className="p-1.5 rounded-lg bg-base-100 border border-base-200">
                                                    <span className="opacity-50 block">Prot</span>
                                                    <span className="font-bold text-xs text-info">{foodData.summary.totalProtein}g</span>
                                                </div>
                                                <div className="p-1.5 rounded-lg bg-base-100 border border-base-200">
                                                    <span className="opacity-50 block">Carb</span>
                                                    <span className="font-bold text-xs text-warning">{foodData.summary.totalCarbs}g</span>
                                                </div>
                                                <div className="p-1.5 rounded-lg bg-base-100 border border-base-200">
                                                    <span className="opacity-50 block">Fat</span>
                                                    <span className="font-bold text-xs text-pink-500">{foodData.summary.totalFat}g</span>
                                                </div>
                                            </div>

                                            {/* Meals Breakdown */}
                                            {Object.keys(foodData.meals || {}).map((mealType) => {
                                                const items = foodData.meals[mealType] || [];
                                                if (items.length === 0) return null;

                                                const IconComp = getMealIcon(mealType);

                                                return (
                                                    <div key={mealType} className="space-y-1.5">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold opacity-70">
                                                            <IconComp size={14} className="text-primary" />
                                                            <span>{mealType}</span>
                                                            <span className="text-[10px] opacity-60 font-normal">({items.length})</span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            {items.map((item, i) => (
                                                                <div 
                                                                    key={item._id || i}
                                                                    className="p-2 rounded-xl bg-base-100 border border-base-200 flex items-center justify-between text-xs"
                                                                >
                                                                    <div className="truncate pr-2">
                                                                        <span className="font-semibold block truncate text-base-content/90">
                                                                            {item.foodName}
                                                                        </span>
                                                                        <span className="text-[10px] opacity-50">
                                                                            {item.servings} serving ({item.totalGram}g)
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-right shrink-0">
                                                                        <span className="font-bold text-primary block">
                                                                            {item.calories} kcal
                                                                        </span>
                                                                        <span className="text-[10px] opacity-50">
                                                                            P:{item.protein}g C:{item.carbs}g F:{item.fat}g
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-48 text-center opacity-50 space-y-2">
                                            <Utensils size={32} />
                                            <p className="text-xs">No food logs recorded for this day.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="bg-base-200/70 p-3 border-t border-base-300 text-center shrink-0">
                            <span className="text-xs opacity-50 italic">Click outside or press X to close popup</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JournalCalendar;
