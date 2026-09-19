import { Flame } from "lucide-react";
import React, { useEffect, useState } from "react";

// 🔁 Entry Counter (counts non-empty entries for any habit)
const countHabitEntries = (habitData) => {
  if (!habitData || habitData.length === 0) return 0;

  return habitData.filter((entry) => {
    const keysToIgnore = ["date", "score", "progress"];
    return Object.entries(entry).some(
      ([key, value]) => !keysToIgnore.includes(key) && value !== ""
    );
  }).length;
};

// 🔥 Dynamic Messages
const getMessage = (count) => {
  if (count === 0) return { emoji: "🕊️", text: "No entries yet — today is a great day to begin!" };
  if (count <= 7) return { emoji: "🌱", text: "Just getting started" };
  if (count <= 15) return { emoji: "✨", text: "Momentum is building" };
  if (count <= 30) return { emoji: "🔥", text: "Great consistency" };
  return { emoji: "🚀", text: "Incredible dedication" };
};

const HabitSummaryCard = React.memo(({ habitData = [] }) => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState({ emoji: "", text: "" });

  useEffect(() => {
    const total = countHabitEntries(habitData);
    setCount(total);
    setMessage(getMessage(total));
  }, [habitData]);

  // Show skeleton if count is zero


  return (
    <div className="flex flex-col items-center justify-center">
      <Flame className="text-primary mb-1 md:mb-2 w-6 h-6 md:w-8 md:h-8" />
      <h2 className="text-xs sm:text-sm md:text-xl font-semibold text-gray-800 dark:text-gray-200 text-center">Logged Days</h2>
      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mt-1 md:mt-2 mb-1.5 md:mb-5">{count} Day{count > 1 ? "s" : ""}</p>
      <p className="text-[11px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center line-clamp-1 md:line-clamp-none">
        {message.emoji} {message.text}
      </p>
    </div>
  );
});

export default HabitSummaryCard;
