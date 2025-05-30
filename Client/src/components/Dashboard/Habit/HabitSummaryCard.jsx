import { Flame } from "lucide-react";

const HabitSummaryCard = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-base-100 rounded-2xl shadow-md p-4">
      <Flame className="text-primary mb-2" size={32} />
      <h2 className="text-xl font-semibold">Total Habits</h2>
      <p className="text-3xl font-bold text-primary mt-2">7</p>
      <p className="text-sm text-gray-500">Active this month</p>
    </div>
  );
};

export default HabitSummaryCard;
