import { Target } from "lucide-react";

const GoalProgressCard = ({ completed = 2, total = 7 }) => {
  const percent = Math.min((completed / total) * 100, 100);
  const message =
    completed === 0
      ? "Let’s begin your journey!"
      : completed < total
      ? "You're making progress!"
      : "Goal achieved! Well done! 🎯";

  return (
    <div className="flex flex-col items-center justify-center">
      <Target className="text-green-500 mb-2" size={32} />
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Goal Progress</h2>
      <p className="text-3xl font-bold text-green-500 mt-2">
        {completed} / {total}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>

      {/* Progress Bar */}
      <progress
        className="progress progress-success w-full mt-4"
        value={percent}
        max="100"
      ></progress>
    </div>
  );
};

export default GoalProgressCard;
