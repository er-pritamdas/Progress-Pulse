import React from 'react'
import BarChart from "../../../components/Dashboard/Habit/Charts/BrushBarChart"
import { TitleChanger } from '../../../utils/TitleChanger'

function HabitDashboard() {

  TitleChanger("Progress Pulse | Habit Dashboard")
  return (

    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-4 bg-base-300">
      <div className="grid grid-cols-12 grid-rows-12 gap-4 min-h-[1000px]">
        <div className="col-span-3 border border-gray-500  p-4">1</div>
        <div className="col-span-3 col-start-4 border border-gray-500 p-4">2</div>
        <div className="col-span-3 col-start-7 border border-gray-500 p-4">3</div>
        <div className="col-span-3 col-start-10 border border-gray-500 p-4">4</div>

        <div className="col-span-4 row-span-3 row-start-2 border border-gray-500 p-4">

        </div>
        <div className="col-span-4 row-span-3 col-start-5 row-start-2 border border-gray-500 p-4">6</div>
        <div className="col-span-4 row-span-3 col-start-9 row-start-2 border border-gray-500 p-4">7</div>

        <div className="col-span-12 row-span-4 row-start-5 border border-gray-500 p-4">
          <BarChart />
        </div>
        <div className="col-span-12 row-span-4 row-start-9 border border-gray-500 p-4">9</div>
      </div>
    </div>


  )
}

export default HabitDashboard
