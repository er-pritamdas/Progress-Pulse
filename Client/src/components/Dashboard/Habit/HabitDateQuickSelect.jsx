import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setHabitYearAndMonth } from "../../../services/redux/slice/habitSlice";

const HabitDateQuickSelect = () => {
  const dispatch = useDispatch();
  const { fromDate, toDate } = useSelector((state) => state.habit.filters);

  const now = new Date();
  const currentSystemYear = now.getFullYear();

  // Compute active year and month from fromDate and toDate
  const getYearAndMonth = () => {
    if (!fromDate || !toDate) return { year: currentSystemYear, month: "all" };

    const fromParts = fromDate.split("-").map(Number);
    const toParts = toDate.split("-").map(Number);

    if (fromParts.length !== 3 || toParts.length !== 3) {
      return { year: currentSystemYear, month: "all" };
    }

    const [fromYear, fromMonthNum, fromDay] = fromParts;
    const [toYear, toMonthNum, toDay] = toParts;

    const fromMonth = fromMonthNum - 1; // 0-indexed
    const toMonth = toMonthNum - 1;

    const lastDayOfToMonth = new Date(toYear, toMonth + 1, 0).getDate();

    if (fromYear === toYear) {
      if (fromMonth === 0 && fromDay === 1 && toMonth === 11 && toDay === 31) {
        return { year: fromYear, month: "all" };
      }
      if (fromMonth === toMonth && fromDay === 1 && toDay === lastDayOfToMonth) {
        return { year: fromYear, month: fromMonth };
      }
    }
    return { year: fromYear || currentSystemYear, month: "custom" };
  };

  const { year: activeYear, month: activeMonth } = getYearAndMonth();

  const years = Array.from({ length: 11 }, (_, i) => currentSystemYear - 5 + i);

  const months = [
    { label: "Whole Year", value: "all" },
    { label: "January", value: 0 },
    { label: "February", value: 1 },
    { label: "March", value: 2 },
    { label: "April", value: 3 },
    { label: "May", value: 4 },
    { label: "June", value: 5 },
    { label: "July", value: 6 },
    { label: "August", value: 7 },
    { label: "September", value: 8 },
    { label: "October", value: 9 },
    { label: "November", value: 10 },
    { label: "December", value: 11 },
  ];

  const handleYearChange = (e) => {
    const selectedYear = Number(e.target.value);
    const targetMonth = activeMonth === "custom" ? "all" : activeMonth;
    dispatch(setHabitYearAndMonth({ year: selectedYear, month: targetMonth }));
  };

  const handleMonthChange = (e) => {
    const val = e.target.value === "all" ? "all" : Number(e.target.value);
    dispatch(setHabitYearAndMonth({ year: activeYear, month: val }));
  };

  return (
    <div className="flex items-center gap-2">
      {/* Year Selector */}
      <div className="floating-label">
        <select
          className="select select-sm text-xs w-24 bg-base-100 border border-base-300 rounded-lg shadow-sm focus:outline-none"
          value={activeYear}
          onChange={handleYearChange}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <span>Year</span>
      </div>

      {/* Month Selector */}
      <div className="floating-label">
        <select
          className="select select-sm text-xs w-32 bg-base-100 border border-base-300 rounded-lg shadow-sm focus:outline-none"
          value={activeMonth}
          onChange={handleMonthChange}
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
          {activeMonth === "custom" && (
            <option value="custom" disabled>
              Custom Range
            </option>
          )}
        </select>
        <span>Month</span>
      </div>
    </div>
  );
};

export default HabitDateQuickSelect;
