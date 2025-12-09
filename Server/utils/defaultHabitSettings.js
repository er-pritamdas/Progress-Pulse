// utils/defaultHabitSettings.js
export const defaultHabitSettings = {
  settings: {
    burned: { min: 300, max: 500 },
    water: { min: 2, max: 4 },
    sleep: { min: 7, max: 9 },
    read: { min: 2, max: 5 },
    intake: { min: 1500, max: 2500 },
    selfcare: ["Shower", "Brush", "Face"],
    mood: ["Amazing", "Good", "Average", "Sad", "Depressed", "Productive"],
  },
  subscribeToNewsletter: false,
  emailNotification: false,
  darkMode: false,
  streakReminders: false,
  age: 18,
  gender: "male",
  weight: 80,
  height: 180,
  activityLevel: "light",
  maintenanceCalories: 0,
  bmr: 0,
};
