import requests
import datetime
import random

# API URLs
LOGIN_URL = "http://localhost:3000/api/v1/users/loggedin"
HABIT_ENTRY_URL = "http://localhost:3000/api/v1/dashboard/habit/table-entry"

# Credentials
USERNAME = "Pritam Das"
PASSWORD = "Versa@123"

# Step 1: Login to get the access token
login_payload = {
    "username": USERNAME,
    "password": PASSWORD
}

response = requests.post(LOGIN_URL, json=login_payload)

if response.status_code != 200:
    print("Login failed:", response.text)
    exit()

access_token = response.json().get("data", {}).get("accessToken")

if not access_token:
    print("Access token not found in response.")
    exit()

headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

# Step 2: Generate and send habit entries for a month
start_date = datetime.date(2025, 7, 1)

for i in range(30):
    current_date = start_date + datetime.timedelta(days=i)

    # Random realistic values
    burned = random.randint(200, 500)
    water = round(random.uniform(2.0, 4.0), 1)
    sleep = round(random.uniform(6.0, 9.0), 1)
    read = round(random.uniform(0.5, 2.0), 1)
    intake = random.randint(1800, 2500)
    selfcare = ""
    mood = random.choice(["Good", "Average", "Sad", "Amazing","Depressed","Productive"])
    progress = 100
    score = 6

    habit_payload = {
        "date": str(current_date),
        "burned": str(burned),
        "water": str(water),
        "sleep": str(sleep),
        "read": str(read),
        "intake": str(intake),
        "selfcare": selfcare,
        "mood": mood,
        "progress": progress,
        "currentPage": "1",
        "score" : score,
    }

    res = requests.post(HABIT_ENTRY_URL, headers=headers, json=habit_payload)

    if res.status_code == 201:
        print(f"[{current_date}] Entry added successfully.")
    else:
        print(f"[{current_date}] Failed to add entry. Status: {res.status_code}, Error: {res.text}")
