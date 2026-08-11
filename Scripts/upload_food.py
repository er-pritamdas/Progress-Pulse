import json
import os
import sys
import subprocess
import site
from datetime import datetime, timezone

# Ensure user site-packages are loaded
sys.path.append(site.getusersitepackages())

# Auto-install pymongo if not present
try:
    from pymongo import MongoClient
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pymongo", "--break-system-packages"])
    from pymongo import MongoClient

# Locate Project Root & Server .env
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(PROJECT_ROOT, "Server", ".env")
CSV_PATH = os.path.join(PROJECT_ROOT, "bin", "FOOD TRACKER - Food_Database.csv")

# Load environment variables from Server/.env if available
def load_env():
    env_vars = {}
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    env_vars[key.strip()] = value.strip()
    return env_vars

env = load_env()
MONGO_URI = env.get("MONGO_URI", os.getenv("MONGODB_URI", "mongodb://localhost:27017"))
DB_NAME = env.get("HABIT_DB", os.getenv("HABIT_DB", "Habit-Tracker"))
COLLECTION_NAME = "fooddatabases"

# ==============================================================================
# PASTE YOUR RAW JSON HERE (Copy & Paste directly with "null" / "false")
# ==============================================================================
RAW_JSON_DATA = """
[
{
"foodId": "",
"name": "Beguni (Bengali Brinjal Pakoda)",
"brand": "Generic",
"category": "Indian Snacks",
"subCategory": "Pakoda",
"unitType": "1 piece",
"servingSize": 35,
"source": "IFCT 2017 + USDA FoodData Central (Estimated Home-style Recipe)",
"notes": "Homemade Bengali beguni prepared with brinjal slices coated in besan, turmeric, red chilli powder and salt, then fried in vegetable/mustard oil. Typical homemade preparation.",
"calories": 92,
"protein": 2.00,
"carbohydrates": 10.20,
"netCarbs": 8.70,
"fat": 4.80,
"fiber": 1.50,
"sugar": 1.80,
"addedSugar": 0.00,
"vitaminA": "14.00 mcg",
"vitaminB1": "0.06 mg",
"vitaminB2": "0.04 mg",
"vitaminB3": "0.50 mg",
"vitaminB5": "0.15 mg",
"vitaminB6": "0.08 mg",
"vitaminB7": "N/A",
"vitaminB9": "28.00 mcg",
"vitaminB12": "0.00 mcg",
"vitaminC": "2.10 mg",
"vitaminD": "0.00 mcg",
"vitaminE": "0.62 mg",
"vitaminK": "2.10 mcg",
"iron": "0.70 mg",
"zinc": "0.38 mg",
"copper": "0.08 mg",
"manganese": "0.16 mg",
"selenium": "1.40 mcg",
"iodine": "N/A",
"saturatedFat": "0.55 g",
"monounsaturatedFat": "2.15 g",
"polyunsaturatedFat": "1.65 g",
"omega3": "0.08 g",
"omega6": "1.55 g",
"transFat": "0.02 g",
"cholesterol": "0.00 mg",
"glycemicIndex": "50",
"glycemicLoad": "4",
"water": "18.20 g",
"calcium": "18.00 mg",
"magnesium": "16.00 mg",
"phosphorus": "40.00 mg",
"potassium": "105.00 mg",
"sodium": "160.00 mg",
"userId": null,
"isCustom": false
},
{
"foodId": "",
"name": "Onion Pakoda",
"brand": "Generic",
"category": "Indian Snacks",
"subCategory": "Pakoda",
"unitType": "1 piece",
"servingSize": 30,
"source": "IFCT 2017 + USDA FoodData Central (Estimated Home-style Recipe)",
"notes": "Homemade onion pakoda prepared with sliced onion, besan, green chilli, turmeric, red chilli powder, salt and Indian spices, fried in vegetable/mustard oil. Typical homemade preparation.",
"calories": 91,
"protein": 2.20,
"carbohydrates": 10.20,
"netCarbs": 8.80,
"fat": 4.60,
"fiber": 1.40,
"sugar": 1.70,
"addedSugar": 0.00,
"vitaminA": "8.00 mcg",
"vitaminB1": "0.06 mg",
"vitaminB2": "0.04 mg",
"vitaminB3": "0.55 mg",
"vitaminB5": "0.15 mg",
"vitaminB6": "0.08 mg",
"vitaminB7": "N/A",
"vitaminB9": "35.00 mcg",
"vitaminB12": "0.00 mcg",
"vitaminC": "2.30 mg",
"vitaminD": "0.00 mcg",
"vitaminE": "0.62 mg",
"vitaminK": "2.50 mcg",
"iron": "0.70 mg",
"zinc": "0.38 mg",
"copper": "0.08 mg",
"manganese": "0.17 mg",
"selenium": "1.20 mcg",
"iodine": "N/A",
"saturatedFat": "0.52 g",
"monounsaturatedFat": "2.05 g",
"polyunsaturatedFat": "1.58 g",
"omega3": "0.08 g",
"omega6": "1.48 g",
"transFat": "0.02 g",
"cholesterol": "0.00 mg",
"glycemicIndex": "45",
"glycemicLoad": "4",
"water": "17.10 g",
"calcium": "20.00 mg",
"magnesium": "18.00 mg",
"phosphorus": "43.00 mg",
"potassium": "115.00 mg",
"sodium": "175.00 mg",
"userId": null,
"isCustom": false
},
{
"foodId": "",
"name": "Potato Fry",
"brand": "Generic",
"category": "Vegetables",
"subCategory": "Potato Fry",
"unitType": "100 g",
"servingSize": 100,
"source": "IFCT 2017 + USDA FoodData Central (Estimated Home-style Recipe)",
"notes": "Homemade potato fry prepared with potato, turmeric, red chilli powder, salt and common Indian spices using a moderate amount of cooking oil. Pan-fried home-style preparation.",
"calories": 126,
"protein": 2.30,
"carbohydrates": 18.60,
"netCarbs": 16.50,
"fat": 4.80,
"fiber": 2.10,
"sugar": 1.10,
"addedSugar": 0.00,
"vitaminA": "2.00 mcg",
"vitaminB1": "0.08 mg",
"vitaminB2": "0.03 mg",
"vitaminB3": "1.15 mg",
"vitaminB5": "0.30 mg",
"vitaminB6": "0.25 mg",
"vitaminB7": "N/A",
"vitaminB9": "14.00 mcg",
"vitaminB12": "0.00 mcg",
"vitaminC": "12.00 mg",
"vitaminD": "0.00 mcg",
"vitaminE": "0.55 mg",
"vitaminK": "2.50 mcg",
"iron": "0.65 mg",
"zinc": "0.35 mg",
"copper": "0.10 mg",
"manganese": "0.16 mg",
"selenium": "0.40 mcg",
"iodine": "N/A",
"saturatedFat": "0.55 g",
"monounsaturatedFat": "1.55 g",
"polyunsaturatedFat": "2.30 g",
"omega3": "0.04 g",
"omega6": "2.15 g",
"transFat": "0.00 g",
"cholesterol": "0.00 mg",
"glycemicIndex": "60",
"glycemicLoad": "10",
"water": "71.80 g",
"calcium": "16.00 mg",
"magnesium": "22.00 mg",
"phosphorus": "50.00 mg",
"potassium": "360.00 mg",
"sodium": "135.00 mg",
"userId": null,
"isCustom": false
},
{
"foodId": "",
"name": "Aaplam Papad",
"brand": "Generic",
"category": "Snacks",
"subCategory": "Papad",
"unitType": "1 piece",
"servingSize": 10,
"source": "IFCT 2017 + USDA FoodData Central (Estimated)",
"notes": "Aaplam/appalam papad made primarily from urad dal flour, salt and spices. Values assume one approximately 10 g papad, roasted or cooked without additional oil.",
"calories": 35,
"protein": 2.20,
"carbohydrates": 5.10,
"netCarbs": 4.20,
"fat": 0.50,
"fiber": 0.90,
"sugar": 0.20,
"addedSugar": 0.00,
"vitaminA": "0.00 mcg",
"vitaminB1": "0.03 mg",
"vitaminB2": "0.01 mg",
"vitaminB3": "0.15 mg",
"vitaminB5": "0.05 mg",
"vitaminB6": "0.02 mg",
"vitaminB7": "N/A",
"vitaminB9": "4.00 mcg",
"vitaminB12": "0.00 mcg",
"vitaminC": "0.00 mg",
"vitaminD": "0.00 mcg",
"vitaminE": "0.01 mg",
"vitaminK": "0.00 mcg",
"iron": "0.65 mg",
"zinc": "0.30 mg",
"copper": "0.08 mg",
"manganese": "0.10 mg",
"selenium": "1.00 mcg",
"iodine": "N/A",
"saturatedFat": "0.08 g",
"monounsaturatedFat": "0.10 g",
"polyunsaturatedFat": "0.25 g",
"omega3": "0.02 g",
"omega6": "0.22 g",
"transFat": "0.00 g",
"cholesterol": "0.00 mg",
"glycemicIndex": "55",
"glycemicLoad": "2",
"water": "1.70 g",
"calcium": "12.00 mg",
"magnesium": "10.00 mg",
"phosphorus": "28.00 mg",
"potassium": "32.00 mg",
"sodium": "170.00 mg",
"userId": null,
"isCustom": false
},
{
"foodId": "",
"name": "Cucumber",
"brand": "Generic",
"category": "Vegetables",
"subCategory": "Raw Vegetable",
"unitType": "100 g",
"servingSize": 100,
"source": "USDA FoodData Central",
"notes": "Raw fresh cucumber, with peel, eaten without cooking or added salt.",
"calories": 15,
"protein": 0.65,
"carbohydrates": 3.63,
"netCarbs": 2.93,
"fat": 0.11,
"fiber": 0.70,
"sugar": 1.67,
"addedSugar": 0.00,
"vitaminA": "5.00 mcg",
"vitaminB1": "0.03 mg",
"vitaminB2": "0.03 mg",
"vitaminB3": "0.10 mg",
"vitaminB5": "0.26 mg",
"vitaminB6": "0.04 mg",
"vitaminB7": "N/A",
"vitaminB9": "7.00 mcg",
"vitaminB12": "0.00 mcg",
"vitaminC": "2.80 mg",
"vitaminD": "0.00 mcg",
"vitaminE": "0.03 mg",
"vitaminK": "16.40 mcg",
"iron": "0.28 mg",
"zinc": "0.20 mg",
"copper": "0.04 mg",
"manganese": "0.08 mg",
"selenium": "0.30 mcg",
"iodine": "N/A",
"saturatedFat": "0.04 g",
"monounsaturatedFat": "0.01 g",
"polyunsaturatedFat": "0.04 g",
"omega3": "0.01 g",
"omega6": "0.03 g",
"transFat": "0.00 g",
"cholesterol": "0.00 mg",
"glycemicIndex": "15",
"glycemicLoad": "0",
"water": "95.23 g",
"calcium": "16.00 mg",
"magnesium": "13.00 mg",
"phosphorus": "24.00 mg",
"potassium": "147.00 mg",
"sodium": "2.00 mg",
"userId": null,
"isCustom": false
}
]
"""

