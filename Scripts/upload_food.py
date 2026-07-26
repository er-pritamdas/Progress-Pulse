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
    "name": "Mango",
    "brand": "Generic",
    "category": "Fruits",
    "subCategory": "Fresh Fruit",
    "unitType": "100 g",
    "servingSize": 100,
    "source": "USDA FoodData Central",
    "notes": "Fresh ripe mango without peel or seed. No added sugar or preservatives.",

    "calories": 60,
    "protein": 0.82,
    "carbohydrates": 14.98,
    "netCarbs": 13.38,
    "fat": 0.38,
    "fiber": 1.60,
    "sugar": 13.66,
    "addedSugar": 0.00,

    "vitaminA": "54.00 mcg",
    "vitaminB1": "0.03 mg",
    "vitaminB2": "0.04 mg",
    "vitaminB3": "0.67 mg",
    "vitaminB5": "0.20 mg",
    "vitaminB6": "0.12 mg",
    "vitaminB7": "N/A",
    "vitaminB9": "43.00 mcg",
    "vitaminB12": "0.00 mcg",
    "vitaminC": "36.40 mg",
    "vitaminD": "0.00 mcg",
    "vitaminE": "0.90 mg",
    "vitaminK": "4.20 mcg",

    "iron": "0.16 mg",
    "zinc": "0.09 mg",
    "copper": "0.11 mg",
    "manganese": "0.06 mg",
    "selenium": "0.60 mcg",
    "iodine": "N/A",

    "saturatedFat": "0.09 g",
    "monounsaturatedFat": "0.14 g",
    "polyunsaturatedFat": "0.07 g",
    "omega3": "0.03 g",
    "omega6": "0.04 g",
    "transFat": "0.00 g",

    "cholesterol": "0.00 mg",
    "glycemicIndex": "51",
    "glycemicLoad": "8",
    "water": "83.50 g",

    "calcium": "11.00 mg",
    "magnesium": "10.00 mg",
    "phosphorus": "14.00 mg",
    "potassium": "168.00 mg",
    "sodium": "1.00 mg",

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

            # Sync to CSV file as well
            sync_to_csv(item)

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
