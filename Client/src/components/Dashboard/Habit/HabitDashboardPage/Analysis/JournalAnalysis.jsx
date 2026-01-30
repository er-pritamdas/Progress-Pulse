import React, { useMemo } from 'react';
import dayjs from "dayjs";
import JournalCalendar from "./JournalCalendar";

const JournalAnalysis = ({
    habitData,
    moodList = [],
    fromDate,
    toDate
}) => {

    const totalDaysInRange = useMemo(() => {
        if (!fromDate || !toDate) return 0;
        return dayjs(toDate).diff(dayjs(fromDate), 'day') + 1;
    }, [fromDate, toDate]);

    // Journal Analysis doesn't need stats anymore as requested, just the calendar.

    return (
        <div className="mb-12 animate-fade-in-up">
            <div className="py-3 text-2xl text-primary font-semibold divider mb-8">
                Journal Analysis ✍️
            </div>

            {/* Journal Calendar Section */}
            <section className="mt-8">
                 <JournalCalendar 
                    habitData={habitData} 
                    moodList={moodList}
                    year={fromDate ? dayjs(fromDate).year() : dayjs().year()}
                 />
            </section>
        </div>
    );
};

export default JournalAnalysis;
