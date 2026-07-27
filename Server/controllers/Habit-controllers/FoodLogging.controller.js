import FoodDatabase from "../../models/Habit-models/foodDatabase.model.js";
import FoodLog from "../../models/Habit-models/foodLog.model.js";
import { seedFoodDatabase } from "../../utils/seedFoodDatabase.js";

// GET /api/v1/dashboard/habit/food/database
export const getFoodDatabase = async (req, res) => {
  try {
    // Seed database if empty
    const totalCount = await FoodDatabase.countDocuments();
    if (totalCount === 0) {
      await seedFoodDatabase();
    }

    const { search = "", category = "", page = 1, limit = 50 } = req.query;
    const userId = req.user?._id;

    const query = {
      $or: [{ isCustom: false }, { userId: userId }],
    };

    if (search.trim()) {
      query.$and = [
        {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { brand: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
          ],
        },
      ];
    }

    if (category.trim() && category !== "All") {
      query.category = { $regex: `^${category}$`, $options: "i" };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const foods = await FoodDatabase.find(query)
      .sort({ isCustom: -1, name: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await FoodDatabase.countDocuments(query);
    const categories = await FoodDatabase.distinct("category", {
      $or: [{ isCustom: false }, { userId: userId }],
    });

    return res.status(200).json({
      success: true,
      message: "Food database retrieved successfully",
      data: {
        foods,
        total,
        categories,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch food database",
    });
  }
};

// POST /api/v1/dashboard/habit/food/database (User adds custom food)
export const createCustomFood = async (req, res) => {
  try {
    const userId = req.user?._id;
    const {
      name,
      brand = "Generic",
      category = "General",
      subCategory = "",
      unitType = "100 g",
      servingSize = 100,
      notes = "",
      calories = 0,
      protein = 0,
      carbohydrates = 0,
      fat = 0,
      fiber = 0,
      sugar = 0,
      addedSugar = 0,
      vitaminA = "0",
      vitaminB1 = "0",
      vitaminB2 = "0",
      vitaminB3 = "0",
      vitaminB5 = "0",
      vitaminB6 = "0",
      vitaminB7 = "0",
      vitaminB9 = "0",
      vitaminB12 = "0",
      vitaminC = "0",
      vitaminD = "0",
      vitaminE = "0",
      vitaminK = "0",
      iron = "0",
      zinc = "0",
      copper = "0",
      manganese = "0",
      selenium = "0",
      iodine = "0",
      saturatedFat = "0",
      monounsaturatedFat = "0",
      polyunsaturatedFat = "0",
      omega3 = "0",
      omega6 = "0",
      transFat = "0",
      cholesterol = "0",
      glycemicIndex = "N/A",
      glycemicLoad = "N/A",
      water = "0",
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Food name is required",
      });
    }

    const customFood = await FoodDatabase.create({
      name: name.trim(),
      brand,
      category,
      subCategory,
      unitType,
      servingSize: Number(servingSize) || 100,
      notes,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbohydrates: Number(carbohydrates) || 0,
      netCarbs: Math.max(0, (Number(carbohydrates) || 0) - (Number(fiber) || 0)),
      fat: Number(fat) || 0,
      fiber: Number(fiber) || 0,
      sugar: Number(sugar) || 0,
      addedSugar: Number(addedSugar) || 0,
      vitaminA: String(vitaminA || "0"),
      vitaminB1: String(vitaminB1 || "0"),
      vitaminB2: String(vitaminB2 || "0"),
      vitaminB3: String(vitaminB3 || "0"),
      vitaminB5: String(vitaminB5 || "0"),
      vitaminB6: String(vitaminB6 || "0"),
      vitaminB7: String(vitaminB7 || "0"),
      vitaminB9: String(vitaminB9 || "0"),
      vitaminB12: String(vitaminB12 || "0"),
      vitaminC: String(vitaminC || "0"),
      vitaminD: String(vitaminD || "0"),
      vitaminE: String(vitaminE || "0"),
      vitaminK: String(vitaminK || "0"),
      iron: String(iron || "0"),
      zinc: String(zinc || "0"),
      copper: String(copper || "0"),
      manganese: String(manganese || "0"),
      selenium: String(selenium || "0"),
      iodine: String(iodine || "0"),
      saturatedFat: String(saturatedFat || "0"),
      monounsaturatedFat: String(monounsaturatedFat || "0"),
      polyunsaturatedFat: String(polyunsaturatedFat || "0"),
      omega3: String(omega3 || "0"),
      omega6: String(omega6 || "0"),
      transFat: String(transFat || "0"),
      cholesterol: String(cholesterol || "0"),
      glycemicIndex: String(glycemicIndex || "N/A"),
      glycemicLoad: String(glycemicLoad || "N/A"),
      water: String(water || "0"),
      userId,
      isCustom: true,
      source: "User Custom Entry",
    });

    return res.status(201).json({
      success: true,
      message: "Custom food item added successfully",
      data: customFood,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create custom food item",
    });
  }
};

// GET /api/v1/dashboard/habit/food/log
export const getDailyFoodLogs = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required (YYYY-MM-DD)",
      });
    }

    const logs = await FoodLog.find({ userId, date }).populate({
      path: "foodId",
      model: FoodDatabase,
    });
    console.log(`🔍 [getDailyFoodLogs] Date: ${date} | User: ${userId} | Found: ${logs.length} entries`);

    // Group logs by mealType and calculate totals
    const meals = {
      Breakfast: [],
      Lunch: [],
      Dinner: [],
      Snacks: [],
      Other: [],
    };

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSugar = 0;

    logs.forEach((log) => {
      let rawMeal = log.mealType || "Breakfast";
      let meal = rawMeal.charAt(0).toUpperCase() + rawMeal.slice(1).toLowerCase();
      if (meal === "Others") meal = "Other";
      if (!["Breakfast", "Lunch", "Dinner", "Snacks", "Other"].includes(meal)) {
        meal = "Breakfast";
      }
      if (!meals[meal]) meals[meal] = [];
      meals[meal].push(log);

      totalCalories += log.calories || 0;
      totalProtein += log.protein || 0;
      totalCarbs += log.carbohydrates || 0;
      totalFat += log.fat || 0;
      totalFiber += log.fiber || 0;
      totalSugar += log.sugar || 0;
    });

    return res.status(200).json({
      success: true,
      message: "Daily food logs retrieved successfully",
      data: {
        date,
        logs,
        meals,
        summary: {
          totalCalories: Math.round(totalCalories),
          totalProtein: parseFloat(totalProtein.toFixed(1)),
          totalCarbs: parseFloat(totalCarbs.toFixed(1)),
          totalFat: parseFloat(totalFat.toFixed(1)),
          totalFiber: parseFloat(totalFiber.toFixed(1)),
          totalSugar: parseFloat(totalSugar.toFixed(1)),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error in getDailyFoodLogs:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch food logs",
    });
  }
};

