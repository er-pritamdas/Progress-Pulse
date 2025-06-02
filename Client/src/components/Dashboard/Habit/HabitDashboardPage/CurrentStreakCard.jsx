import { Flame } from "lucide-react";

// 🎯 Dynamic streak message generator
const getStreakMessage = (streak) => {
  if (streak === 0) return { text: "Let’s start today!", emoji: "🌱" };
  if (streak <= 2) return { text: "Off to a good start!", emoji: "✨" };
  if (streak <= 6) return { text: "You're on fire!", emoji: "🔥" };
  if (streak <= 13) return { text: "1 week strong!", emoji: "🚀" };
  if (streak <= 29) return { text: "Nearly a month!", emoji: "💪" };
  if (streak <= 59) return { text: "This is real progress!", emoji: "🧠" };
  return { text: "You're a legend!", emoji: "🏆" };
};

const CurrentStreakCard = ({ streak = 0 }) => {
  const { text, emoji } = getStreakMessage(streak);

  return (
    <div className="flex flex-col items-center justify-center">
      <Flame className="text-orange-500 mb-2" size={32} />
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Current Streak</h2>
      <p className="text-3xl font-extrabold text-orange-500 mt-2 mb-3">{streak} Day{streak !== 1 ? "s" : ""}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{emoji} {text}</p>
    </div>
  );
};

export default CurrentStreakCard;
