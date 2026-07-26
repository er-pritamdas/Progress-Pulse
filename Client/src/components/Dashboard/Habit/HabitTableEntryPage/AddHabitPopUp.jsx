import React, { useState, useEffect } from "react";
import { Utensils, Loader2 } from "lucide-react";
import axiosInstance from "../../../../Context/AxiosInstance";

const AddHabitPopUp = ({
  isOpen,
  onClose,
  onAdd,
  progress,
  progresscolor,
  settings,
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    burned: "",
    water: "",
    sleep: "",
    read: "",
    intake: "",
    selfcare: "",
    mood: "",
  });

  const [isCalculatingFood, setIsCalculatingFood] = useState(false);
  const [foodCalcMsg, setFoodCalcMsg] = useState("");

  const handleCalculateFromFood = async () => {
    if (!formData.date) return;
    try {
      setIsCalculatingFood(true);
      setFoodCalcMsg("");
      const res = await axiosInstance.get("/v1/dashboard/habit/food/log", {
        params: { date: formData.date },
      });
      const totalCals = res.data?.data?.summary?.totalCalories;
      if (totalCals !== undefined && totalCals !== null) {
        setFormData((prev) => ({ ...prev, intake: totalCals }));
        setFoodCalcMsg(`Fetched ${totalCals} kcal from Food Logging!`);
        setTimeout(() => setFoodCalcMsg(""), 3500);
      } else {
        setFormData((prev) => ({ ...prev, intake: 0 }));
        setFoodCalcMsg("No food logged for this date (0 kcal).");
        setTimeout(() => setFoodCalcMsg(""), 3500);
      }
    } catch (err) {
      console.error("Failed to calculate calories from food logging", err);
      setFoodCalcMsg("Failed to fetch food logs.");
      setTimeout(() => setFoodCalcMsg(""), 3500);
    } finally {
      setIsCalculatingFood(false);
    }
  };

  useEffect(() => {
    if (isOpen && settings) {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        burned: settings.burned?.min || "",
        water: settings.water?.min || "",
        sleep: settings.sleep?.min || "",
        read: settings.read?.min || "",
        intake: settings.intake?.min || "",
        selfcare: "_".repeat(settings.selfcare?.length || 0),
        mood: "",
      });
    }
  }, [isOpen, settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const progressPercentage = progress(formData);
    const newItem = {
      ...formData,
      progress: progressPercentage,
    };
    console.log(newItem);
    onAdd(newItem);
    // Reset form to defaults for next time, though useEffect will likely handle it on re-open. 
    // But if we want it to reset immediately after submit even if still open (though onClose is called):
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/75 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-18 pb-6 px-3 sm:px-6 overflow-hidden">
      <div className="bg-base-200 p-6 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-80px)] flex flex-col overflow-y-auto border border-base-300 animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold text-center">
          Add New Habit Entry
        </h2>
        <div className="flex justify-center mt-4 mb-4">
          <progress
            className={`progress w-150 ${progresscolor(progress(formData))}`}
            value={progress(formData)}
            max="100"
          ></progress>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date Picker */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Date</legend>
            <div className="dropdown dropdown-bottom w-full">
              <div
                tabIndex={0}
                role="button"
                className="input input-bordered w-full"
              >
                {formData.date || "Pick a date"}
              </div>
              <div className="dropdown-content z-[999] bg-base-100 rounded-box shadow-sm p-2">
                <calendar-date
                  class="cally"
                  onchange={(e) =>
                    handleChange({
                      target: { name: "date", value: e.target.value },
                    })
                  }
                >
                  <svg
                    aria-label="Previous"
                    className="fill-current size-4"
                    slot="previous"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                  <svg
                    aria-label="Next"
                    className="fill-current size-4"
                    slot="next"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                  <calendar-month></calendar-month>
                </calendar-date>
              </div>
            </div>
            <p className="label mt-1 text-xs text-gray-400">
              Required – Choose the date for this entry.
            </p>
          </fieldset>

          {/* Burned */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Calories Burned</legend>
            <label className="input input-bordered flex items-center gap-2">
              <input
                name="burned"
                type="number"
                min="0"
                max="2000"
                step="10"
                className="grow"
                placeholder="Burned [Kcal]"
                value={formData.burned}
                onChange={handleChange}
              />
              <span className="label">Kcal</span>
            </label>
            <p className="label mt-1 text-xs text-gray-400">
              Required – Total calories you burned today.
            </p>
          </fieldset>

          {/* Water */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Water Intake</legend>
            <label className="input input-bordered flex items-center gap-2">
              <input
                name="water"
                type="number"
                min="0"
                max="10"
                step="0.1"
                className="grow"
                placeholder="Water [L]"
                value={formData.water}
                onChange={handleChange}
                required
              />
              <span className="label">L</span>
            </label>
            <p className="label mt-1 text-xs text-gray-400">
              Required – Total liters of water consumed.
            </p>
          </fieldset>

          {/* Sleep */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Sleep Duration</legend>
            <label className="input input-bordered flex items-center gap-2">
              <input
                name="sleep"
                type="number"
                min="0"
                max="24"
                step="0.5"
                className="grow"
                placeholder="Sleep [Hrs]"
                value={formData.sleep}
                onChange={handleChange}
              />
              <span className="label">Hrs</span>
            </label>
            <p className="label mt-1 text-xs text-gray-400">
              Required – Hours of sleep you had last night.
            </p>
          </fieldset>

          {/* Read */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Reading Time</legend>
            <label className="input input-bordered flex items-center gap-2">
              <input
                name="read"
                type="number"
                min="0"
                max="12"
                step="0.5"
                className="grow"
                placeholder="Read [Hrs]"
                value={formData.read}
                onChange={handleChange}
              />
              <span className="label">Hrs</span>
            </label>
            <p className="label mt-1 text-xs text-gray-400">
              Required – How many hours did you read today?
            </p>
          </fieldset>

          {/* Intake */}
          <fieldset className="fieldset">
            <div className="flex flex-wrap justify-between items-center mb-1 gap-1">
              <legend className="fieldset-legend mb-0">Calorie Intake</legend>
              <button
                type="button"
                className="btn btn-xs btn-outline btn-primary gap-1 rounded-lg"
                onClick={handleCalculateFromFood}
                disabled={isCalculatingFood}
                title="Automatically calculate total logged calories from Food Logging for this date"
              >
                {isCalculatingFood ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Utensils size={12} />
                )}
                <span>Calculate from Food Logging</span>
              </button>
            </div>
            <label className="input input-bordered flex items-center gap-2">
              <input
                name="intake"
                type="number"
                min="0"
                max="5000"
                step="10"
                className="grow"
                placeholder="Intake [Kcal]"
                value={formData.intake}
                onChange={handleChange}
              />
              <span className="label">Kcal</span>
            </label>
            <div className="flex justify-between items-center mt-1">
              <p className="label text-xs text-gray-400">
                Required – Total calorie intake today.
              </p>
              {foodCalcMsg && (
                <span className="text-[11px] font-bold text-success animate-in fade-in">
                  {foodCalcMsg}
                </span>
              )}
            </div>
          </fieldset>

          {/* Selfcare */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Selfcare</legend>

            <div className="dropdown dropdown-top w-full">
              <div
                tabIndex={0}
                role="button"
                className="input input-bordered w-full cursor-pointer"
              >
                {formData.selfcare ||
                  "_".repeat(settings.selfcare?.length || 3)}
              </div>

              <ul
                tabIndex={0}
                className="dropdown-content z-[999] menu p-2 shadow bg-base-300 rounded-box w-full max-w-xs"
              >
                {settings.selfcare && settings.selfcare.length > 0 ? (
                  settings.selfcare.map((habit, index) => {
                    const currentValue = formData.selfcare.padEnd(
                      settings.selfcare.length,
                      "_"
                    );
                    const isChecked =
                      currentValue[index] === habit[0].toUpperCase();

                    return (
                      <li key={habit}>
                        <label className="label cursor-pointer gap-2">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={isChecked}
                            onChange={(e) => {
                              const updated = currentValue
                                .split("")
                                .map((char, i) =>
                                  i === index
                                    ? e.target.checked
                                      ? habit[0].toUpperCase()
                                      : "_"
                                    : char
                                )
                                .join("");

                              handleChange({
                                target: {
                                  name: "selfcare",
                                  value: updated,
                                },
                              });
                            }}
                          />
                          <span className="label-text">{habit}</span>
                        </label>
                      </li>
                    );
                  })
                ) : (
                  <li className="text-sm text-center text-gray-400 px-2 py-1 flex flex-col items-center gap-1">
                    No Self Care Habits set. Please set them in{" "}
                    <a
                      href="/settings"
                      className="text-primary hover:text-primary-focus"
                    >
                      Settings
                    </a>
                  </li>
                )}
              </ul>
            </div>

            <p className="label mt-1 text-xs text-gray-400">
              Required – Track self-care habits like BNF, Journaling, etc.
            </p>
          </fieldset>

          {/* Mood */}
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend">Mood</legend>

            <div className="dropdown dropdown-top w-full">
              <div
                tabIndex={0}
                role="button"
                className="input input-bordered w-full cursor-pointer"
              >
                {formData.mood || "Select Mood"}
              </div>

              <ul
                tabIndex={0}
                className="dropdown-content z-[999] menu p-2 shadow bg-base-300 rounded-box w-full max-w-xs"
              >
                {
                  settings.mood && settings.mood.length > 0 ? (
                    settings.mood.map((mood) => (
                      <li key={mood}>
                        <button
                          onClick={() =>
                            handleChange({
                              target: { name: "mood", value: mood },
                            })
                          }
                          className={`text-sm px-2 py-1 rounded w-full text-left ${formData.mood === mood
                            ? "bg-primary text-primary-content"
                            : ""
                            }`}
                        >
                          {mood}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-center text-gray-400 px-2 py-1 flex flex-col items-center gap-1">
                      No Moods set. Please set them in{" "}
                      <a
                        href="/settings"
                        className="text-primary hover:text-primary-focus"
                      >
                        Settings
                      </a>
                    </li>
                  )}
              </ul>
            </div>

            <p className="label mt-1 text-xs text-gray-400">
              Required – Track your daily emotional state.
            </p>
          </fieldset>
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <button className="btn btn-success" onClick={handleSubmit}>
            Add
          </button>
          <button className="btn btn-warning" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddHabitPopUp;