// GET /api/v1/dashboard/habit/food/range-logs
export const getFoodLogsDateRange = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required (YYYY-MM-DD)",
      });
    }

    const cleanStart = String(startDate).split("T")[0].trim();
    const cleanEnd = String(endDate).split("T")[0].trim();

    const parseToYYYYMMDD = (raw) => {
      if (!raw) return "";
      const str = String(raw).trim();
      if (str.includes("T")) return str.split("T")[0].trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
      const d = new Date(str);
      if (isNaN(d.getTime())) return "";
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    const allLogs = await FoodLog.find({ userId })
      .populate({
        path: "foodId",
        model: FoodDatabase,
      })
      .sort({ createdAt: 1 });

    const logs = allLogs.filter((log) => {
      const normDate = parseToYYYYMMDD(log.date);
      return normDate && normDate >= cleanStart && normDate <= cleanEnd;
    });

    console.log(`🔍 [getFoodLogsDateRange] User: ${userId} | Range: ${cleanStart} to ${cleanEnd} | Found ${logs.length} / ${allLogs.length} logs`);

    // Group logs by date
    const groupedByDate = {};
    logs.forEach((log) => {
      const dKey = parseToYYYYMMDD(log.date);
      if (dKey) {
        if (!groupedByDate[dKey]) {
          groupedByDate[dKey] = [];
        }
        groupedByDate[dKey].push(log);
      }
    });

    return res.status(200).json({
      success: true,
      message: "Date range food logs retrieved successfully",
      data: {
        startDate: cleanStart,
        endDate: cleanEnd,
        totalLogs: logs.length,
        logs,
        groupedByDate,
      },
    });
  } catch (error) {
    console.error("❌ Error in getFoodLogsDateRange:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch date range food logs",
    });
  }
};