def sync_to_csv(item):
    """Appends/updates the item in the CSV database file so server re-seeds preserve it."""
    if not os.path.exists(CSV_PATH):
        return

    try:
        with open(CSV_PATH, "r", encoding="utf-8") as f:
            lines = f.readlines()

        food_name = item.get("name", "").strip()
        existing_names = [l.split(",")[1].replace('"', '').strip() for l in lines[3:] if len(l.split(",")) > 1]

        next_id = str(len(lines) - 2) if food_name not in existing_names else item.get("foodId", "")

        def fmt(val, suffix=""):
            if val is None or val == "" or val == "N/A":
                return "N/A"
            if isinstance(val, (int, float)):
                return f"{val:.2f} {suffix}".strip() if suffix else str(val)
            return str(val)

        csv_row = [
            next_id,
            f'"{food_name}"' if ',' in food_name else food_name,
            item.get("brand", "Generic"),
            item.get("category", "General"),
            item.get("subCategory", ""),
            item.get("unitType", "100 g"),
            str(item.get("servingSize", 100)),
            item.get("source", "User Defined"),
            item.get("notes", ""),
            fmt(item.get("calories"), "kcal"),
            fmt(item.get("protein"), "g"),
            fmt(item.get("carbohydrates"), "g"),
            fmt(item.get("netCarbs"), "g"),
            fmt(item.get("fat"), "g"),
            fmt(item.get("fiber"), "g"),
            fmt(item.get("sugar"), "g"),
            fmt(item.get("addedSugar"), "g"),
            fmt(item.get("vitaminA")),
            fmt(item.get("vitaminB1")),
            fmt(item.get("vitaminB2")),
            fmt(item.get("vitaminB3")),
            fmt(item.get("vitaminB5")),
            fmt(item.get("vitaminB6")),
            fmt(item.get("vitaminB7")),
            fmt(item.get("vitaminB9")),
            fmt(item.get("vitaminB12")),
            fmt(item.get("vitaminC")),
            fmt(item.get("vitaminD")),
            fmt(item.get("vitaminE")),
            fmt(item.get("vitaminK")),
            fmt(item.get("iron")),
            fmt(item.get("zinc")),
            fmt(item.get("copper")),
            fmt(item.get("manganese")),
            fmt(item.get("selenium")),
            fmt(item.get("iodine")),
            fmt(item.get("saturatedFat")),
            fmt(item.get("monounsaturatedFat")),
            fmt(item.get("polyunsaturatedFat")),
            fmt(item.get("omega3")),
            fmt(item.get("omega6")),
            fmt(item.get("transFat")),
            fmt(item.get("cholesterol")),
            fmt(item.get("glycemicIndex")),
            fmt(item.get("glycemicLoad")),
            fmt(item.get("water"))
        ]

        csv_line = ",".join(csv_row) + "\n"

        if food_name not in existing_names:
            with open(CSV_PATH, "a", encoding="utf-8") as f:
                f.write(csv_line)
            print(f"📄 Appended '{food_name}' to {os.path.basename(CSV_PATH)}")
    except Exception as err:
        print(f"⚠️ Warning: Could not sync to CSV: {err}")

