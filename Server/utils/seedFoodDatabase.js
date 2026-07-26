import fs from "fs";
import path from "path";
import FoodDatabase from "../models/Habit-models/foodDatabase.model.js";

// Utility function to split CSV line handling quoted strings
function parseCsvLine(text) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'") {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

// Extract numeric value from strings like "130 kcal", "2.69 g", etc.
function extractNumber(val) {
  if (!val || val === "N/A" || val === "-") return 0;
  const match = String(val).match(/[-+]?[0-9]*\.?[0-9]+/);
  return match ? parseFloat(match[0]) : 0;
}

export async function seedFoodDatabase() {
  try {
    const count = await FoodDatabase.countDocuments({ isCustom: false });
    // If we already have seeded items, check if we need to sync
    const csvPath = path.join(process.cwd(), "..", "bin", "FOOD TRACKER - Food_Database.csv");
    let fallbackPath = path.join(process.cwd(), "bin", "FOOD TRACKER - Food_Database.csv");

    let targetPath = fs.existsSync(csvPath) ? csvPath : (fs.existsSync(fallbackPath) ? fallbackPath : null);

    if (!targetPath) {
      console.log("⚠️ Food Database CSV file not found at", csvPath);
      return;
    }

    const content = fs.readFileSync(targetPath, "utf-8");
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

    // Line 0 is group header, line 1 is column names, line 2 is units, data starts at line 3
    if (lines.length < 4) {
      console.log("⚠️ CSV file has fewer lines than expected.");
      return;
    }

    const dataLines = lines.slice(3);

    for (const line of dataLines) {
      const col = parseCsvLine(line);
      if (col.length < 5 || !col[1]) continue;

      const foodId = col[0] || "";
      const name = col[1].replace(/^"(.*)"$/, "$1");
      const brand = (col[2] || "Generic").replace(/^"(.*)"$/, "$1");
      const category = (col[3] || "General").replace(/^"(.*)"$/, "$1");
      const subCategory = (col[4] || "").replace(/^"(.*)"$/, "$1");
      const unitType = (col[5] || "100 g").replace(/^"(.*)"$/, "$1");
      const servingSize = extractNumber(col[6]) || 100;
      const source = (col[7] || "").replace(/^"(.*)"$/, "$1");
      const notes = (col[8] || "").replace(/^"(.*)"$/, "$1");

      const calories = extractNumber(col[9]);
      const protein = extractNumber(col[10]);
      const carbohydrates = extractNumber(col[11]);
      const netCarbs = extractNumber(col[12]);
      const fat = extractNumber(col[13]);
      const fiber = extractNumber(col[14]);
      const sugar = extractNumber(col[15]);
      const addedSugar = extractNumber(col[16]);

      const foodDoc = {
        foodId,
        name,
        brand,
        category,
        subCategory,
        unitType,
        servingSize,
        source,
        notes,
        calories,
        protein,
        carbohydrates,
        netCarbs,
        fat,
        fiber,
        sugar,
        addedSugar,
        vitaminA: col[17] || "0",
        vitaminB1: col[18] || "0",
        vitaminB2: col[19] || "0",
        vitaminB3: col[20] || "0",
        vitaminB5: col[21] || "0",
        vitaminB6: col[22] || "0",
        vitaminB7: col[23] || "0",
        vitaminB9: col[24] || "0",
        vitaminB12: col[25] || "0",
        vitaminC: col[26] || "0",
        vitaminD: col[27] || "0",
        vitaminE: col[28] || "0",
        vitaminK: col[29] || "0",
        iron: col[30] || "0",
        zinc: col[31] || "0",
        copper: col[32] || "0",
        manganese: col[33] || "0",
        selenium: col[34] || "0",
        iodine: col[35] || "0",
        saturatedFat: col[36] || "0",
        monounsaturatedFat: col[37] || "0",
        polyunsaturatedFat: col[38] || "0",
        omega3: col[39] || "0",
        omega6: col[40] || "0",
        transFat: col[41] || "0",
        cholesterol: col[42] || "0",
        glycemicIndex: col[43] || "N/A",
        glycemicLoad: col[44] || "N/A",
        water: col[45] || "0",
        isCustom: false,
        userId: null,
      };

      // Upsert by foodId or name
      await FoodDatabase.findOneAndUpdate(
        { name: foodDoc.name, isCustom: false },
        { $set: foodDoc },
        { upsert: true, new: true }
      );
    }
    console.log("✅ Food Database seeded/updated from CSV successfully.");
  } catch (err) {
    console.error("❌ Error seeding Food Database:", err.message);
  }
}
