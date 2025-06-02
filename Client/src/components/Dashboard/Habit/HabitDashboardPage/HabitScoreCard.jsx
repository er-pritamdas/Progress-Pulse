import { Trophy } from "lucide-react";

// 🎯 Get message based on score
const getScoreMessage = (score) => {
  if (score === 0) return "Let’s get started!";
  if (score < 40) return "You’ve got room to grow!";
  if (score < 70) return "Keep up the good work!";
  if (score < 90) return "You're doing great!";
  return "Excellent consistency! 🏆";
};

const HabitScoreCard = ({ score = 0 }) => {
  const message = getScoreMessage(score);
  const color =
    score >= 90 ? "text-yellow-400" :
    score >= 70 ? "text-yellow-500" :
    score >= 40 ? "text-yellow-600" : "text-yellow-700";

  return (
    <div className="flex flex-col items-center justify-center">
      <Trophy className="text-yellow-500 mb-2" size={32} />
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Habit Score</h2>
      <p className={`text-3xl font-bold ${color} mt-2`}>{score}%</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>

      {/* Progress bar visual (optional) */}
      <progress
        className="progress progress-warning w-full mt-4"
        value={score}
        max="100"
      ></progress>
    </div>
  );
};

export default HabitScoreCard;