// POST /api/v1/dashboard/habit/food/log
export const logFoodItem = async (req, res) => {
  try {
    const userId = req.user?._id;

    // Support batch logging via `items` array
    if (req.body.items && Array.isArray(req.body.items) && req.body.items.length > 0) {
      const createdLogs = [];
      for (const itemPayload of req.body.items) {
        let { date, mealType = "Breakfast", foodId, servings = 1 } = itemPayload;

        if (!date || !foodId) continue;

        let normalizedMeal = mealType || "Breakfast";
        normalizedMeal = normalizedMeal.charAt(0).toUpperCase() + normalizedMeal.slice(1).toLowerCase();
        if (normalizedMeal === "Others") normalizedMeal = "Other";
        if (!["Breakfast", "Lunch", "Dinner", "Snacks", "Other"].includes(normalizedMeal)) {
          normalizedMeal = "Breakfast";
        }

        const food = await FoodDatabase.findById(foodId);
        if (!food) continue;

        const multiplier = Number(servings) || 1;

        let cleanDate = String(date).split("T")[0].trim();
        const dObj = new Date(cleanDate);
        if (!isNaN(dObj.getTime())) {
          const yyyy = dObj.getFullYear();
          const mm = String(dObj.getMonth() + 1).padStart(2, "0");
          const dd = String(dObj.getDate()).padStart(2, "0");
          cleanDate = `${yyyy}-${mm}-${dd}`;
        }

        const newLog = await FoodLog.create({
          userId,
          date: cleanDate,
          mealType: normalizedMeal,
          foodId: food._id,
          foodName: food.name,
          servings: multiplier,
          unitType: food.unitType,
          servingSize: food.servingSize,
          calories: Math.round((food.calories || 0) * multiplier),
          protein: parseFloat(((food.protein || 0) * multiplier).toFixed(1)),
          carbohydrates: parseFloat(((food.carbohydrates || 0) * multiplier).toFixed(1)),
          fat: parseFloat(((food.fat || 0) * multiplier).toFixed(1)),
          fiber: parseFloat(((food.fiber || 0) * multiplier).toFixed(1)),
          sugar: parseFloat(((food.sugar || 0) * multiplier).toFixed(1)),
        });

        createdLogs.push(newLog);
      }

      return res.status(201).json({
        success: true,
        message: `${createdLogs.length} food item(s) logged successfully`,
        data: createdLogs,
      });
    }

    let { date, mealType = "Breakfast", foodId, servings = 1 } = req.body;

    console.log("➕ [logFoodItem] Received payload:", { date, mealType, foodId, servings, userId });

    if (!date || !foodId) {
      return res.status(400).json({
        success: false,
        message: "Date and foodId are required",
      });
    }

    let normalizedMeal = mealType || "Breakfast";
    normalizedMeal = normalizedMeal.charAt(0).toUpperCase() + normalizedMeal.slice(1).toLowerCase();
    if (normalizedMeal === "Others") normalizedMeal = "Other";
    if (!["Breakfast", "Lunch", "Dinner", "Snacks", "Other"].includes(normalizedMeal)) {
      normalizedMeal = "Breakfast";
    }

    const food = await FoodDatabase.findById(foodId);
    if (!food) {
      console.log("❌ Food item not found for ID:", foodId);
      return res.status(404).json({
        success: false,
        message: "Food item not found in database",
      });
    }

    const multiplier = Number(servings) || 1;

    let cleanDate = String(date).split("T")[0].trim();
    const dObj = new Date(cleanDate);
    if (!isNaN(dObj.getTime())) {
      const yyyy = dObj.getFullYear();
      const mm = String(dObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dObj.getDate()).padStart(2, "0");
      cleanDate = `${yyyy}-${mm}-${dd}`;
    }

    const newLog = await FoodLog.create({
      userId,
      date: cleanDate,
      mealType: normalizedMeal,
      foodId: food._id,
      foodName: food.name,
      servings: multiplier,
      unitType: food.unitType,
      servingSize: food.servingSize,
      calories: Math.round((food.calories || 0) * multiplier),
      protein: parseFloat(((food.protein || 0) * multiplier).toFixed(1)),
      carbohydrates: parseFloat(((food.carbohydrates || 0) * multiplier).toFixed(1)),
      fat: parseFloat(((food.fat || 0) * multiplier).toFixed(1)),
      fiber: parseFloat(((food.fiber || 0) * multiplier).toFixed(1)),
      sugar: parseFloat(((food.sugar || 0) * multiplier).toFixed(1)),
    });

    console.log("✅ [logFoodItem] Created Log:", newLog._id, newLog.foodName, newLog.mealType);

    return res.status(201).json({
      success: true,
      message: `${food.name} logged to ${mealType}`,
      data: newLog,
    });
  } catch (error) {
    console.error("❌ Error in logFoodItem:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to log food item",
    });
  }
};

