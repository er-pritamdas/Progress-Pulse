import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { ChevronRight, Trophy, CheckCircle, Clock, AlertCircle, XCircle, Zap, Award, Target } from 'lucide-react';

const ScoreCalendar = ({ habitData = [], year = dayjs().year() }) => {
    const [selectedStatus, setSelectedStatus] = useState('All');

    // Status definitions & brand colors
    const STATUS_MAP = {
        Consistent: { label: 'Consistent (≥75%)', color: '#10B981', textColor: '#FFFFFF', icon: CheckCircle },
        Moderate: { label: 'Moderate (50-74%)', color: '#3B82F6', textColor: '#FFFFFF', icon: Clock },
        Uncertain: { label: 'Uncertain (25-49%)', color: '#F59E0B', textColor: '#000000', icon: AlertCircle },
        Inconsistent: { label: 'Inconsistent (<25%)', color: '#EF4444', textColor: '#FFFFFF', icon: XCircle },
    };

    const getStatusForEntry = (entry) => {
        if (!entry) return null;
        const progress = Number(entry.progress) || 0;
        const score = Number(entry.score) || 0;

        if (progress >= 75 || score >= 5.25) return 'Consistent';
        if (progress >= 50 || score >= 3.5) return 'Moderate';
        if (progress >= 25 || score >= 1.75) return 'Uncertain';
        return 'Inconsistent';
    };

    // Calculate Active Days & Status Counts
    const { activeData, statusCounts, totalCount } = useMemo(() => {
        if (!habitData || habitData.length === 0) {
            return { activeData: new Map(), statusCounts: { Consistent: 0, Moderate: 0, Uncertain: 0, Inconsistent: 0 }, totalCount: 0 };
        }

        const map = new Map();
        const counts = { Consistent: 0, Moderate: 0, Uncertain: 0, Inconsistent: 0 };
        let total = 0;

        habitData.forEach((entry) => {
            if (entry.date) {
                const dateStr = dayjs(entry.date).format('YYYY-MM-DD');
                const status = getStatusForEntry(entry);

                if (status) {
                    counts[status] = (counts[status] || 0) + 1;
                    total++;

                    if (selectedStatus === 'All' || selectedStatus === status) {
                        map.set(dateStr, { ...entry, status });
                    }
                }
            }
        });

        return { activeData: map, statusCounts: counts, totalCount: total };
    }, [selectedStatus, habitData]);

    const months = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => {
            return dayjs().year(year).month(i).startOf('month');
        });
    }, [year]);

    return (
        <div className="flex flex-col md:flex-row gap-6 bg-base-100 rounded-2xl shadow-md p-6 animate-fade-in-up">
            {/* Left Sidebar: Score Status Categories */}
            <div className="w-full md:w-[22%] space-y-2">
                <h3 className="text-lg font-semibold mb-4 opacity-70 flex items-center gap-2">
                    <Trophy size={18} className="text-warning" />
                    Score Levels
                </h3>
                <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {/* All Option */}
                    <button
                        onClick={() => setSelectedStatus('All')}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left ${
                            selectedStatus === 'All'
                                ? 'bg-primary text-primary-content shadow-md'
                                : 'bg-base-200 hover:bg-base-300 opacity-70 hover:opacity-100'
                        }`}
                    >
                        <span className="font-medium truncate flex items-center gap-2 text-sm">
                            <Zap size={16} />
                            All Days
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs opacity-80 font-bold bg-base-100/20 px-2 py-0.5 rounded-full">
                                {totalCount}
                            </span>
                            {selectedStatus === 'All' && <ChevronRight size={16} />}
                        </div>
                    </button>

                    {/* Status Options */}
                    {Object.keys(STATUS_MAP).map((statusKey) => {
                        const statusObj = STATUS_MAP[statusKey];
                        const IconComponent = statusObj.icon;
                        const isSelected = selectedStatus === statusKey;

                        return (
                            <button
                                key={statusKey}
                                onClick={() => setSelectedStatus(statusKey)}
                                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left ${
                                    isSelected
                                        ? 'bg-primary text-primary-content shadow-md'
                                        : 'bg-base-200 hover:bg-base-300 opacity-70 hover:opacity-100'
                                }`}
                            >
                                <span className="font-medium truncate flex items-center gap-2 text-sm">
                                    <IconComponent size={16} style={{ color: isSelected ? 'inherit' : statusObj.color }} />
                                    {statusKey}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`text-xs opacity-80 font-bold px-2 py-0.5 rounded-full ${
                                            isSelected ? 'bg-base-100/20' : 'bg-base-300'
                                        }`}
                                    >
                                        {statusCounts[statusKey] || 0}
                                    </span>
                                    {isSelected && <ChevronRight size={16} />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Right Content: Year Score Calendar */}
            <div className="w-full md:w-[78%]">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Trophy size={20} className="text-warning" />
                        {selectedStatus === 'All' ? 'Score Calendar' : `${selectedStatus} Days`}
                        <span className="opacity-50 text-sm font-normal">in {year}</span>
                    </h3>
                    <div className="flex items-center gap-3 text-xs opacity-60 flex-wrap justify-end">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-base-300"></div> <span>Empty</span>
                        </div>

                        {selectedStatus === 'All' ? (
                            Object.keys(STATUS_MAP).map((key) => (
                                <div key={key} className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_MAP[key].color }}></div>
                                    <span>{key}</span>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center gap-1">
                                <div
                                    className="w-3 h-3 rounded"
                                    style={{ backgroundColor: STATUS_MAP[selectedStatus]?.color || '#10B981' }}
                                ></div>
                                <span>{selectedStatus}</span>
                            </div>
                        )}
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
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                        <span key={i} className="text-[10px] opacity-40 font-bold">
                                            {d}
                                        </span>
                                    ))}

                                    {padding.map((_, i) => (
                                        <div key={`pad-${i}`} />
                                    ))}

                                    {days.map((day) => {
                                        const dateStr = monthStart.date(day).format('YYYY-MM-DD');
                                        const entry = activeData.get(dateStr);
                                        const isActive = !!entry;
                                        const statusInfo = isActive ? STATUS_MAP[entry.status] : null;

                                        return (
                                            <div
                                                key={day}
                                                className={`aspect-square flex items-center justify-center text-[10px] rounded-sm transition-colors ${
                                                    isActive
                                                        ? 'font-bold shadow-sm'
                                                        : 'bg-base-100 opacity-50 hover:opacity-100'
                                                }`}
                                                style={
                                                    isActive && statusInfo
                                                        ? { backgroundColor: statusInfo.color, color: statusInfo.textColor }
                                                        : {}
                                                }
                                                title={
                                                    isActive
                                                        ? `Recorded on ${dateStr}: Score ${entry.score ?? '--'}/7 (${entry.progress ?? 0}%) - ${entry.status}`
                                                        : dateStr
                                                }
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

export default ScoreCalendar;
