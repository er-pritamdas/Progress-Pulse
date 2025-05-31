import { Trophy } from "lucide-react";

const HabitScoreCard = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-base-100 rounded-2xl shadow-md p-4">
      <Trophy className="text-yellow-500 mb-2" size={32} />
      <h2 className="text-xl font-semibold">Habit Score</h2>
      <p className="text-3xl font-bold text-yellow-500 mt-2">82%</p>
      <p className="text-sm text-gray-500">Consistency score</p>
    </div>
  );
};

export default HabitScoreCard;
