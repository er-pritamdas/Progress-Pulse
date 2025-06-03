import { Flame } from "lucide-react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

// 🔁 Longest Streak Calculator
const getLongestStreak = (habitData, fromDate, toDate) => {
  if (!habitData || habitData.length === 0) return 0;

  const validDates = habitData
    .map((entry) => dayjs(entry.date))
    .filter((date) => date.isValid())
    .filter((date) =>
      date.isBetween(dayjs(fromDate).subtract(1, "day"), dayjs(toDate).add(1, "day"))
    );

  const sortedDates = Array.from(new Set(validDates.map((d) => d.format("YYYY-MM-DD"))))
    .map((d) => dayjs(d))
    .sort((a, b) => a.diff(b));

  let longestStreak = 0;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const diff = sortedDates[i].diff(sortedDates[i - 1], "day");
    if (diff === 1) {
      currentStreak++;
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
  }

  return Math.max(longestStreak, currentStreak);
};

// 🔥 Dynamic Streak Messages
const getStreakMessage = (streak) => {
  if (streak === 0) return { text: "Let’s start today!", emoji: "🌱" };
  if (streak <= 2) return { text: "Off to a good start!", emoji: "✨" };
  if (streak <= 6) return { text: "You're on fire!", emoji: "🔥" };
  if (streak <= 13) return { text: "1 week strong!", emoji: "🚀" };
  if (streak <= 29) return { text: "Nearly a month!", emoji: "💪" };
  if (streak <= 59) return { text: "This is real progress!", emoji: "🧠" };
  return { text: "You're a legend!", emoji: "🏆" };
};

const CurrentStreakCard = ({ habitData = [], fromDate, toDate }) => {
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState({ text: "", emoji: "" });

  useEffect(() => {
    if (habitData.length && fromDate && toDate) {
      const streakCount = getLongestStreak(habitData, fromDate, toDate);
      setStreak(streakCount);
      setMessage(getStreakMessage(streakCount));
    } else {
      setStreak(0);
      setMessage(getStreakMessage(0));
    }
  }, [habitData, fromDate, toDate]);

  return (
    <div className="flex flex-col items-center justify-center bg-base-100 rounded-2xl shadow-md p-4">
      <Flame className="text-orange-500 mb-2" size={32} />
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Longest Streak</h2>
      <p className="text-3xl font-extrabold text-orange-500 mt-2 mb-3">
        {streak} Day{streak !== 1 ? "s" : ""}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{message.emoji} {message.text}</p>
    </div>
  );
};

export default CurrentStreakCard;
