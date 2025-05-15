import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { TitleChanger } from '../../../utils/TitleChanger'
import {
  setFieldRange,
  setSelfcareHabits,
  setMoodList,
} from '../../../services/redux/slice/habitSlice'

function HabitSettings() {
  TitleChanger("Progress Pulse | Habit Settings")
  const dispatch = useDispatch()
  const settings = useSelector((state) => state.habit.settings)

  const numericFields = ["burned", "water", "sleep", "read", "intake"]

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
    dispatch(setFieldRange({
      field,
      min: Number(ranges[field].min),
      max: Number(ranges[field].max)
    }))
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
    <div className="p-6 mx-auto">
      <h1 className="text-3xl font-bold mb-6">Habit Settings</h1>

      {/* Ranges */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-8">
        {numericFields.map((field) => (
          <div key={field} className="card shadow-md bg-base-200 p-4">
            <h2 className="text-lg font-semibold capitalize mb-2">{field}</h2>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                placeholder="Min"
                className="input input-bordered w-full"
                value={ranges[field]?.min}
                onChange={(e) => handleRangeChange(field, 'min', e.target.value)}
              />-
              <input
                type="number"
                placeholder="Max"
                className="input input-bordered w-full"
                value={ranges[field]?.max}
                onChange={(e) => handleRangeChange(field, 'max', e.target.value)}
              />
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => saveRange(field)}>
              Save {field}
            </button>
          </div>
        ))}
      </div>

      {/* Selfcare */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Selfcare Habits</h2>
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
            <div key={idx} className="badge badge-info gap-2">
              {habit}
              <button className="btn btn-xs btn-circle" onClick={() => removeFromArray('selfcare', idx)}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Mood List */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Mood Tracking</h2>
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
            <div key={idx} className="badge badge-warning gap-2">
              {m}
              <button className="btn btn-xs btn-circle btn-error" onClick={() => removeFromArray('mood', idx)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HabitSettings