def upload_food_items():
    try:
        data = json.loads(RAW_JSON_DATA.strip())
        items_to_insert = data if isinstance(data, list) else [data]

        print(f"Connecting to MongoDB database '{DB_NAME}' at {MONGO_URI}...")
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]

        now = datetime.now(timezone.utc)

        for item in items_to_insert:
            food_name = item.get("name")
            if not food_name:
                print("⚠️ Skipping item with missing 'name' field.")
                continue

            item["isCustom"] = item.get("isCustom", False)
            item["userId"] = item.get("userId", None)

            # Mongoose compatibility: set createdAt, updatedAt & __v
            item_data = dict(item)
            item_data["updatedAt"] = now

            result = collection.update_one(
                {"name": food_name, "isCustom": item.get("isCustom", False)},
                {
                    "$set": item_data,
                    "$setOnInsert": {
                        "createdAt": now,
                        "__v": 0
                    }
                },
                upsert=True
            )

            if result.matched_count > 0:
                print(f"🔄 Updated existing food item in MongoDB '{DB_NAME}': '{food_name}' (with timestamps & __v)")
            else:
                print(f"✅ Successfully inserted new food item in MongoDB '{DB_NAME}': '{food_name}' (with timestamps & __v)")

            # CSV sync disabled - MongoDB only

        # Backfill any existing documents missing __v, createdAt, updatedAt
        collection.update_many(
            {"createdAt": {"$exists": False}},
            {"$set": {"createdAt": now, "updatedAt": now, "__v": 0}}
        )

        print("🎉 Database & CSV sync complete!")

    except json.JSONDecodeError as je:
        print(f"❌ JSON Parsing Error: {je}. Please make sure your raw JSON string is valid!")
    except Exception as e:
        print(f"❌ Error uploading food item: {e}")

if __name__ == "__main__":
    upload_food_items()