// PUT /api/v1/dashboard/habit/food/log/:id
export const updateFoodLog = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const { servings, mealType } = req.body;

    if (!servings || Number(servings) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid servings quantity is required",
      });
    }

    const log = await FoodLog.findOne({ _id: id, userId }).populate("foodId");
    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Food log entry not found",
      });
    }

    if (mealType) {
      let normalizedMeal = mealType.charAt(0).toUpperCase() + mealType.slice(1).toLowerCase();
      if (normalizedMeal === "Others") normalizedMeal = "Other";
      if (["Breakfast", "Lunch", "Dinner", "Snacks", "Other"].includes(normalizedMeal)) {
        log.mealType = normalizedMeal;
      }
    }

    const food = log.foodId;
    const multiplier = Number(servings);

    log.servings = multiplier;
    if (food) {
      log.calories = Math.round(food.calories * multiplier);
      log.protein = parseFloat((food.protein * multiplier).toFixed(1));
      log.carbohydrates = parseFloat((food.carbohydrates * multiplier).toFixed(1));
      log.fat = parseFloat((food.fat * multiplier).toFixed(1));
      log.fiber = parseFloat((food.fiber * multiplier).toFixed(1));
      log.sugar = parseFloat((food.sugar * multiplier).toFixed(1));
    }

    await log.save();

    return res.status(200).json({
      success: true,
      message: "Food log updated successfully",
      data: log,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update food log",
    });
  }
};

// DELETE /api/v1/dashboard/habit/food/log/:id
export const deleteFoodLog = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const log = await FoodLog.findOneAndDelete({ _id: id, userId });
    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Food log entry not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Food log entry deleted successfully",
      data: log,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete food log",
    });
  }
};

// DELETE /api/v1/dashboard/habit/food/meal-category
export const deleteMealCategoryLogs = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { date, mealType } = req.query;

    if (!date || !mealType) {
      return res.status(400).json({
        success: false,
        message: "Date and mealType are required",
      });
    }

    let normalizedMeal = mealType.charAt(0).toUpperCase() + mealType.slice(1).toLowerCase();
    if (normalizedMeal === "Others") normalizedMeal = "Other";

    let cleanDate = String(date).split("T")[0].trim();
    const dObj = new Date(cleanDate);
    if (!isNaN(dObj.getTime())) {
      const yyyy = dObj.getFullYear();
      const mm = String(dObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dObj.getDate()).padStart(2, "0");
      cleanDate = `${yyyy}-${mm}-${dd}`;
    }

    const result = await FoodLog.deleteMany({
      userId,
      date: cleanDate,
      mealType: { $regex: new RegExp(`^${normalizedMeal}$`, "i") },
    });

    console.log(`🗑️ [deleteMealCategoryLogs] Deleted ${result.deletedCount} items for ${normalizedMeal} on ${cleanDate}`);

    return res.status(200).json({
      success: true,
      message: `All ${normalizedMeal} items for ${cleanDate} deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("❌ Error in deleteMealCategoryLogs:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete meal category logs",
    });
  }
};
