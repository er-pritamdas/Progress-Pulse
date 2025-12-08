import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { CalendarDays, CalendarCheck2, Flame, Utensils, Scale, Target } from 'lucide-react';

const CalorieScoreBoard = ({
    habitData = [],
    ConsumedCalorieMax = 0,
    BurnedCalorieMax = 0,
    maintenanceCalories = 0,
}) => {
    const {
        fromDate,
        toDate,
        consumedSum,
        burnedSum,
        effective,
        offset,
        totalDays
    } = useMemo(() => {
        if (!Array.isArray(habitData) || habitData.length === 0) {
            return {
                fromDate: null,
                toDate: null,
                consumedSum: 0,
                burnedSum: 0,
                effective: 0,
                offset: 0,
                totalDays: 0,
            };
        }

        const consumed = habitData
            .map((entry) => Number(entry.intake))
            .filter((val) => !isNaN(val))
            .reduce((sum, val) => sum + val, 0);

        const burned = habitData
            .map((entry) => Number(entry.burned))
            .filter((val) => !isNaN(val))
            .reduce((sum, val) => sum + val, 0);

        const fromDate = habitData[habitData.length - 1].date;
        const toDate = habitData[0].date;
        const days = dayjs(toDate).diff(dayjs(fromDate), 'day') + 1;

        const effective = consumed - burned;
        const offset = effective - (maintenanceCalories * days);

        return {
            fromDate,
            toDate,
            consumedSum: consumed,
            burnedSum: burned,
            effective,
            offset,
            totalDays: days,
        };
    }, [habitData, ConsumedCalorieMax, BurnedCalorieMax, maintenanceCalories]);

    const consumedGoal = totalDays * ConsumedCalorieMax;
    const burnedGoal = totalDays * BurnedCalorieMax;

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Row 1 */}
                <div className="stat shadow">
                    <div className="stat-figure text-secondary">
                        <CalendarDays className="h-6 w-6" />
                    </div>
                    <div className="stat-title">From</div>
                    <div className="stat-value">{fromDate ? dayjs(fromDate).format('DD MMM') : 'N/A'}</div>
                    <div className="stat-desc">Start Date</div>
                </div>

                <div className="stat shadow">
                    <div className="stat-figure text-secondary">
                        <CalendarCheck2 className="h-6 w-6" />
                    </div>
                    <div className="stat-title">To</div>
                    <div className="stat-value">{toDate ? dayjs(toDate).format('DD MMM') : 'N/A'}</div>
                    <div className="stat-desc">End Date</div>
                </div>

                <div className="stat shadow">
                    <div className="stat-figure text-red-500">
                        <Flame className="h-6 w-6" />
                    </div>
                    <div className="stat-title">Burned</div>
                    <div className="stat-value text-red-500">{burnedSum}</div>
                    <div className="stat-desc">Target: {burnedGoal}</div>
                </div>

                {/* Row 2 */}
                <div className="stat shadow">
                    <div className="stat-figure text-green-500">
                        <Utensils className="h-6 w-6" />
                    </div>
                    <div className="stat-title">Consumed</div>
                    <div className="stat-value text-green-500">{consumedSum}</div>
                    <div className="stat-desc">Limit: {consumedGoal}</div>
                </div>

                <div className="stat shadow">
                    <div className="stat-figure text-blue-500">
                        <Scale className="h-6 w-6" />
                    </div>
                    <div className="stat-title">Effective</div>
                    <div className="stat-value text-blue-500">{effective}</div>
                    <div className="stat-desc">Consumed - Burned</div>
                </div>

                <div
                    className={`stat shadow rounded-lg ${offset >= 0 ? 'border border-emerald-500' : 'border border-rose-500'
                        }`}
                >
                    <div className={`stat-figure ${offset >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        <Target className="h-6 w-6" />
                    </div>
                    <div className="stat-title">Offset from {maintenanceCalories}</div>
                    <div className={`stat-value ${offset >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {offset >= 0 ? '+' : ''}
                        {offset}
                    </div>
                    <div className="stat-desc">{offset >= 0 ? 'In Surplus' : 'In Deficit'}</div>
                </div>

            </div>

            {/* Notes */}
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-500">
                <p className='mb-1'>📅 <strong>From / To</strong>: Automatically picked from habit data (latest to oldest).</p>
                <p className='mb-1'>🔥 <strong>Burned</strong>: Total calories burned via workouts or activities. Compared to your goal for {totalDays} days.</p>
                <p className='mb-1'>🍽️ <strong>Consumed</strong>: Total calories eaten. Compared to your max allowed intake for {totalDays} days.</p>
                <p className='mb-1'>⚖️ <strong>Effective</strong>: Net calories = Consumed - Burned.</p>
                <p className='mb-1'>🎯 <strong>Offset</strong>: Difference from {maintenanceCalories} kcal reference. Positive = surplus, Negative = deficit.</p>
            </div>
        </div>
    );
};

export default CalorieScoreBoard;
