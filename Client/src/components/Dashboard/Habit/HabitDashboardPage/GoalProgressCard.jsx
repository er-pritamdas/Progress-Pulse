import React, { useEffect, useState } from "react";
import { Target } from "lucide-react";

// 🎯 Get average score (out of 7, 1 decimal)
const getAverageScore = (habitData, fromDate, toDate) => {
  if (!habitData || habitData.length === 0) return 0;

  // Parse date strings into Date objects
  const start = new Date(fromDate);
  const end = new Date(toDate);

  // Calculate number of days (inclusive)
  const timeDiff = end.getTime() - start.getTime();
  const numDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

  if (numDays <= 0) return 0;

  // Extract and sum valid scores
  const scores = habitData
    .map((entry) => Number(entry.score))
    .filter((s) => !isNaN(s));

  const total = scores.reduce((sum, s) => sum + s, 0);

  // Divide by number of days instead of score count
  return parseFloat((total / numDays).toFixed(1));
};


// 🧠 Message + Emoji logic
const getGoalMessage = (avg) => {
  if (avg === 0) return { text: "Let’s begin your journey!", emoji: "🛫" };
  if (avg < 3) return { text: "Small steps count!", emoji: "🪜" };
  if (avg < 5) return { text: "You're making progress!", emoji: "🏃‍♂️" };
  if (avg < 6.5) return { text: "Almost there!", emoji: "🎯" };
  return { text: "Goal achieved! Well done!", emoji: "🏆" };
};

const GoalProgressCard = React.memo(({ habitData = [], fromDate, toDate }) => {
  const [average, setAverage] = useState(0);
  const [message, setMessage] = useState({ text: "", emoji: "" });

  useEffect(() => {
    const avg = getAverageScore(habitData, fromDate, toDate);
    setAverage(avg);
    setMessage(getGoalMessage(avg));
  }, [habitData, fromDate, toDate]);

  const percent = Math.min((average / 7) * 100, 100);

  return (
    <div className="flex flex-col items-center justify-center">
      <Target className="text-green-500 mb-2" size={32} />
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Average Score</h2>
      <p className="text-3xl font-bold text-green-500 mt-2">
        {average} / 7
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {message.emoji} {message.text}
      </p>

      <progress
        className="progress progress-success w-full mt-4"
        value={percent}
        max="100"
      ></progress>
    </div>
  );
});

export default GoalProgressCard;
