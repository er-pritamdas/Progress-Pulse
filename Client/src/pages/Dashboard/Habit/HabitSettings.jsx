import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { TitleChanger } from '../../../utils/TitleChanger'
import {
  setFieldRange,
  setSelfcareHabits,
  setMoodList,
} from '../../../services/redux/slice/habitSlice'
import {
  Flame,
  Droplet,
  Moon,
  BookOpen,
  Utensils,
  Smile,
  UserCheck,
  Trash2,
} from 'lucide-react'

function HabitSettings() {
  TitleChanger('Progress Pulse | Habit Settings')
  const dispatch = useDispatch()
  const settings = useSelector((state) => state.habit.settings)

  const iconMap = {
    burned: <Flame size={18} />,
    water: <Droplet size={18} />,
    sleep: <Moon size={18} />,
    read: <BookOpen size={18} />,
    intake: <Utensils size={18} />,
  }

  const [ranges, setRanges] = useState({ ...settings })
  const [selfcareInput, setSelfcareInput] = useState('')
  const [moodInput, setMoodInput] = useState('')

  const handleRangeChange = (field, type, value) => {
    setRanges((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [type]: value,
      },
    }))
  }

  const saveRange = (field) => {
    dispatch(
      setFieldRange({
        field,
        min: Number(ranges[field].min),
        max: Number(ranges[field].max),
      })
    )
  }

  const addToArray = (field, value, setter) => {
    if (!value.trim()) return
    const updatedArray = [...settings[field], value.trim()]
    if (field === 'selfcare') dispatch(setSelfcareHabits(updatedArray))
    else if (field === 'mood') dispatch(setMoodList(updatedArray))
    setter('')
  }

  const removeFromArray = (field, index) => {
    const updatedArray = [...settings[field]]
    updatedArray.splice(index, 1)
    if (field === 'selfcare') dispatch(setSelfcareHabits(updatedArray))
    else if (field === 'mood') dispatch(setMoodList(updatedArray))
  }

  return (
    <div className="p-1">
      {/* Heading */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserCheck size={26} /> Habit Settings
        </h1>
      </div>

      {/* Settings Container */}
      <div className="bg-base-300 rounded-xl p-6 shadow-md">

        {/* Range Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {Object.keys(iconMap).map((field) => (
            <div key={field} className="card bg-base-200 p-4 shadow-md">
              <h2 className="text-lg font-semibold capitalize mb-3 flex items-center gap-2">
                {iconMap[field]} {field}
              </h2>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="input input-bordered w-full"
                  value={ranges[field]?.min}
                  onChange={(e) => handleRangeChange(field, 'min', e.target.value)}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="input input-bordered w-full"
                  value={ranges[field]?.max}
                  onChange={(e) => handleRangeChange(field, 'max', e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary btn-sm w-full"
                onClick={() => saveRange(field)}
              >
                Save
              </button>
            </div>
          ))}
        </div>

        {/* Selfcare Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
            <UserCheck size={22} /> Selfcare Habits
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Add a selfcare habit"
              className="input input-bordered w-full"
              value={selfcareInput}
              onChange={(e) => setSelfcareInput(e.target.value)}
            />
            <button
              className="btn btn-success"
              onClick={() => addToArray('selfcare', selfcareInput, setSelfcareInput)}
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {settings.selfcare.map((habit, idx) => (
              <div
                key={idx}
                className="badge badge-info gap-1 text-sm px-3 py-2 flex items-center"
              >
                <UserCheck size={14} />
                {habit}
                <button
                  className="ml-2 btn btn-xs btn-circle btn-error"
                  onClick={() => removeFromArray('selfcare', idx)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Mood Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
            <Smile size={22} /> Mood Tracking
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Add a mood"
              className="input input-bordered w-full"
              value={moodInput}
              onChange={(e) => setMoodInput(e.target.value)}
            />
            <button
              className="btn btn-success"
              onClick={() => addToArray('mood', moodInput, setMoodInput)}
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {settings.mood.map((m, idx) => (
              <div
                key={idx}
                className="badge badge-warning gap-1 text-sm px-3 py-2 flex items-center"
              >
                <Smile size={14} />
                {m}
                <button
                  className="ml-2 btn btn-xs btn-circle btn-error"
                  onClick={() => removeFromArray('mood', idx)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HabitSettings
