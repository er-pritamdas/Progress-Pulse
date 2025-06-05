import { Flame } from "lucide-react";

const HabitSummaryCard = ({ total = 0 }) => {
  const message =
    total === 0
      ? "No habits yet — time to build!"
      : total < 3
      ? "Great start — add more!"
      : total < 8
      ? "You're building momentum!"
      : "You're on fire! 🔥";


      
  return (
    <div className="flex flex-col items-center justify-center">
      <Flame className="text-primary mb-2" size={32} />
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Total Habits</h2>
      <p className="text-3xl font-bold text-primary mt-2 mb-5">{total}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{message}</p>
    </div>
  );
};



export default HabitSummaryCard;
