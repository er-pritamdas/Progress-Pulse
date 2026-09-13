import React from "react";
import dayjs from "dayjs";
import { Calendar } from "lucide-react";

/**
 * Formats any valid date string or Date object into DD-MMM-YYYY format.
 * Example: "2026-08-08" -> "08-Aug-2026"
 */
export const formatDateDDMMMYYYY = (dateStr) => {
  if (!dateStr || dateStr === "-") return "-";
  const dateObj = dayjs(dateStr);
  if (!dateObj.isValid()) return dateStr;
  return dateObj.format("DD-MMM-YYYY");
};

/**
 * Reusable Cally Dropdown Calendar DatePicker Component.
 * Consistent across whole application with DD-MMM-YYYY formatting.
 */
export const CallyDatePicker = ({
  value,
  onChange,
  placeholder = "Select Date",
  className = "",
  size = "sm",
  required = false,
  max,
  min,
  showClear = false,
  onClear
}) => {
  const displayVal = value ? formatDateDDMMMYYYY(value) : placeholder;

  return (
    <div className={`dropdown dropdown-bottom ${className}`}>
      <div
        tabIndex={0}
        role="button"
        className={`input input-${size} input-bordered focus:outline-none focus:ring-0 focus:border-primary/40 w-full flex items-center justify-between cursor-pointer font-medium ${size === "xs" || size === "sm" ? "text-xs" : "text-sm"} rounded-xl bg-base-100`}
      >
        <span className="truncate flex items-center gap-2">
          <Calendar size={size === "xs" || size === "sm" ? 14 : 16} className="shrink-0 text-primary" />
          <span className={value ? "text-base-content font-bold" : "text-base-content/40 font-normal"}>
            {displayVal}
          </span>
        </span>
        <span className="flex items-center gap-1.5 shrink-0">
          {showClear && value && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (onClear) onClear();
                else onChange("");
                document.activeElement?.blur();
              }}
              className="text-error/70 hover:text-error hover:scale-110 transition-transform font-bold text-xs px-1 cursor-pointer"
              title="Clear Date"
            >
              ✕
            </span>
          )}
          <span className="text-[10px] opacity-40">▼</span>
        </span>
      </div>
      <div
        tabIndex={0}
        className="dropdown-content z-[99999] bg-base-100 rounded-2xl shadow-2xl p-2 border border-base-200 mt-1 animate-in fade-in zoom-in-95 duration-150"
      >
        <calendar-date
          class="cally"
          value={value || undefined}
          max={max || undefined}
          min={min || undefined}
          onchange={(e) => {
            if (e.target.value) {
              onChange(e.target.value);
              e.currentTarget.closest(".dropdown")?.removeAttribute("open");
              document.activeElement?.blur();
            }
          }}
        >
          <svg
            aria-label="Previous"
            className="fill-current size-4"
            slot="previous"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          <svg
            aria-label="Next"
            className="fill-current size-4"
            slot="next"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
          <calendar-month></calendar-month>
        </calendar-date>
      </div>
    </div>
  );
};

export default CallyDatePicker;
