import { Flame } from "lucide-react";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

// 🔁 Current Streak Calculator
const getCurrentStreak = (habitData, fromDate, toDate) => {
  if (!habitData || habitData.length === 0) return 0;

  const today = dayjs().startOf("day");

  const validDates = habitData
    .map((entry) => dayjs(entry.date))
    .filter((date) => date.isValid())
    .filter((date) =>
      date.isBetween(dayjs(fromDate).subtract(1, "day"), dayjs(toDate).add(1, "day"))
    );

  const sortedDates = Array.from(new Set(validDates.map((d) => d.format("YYYY-MM-DD"))))
    .map((d) => dayjs(d))
    .sort((a, b) => a.diff(b));

  let currentStreak = 0;

  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const expectedDate = today.subtract(currentStreak, "day");
    if (sortedDates[i].isSame(expectedDate, "day")) {
      currentStreak++;
    } else {
      break;
    }
  }

  return currentStreak;
};

// 🔥 Dynamic Streak Messages
const getStreakMessage = (streak) => {
  if (streak === 0) return { text: "Let’s get back on track!", emoji: "🛤️" };
  if (streak <= 2) return { text: "Keep it up!", emoji: "💫" };
  if (streak <= 6) return { text: "Solid consistency!", emoji: "🔥" };
  if (streak <= 13) return { text: "On a roll!", emoji: "🏃‍♂️" };
  if (streak <= 29) return { text: "Almost a month straight!", emoji: "📅" };
  if (streak <= 59) return { text: "You're unstoppable!", emoji: "⚡" };
  return { text: "Streak master!", emoji: "👑" };
};

const CurrentStreakCard = React.memo(({ habitData = [], fromDate, toDate }) => {
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState({ text: "", emoji: "" });

  useEffect(() => {
    if (habitData.length && fromDate && toDate) {
      const streakCount = getCurrentStreak(habitData, fromDate, toDate);
      setStreak(streakCount);
      setMessage(getStreakMessage(streakCount));
    } else {
      setStreak(0);
      setMessage(getStreakMessage(0));
    }
  }, [habitData, fromDate, toDate]);

  return (
    <div className="flex flex-col items-center justify-center">
      <Flame className="text-red-500 mb-1 md:mb-2 w-6 h-6 md:w-8 md:h-8" />
      <h2 className="text-xs sm:text-sm md:text-xl font-semibold text-gray-800 dark:text-gray-200 text-center">Current Streak</h2>
      <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-red-500 mt-1 md:mt-2 mb-1.5 md:mb-6">
        {streak} Day{streak !== 1 ? "s" : ""}
      </p>
      <p className="text-[11px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center line-clamp-1 md:line-clamp-none">{message.emoji} {message.text}</p>
    </div>
  );
});

export default CurrentStreakCard;
