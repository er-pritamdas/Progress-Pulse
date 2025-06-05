import { Flame } from "lucide-react";
import { useEffect, useState } from "react";

// 🔁 Entry Counter (counts non-empty entries for any habit)
const countHabitEntries = (habitData) => {
  if (!habitData || habitData.length === 0) return 0;

  return habitData.filter((entry) => {
    // Check if at least one habit field has a non-empty value
    const keysToIgnore = ["date", "score", "progress"]; // not habits
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

const HabitSummaryCard = ({ habitData = [] }) => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState({ emoji: "", text: "" });

  useEffect(() => {
    const total = countHabitEntries(habitData);
    setCount(total);
    setMessage(getMessage(total));
  }, [habitData]);

  return (
    <div className="flex flex-col items-center justify-center">
      <Flame className="text-primary mb-2" size={32} />
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Logged Days</h2>
      <p className="text-3xl font-bold text-primary mt-2 mb-5">{count} Days</p>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
        {message.emoji} {message.text}
      </p>
    </div>
  );
};

export default HabitSummaryCard;
