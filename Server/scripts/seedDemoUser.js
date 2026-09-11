import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from Server root
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/";
const USER_DB = process.env.USER_DB || "User";
const HABIT_DB = process.env.HABIT_DB || "Habit-Tracker";
const EXPENSE_DB = process.env.EXPENSE_DB || "Expense-Tracker";
const INVESTMENT_DB = process.env.INVESTMENT_DB || "Investment-Tracker";

console.log("Connecting to MongoDB:", MONGO_URI);

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB successfully!");

  const userDb = mongoose.connection.useDb(USER_DB);
  const habitDb = mongoose.connection.useDb(HABIT_DB);
  const expenseDb = mongoose.connection.useDb(EXPENSE_DB);
  const investDb = mongoose.connection.useDb(INVESTMENT_DB);

  // 1. Check or Create Demo User
  const usersColl = userDb.collection("registeredusers");
  let demoUser = await usersColl.findOne({
    $or: [
      { username: { $regex: /^demo$/i } },
      { email: "demo@progresspulse.com" }
    ]
  });

  let demoUserId;
  if (demoUser) {
    demoUserId = demoUser._id;
    console.log(`Found existing Demo user: ${demoUserId}. Cleaning old demo data...`);
  } else {
    demoUserId = new mongoose.Types.ObjectId();
    console.log(`Creating new Demo user ID: ${demoUserId}...`);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("Demo@123", salt);

  await usersColl.updateOne(
    { _id: demoUserId },
    {
      $set: {
        username: "Demo",
        email: "demo@progresspulse.com",
        passwordHash: passwordHash,
        isVerified: true,
        isLoggedIn: false,
        lastLogin: null,
        lastLogout: null,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  console.log("Demo user updated/inserted in RegisteredUsers with password 'Demo@123'");

  // 2. Clean up any existing data for this userId across all collections to avoid stale/duplicate state
  console.log("Purging old records for Demo user...");
  await Promise.all([
    // Habit
    habitDb.collection("habitsettings").deleteMany({ userId: demoUserId }),
    habitDb.collection("habittrackers").deleteMany({ userId: demoUserId }),
    habitDb.collection("physicallogs").deleteMany({ userId: demoUserId }),
    habitDb.collection("foodlogs").deleteMany({ userId: demoUserId }),

    // Expense
    expenseDb.collection("paymentsources").deleteMany({ userId: demoUserId }),
    expenseDb.collection("expensecategories").deleteMany({ userId: demoUserId }),
    expenseDb.collection("monthlybudgets").deleteMany({ userId: demoUserId }),
    expenseDb.collection("expensetransactions").deleteMany({ userId: demoUserId }),

    // Investment
    investDb.collection("salaries").deleteMany({ userId: demoUserId }),
    investDb.collection("pfwithdrawals").deleteMany({ userId: demoUserId }),
    investDb.collection("mutualfunds").deleteMany({ userId: demoUserId }),
    investDb.collection("mutualfundgroups").deleteMany({ userId: demoUserId }),
    investDb.collection("stocktrades").deleteMany({ userId: demoUserId }),
    investDb.collection("fixeddeposits").deleteMany({ userId: demoUserId }),
    investDb.collection("recurringdeposits").deleteMany({ userId: demoUserId }),
  ]);
  console.log("Old records purged!");

  // =========================================================================
  // 3. SEED HABIT TRACKER
  // =========================================================================
  console.log("Seeding Habit Tracker...");

  // Habit Settings
  await habitDb.collection("habitsettings").insertOne({
    userId: demoUserId,
    settings: {
      burned: { min: 350, max: 600 },
      water: { min: 3, max: 4.5 },
      sleep: { min: 7, max: 8.5 },
      read: { min: 1, max: 3 },
      intake: { min: 1900, max: 2400 },
      selfcare: ["Shower", "Brush", "Face", "Workout", "Meditation", "Reading", "Walk"],
      mood: ["Amazing", "Productive", "Good", "Energetic", "Calm", "Tired"]
    },
    subscribeToNewsletter: false,
    emailNotification: false,
    darkMode: true,
    streakReminders: true,
    age: 25,
    gender: "male",
    weight: 72.5,
    height: 178,
    activityLevel: "active",
    maintenanceCalories: 2650,
    bmr: 1720,
    bmi: 22.9,
    createdAt: new Date("2026-07-01T00:00:00.000Z"),
    updatedAt: new Date("2026-09-11T00:00:00.000Z")
  });

  // Daily Habit Tracker Entries (July 1, 2026 to Sep 11, 2026: ~73 days)
  const habitEntries = [];
  const startHabitDate = new Date("2026-07-01");
  const endHabitDate = new Date("2026-09-11");

  let currDate = new Date(startHabitDate);
  let streakCounter = 1;

  const moods = ["Productive", "Amazing", "Good", "Energetic", "Calm"];
  const journals = [
    "Had an energetic morning workout and focused work session.",
    "Crushed all daily targets, great deep-work block in the afternoon.",
    "Hydration on point, finished reading 30 pages of Atomic Habits.",
    "Balanced nutrition day and great strength workout session.",
    "Solid routine consistency today. Meditation felt very peaceful.",
    "Kept a steady rhythm all day. High productivity on codebase refactoring.",
    "Completed all selfcare routines, sleep quality was exceptionally restful."
  ];

  while (currDate <= endHabitDate) {
    const yyyy = currDate.getFullYear();
    const mm = String(currDate.getMonth() + 1).padStart(2, "0");
    const dd = String(currDate.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const dayIndex = streakCounter;
    const burned = 400 + ((dayIndex * 17) % 180); // 400 - 580
    const water = Number((3.2 + ((dayIndex * 3) % 12) * 0.1).toFixed(1)); // 3.2 - 4.4
    const sleep = Number((7.0 + ((dayIndex * 7) % 15) * 0.1).toFixed(1)); // 7.0 - 8.5
    const read = Number((1.0 + ((dayIndex * 5) % 15) * 0.1).toFixed(1)); // 1.0 - 2.5
    const intake = 2000 + ((dayIndex * 23) % 350); // 2000 - 2350
    const mood = moods[dayIndex % moods.length];
    const journal = journals[dayIndex % journals.length];

    const progress = 85 + (dayIndex % 16); // 85 - 100%
    const score = progress >= 95 ? 7 : 6;
    const status = "consistent";

    habitEntries.push({
      userId: demoUserId,
      date: dateStr,
      habits: {
        burned,
        water,
        sleep,
        read,
        intake,
        selfcare: "SBFWM",
        mood,
        journal
      },
      progress,
      status,
      score,
      completionRate: progress,
      streak: streakCounter,
      createdAt: new Date(`${dateStr}T20:00:00.000Z`),
      updatedAt: new Date(`${dateStr}T21:30:00.000Z`)
    });

    streakCounter++;
    currDate.setDate(currDate.getDate() + 1);
  }

  if (habitEntries.length > 0) {
    await habitDb.collection("habittrackers").insertMany(habitEntries);
    console.log(`Inserted ${habitEntries.length} Habit Tracker entries.`);
  }

  // Physical Logs (weight progression over 10 check-ins)
  const physicalLogs = [
    { weight: 74.5, height: 178, bmi: 23.5, date: new Date("2026-07-05T08:00:00.000Z") },
    { weight: 74.2, height: 178, bmi: 23.4, date: new Date("2026-07-15T08:00:00.000Z") },
    { weight: 73.9, height: 178, bmi: 23.3, date: new Date("2026-07-25T08:00:00.000Z") },
    { weight: 73.6, height: 178, bmi: 23.2, date: new Date("2026-08-05T08:00:00.000Z") },
    { weight: 73.2, height: 178, bmi: 23.1, date: new Date("2026-08-15T08:00:00.000Z") },
    { weight: 73.0, height: 178, bmi: 23.0, date: new Date("2026-08-25T08:00:00.000Z") },
    { weight: 72.7, height: 178, bmi: 22.9, date: new Date("2026-09-02T08:00:00.000Z") },
    { weight: 72.5, height: 178, bmi: 22.9, date: new Date("2026-09-10T08:00:00.000Z") }
  ].map(p => ({ ...p, userId: demoUserId, createdAt: p.date, updatedAt: p.date }));

  await habitDb.collection("physicallogs").insertMany(physicalLogs);
  console.log(`Inserted ${physicalLogs.length} Physical logs.`);

  // Food Logs (last 15 days, using real food database items)
  const sampleFoods = await habitDb.collection("fooddatabases").find({}).limit(12).toArray();
  if (sampleFoods.length >= 4) {
    const foodLogs = [];
    const foodLogStartDate = new Date("2026-08-28");
    const foodLogEndDate = new Date("2026-09-11");

    let fDate = new Date(foodLogStartDate);
    while (fDate <= foodLogEndDate) {
      const yyyy = fDate.getFullYear();
      const mm = String(fDate.getMonth() + 1).padStart(2, "0");
      const dd = String(fDate.getDate()).padStart(2, "0");
      const dStr = `${yyyy}-${mm}-${dd}`;

      // Breakfast
      const bFood = sampleFoods[0];
      foodLogs.push({
        userId: demoUserId,
        date: dStr,
        mealType: "Breakfast",
        foodId: bFood._id,
        foodName: bFood.name,
        servings: 1,
        unitType: bFood.unitType || "100 g",
        servingSize: bFood.servingSize || 100,
        calories: bFood.calories || 364,
        protein: bFood.protein || 26,
        carbohydrates: bFood.carbohydrates || 57,
        fat: bFood.fat || 6,
        fiber: bFood.fiber || 11,
        sugar: bFood.sugar || 15,
        createdAt: new Date(`${dStr}T08:30:00.000Z`),
        updatedAt: new Date(`${dStr}T08:30:00.000Z`)
      });

      // Boiled Egg for Breakfast
      const bFood2 = sampleFoods[4] || sampleFoods[1];
      foodLogs.push({
        userId: demoUserId,
        date: dStr,
        mealType: "Breakfast",
        foodId: bFood2._id,
        foodName: bFood2.name,
        servings: 2,
        unitType: bFood2.unitType || "1 piece",
        servingSize: (bFood2.servingSize || 50) * 2,
        calories: (bFood2.calories || 78) * 2,
        protein: (bFood2.protein || 6.3) * 2,
        carbohydrates: (bFood2.carbohydrates || 0.5) * 2,
        fat: (bFood2.fat || 5.3) * 2,
        fiber: (bFood2.fiber || 0) * 2,
        sugar: (bFood2.sugar || 0.5) * 2,
        createdAt: new Date(`${dStr}T08:35:00.000Z`),
        updatedAt: new Date(`${dStr}T08:35:00.000Z`)
      });

      // Lunch
      const lFood = sampleFoods[9] || sampleFoods[2];
      foodLogs.push({
        userId: demoUserId,
        date: dStr,
        mealType: "Lunch",
        foodId: lFood._id,
        foodName: lFood.name,
        servings: 3,
        unitType: lFood.unitType || "1 piece",
        servingSize: (lFood.servingSize || 50) * 3,
        calories: (lFood.calories || 157) * 3,
        protein: (lFood.protein || 4.6) * 3,
        carbohydrates: (lFood.carbohydrates || 25.3) * 3,
        fat: (lFood.fat || 4.15) * 3,
        fiber: (lFood.fiber || 3.8) * 3,
        sugar: (lFood.sugar || 0.3) * 3,
        createdAt: new Date(`${dStr}T13:15:00.000Z`),
        updatedAt: new Date(`${dStr}T13:15:00.000Z`)
      });

      // Snacks
      const sFood = sampleFoods[5] || sampleFoods[3];
      foodLogs.push({
        userId: demoUserId,
        date: dStr,
        mealType: "Snacks",
        foodId: sFood._id,
        foodName: sFood.name,
        servings: 1,
        unitType: sFood.unitType || "1 medium",
        servingSize: sFood.servingSize || 118,
        calories: sFood.calories || 105,
        protein: sFood.protein || 1.3,
        carbohydrates: sFood.carbohydrates || 26.9,
        fat: sFood.fat || 0.39,
        fiber: sFood.fiber || 3.1,
        sugar: sFood.sugar || 14.4,
        createdAt: new Date(`${dStr}T17:00:00.000Z`),
        updatedAt: new Date(`${dStr}T17:00:00.000Z`)
      });

      // Dinner
      const dFood = sampleFoods[10] || sampleFoods[0];
      foodLogs.push({
        userId: demoUserId,
        date: dStr,
        mealType: "Dinner",
        foodId: dFood._id,
        foodName: dFood.name,
        servings: 2,
        unitType: dFood.unitType || "1 piece",
        servingSize: (dFood.servingSize || 45) * 2,
        calories: (dFood.calories || 120) * 2,
        protein: (dFood.protein || 3.9) * 2,
        carbohydrates: (dFood.carbohydrates || 22.3) * 2,
        fat: (dFood.fat || 0.8) * 2,
        fiber: (dFood.fiber || 3.4) * 2,
        sugar: (dFood.sugar || 0.25) * 2,
        createdAt: new Date(`${dStr}T20:30:00.000Z`),
        updatedAt: new Date(`${dStr}T20:30:00.000Z`)
      });

      fDate.setDate(fDate.getDate() + 1);
    }

    await habitDb.collection("foodlogs").insertMany(foodLogs);
    console.log(`Inserted ${foodLogs.length} Food logs.`);
  }

  // =========================================================================
  // 4. SEED EXPENSE TRACKER
  // =========================================================================
  console.log("Seeding Expense Tracker...");

  // Payment Sources
  const sourceHdfcId = new mongoose.Types.ObjectId();
  const sourceSbiId = new mongoose.Types.ObjectId();
  const sourceTataNeuId = new mongoose.Types.ObjectId();
  const sourceAxisId = new mongoose.Types.ObjectId();
  const sourceUpiId = new mongoose.Types.ObjectId();
  const sourceCashId = new mongoose.Types.ObjectId();

  const paymentSources = [
    {
      _id: sourceHdfcId,
      userId: demoUserId,
      name: "HDFC Salary A/c",
      type: "Bank",
      balance: 145000,
      limit: 0,
      color: "blue",
      createdAt: new Date("2026-07-01T00:00:00.000Z"),
      updatedAt: new Date("2026-09-11T00:00:00.000Z")
    },
    {
      _id: sourceSbiId,
      userId: demoUserId,
      name: "SBI Savings A/c",
      type: "Bank",
      balance: 68500,
      limit: 0,
      color: "emerald",
      createdAt: new Date("2026-07-01T00:00:00.000Z"),
      updatedAt: new Date("2026-09-11T00:00:00.000Z")
    },
    {
      _id: sourceTataNeuId,
      userId: demoUserId,
      name: "Tata Neu Infinity Card",
      type: "Card",
      balance: -7540,
      limit: 250000,
      color: "indigo",
      createdAt: new Date("2026-07-01T00:00:00.000Z"),
      updatedAt: new Date("2026-09-11T00:00:00.000Z")
    },
    {
      _id: sourceAxisId,
      userId: demoUserId,
      name: "Axis Bank Neo Card",
      type: "Card",
      balance: -2150,
      limit: 120000,
      color: "rose",
      createdAt: new Date("2026-07-01T00:00:00.000Z"),
      updatedAt: new Date("2026-09-11T00:00:00.000Z")
    },
    {
      _id: sourceUpiId,
      userId: demoUserId,
      name: "Paytm / UPI Wallet",
      type: "Wallet",
      balance: 4200,
      limit: 0,
      color: "cyan",
      createdAt: new Date("2026-07-01T00:00:00.000Z"),
      updatedAt: new Date("2026-09-11T00:00:00.000Z")
    },
    {
      _id: sourceCashId,
      userId: demoUserId,
      name: "Cash in Hand",
      type: "Wallet",
      balance: 5000,
      limit: 0,
      color: "amber",
      createdAt: new Date("2026-07-01T00:00:00.000Z"),
      updatedAt: new Date("2026-09-11T00:00:00.000Z")
    }
  ];

  await expenseDb.collection("paymentsources").insertMany(paymentSources);
  console.log("Payment Sources seeded.");

  // Categories & Subcategories across 3 months: 2026-07, 2026-08, 2026-09
  const months = ["2026-07", "2026-08", "2026-09"];
  const categoriesDefinition = [
    {
      name: "Investment",
      color: "violet",
      order: 0,
      subs: [
        { name: "SIP", budget: 20000, order: 0 },
        { name: "EPF", budget: 6720, order: 1 },
        { name: "Stock Market", budget: 15000, order: 2 },
        { name: "Emergency Fund", budget: 10000, order: 3 }
      ]
    },
    {
      name: "Living & Rent",
      color: "blue",
      order: 1,
      subs: [
        { name: "House Rent", budget: 25000, order: 0 },
        { name: "Electricity & Utility", budget: 2500, order: 1 },
        { name: "WiFi Broadband", budget: 1200, order: 2 },
        { name: "House Help & Cook", budget: 5000, order: 3 }
      ]
    },
    {
      name: "Food & Groceries",
      color: "emerald",
      order: 2,
      subs: [
        { name: "Groceries & Supermarket", budget: 10000, order: 0 },
        { name: "Dining Out & Cafes", budget: 5000, order: 1 },
        { name: "Online Food (Swiggy/Zomato)", budget: 4000, order: 2 }
      ]
    },
    {
      name: "Commute & Travel",
      color: "amber",
      order: 3,
      subs: [
        { name: "Petrol & Fuel", budget: 4500, order: 0 },
        { name: "Cab & Uber", budget: 2000, order: 1 },
        { name: "Metro / Fastag", budget: 1000, order: 2 }
      ]
    },
    {
      name: "Entertainment & Subs",
      color: "purple",
      order: 4,
      subs: [
        { name: "Streaming & OTT", budget: 1200, order: 0 },
        { name: "Movies & Outings", budget: 2500, order: 1 },
        { name: "Gym & Fitness", budget: 2500, order: 2 }
      ]
    },
    {
      name: "Shopping & Lifestyle",
      color: "rose",
      order: 5,
      subs: [
        { name: "Clothing & Footwear", budget: 6000, order: 0 },
        { name: "Gadgets & Accessories", budget: 4000, order: 1 },
        { name: "Personal Grooming", budget: 2000, order: 2 }
      ]
    },
    {
      name: "Family & Support",
      color: "cyan",
      order: 6,
      subs: [
        { name: "Parents Transfer", budget: 15000, order: 0 },
        { name: "Medical & Medicines", budget: 4000, order: 1 }
      ]
    }
  ];

  const catMap = {};

  for (const m of months) {
    for (const cDef of categoriesDefinition) {
      const catId = new mongoose.Types.ObjectId();
      const subCategories = cDef.subs.map(s => ({
        _id: new mongoose.Types.ObjectId(),
        name: s.name,
        budget: s.budget,
        month: m,
        order: s.order
      }));

      await expenseDb.collection("expensecategories").insertOne({
        _id: catId,
        userId: demoUserId,
        name: cDef.name,
        month: m,
        order: cDef.order,
        color: cDef.color,
        subCategories,
        createdAt: new Date(`${m}-01T00:00:00.000Z`),
        updatedAt: new Date(`${m}-01T00:00:00.000Z`)
      });

      const subsMap = {};
      subCategories.forEach(s => {
        subsMap[s.name] = s._id;
      });

      catMap[`${m}:${cDef.name}`] = {
        _id: catId,
        subs: subsMap
      };
    }
  }
  console.log("Expense Categories and SubCategories seeded for months:", months);

  // Monthly Budgets
  const monthlyBudgets = [
    { userId: demoUserId, month: "2026-07", salary: 125000, createdAt: new Date("2026-07-01"), updatedAt: new Date("2026-07-01") },
    { userId: demoUserId, month: "2026-08", salary: 125000, createdAt: new Date("2026-08-01"), updatedAt: new Date("2026-08-01") },
    { userId: demoUserId, month: "2026-09", salary: 135000, createdAt: new Date("2026-09-01"), updatedAt: new Date("2026-09-01") }
  ];
  await expenseDb.collection("monthlybudgets").insertMany(monthlyBudgets);
  console.log("Monthly Budgets seeded.");

  // Expense Transactions (July, August, September 2026)
  const expenseTransactions = [];

  const addDebit = (dateStr, desc, amount, sourceId, month, catName, subName, isReimbursable = false, info = "") => {
    const cObj = catMap[`${month}:${catName}`];
    const catId = cObj?._id || null;
    const subCatId = cObj?.subs[subName] || null;

    expenseTransactions.push({
      userId: demoUserId,
      date: new Date(`${dateStr}T10:00:00.000Z`),
      description: desc,
      sourceId,
      categoryId: catId,
      subCategoryId: subCatId,
      amount,
      type: "Debit",
      isReimbursable,
      info,
      createdAt: new Date(`${dateStr}T10:00:00.000Z`),
      updatedAt: new Date(`${dateStr}T10:00:00.000Z`)
    });
  };

  const addCredit = (dateStr, desc, amount, sourceId, info = "") => {
    expenseTransactions.push({
      userId: demoUserId,
      date: new Date(`${dateStr}T09:00:00.000Z`),
      description: desc,
      sourceId,
      amount,
      type: "Credit",
      isReimbursable: false,
      info,
      createdAt: new Date(`${dateStr}T09:00:00.000Z`),
      updatedAt: new Date(`${dateStr}T09:00:00.000Z`)
    });
  };

  const addTransfer = (dateStr, desc, amount, fromSourceId, toSourceId, info = "") => {
    expenseTransactions.push({
      userId: demoUserId,
      date: new Date(`${dateStr}T12:00:00.000Z`),
      description: desc,
      sourceId: fromSourceId,
      targetSourceId: toSourceId,
      amount,
      type: "Transfer",
      isReimbursable: false,
      info,
      createdAt: new Date(`${dateStr}T12:00:00.000Z`),
      updatedAt: new Date(`${dateStr}T12:00:00.000Z`)
    });
  };

  // --- JULY 2026 ---
  addCredit("2026-07-01", "July Salary Credited", 125000, sourceHdfcId, "Salary from CloudScale Tech");
  addDebit("2026-07-02", "Apartment Rent", 25000, sourceHdfcId, "2026-07", "Living & Rent", "House Rent");
  addDebit("2026-07-03", "Mutual Fund SIPs", 20000, sourceHdfcId, "2026-07", "Investment", "SIP");
  addDebit("2026-07-03", "EPF Contribution", 6720, sourceHdfcId, "2026-07", "Investment", "EPF");
  addTransfer("2026-07-04", "Savings Allocation", 25000, sourceHdfcId, sourceSbiId, "Monthly emergency buffer");
  addDebit("2026-07-05", "Parents Monthly Support", 15000, sourceHdfcId, "2026-07", "Family & Support", "Parents Transfer");
  addDebit("2026-07-06", "Electricity Bill", 2340, sourceHdfcId, "2026-07", "Living & Rent", "Electricity & Utility");
  addDebit("2026-07-06", "ACT Fibernet Broadband", 1179, sourceHdfcId, "2026-07", "Living & Rent", "WiFi Broadband");
  addDebit("2026-07-07", "Supermarket Monthly Grocery", 5840, sourceTataNeuId, "2026-07", "Food & Groceries", "Groceries & Supermarket");
  addDebit("2026-07-08", "House Help Salary", 5000, sourceHdfcId, "2026-07", "Living & Rent", "House Help & Cook");
  addDebit("2026-07-10", "Shell Petrol Bunk", 2500, sourceTataNeuId, "2026-07", "Commute & Travel", "Petrol & Fuel");
  addDebit("2026-07-11", "Weekend Dinner with Friends", 2150, sourceTataNeuId, "2026-07", "Food & Groceries", "Dining Out & Cafes");
  addDebit("2026-07-13", "Swiggy Gourmet Order", 740, sourceUpiId, "2026-07", "Food & Groceries", "Online Food (Swiggy/Zomato)");
  addDebit("2026-07-15", "Cult.fit Monthly Membership", 2500, sourceHdfcId, "2026-07", "Entertainment & Subs", "Gym & Fitness");
  addDebit("2026-07-18", "ZARA Summer Shirt", 3200, sourceTataNeuId, "2026-07", "Shopping & Lifestyle", "Clothing & Footwear");
  addDebit("2026-07-20", "Apollo Pharmacy Essentials", 1450, sourceUpiId, "2026-07", "Family & Support", "Medical & Medicines");
  addDebit("2026-07-22", "Uber Work Travel", 480, sourceUpiId, "2026-07", "Commute & Travel", "Cab & Uber", true, "Office client meeting commute");
  addCredit("2026-07-26", "Uber Trip Reimbursement", 480, sourceHdfcId, "Reimbursement received");
  addDebit("2026-07-28", "IMAX Movie Night", 950, sourceTataNeuId, "2026-07", "Entertainment & Subs", "Movies & Outings");
  addTransfer("2026-07-30", "Tata Neu Credit Card Bill Settlement", 14640, sourceHdfcId, sourceTataNeuId, "Full payment");

  // --- AUGUST 2026 ---
  addCredit("2026-08-01", "August Salary Credited", 125000, sourceHdfcId, "Salary from CloudScale Tech");
  addDebit("2026-08-02", "Apartment Rent", 25000, sourceHdfcId, "2026-08", "Living & Rent", "House Rent");
  addDebit("2026-08-03", "Mutual Fund SIPs", 20000, sourceHdfcId, "2026-08", "Investment", "SIP");
  addDebit("2026-08-03", "EPF Contribution", 6720, sourceHdfcId, "2026-08", "Investment", "EPF");
  addDebit("2026-08-04", "Direct Stock Buy (Polycab)", 15000, sourceHdfcId, "2026-08", "Investment", "Stock Market");
  addTransfer("2026-08-04", "Emergency Buffer Deposit", 20000, sourceHdfcId, sourceSbiId, "Emergency Fund");
  addDebit("2026-08-05", "Parents Monthly Support", 15000, sourceHdfcId, "2026-08", "Family & Support", "Parents Transfer");
  addDebit("2026-08-06", "Electricity Bill", 2480, sourceHdfcId, "2026-08", "Living & Rent", "Electricity & Utility");
  addDebit("2026-08-06", "ACT Fibernet Broadband", 1179, sourceHdfcId, "2026-08", "Living & Rent", "WiFi Broadband");
  addDebit("2026-08-07", "Nature's Basket Organic Groceries", 6120, sourceTataNeuId, "2026-08", "Food & Groceries", "Groceries & Supermarket");
  addDebit("2026-08-08", "House Help Salary", 5000, sourceHdfcId, "2026-08", "Living & Rent", "House Help & Cook");
  addDebit("2026-08-11", "Fuel Tank Refill", 2600, sourceAxisId, "2026-08", "Commute & Travel", "Petrol & Fuel");
  addDebit("2026-08-13", "Italian Cafe Dinner", 2450, sourceTataNeuId, "2026-08", "Food & Groceries", "Dining Out & Cafes");
  addDebit("2026-08-15", "Netflix & Spotify Subscription", 1198, sourceTataNeuId, "2026-08", "Entertainment & Subs", "Streaming & OTT");
  addDebit("2026-08-16", "Zomato Food Delivery", 850, sourceUpiId, "2026-08", "Food & Groceries", "Online Food (Swiggy/Zomato)");
  addDebit("2026-08-18", "Wireless Earbuds Deal", 3499, sourceTataNeuId, "2026-08", "Shopping & Lifestyle", "Gadgets & Accessories");
  addDebit("2026-08-20", "Barber & Hair Styling", 1200, sourceUpiId, "2026-08", "Shopping & Lifestyle", "Personal Grooming");
  addDebit("2026-08-22", "Uber Travel to Airport", 950, sourceUpiId, "2026-08", "Commute & Travel", "Cab & Uber", true, "Official business travel");
  addCredit("2026-08-27", "Travel Reimbursement Claim", 950, sourceHdfcId, "Client travel clearance");
  addDebit("2026-08-28", "Concert Tickets", 2200, sourceAxisId, "2026-08", "Entertainment & Subs", "Movies & Outings");
  addTransfer("2026-08-30", "Credit Card Full Payment", 13269, sourceHdfcId, sourceTataNeuId, "Cleared bills");

  // --- SEPTEMBER 2026 (To-Date) ---
  addCredit("2026-09-01", "September Salary Credited (Appraisal)", 135000, sourceHdfcId, "Increased pay from CloudScale");
  addDebit("2026-09-02", "Apartment Rent", 25000, sourceHdfcId, "2026-09", "Living & Rent", "House Rent");
  addDebit("2026-09-03", "Mutual Fund SIPs", 20000, sourceHdfcId, "2026-09", "Investment", "SIP");
  addDebit("2026-09-03", "EPF Contribution", 6720, sourceHdfcId, "2026-09", "Investment", "EPF");
  addDebit("2026-09-04", "Direct Equity Buy (Kaynes)", 15000, sourceHdfcId, "2026-09", "Investment", "Stock Market");
  addTransfer("2026-09-04", "Emergency Fund Transfer", 25000, sourceHdfcId, sourceSbiId, "Emergency Fund");
  addDebit("2026-09-05", "Parents Monthly Support", 15000, sourceHdfcId, "2026-09", "Family & Support", "Parents Transfer");
  addDebit("2026-09-06", "Electricity Bill", 2150, sourceHdfcId, "2026-09", "Living & Rent", "Electricity & Utility");
  addDebit("2026-09-06", "ACT Fibernet Broadband", 1179, sourceHdfcId, "2026-09", "Living & Rent", "WiFi Broadband");
  addDebit("2026-09-07", "Fresh Veggies & BigBasket", 4850, sourceTataNeuId, "2026-09", "Food & Groceries", "Groceries & Supermarket");
  addDebit("2026-09-08", "House Help Salary", 5000, sourceHdfcId, "2026-09", "Living & Rent", "House Help & Cook");
  addDebit("2026-09-08", "Fastag Recharge", 1000, sourceUpiId, "2026-09", "Commute & Travel", "Metro / Fastag");
  addDebit("2026-09-09", "HP Petrol Station", 2150, sourceAxisId, "2026-09", "Commute & Travel", "Petrol & Fuel");
  addDebit("2026-09-10", "Team Lunch Celebration", 1850, sourceTataNeuId, "2026-09", "Food & Groceries", "Dining Out & Cafes");
  addDebit("2026-09-11", "Swiggy Healthy Salad Lunch", 540, sourceTataNeuId, "2026-09", "Food & Groceries", "Online Food (Swiggy/Zomato)");

  await expenseDb.collection("expensetransactions").insertMany(expenseTransactions);
  console.log(`Inserted ${expenseTransactions.length} Expense Transactions.`);

  // =========================================================================
  // 5. SEED INVESTMENT TRACKER
  // =========================================================================
  console.log("Seeding Investment Tracker...");

  // 5A. Salaries across 2 Companies (24 Months: 2024-10 to 2026-09)
  const salaryRecords = [];

  // 12 months at InnovateX
  for (let i = 0; i < 12; i++) {
    const year = i < 3 ? 2024 : 2025;
    const monthNum = i < 3 ? 10 + i : i - 2;
    const mStr = `${year}-${String(monthNum).padStart(2, "0")}`;
    const isBonusMonth = mStr === "2025-03";
    const bonus = isBonusMonth ? 30000 : 0;
    const basicSalary = 42000;
    const hra = 21000;
    const flexi = 27000;
    const erPf = 5040;
    const taxes = isBonusMonth ? 9500 : 4800;
    const gross = basicSalary + hra + flexi + bonus;
    const inHand = gross - (erPf + taxes);
    const gratuity = 2020;
    const ctc = gross + erPf + gratuity;

    salaryRecords.push({
      userId: demoUserId,
      month: mStr,
      company: "InnovateX Solutions Pvt Ltd",
      basicSalary,
      hra,
      flexi,
      bonus,
      gross,
      erPf,
      taxes,
      inHand,
      gratuity,
      variablePay: 0,
      ctc,
      notes: isBonusMonth ? "Annual Performance Bonus included" : "Standard monthly pay",
      createdAt: new Date(`${mStr}-01T00:00:00.000Z`),
      updatedAt: new Date(`${mStr}-01T00:00:00.000Z`)
    });
  }

  // 12 months at CloudScale Technologies
  for (let i = 0; i < 12; i++) {
    const year = i < 3 ? 2025 : 2026;
    const monthNum = i < 3 ? 10 + i : i - 2;
    const mStr = `${year}-${String(monthNum).padStart(2, "0")}`;
    const isBonusMonth = mStr === "2026-04";
    const bonus = isBonusMonth ? 45000 : 0;
    const basicSalary = 56000;
    const hra = 28000;
    const flexi = 36000;
    const erPf = 6720;
    const taxes = isBonusMonth ? 14200 : 8400;
    const gross = basicSalary + hra + flexi + bonus;
    const inHand = gross - (erPf + taxes);
    const gratuity = 2693;
    const ctc = gross + erPf + gratuity;

    salaryRecords.push({
      userId: demoUserId,
      month: mStr,
      company: "CloudScale Technologies India",
      basicSalary,
      hra,
      flexi,
      bonus,
      gross,
      erPf,
      taxes,
      inHand,
      gratuity,
      variablePay: 0,
      ctc,
      notes: isBonusMonth ? "Promotion & Annual Performance Bonus credited" : "Regular monthly salary",
      createdAt: new Date(`${mStr}-01T00:00:00.000Z`),
      updatedAt: new Date(`${mStr}-01T00:00:00.000Z`)
    });
  }

  await investDb.collection("salaries").insertMany(salaryRecords);
  console.log(`Inserted ${salaryRecords.length} Salary records.`);

  // 5B. PF Withdrawals
  const pfWithdrawals = [
    {
      userId: demoUserId,
      date: "2025-11-15",
      amount: 60000,
      reason: "Higher Education / Upskilling",
      notes: "Advanced Cloud Architecture certification fee and workspace upgrade",
      createdAt: new Date("2025-11-15T10:00:00.000Z"),
      updatedAt: new Date("2025-11-15T10:00:00.000Z")
    },
    {
      userId: demoUserId,
      date: "2026-03-20",
      amount: 120000,
      reason: "Home Renovation",
      notes: "EPFO advance withdrawal under Rule 68B for home structural repairs",
      createdAt: new Date("2026-03-20T10:00:00.000Z"),
      updatedAt: new Date("2026-03-20T10:00:00.000Z")
    }
  ];
  await investDb.collection("pfwithdrawals").insertMany(pfWithdrawals);
  console.log(`Inserted ${pfWithdrawals.length} PF Withdrawal records.`);

  // 5C. Mutual Funds & Transactions
  const fundIds = {
    paragParikh: new mongoose.Types.ObjectId(),
    miraeLarge: new mongoose.Types.ObjectId(),
    motilalMid: new mongoose.Types.ObjectId(),
    nipponSmall: new mongoose.Types.ObjectId(),
    bandhanElss: new mongoose.Types.ObjectId(),
    iciciHybrid: new mongoose.Types.ObjectId()
  };

  const generateSipTx = (monthlyAmt, baseNav, navStep, startMonth = 4, startYear = 2025, totalMonths = 18) => {
    const txs = [];
    let curY = startYear;
    let curM = startMonth;
    for (let t = 1; t <= totalMonths; t++) {
      const dStr = `${curY}-${String(curM).padStart(2, "0")}-05`;
      const nav = Number((baseNav + (t * navStep)).toFixed(4));
      const amtDeposit = monthlyAmt;
      const er = Number((amtDeposit * 0.00005).toFixed(2));
      const actualAmt = Number((amtDeposit - er).toFixed(2));
      const units = Number((actualAmt / nav).toFixed(3));
      txs.push({
        _id: new mongoose.Types.ObjectId(),
        term: `Term ${t}`,
        type: "SIP",
        date: dStr,
        amtDeposit,
        er,
        actualAmt,
        nav,
        units,
        amount: actualAmt,
        createdAt: new Date(`${dStr}T09:00:00.000Z`),
        updatedAt: new Date(`${dStr}T09:00:00.000Z`)
      });

      curM++;
      if (curM > 12) {
        curM = 1;
        curY++;
      }
    }
    return txs;
  };

  const mutualFundsData = [
    {
      _id: fundIds.paragParikh,
      userId: demoUserId,
      amc: "PPFAS Mutual Fund",
      schemeName: "Parag Parikh Flexi Cap Fund - Direct Growth",
      category: "Equity",
      subCategory: "Flexi Cap",
      plan: "Direct",
      optionType: "Growth",
      folioNumber: "PPF-102938475",
      investmentType: "SIP",
      transactions: generateSipTx(5000, 64.20, 1.35, 4, 2025, 18),
      createdAt: new Date("2025-04-05T09:00:00.000Z"),
      updatedAt: new Date("2026-09-05T09:00:00.000Z")
    },
    {
      _id: fundIds.miraeLarge,
      userId: demoUserId,
      amc: "Mirae Asset Mutual Fund",
      schemeName: "Mirae Asset Large Cap Fund - Direct Growth",
      category: "Equity",
      subCategory: "Large Cap",
      plan: "Direct",
      optionType: "Growth",
      folioNumber: "MAM-847291048",
      investmentType: "SIP",
      transactions: generateSipTx(4000, 94.50, 1.25, 4, 2025, 18),
      createdAt: new Date("2025-04-05T09:00:00.000Z"),
      updatedAt: new Date("2026-09-05T09:00:00.000Z")
    },
    {
      _id: fundIds.motilalMid,
      userId: demoUserId,
      amc: "Motilal Oswal Mutual Fund",
      schemeName: "Motilal Oswal Midcap Fund - Direct Growth",
      category: "Equity",
      subCategory: "Mid Cap",
      plan: "Direct",
      optionType: "Growth",
      folioNumber: "MOM-392019482",
      investmentType: "SIP",
      transactions: generateSipTx(3500, 72.80, 1.80, 7, 2025, 15),
      createdAt: new Date("2025-07-05T09:00:00.000Z"),
      updatedAt: new Date("2026-09-05T09:00:00.000Z")
    },
    {
      _id: fundIds.nipponSmall,
      userId: demoUserId,
      amc: "Nippon India Mutual Fund",
      schemeName: "Nippon India Small Cap Fund - Direct Growth",
      category: "Equity",
      subCategory: "Small Cap",
      plan: "Direct",
      optionType: "Growth",
      folioNumber: "NIM-582910482",
      investmentType: "SIP",
      transactions: generateSipTx(3000, 118.40, 2.90, 7, 2025, 15),
      createdAt: new Date("2025-07-05T09:00:00.000Z"),
      updatedAt: new Date("2026-09-05T09:00:00.000Z")
    },
    {
      _id: fundIds.bandhanElss,
      userId: demoUserId,
      amc: "Bandhan Mutual Fund",
      schemeName: "Bandhan ELSS Tax Saver Fund - Direct Growth",
      category: "Equity",
      subCategory: "ELSS",
      plan: "Direct",
      optionType: "Growth",
      folioNumber: "BMF-748291048",
      investmentType: "SIP",
      transactions: generateSipTx(5000, 108.50, 1.95, 10, 2025, 12),
      createdAt: new Date("2025-10-05T09:00:00.000Z"),
      updatedAt: new Date("2026-09-05T09:00:00.000Z")
    },
    {
      _id: fundIds.iciciHybrid,
      userId: demoUserId,
      amc: "ICICI Prudential Mutual Fund",
      schemeName: "ICICI Prudential Equity & Debt Fund - Direct Growth",
      category: "Hybrid",
      subCategory: "Aggressive Hybrid",
      plan: "Direct",
      optionType: "Growth",
      folioNumber: "IPM-619283740",
      investmentType: "Lumpsum",
      transactions: [
        {
          _id: new mongoose.Types.ObjectId(),
          term: "Term 1",
          type: "Lumpsum",
          date: "2025-08-15",
          amtDeposit: 50000,
          er: 2.5,
          actualAmt: 49997.5,
          nav: 282.45,
          units: 177.013,
          amount: 49997.5,
          createdAt: new Date("2025-08-15T10:00:00.000Z"),
          updatedAt: new Date("2025-08-15T10:00:00.000Z")
        },
        {
          _id: new mongoose.Types.ObjectId(),
          term: "Term 2",
          type: "Lumpsum",
          date: "2026-02-10",
          amtDeposit: 50000,
          er: 2.5,
          actualAmt: 49997.5,
          nav: 312.80,
          units: 159.838,
          amount: 49997.5,
          createdAt: new Date("2026-02-10T10:00:00.000Z"),
          updatedAt: new Date("2026-02-10T10:00:00.000Z")
        }
      ],
      createdAt: new Date("2025-08-15T10:00:00.000Z"),
      updatedAt: new Date("2026-02-10T10:00:00.000Z")
    }
  ];

  await investDb.collection("mutualfunds").insertMany(mutualFundsData);
  console.log(`Inserted ${mutualFundsData.length} Mutual Funds.`);

  // 5D. Mutual Fund Groups
  await investDb.collection("mutualfundgroups").insertOne({
    userId: demoUserId,
    groups: [
      {
        id: "core-portfolio",
        name: "Core Equity & Index MFs",
        fundIds: [
          fundIds.paragParikh.toString(),
          fundIds.miraeLarge.toString(),
          fundIds.motilalMid.toString()
        ]
      },
      {
        id: "high-growth-tax",
        name: "Small Cap & Tax Savers",
        fundIds: [
          fundIds.nipponSmall.toString(),
          fundIds.bandhanElss.toString(),
          fundIds.iciciHybrid.toString()
        ]
      }
    ],
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z")
  });
  console.log("Mutual Fund Groups seeded.");

  // 5E. Stock Trades (21 Trades covering Demat, Delivery, and Intraday)
  const stockTrades = [
    // ----------------- DEMAT HOLDINGS (qLeft > 0) -----------------
    {
      userId: demoUserId,
      slNo: 1,
      name: "RELIANCE",
      platform: "Zerodha",
      cap: "Large",
      exchange: "NSE",
      term: "Delivery",
      bDate: "2025-11-10",
      bShare: 2450.50,
      bQty: 12,
      bStock: 29406.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 2452.17,
      bFStock: 29426.00,
      bTt: 6,
      sDate: "-",
      sShare: 0,
      sQty: 0,
      sStock: 0,
      sBkg: 0,
      sPdc: 0,
      dp: 0,
      sBkgPdc: 0,
      sFShare: 0,
      sFStock: 0,
      sTt: 0,
      period: 305,
      qLeft: 12,
      gainRs: 0,
      gainPct: 0
    },
    {
      userId: demoUserId,
      slNo: 2,
      name: "TCS",
      platform: "Zerodha",
      cap: "Large",
      exchange: "NSE",
      term: "Delivery",
      bDate: "2025-12-05",
      bShare: 3820.00,
      bQty: 6,
      bStock: 22920.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 3823.33,
      bFStock: 22940.00,
      bTt: 6,
      sDate: "-",
      sShare: 0,
      sQty: 0,
      sStock: 0,
      sBkg: 0,
      sPdc: 0,
      dp: 0,
      sBkgPdc: 0,
      sFShare: 0,
      sFStock: 0,
      sTt: 0,
      period: 280,
      qLeft: 6,
      gainRs: 0,
      gainPct: 0
    },
    {
      userId: demoUserId,
      slNo: 3,
      name: "HDFC BANK",
      platform: "Groww",
      cap: "Large",
      exchange: "NSE",
      term: "Delivery",
      bDate: "2026-01-15",
      bShare: 1520.00,
      bQty: 25,
      bStock: 38000.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 1520.80,
      bFStock: 38020.00,
      bTt: 6,
      sDate: "-",
      sShare: 0,
      sQty: 0,
      sStock: 0,
      sBkg: 0,
      sPdc: 0,
      dp: 0,
      sBkgPdc: 0,
      sFShare: 0,
      sFStock: 0,
      sTt: 0,
      period: 239,
      qLeft: 25,
      gainRs: 0,
      gainPct: 0
    },
    {
      userId: demoUserId,
      slNo: 4,
      name: "INFOSYS",
      platform: "Zerodha",
      cap: "Large",
      exchange: "NSE",
      term: "Delivery",
      bDate: "2026-02-20",
      bShare: 1680.00,
      bQty: 18,
      bStock: 30240.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 1681.11,
      bFStock: 30260.00,
      bTt: 6,
      sDate: "-",
      sShare: 0,
      sQty: 0,
      sStock: 0,
      sBkg: 0,
      sPdc: 0,
      dp: 0,
      sBkgPdc: 0,
      sFShare: 0,
      sFStock: 0,
      sTt: 0,
      period: 203,
      qLeft: 18,
      gainRs: 0,
      gainPct: 0
    },
    {
      userId: demoUserId,
      slNo: 5,
      name: "TATA MOTORS",
      platform: "Groww",
      cap: "Large",
      exchange: "NSE",
      term: "Delivery",
      bDate: "2026-03-10",
      bShare: 920.00,
      bQty: 35,
      bStock: 32200.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 920.57,
      bFStock: 32220.00,
      bTt: 6,
      sDate: "-",
      sShare: 0,
      sQty: 0,
      sStock: 0,
      sBkg: 0,
      sPdc: 0,
      dp: 0,
      sBkgPdc: 0,
      sFShare: 0,
      sFStock: 0,
      sTt: 0,
      period: 185,
      qLeft: 35,
      gainRs: 0,
      gainPct: 0
    },
    {
      userId: demoUserId,
      slNo: 6,
      name: "BHARTI AIRTEL",
      platform: "Zerodha",
      cap: "Large",
      exchange: "NSE",
      term: "Delivery",
      bDate: "2026-04-05",
      bShare: 1240.00,
      bQty: 22,
      bStock: 27280.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 1240.91,
      bFStock: 27300.00,
      bTt: 6,
      sDate: "-",
      sShare: 0,
      sQty: 0,
      sStock: 0,
      sBkg: 0,
      sPdc: 0,
      dp: 0,
      sBkgPdc: 0,
      sFShare: 0,
      sFStock: 0,
      sTt: 0,
      period: 159,
      qLeft: 22,
      gainRs: 0,
      gainPct: 0
    },
    {
      userId: demoUserId,
      slNo: 7,
      name: "POLYCAB INDIA",
      platform: "Groww",
      cap: "Mid",
      exchange: "NSE",
      term: "Delivery",
      bDate: "2026-05-12",
      bShare: 6450.00,
      bQty: 5,
      bStock: 32250.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 6454.00,
      bFStock: 32270.00,
      bTt: 6,
      sDate: "-",
      sShare: 0,
      sQty: 0,
      sStock: 0,
      sBkg: 0,
      sPdc: 0,
      dp: 0,
      sBkgPdc: 0,
      sFShare: 0,
      sFStock: 0,
      sTt: 0,
      period: 122,
      qLeft: 5,
      gainRs: 0,
      gainPct: 0
    },
    {
      userId: demoUserId,
      slNo: 8,
      name: "KAYNES TECH",
      platform: "Zerodha",
      cap: "Small",
      exchange: "NSE",
      term: "Delivery",
      bDate: "2026-06-18",
      bShare: 4200.00,
      bQty: 8,
      bStock: 33600.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 4202.50,
      bFStock: 33620.00,
      bTt: 6,
      sDate: "-",
      sShare: 0,
      sQty: 0,
      sStock: 0,
      sBkg: 0,
      sPdc: 0,
      dp: 0,
      sBkgPdc: 0,
      sFShare: 0,
      sFStock: 0,
      sTt: 0,
      period: 85,
      qLeft: 8,
      gainRs: 0,
      gainPct: 0
    },

    // ----------------- DELIVERY ANALYSIS (qLeft === 0 && period > 1) -----------------
    {
      userId: demoUserId,
      slNo: 9,
      name: "HINDALCO",
      platform: "Zerodha",
      cap: "Large",
      exchange: "NSE",
      term: "Delivery",
      bDate: "2025-06-10",
      bShare: 480.00,
      bQty: 50,
      bStock: 24000.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 480.40,
      bFStock: 24020.00,
      bTt: 6,
      sDate: "2025-11-15",
      sShare: 610.00,
      sQty: 50,
      sStock: 30500.00,
      sBkg: 20,
      sPdc: 0,
      dp: 15.93,
      sBkgPdc: 35.93,
      sFShare: 609.28,
      sFStock: 30464.07,
      sTt: 6,
      period: 158,
      qLeft: 0,
      gainRs: 6444.07,
      gainPct: 26.83
    },
    {
      userId: demoUserId,
      slNo: 10,
      name: "TATA STEEL",
      platform: "Groww",
      cap: "Large",
      exchange: "NSE",
      term: "Delivery",
      bDate: "2025-07-01",
      bShare: 130.00,
      bQty: 120,
      bStock: 15600.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 130.17,
      bFStock: 15620.00,
      bTt: 6,
      sDate: "2025-12-20",
      sShare: 162.00,
      sQty: 120,
      sStock: 19440.00,
      sBkg: 20,
      sPdc: 0,
      dp: 15.93,
      sBkgPdc: 35.93,
      sFShare: 161.70,
      sFStock: 19404.07,
      sTt: 6,
      period: 172,
      qLeft: 0,
      gainRs: 3784.07,
      gainPct: 24.23
    },
    {
      userId: demoUserId,
      slNo: 11,
      name: "LARSEN & TOUBRO",
      platform: "Zerodha",
      cap: "Large",
      exchange: "NSE",
      term: "Delivery",
      bDate: "2025-08-15",
      bShare: 3100.00,
      bQty: 10,
      bStock: 31000.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 3102.00,
      bFStock: 31020.00,
      bTt: 6,
      sDate: "2026-01-10",
      sShare: 3600.00,
      sQty: 10,
      sStock: 36000.00,
      sBkg: 20,
      sPdc: 0,
      dp: 15.93,
      sBkgPdc: 35.93,
      sFShare: 3596.41,
      sFStock: 35964.07,
      sTt: 6,
      period: 148,
      qLeft: 0,
      gainRs: 4944.07,
      gainPct: 15.94
    },
    {
      userId: demoUserId,
      slNo: 12,
      name: "TITAN",
      platform: "Groww",
      cap: "Large",
      exchange: "NSE",
      term: "Delivery",
      bDate: "2025-09-05",
      bShare: 3250.00,
      bQty: 8,
      bStock: 26000.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 3252.50,
      bFStock: 26020.00,
      bTt: 6,
      sDate: "2026-02-14",
      sShare: 3750.00,
      sQty: 8,
      sStock: 30000.00,
      sBkg: 20,
      sPdc: 0,
      dp: 15.93,
      sBkgPdc: 35.93,
      sFShare: 3745.51,
      sFStock: 29964.07,
      sTt: 6,
      period: 162,
      qLeft: 0,
      gainRs: 3944.07,
      gainPct: 15.16
    },
    {
      userId: demoUserId,
      slNo: 13,
      name: "PERSISTENT SYSTEMS",
      platform: "Zerodha",
      cap: "Mid",
      exchange: "NSE",
      term: "Delivery",
      bDate: "2025-10-12",
      bShare: 4600.00,
      bQty: 6,
      bStock: 27600.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 4603.33,
      bFStock: 27620.00,
      bTt: 6,
      sDate: "2026-03-25",
      sShare: 5500.00,
      sQty: 6,
      sStock: 33000.00,
      sBkg: 20,
      sPdc: 0,
      dp: 15.93,
      sBkgPdc: 35.93,
      sFShare: 5494.01,
      sFStock: 32964.07,
      sTt: 6,
      period: 164,
      qLeft: 0,
      gainRs: 5344.07,
      gainPct: 19.35
    },
    {
      userId: demoUserId,
      slNo: 14,
      name: "COFORGE",
      platform: "Groww",
      cap: "Mid",
      exchange: "NSE",
      term: "Delivery",
      bDate: "2025-11-20",
      bShare: 5800.00,
      bQty: 5,
      bStock: 29000.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 5804.00,
      bFStock: 29020.00,
      bTt: 6,
      sDate: "2026-04-18",
      sShare: 6700.00,
      sQty: 5,
      sStock: 33500.00,
      sBkg: 20,
      sPdc: 0,
      dp: 15.93,
      sBkgPdc: 35.93,
      sFShare: 6692.81,
      sFStock: 33464.07,
      sTt: 6,
      period: 149,
      qLeft: 0,
      gainRs: 4444.07,
      gainPct: 15.31
    },
    {
      userId: demoUserId,
      slNo: 15,
      name: "CDSL",
      platform: "Zerodha",
      cap: "Small",
      exchange: "NSE",
      term: "Delivery",
      bDate: "2026-01-08",
      bShare: 1850.00,
      bQty: 15,
      bStock: 27750.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 1851.33,
      bFStock: 27770.00,
      bTt: 6,
      sDate: "2026-05-30",
      sShare: 2400.00,
      sQty: 15,
      sStock: 36000.00,
      sBkg: 20,
      sPdc: 0,
      dp: 15.93,
      sBkgPdc: 35.93,
      sFShare: 2397.60,
      sFStock: 35964.07,
      sTt: 6,
      period: 142,
      qLeft: 0,
      gainRs: 8194.07,
      gainPct: 29.51
    },

    // ----------------- INTRADAY ANALYSIS (period <= 1 or term === "Intraday") -----------------
    {
      userId: demoUserId,
      slNo: 16,
      name: "STATE BANK OF INDIA",
      platform: "Zerodha",
      cap: "Large",
      exchange: "NSE",
      term: "Intraday",
      bDate: "2026-08-10",
      bShare: 810.00,
      bQty: 60,
      bStock: 48600.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 810.33,
      bFStock: 48620.00,
      bTt: 0,
      sDate: "2026-08-10",
      sShare: 825.00,
      sQty: 60,
      sStock: 49500.00,
      sBkg: 20,
      sPdc: 0,
      dp: 0,
      sBkgPdc: 20,
      sFShare: 824.67,
      sFStock: 49480.00,
      sTt: 0,
      period: 0,
      qLeft: 0,
      gainRs: 860.00,
      gainPct: 1.77
    },
    {
      userId: demoUserId,
      slNo: 17,
      name: "ICICI BANK",
      platform: "Zerodha",
      cap: "Large",
      exchange: "NSE",
      term: "Intraday",
      bDate: "2026-08-14",
      bShare: 1160.00,
      bQty: 40,
      bStock: 46400.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 1160.50,
      bFStock: 46420.00,
      bTt: 0,
      sDate: "2026-08-14",
      sShare: 1178.00,
      sQty: 40,
      sStock: 47120.00,
      sBkg: 20,
      sPdc: 0,
      dp: 0,
      sBkgPdc: 20,
      sFShare: 1177.50,
      sFStock: 47100.00,
      sTt: 0,
      period: 0,
      qLeft: 0,
      gainRs: 680.00,
      gainPct: 1.46
    },
    {
      userId: demoUserId,
      slNo: 18,
      name: "AXIS BANK",
      platform: "Zerodha",
      cap: "Large",
      exchange: "NSE",
      term: "Intraday",
      bDate: "2026-08-20",
      bShare: 1185.00,
      bQty: 35,
      bStock: 41475.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 1185.57,
      bFStock: 41495.00,
      bTt: 0,
      sDate: "2026-08-20",
      sShare: 1172.00,
      sQty: 35,
      sStock: 41020.00,
      sBkg: 20,
      sPdc: 0,
      dp: 0,
      sBkgPdc: 20,
      sFShare: 1171.43,
      sFStock: 41000.00,
      sTt: 0,
      period: 0,
      qLeft: 0,
      gainRs: -495.00,
      gainPct: -1.19
    },
    {
      userId: demoUserId,
      slNo: 19,
      name: "MARUTI SUZUKI",
      platform: "Groww",
      cap: "Large",
      exchange: "NSE",
      term: "Intraday",
      bDate: "2026-08-28",
      bShare: 12200.00,
      bQty: 4,
      bStock: 48800.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 12205.00,
      bFStock: 48820.00,
      bTt: 0,
      sDate: "2026-08-28",
      sShare: 12410.00,
      sQty: 4,
      sStock: 49640.00,
      sBkg: 20,
      sPdc: 0,
      dp: 0,
      sBkgPdc: 20,
      sFShare: 12405.00,
      sFStock: 49620.00,
      sTt: 0,
      period: 0,
      qLeft: 0,
      gainRs: 800.00,
      gainPct: 1.64
    },
    {
      userId: demoUserId,
      slNo: 20,
      name: "TATA CONSUMER",
      platform: "Zerodha",
      cap: "Large",
      exchange: "NSE",
      term: "Intraday",
      bDate: "2026-09-04",
      bShare: 1150.00,
      bQty: 40,
      bStock: 46000.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 1150.50,
      bFStock: 46020.00,
      bTt: 0,
      sDate: "2026-09-04",
      sShare: 1168.00,
      sQty: 40,
      sStock: 46720.00,
      sBkg: 20,
      sPdc: 0,
      dp: 0,
      sBkgPdc: 20,
      sFShare: 1167.50,
      sFStock: 46700.00,
      sTt: 0,
      period: 0,
      qLeft: 0,
      gainRs: 680.00,
      gainPct: 1.48
    },
    {
      userId: demoUserId,
      slNo: 21,
      name: "BAJAJ FINANCE",
      platform: "Groww",
      cap: "Large",
      exchange: "NSE",
      term: "Intraday",
      bDate: "2026-09-08",
      bShare: 7120.00,
      bQty: 6,
      bStock: 42720.00,
      bBkg: 20,
      bPdc: 0,
      bBkgPdc: 20,
      bFShare: 7123.33,
      bFStock: 42740.00,
      bTt: 0,
      sDate: "2026-09-08",
      sShare: 7240.00,
      sQty: 6,
      sStock: 43440.00,
      sBkg: 20,
      sPdc: 0,
      dp: 0,
      sBkgPdc: 20,
      sFShare: 7236.67,
      sFStock: 43420.00,
      sTt: 0,
      period: 0,
      qLeft: 0,
      gainRs: 680.00,
      gainPct: 1.59
    }
  ].map((trade) => ({
    ...trade,
    createdAt: new Date(`${trade.bDate}T09:15:00.000Z`),
    updatedAt: new Date(trade.sDate !== "-" ? `${trade.sDate}T15:30:00.000Z` : `${trade.bDate}T09:15:00.000Z`)
  }));

  await investDb.collection("stocktrades").insertMany(stockTrades);
  console.log(`Inserted ${stockTrades.length} Stock Trades.`);

  // 5F. Fixed Deposits
  const fixedDeposits = [
    {
      userId: demoUserId,
      bankName: "HDFC Bank",
      fdNumber: "HDFC-FD-901824",
      schemeName: "Regular Cumulative FD",
      amount: 300000,
      interestRate: 7.1,
      tenureYears: 2,
      tenureMonths: 0,
      tenureDays: 0,
      tenureText: "2 Years",
      tenureValue: 2,
      tenureUnit: "Years",
      startDate: "2025-05-10",
      maturityDate: "2027-05-10",
      maturityAmount: 345260.50,
      compoundingFrequency: "Quarterly",
      status: "Active",
      isWithdrawn: false,
      penalty: 0,
      realizedGain: 0,
      realizedInterest: 0,
      realizedPrincipal: 0,
      realizedReturnPercent: 0,
      totalPayout: 0,
      withdrawalDate: "",
      withdrawalNotes: "",
      withdrawalType: "Full Maturity Liquidation",
      transactions: [
        {
          _id: new mongoose.Types.ObjectId(),
          term: "Initial Deposit",
          type: "Initial Deposit",
          date: "2025-05-10",
          amtDeposit: 300000,
          interestAmount: 0,
          penalty: 0,
          actualAmt: 300000,
          notes: "Principal booking @ 7.10% p.a. compounded quarterly",
          createdAt: new Date("2025-05-10T10:00:00.000Z"),
          updatedAt: new Date("2025-05-10T10:00:00.000Z")
        }
      ],
      createdAt: new Date("2025-05-10T10:00:00.000Z"),
      updatedAt: new Date("2025-05-10T10:00:00.000Z")
    },
    {
      userId: demoUserId,
      bankName: "State Bank of India (SBI)",
      fdNumber: "SBI-FD-772819",
      schemeName: "SBI Regular FD",
      amount: 150000,
      interestRate: 6.8,
      tenureYears: 1,
      tenureMonths: 0,
      tenureDays: 0,
      tenureText: "1 Year",
      tenureValue: 1,
      tenureUnit: "Years",
      startDate: "2025-06-01",
      maturityDate: "2026-06-01",
      maturityAmount: 160450.00,
      compoundingFrequency: "Quarterly",
      status: "Matured",
      isWithdrawn: true,
      penalty: 0,
      realizedGain: 10450,
      realizedInterest: 10450,
      realizedPrincipal: 150000,
      realizedReturnPercent: 6.97,
      totalPayout: 160450,
      withdrawalDate: "2026-06-01",
      withdrawalNotes: "Matured and liquidated to savings account",
      withdrawalType: "Full Maturity Liquidation",
      transactions: [
        {
          _id: new mongoose.Types.ObjectId(),
          term: "Initial Deposit",
          type: "Initial Deposit",
          date: "2025-06-01",
          amtDeposit: 150000,
          interestAmount: 0,
          penalty: 0,
          actualAmt: 150000,
          notes: "Principal booking @ 6.80% p.a.",
          createdAt: new Date("2025-06-01T10:00:00.000Z"),
          updatedAt: new Date("2025-06-01T10:00:00.000Z")
        }
      ],
      createdAt: new Date("2025-06-01T10:00:00.000Z"),
      updatedAt: new Date("2026-06-01T10:00:00.000Z")
    }
  ];

  await investDb.collection("fixeddeposits").insertMany(fixedDeposits);
  console.log(`Inserted ${fixedDeposits.length} Fixed Deposits.`);

  console.log("\n==============================================================");
  console.log("🎉 DEMO USER AND ALL DEMO DATA SEEDED SUCCESSFULLY! 🎉");
  console.log("==============================================================");
  console.log(`Username: Demo  (or demo, or demo@progresspulse.com)`);
  console.log(`Password: Demo@123`);
  console.log(`User ID:  ${demoUserId}`);
  console.log("==============================================================\n");

  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding failed with error:", err);
  process.exit(1);
});
