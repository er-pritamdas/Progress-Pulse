import { Flame } from "lucide-react";

const CurrentStreakCard = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-base-100 rounded-2xl shadow-md p-4">
      <Flame className="text-orange-500 mb-2" size={32} />
      <h2 className="text-xl font-semibold">Current Streak</h2>
      <p className="text-3xl font-bold text-orange-500 mt-2">12 Days</p>
      <p className="text-sm text-gray-500">🔥 Keep it going!</p>
    </div>
  );
};

export default CurrentStreakCard;
