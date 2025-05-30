import { Target } from "lucide-react";

const GoalProgressCard = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-base-100 rounded-2xl shadow-md p-4">
      <Target className="text-green-500 mb-2" size={32} />
      <h2 className="text-xl font-semibold">Goal Progress</h2>
      <p className="text-3xl font-bold text-green-500 mt-2">5 / 10</p>
      <p className="text-sm text-gray-500">Habits completed</p>
    </div>
  );
};

export default GoalProgressCard;
