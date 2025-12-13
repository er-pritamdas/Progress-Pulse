import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { TitleChanger } from "../../utils/TitleChanger.jsx";
import axiosInstance from "../../Context/AxiosInstance.jsx";
import { useLoading } from "../../Context/LoadingContext.jsx";
import {
  Droplet,
  Moon,
  BookOpen,
  ArrowRight,
  Zap,
  Quote,
  Activity,
  Calendar,
  Flame,
  Utensils,
  Heart,
  Smile,
  BarChart2,
  Trophy,
  Settings,
  Table,
  Plus,
  Minus,
  ChevronDown,
  CheckSquare,
  Square
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  TitleChanger("Progress Pulse | Dashboard");
  const user = localStorage.getItem("username");
  const navigate = useNavigate();
  const settings = useSelector((state) => state.habit.settings);

  // State
  const [greeting, setGreeting] = useState("");
  const [quote, setQuote] = useState({ text: "", author: "" });
  const [todayHabits, setTodayHabits] = useState(null);
  const [loadingHabits, setLoadingHabits] = useState(true);

  // Quotes Database
  const quotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "Your future is found in your daily routine.", author: "John C. Maxwell" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
  ];

  useEffect(() => {
    // 1. Set Greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // 2. Set Random Quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);

    // 3. Fetch Today's Habit Data
    fetchTodayData();
  }, []);

  const fetchTodayData = async () => {
    try {
      setLoadingHabits(true);
      const today = new Date();
      // Format as YYYY-MM-DD for API
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      const res = await axiosInstance.get("/v1/dashboard/habit/table-entry", {
        params: {
          startDate: dateString,
          endDate: dateString,
        },
      });

      const entries = res.data.data.formattedEntries;
      if (entries && entries.length > 0) {
        setTodayHabits(entries[0]);
      } else {
        setTodayHabits(null);
      }
    } catch (error) {
      console.error("Error fetching today's habits:", error);
    } finally {
      setLoadingHabits(false);
    }
  };

  // Shared Logic for deleting empty entries
  // Helper: Recalculate Score & Progress (Optimistic)
  const recalculateStats = (entry) => {
    if (!entry) return entry;
    // Fields tracked for score
    const fields = ["burned", "water", "sleep", "read", "intake", "selfcare", "mood"];
    let filledCount = 0;

    fields.forEach(field => {
      const val = entry[field];
      if (field === 'selfcare') {
        const emptyStr = "_".repeat(settings?.selfcare?.length || 3);
        if (val && val !== emptyStr) filledCount++;
      } else if (field === 'mood') {
        // If mood is set (string), it counts. 
        // Note: Default "Average" counts if we follow HabitTableEntry logic.
        if (val) filledCount++;
      } else {
        // Numeric fields: > 0 means "done"
        if (val && Number(val) > 0) filledCount++;
      }
    });

    entry.score = filledCount;
    // progress is int percentage
    entry.progress = Math.round((filledCount / fields.length) * 100);
    return entry;
  };

  // Shared Logic for deleting empty entries
  const checkAndDelete = async (entry, isNewEntry) => {
    const isZero = (val) => !val || val === 0;
    const isSelfCareEmpty = (val) => !val || val === "_".repeat(settings?.selfcare?.length || 3);

    const isEmpty =
      isZero(entry.burned) &&
      isZero(entry.intake) &&
      isZero(entry.water) &&
      isZero(entry.sleep) &&
      isZero(entry.read) &&
      isSelfCareEmpty(entry.selfcare);

    if (isEmpty) {
      if (!isNewEntry) {
        try {
          await axiosInstance.delete("/v1/dashboard/habit/table-entry", { params: { date: entry.date } });
        } catch (e) { console.error("Delete failed", e); }
      }
      setTodayHabits(null);
      return true;
    }
    return false;
  };

  // Quick Update Handler (Auto-Create, Update, or Delete)
  const handleUpdateHabit = async (field, change) => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // Determine if we are working with an existing record (even if _id is missing due to fetch)
    const isNewEntry = !todayHabits;

    // 1. Calculate New Value
    const currentVal = Number(todayHabits?.[field]) || 0;
    let newVal = currentVal + change;

    if (newVal < 0) newVal = 0;
    if (field === 'water' || field === 'read' || field === 'sleep') {
      newVal = Math.round(newVal * 100) / 100;
    }

    // 2. Prepare Entry Data
    let updatedEntry = { ...todayHabits };

    // If no entry exists, initialize default structure
    if (isNewEntry) {
      updatedEntry = {
        date: dateString,
        burned: 0, intake: 0, water: 0, sleep: 0, read: 0,
        mood: "Average",
        selfcare: "_".repeat(settings?.selfcare?.length || 3),
        ...updatedEntry
      };
    }

    updatedEntry[field] = newVal;
    updatedEntry.date = updatedEntry.date || dateString;

    // 3. Optimistic Update (with Recalculation)
    updatedEntry = recalculateStats(updatedEntry);
    setTodayHabits(updatedEntry);

    // 4. API Logic
    try {
      if (await checkAndDelete(updatedEntry, isNewEntry)) return;

      if (!isNewEntry) {
        // Update existing (PUT)
        await axiosInstance.put("/v1/dashboard/habit/table-entry", updatedEntry);
      } else {
        // Create new (POST)
        const res = await axiosInstance.post("/v1/dashboard/habit/table-entry", updatedEntry);
        if (res.data?.data) {
          setTodayHabits(prev => ({ ...prev, ...res.data.data }));
        }
      }
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      await fetchTodayData();
    }
  };

  // Self Care Update
  const handleSelfCareUpdate = async (index, isChecked, label) => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const isNewEntry = !todayHabits;

    const requiredLength = settings?.selfcare?.length || 3;
    const currentString = todayHabits?.selfcare || "_".repeat(requiredLength);
    const char = label[0].toUpperCase();

    const newStringArr = currentString.padEnd(requiredLength, "_").split("");
    newStringArr[index] = isChecked ? char : "_";
    const newString = newStringArr.join("");

    let updatedEntry = {
      ...todayHabits,
      selfcare: newString,
      date: todayHabits?.date || dateString
    };

    if (isNewEntry) {
      updatedEntry = {
        burned: 0, intake: 0, water: 0, sleep: 0, read: 0, mood: "Average",
        ...updatedEntry
      };
    }

    updatedEntry = recalculateStats(updatedEntry);
    setTodayHabits(updatedEntry);

    try {
      if (await checkAndDelete(updatedEntry, isNewEntry)) return;

      if (!isNewEntry) {
        await axiosInstance.put("/v1/dashboard/habit/table-entry", updatedEntry);
      } else {
        const res = await axiosInstance.post("/v1/dashboard/habit/table-entry", updatedEntry);
        if (res.data?.data) setTodayHabits(prev => ({ ...prev, ...res.data.data }));
      }
    } catch (error) { console.error("Selfcare update failed", error); await fetchTodayData(); }
  };

  // Mood Update
  const handleMoodUpdate = async (newMood) => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const isNewEntry = !todayHabits;

    let updatedEntry = {
      ...todayHabits,
      mood: newMood,
      date: todayHabits?.date || dateString
    };

    if (isNewEntry) {
      updatedEntry = {
        burned: 0, intake: 0, water: 0, sleep: 0, read: 0, selfcare: "_".repeat(settings?.selfcare?.length || 3),
        ...updatedEntry
      };
    }

    updatedEntry = recalculateStats(updatedEntry);
    setTodayHabits(updatedEntry);

    try {
      if (await checkAndDelete(updatedEntry, isNewEntry)) return;

      if (!isNewEntry) {
        await axiosInstance.put("/v1/dashboard/habit/table-entry", updatedEntry);
      } else {
        const res = await axiosInstance.post("/v1/dashboard/habit/table-entry", updatedEntry);
        if (res.data?.data) setTodayHabits(prev => ({ ...prev, ...res.data.data }));
      }
    } catch (error) { console.error("Mood update failed", error); await fetchTodayData(); }
  };




  // Safe Checks & Data Parsing
  const burned = todayHabits?.burned || 0;
  const intake = todayHabits?.intake || 0;
  const water = todayHabits?.water || 0;
  const sleep = todayHabits?.sleep || 0;
  const read = todayHabits?.read || 0;
  const mood = todayHabits?.mood || "—";
  const progress = todayHabits?.progress || 0;
  const score = todayHabits?.score || 0;

  // Self Care Count logic: count non-underscore chars
  const selfCareRaw = todayHabits?.selfcare || "";
  const selfCareCount = selfCareRaw.replace(/_/g, "").length;

  return (
    <div className="min-h-screen bg-base-100 font-sans selection:bg-primary/30 selection:text-primary pb-20">

      {/* Background Gradient Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16">

        {/* 1. Hero Header Section */}
        <header className="flex flex-col items-center text-center space-y-8 animate-fade-in-down">
          {/* Date Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-base-200/50 border border-base-content/5 backdrop-blur-md shadow-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-base-content/60 tracking-wide">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>

          {/* Greeting */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-base-content leading-tight">
              {greeting}, <br className="md:hidden" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-x">
                {user}
              </span>
              <span className="text-primary">.</span>
            </h1>

            {/* Quote */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="flex items-center justify-center gap-3 text-base-content/50">
                <Quote className="w-4 h-4 opacity-50 rotate-180" />
                <p className="text-lg md:text-xl font-serif italic text-base-content/70">
                  {quote.text}
                </p>
                <Quote className="w-4 h-4 opacity-50" />
              </div>
            </motion.div>
          </div>
        </header>

        {/* 2. Main Stats Grid */}
        <section>
          <div className="flex items-end justify-between px-2 mb-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight text-base-content">Today's Habit Logs</h2>
              <div className="flex items-center gap-2 text-sm font-medium text-base-content/60">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            <div className="h-px bg-base-content/10 flex-1 mx-6 mb-3"></div>

            {/* Quick Actions Dropdown */}
            <div className="dropdown dropdown-end mb-1">
              <div tabIndex={0} role="button" className="btn btn-circle btn-ghost btn-md hover:bg-base-200 transition-colors">
                <Settings className="w-6 h-6 text-base-content/70" />
              </div>
              <ul tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow-xl bg-base-100/80 backdrop-blur-xl rounded-2xl w-64 border border-base-content/5 mt-2">
                <li className="menu-title px-4 py-2 text-xs font-bold text-base-content/40 uppercase tracking-wider">Quick Actions</li>
                <li>
                  <a onClick={() => navigate('/dashboard/habit/table-entry')} className="group flex gap-3 py-3 rounded-xl hover:bg-base-200/50">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <Table size={18} />
                    </div>
                    <span className="font-medium">Table View</span>
                  </a>
                </li>
                <li>
                  <a onClick={() => navigate('/dashboard/habit/dashboard')} className="group flex gap-3 py-3 rounded-xl hover:bg-base-200/50">
                    <div className="p-2 rounded-lg bg-secondary/10 text-secondary group-hover:bg-secondary/20 transition-colors">
                      <BarChart2 size={18} />
                    </div>
                    <span className="font-medium">Analytics</span>
                  </a>
                </li>
                <li>
                  <a onClick={() => navigate('/dashboard/habit/logging')} className="group flex gap-3 py-3 rounded-xl hover:bg-base-200/50">
                    <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                      <Zap size={18} />
                    </div>
                    <span className="font-medium">Log Habits</span>
                  </a>
                </li>
                <div className="divider my-1 opacity-10"></div>
                <li>
                  <a onClick={() => navigate('/dashboard/habit/settings')} className="group flex gap-3 py-3 rounded-xl hover:bg-base-200/50">
                    <div className="p-2 rounded-lg bg-info/10 text-info group-hover:bg-info/20 transition-colors">
                      <Settings size={18} />
                    </div>
                    <span className="font-medium">Settings</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {!loadingHabits ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Row 1: Physical Essentials */}
              <StatCard
                label="Burned Calories"
                value={burned}
                unit="kcal"
                icon={Flame}
                color="text-orange-500"
                borderColor="border-orange-500/20"
                delay={0.1}
                onIncrease={() => handleUpdateHabit('burned', 50)}
                onDecrease={() => handleUpdateHabit('burned', -50)}
                min={settings?.burned?.min || 0}
                max={settings?.burned?.max || 2000}
              />
              <StatCard
                label="Calorie Intake"
                value={intake}
                unit="kcal"
                icon={Utensils}
                color="text-emerald-500"
                borderColor="border-emerald-500/20"
                delay={0.15}
                onIncrease={() => handleUpdateHabit('intake', 50)}
                onDecrease={() => handleUpdateHabit('intake', -50)}
                min={settings?.intake?.min || 1500}
                max={settings?.intake?.max || 2500}
              />
              <StatCard
                label="Water Intake"
                value={water}
                unit="L"
                icon={Droplet}
                color="text-cyan-500"
                borderColor="border-cyan-500/20"
                delay={0.2}
                onIncrease={() => handleUpdateHabit('water', 0.25)}
                onDecrease={() => handleUpdateHabit('water', -0.25)}
                min={settings?.water?.min || 2}
                max={settings?.water?.max || 4}
              />

              {/* Row 2: Regeneration & Growth */}
              <StatCard
                label="Sleep Duration"
                value={sleep}
                unit="hrs"
                icon={Moon}
                color="text-indigo-500"
                borderColor="border-indigo-500/20"
                delay={0.25}
                onIncrease={() => handleUpdateHabit('sleep', 0.5)}
                onDecrease={() => handleUpdateHabit('sleep', -0.5)}
                min={settings?.sleep?.min || 6}
                max={settings?.sleep?.max || 9}
              />
              <StatCard
                label="Reading Time"
                value={read}
                unit="hrs"
                icon={BookOpen}
                color="text-amber-500"
                borderColor="border-amber-500/20"
                delay={0.3}
                onIncrease={() => handleUpdateHabit('read', 0.5)}
                onDecrease={() => handleUpdateHabit('read', -0.5)}
                min={settings?.read?.min || 1}
                max={settings?.read?.max || 4}
              />
              {/* Self Care Dropdown Card */}
              <div className="dropdown dropdown-top dropdown-end w-full group">
                <div tabIndex={0} role="button" className="w-full h-full">
                  <StatCard
                    label="Self Care Acts"
                    value={selfCareCount}
                    unit="Count"
                    icon={Heart}
                    color="text-pink-500"
                    borderColor="border-pink-500/20"
                    delay={0.35}
                  />
                  {/* Overlay indicator for dropdown */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronDown size={20} className="text-base-content/50" />
                  </div>
                </div>
                <ul tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow-xl bg-base-100 rounded-box w-64 border border-base-content/5">
                  <li className="menu-title text-xs uppercase opacity-50 px-2 py-1">Select completed acts</li>
                  {settings?.selfcare?.map((habit, index) => {
                    const currentString = todayHabits?.selfcare || "_".repeat(settings.selfcare.length);
                    const isChecked = currentString[index] !== '_';
                    return (
                      <li key={habit}>
                        <a onClick={() => handleSelfCareUpdate(index, !isChecked, habit)} className="flex items-center gap-3">
                          {isChecked ?
                            <CheckSquare size={18} className="text-pink-500" /> :
                            <Square size={18} className="text-base-content/30" />
                          }
                          <span className={isChecked ? "opacity-100 font-medium" : "opacity-60"}>{habit}</span>
                        </a>
                      </li>
                    )
                  })}
                  {!settings?.selfcare?.length && <li className="text-xs opacity-50 p-2">No habits configured in settings.</li>}
                </ul>
              </div>

              {/* Row 3: Wellness & Metrics */}
              {/* Mood Dropdown Card */}
              <div className="dropdown dropdown-top dropdown-end w-full group">
                <div tabIndex={0} role="button" className="w-full h-full">
                  <StatCard
                    label="Current Mood"
                    value={mood}
                    unit=""
                    icon={Smile}
                    color="text-yellow-400"
                    borderColor="border-yellow-500/20"
                    delay={0.4}
                  />
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronDown size={20} className="text-base-content/50" />
                  </div>
                </div>
                <ul tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow-xl bg-base-100 rounded-box w-52 border border-base-content/5 h-64 overflow-y-auto block">
                  <li className="menu-title text-xs uppercase opacity-50 px-2 py-1 sticky top-0 bg-base-100 z-10">Select Mood</li>
                  {settings?.mood?.map((m) => (
                    <li key={m}>
                      <a onClick={() => handleMoodUpdate(m)} className={mood === m ? "active font-bold" : ""}>
                        {m}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <StatCard
                label="Daily Progress"
                value={progress}
                unit="%"
                icon={Activity}
                color="text-teal-500"
                borderColor="border-teal-500/20"
                delay={0.45}
              />
              <StatCard
                label="Overall Score"
                value={score}
                unit="pts"
                icon={Trophy}
                color="text-primary"
                borderColor="border-primary/20"
                delay={0.5}
              />
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <span className="loading loading-bars loading-lg text-primary opacity-50"></span>
            </div>
          )}

          {/* No Data section removed to allow auto-creation */}
        </section>


      </div>
    </div>
  );
};

// Helper Stats Component (Extracted to prevent re-renders)
const StatCard = ({ label, value, unit, icon: Icon, color, borderColor, delay, onIncrease, onDecrease, min, max }) => {

  // Progress Bar Logic
  let progressPercent = 0;
  let barColor = "bg-base-content/20"; // default color
  let minPercent = 0;

  // Use the exact parameters provided for scale: 0 -> Max.
  const scaleMax = max ? max : (value > 0 ? value * 1.5 : 100);

  if (min !== undefined && max !== undefined) {
    // 1. Calculate visual percentage (capped at 100%)
    progressPercent = Math.min(100, (value / scaleMax) * 100);
    minPercent = (min / scaleMax) * 100;

    // 2. Color Logic
    if (value < min) barColor = "bg-warning";    // Below Min
    else if (value > max) barColor = "bg-error"; // Above Max (user asked for 0-Min-Max, usually >Max is good or bad depending on habit, keeping error for continuity or can switch to success)
    else barColor = "bg-success";                // In Range (Min - Max)

    // Correction: Usually exceeding "Sleep" or "Read" is good (Success), but exceeding "Calories" might be bad.
    // For general purpose, let's keep "Success" for anything >= Min. 
    // BUT the specific request was "0 to min to max", implying a range. 
    // Let's stick to the Zones:
    // < Min = Warning (Not enough)
    // Min..Max = Success (Good!)
    // > Max = Error (Too much? or just extra grid?) -> Let's make it secondary success or just keep success color but bar is full.

    if (value > max) barColor = "bg-blue-500"; // Distinction for "Overachieving" or "High"
    if (unit === 'kcal' && value > max) barColor = "bg-error"; // Calories bad if high

  } else if (unit === "%") {
    progressPercent = Math.min(100, value);
    barColor = "bg-teal-500";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, duration: 0.4, ease: "easeOut" }}
      className={`relative group overflow-hidden p-6 rounded-[2rem] bg-gradient-to-br from-base-100/80 to-base-200/50 backdrop-blur-xl border border-white/5 shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      {/* Ambient Background Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color.replace('text-', 'from-')}/20 to-transparent blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl ${color.replace('text-', 'bg-')}/10 ${color} ring-1 ring-inset ring-white/5`}>
            <Icon size={24} strokeWidth={2} />
          </div>

          {/* Action Buttons */}
          {onIncrease && onDecrease && (
            <div className="flex items-center gap-1 bg-base-100/50 rounded-lg p-1 border border-base-content/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => { e.stopPropagation(); onDecrease(); }}
                className="btn btn-xs btn-ghost btn-square w-6 h-6 hover:bg-base-200 hover:text-error"
                title={`Decrease`}
              >
                <Minus size={14} />
              </button>
              <div className="w-px h-3 bg-base-content/10"></div>
              <button
                onClick={(e) => { e.stopPropagation(); onIncrease(); }}
                className="btn btn-xs btn-ghost btn-square w-6 h-6 hover:bg-base-200 hover:text-success"
                title={`Increase`}
              >
                <Plus size={14} />
              </button>
            </div>
          )}

          {/* Generic % Badge */}
          {unit === "%" && !min && (
            <div className="badge badge-lg font-bold opacity-80">{value}%</div>
          )}
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            <h4 className="text-4xl font-bold tracking-tight text-base-content antialiased">
              {value || (value === 0 ? 0 : "—")}
            </h4>
            {unit !== "%" && (
              <span className="text-sm font-semibold text-base-content/40 uppercase tracking-wider">{unit}</span>
            )}
          </div>
          <p className="text-xs font-medium text-base-content/50 uppercase tracking-widest mt-1 group-hover:text-base-content/80 transition-colors">
            {label}
          </p>

          {/* Progress Line */}
          {min !== undefined && max !== undefined && (
            <div className="relative mt-5">
              {/* Bar Background */}
              <div className="w-full h-1.5 bg-base-content/5 rounded-full overflow-hidden relative">
                {/* Min Marker Line (Visual) */}
                <div className="absolute top-0 bottom-0 w-[2px] bg-base-content/20 z-10" style={{ left: `${minPercent}%` }} />

                {/* Fill */}
                <div className={`h-full ${barColor} transition-all duration-500 rounded-full`} style={{ width: `${progressPercent}%` }} />
              </div>

              {/* Labels */}
              <div className="flex justify-between items-center text-[9px] font-semibold text-base-content/60 mt-2 uppercase tracking-wider">
                {/* 0 Label */}
                <span>0</span>

                {/* Min Label - Absolutely Positioned */}
                <span className="absolute -translate-x-1/2 flex flex-col items-center" style={{ left: `${minPercent}%` }}>
                  <span className="w-1 h-1 bg-current rounded-full mb-1 opacity-50"></span>
                  min: {min}
                </span>

                {/* Max Label */}
                <span className="flex flex-col items-end">
                  <span className="w-1 h-1 bg-current rounded-full mb-1 opacity-50"></span>
                  max: {max}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;