import React, { useState } from 'react';

const initialFormData = {
  date: new Date().toISOString().split('T')[0],
  burned: '0',
  water: '0',
  sleep: '0',
  read: '0',
  intake: '0',
  selfcare: '',
  mood: '',
};

const AddHabitPopUp = ({ isOpen, onClose, onAdd, progress, progresscolor, settings }) => {
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      <div className="bg-base-300 p-6 rounded-xl shadow-lg w-[90%] max-w-2xl">
        <h2 className="text-2xl font-bold mb-4 text-center">Add New Habit Entry</h2>
        <div className="flex justify-center mt-4 mb-4">
          <progress
            className={`progress w-full h-3 ${progresscolor(progress(formData))}`}
            value={progress(formData)}
            max="100"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="dropdown dropdown-bottom ">
            <label>Date</label>
            <div tabIndex={0} role="button" className="input  input-bordered w-full">
              {formData.date || "Pick a date"}
            </div>
            <div className="dropdown-content z-[999] bg-base-100 rounded-box shadow-sm p-2 ">
              <calendar-date
                className="cally"
                onChange={(e) => {
                  handleChange({ target: { name: "date", value: e.target.value } });
                }}
              >
                <svg
                  aria-label="Previous"
                  className="fill-current size-4"
                  slot="previous"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
                </svg>
                <svg
                  aria-label="Next"
                  className="fill-current size-4"
                  slot="next"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                </svg>
                <calendar-month></calendar-month>
              </calendar-date>
            </div>
          </div>

          <div >
            <label>Burned [Kcal]</label>
            <input
              name="burned"
              type="number"
              min="0"
              max="2000"
              step="10"
              className="input  input-bordered w-full"
              value={formData.burned}
              onChange={handleChange}
            />
          </div>

          <div >
            <label>Water [L]</label>
            <input
              name="water"
              type="number"
              min="0"
              max="10"
              step="0.1"
              className="input  input-bordered w-full"
              value={formData.water}
              onChange={handleChange}
              required
            />
          </div>

          <div >
            <label>Sleep [Hrs]</label>
            <input
              name="sleep"
              type="number"
              min="0"
              max="24"
              step="0.5"
              className="input  input-bordered w-full"
              value={formData.sleep}
              onChange={handleChange}
            />
          </div>

          <div >
            <label>Read [Hrs]</label>
            <input
              name="read"
              type="number"
              min="0"
              max="12"
              step="0.5"
              className="input  input-bordered w-full"
              value={formData.read}
              onChange={handleChange}
            />
          </div>

          <div >
            <label>Intake [Kcal]</label>
            <input
              name="intake"
              type="number"
              min="0"
              max="5000"
              step="10"
              className="input input-bordered w-full"
              value={formData.intake}
              onChange={handleChange}
            />
          </div>

          {/* SelfCare */}
          <div className="form-control w-full">
            <label >
              <label className="label-text">Self Care</label>
            </label>

            <div className="dropdown dropdown-bottom w-full">
              <div
                tabIndex={0}
                role="button"
                className="input input-bordered w-full cursor-pointer"
              >
                {formData.selfcare || "_".repeat(settings.selfcare?.length || 3)}
              </div>

              <ul
                tabIndex={0}
                className="dropdown-content z-[999] menu p-2 shadow bg-base-200 rounded-box w-full max-w-xs"
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
                          <label className="label-text">{habit}</label>
                        </label>
                      </li>
                    );
                  })
                ) : (
                  <li className="text-sm text-center text-gray-400 px-2 py-1 flex flex-col items-center gap-1">
                    No Self Care Habits set. Please set them in{' '}
                    <a href="/settings" className="text-primary hover:text-primary-focus">
                      Settings
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Mood Dropdown */}
          <div className="form-control w-full">
            <label >
              <label className="label-text">Mood</label>
            </label>

            <div className="dropdown dropdown-bottom w-full">
              <div
                tabIndex={0}
                role="button"
                className="input  input-bordered w-full cursor-pointer"
              >
                {formData.mood || "Select Mood"}
              </div>

              <ul
                tabIndex={0}
                className="dropdown-content z-[999] menu p-2 shadow bg-base-200 rounded-box w-full max-w-xs"
              >
                {['Amazing', 'Good', 'Average', 'Sad', 'Depressed', 'Productive'].map((mood) => (
                  <li key={mood}>
                    <button
                      onClick={() =>
                        handleChange({
                          target: { name: "mood", value: mood },
                        })
                      }
                      className={`text-sm px-2 py-1 rounded ${formData.mood === mood ? "bg-primary text-primary-content" : ""}`}
                    >
                      {mood}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
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