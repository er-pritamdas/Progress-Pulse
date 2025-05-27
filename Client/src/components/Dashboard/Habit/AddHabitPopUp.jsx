import React, { useState } from 'react';

const initialFormData = {
  date: new Date().toISOString().split('T')[0],
  burned: '',
  water: '',
  sleep: '',
  read: '',
  intake: '',
  selfcare: '',
  mood: '',
};

const AddHabitPopUp = ({ isOpen, onClose, onAdd, progress, progresscolor, settings }) => {
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // setTimeout(() => console.log(formData), 5000);
  };

  const handleSubmit = () => {
    const progressPercentage = progress(formData)
    const newItem = {
      ...formData,
      progress: progressPercentage,
    };
    console.log(newItem)
    onAdd(newItem);
    setFormData(initialFormData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-xs flex justify-center items-center z-50">
      <div className="bg-base-200 p-6 rounded-xl shadow-lg w-[90%] max-w-2xl">
        <h2 className="text-2xl font-bold mb-4 text-center">Add New Habit Entry</h2>
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
            <p className="label mt-1 text-xs text-gray-400">Required – Choose the date for this entry.</p>
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
            <p className="label mt-1 text-xs text-gray-400">Required – Total calories you burned today.</p>
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
            <p className="label mt-1 text-xs text-gray-400">Required – Total liters of water consumed.</p>
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
            <p className="label mt-1 text-xs text-gray-400">Required – Hours of sleep you had last night.</p>
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
            <p className="label mt-1 text-xs text-gray-400">Required – How many hours did you read today?</p>
          </fieldset>

          {/* Intake */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Calorie Intake</legend>
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
            <p className="label mt-1 text-xs text-gray-400">Required – Total calorie intake today.</p>
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
                {formData.selfcare || "_".repeat(settings.selfcare?.length || 3)}
              </div>

              <ul
                tabIndex={0}
                className="dropdown-content z-[999] menu p-2 shadow bg-base-300 rounded-box w-full max-w-xs"
              >
                {settings.selfcare && settings.selfcare.length > 0 ? (
                  settings.selfcare.map((habit, index) => {
                    const currentValue = formData.selfcare.padEnd(settings.selfcare.length, "_");
                    const isChecked = currentValue[index] === habit[0].toUpperCase();

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
                    <a href="/settings" className="text-primary hover:text-primary-focus">
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
                {['Amazing', 'Good', 'Average', 'Sad', 'Depressed', 'Productive'].map((mood) => (
                  <li key={mood}>
                    <button
                      onClick={() =>
                        handleChange({
                          target: { name: "mood", value: mood },
                        })
                      }
                      className={`text-sm px-2 py-1 rounded w-full text-left ${formData.mood === mood ? "bg-primary text-primary-content" : ""
                        }`}
                    >
                      {mood}
                    </button>
                  </li>
                ))}
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
