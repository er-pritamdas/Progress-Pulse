import requests
import datetime

# === API URLs ===
LOGIN_URL = "http://localhost:3000/api/v1/users/loggedin"
DELETE_URL_TEMPLATE = "http://localhost:3000/api/v1/dashboard/habit/table-entry?date={}"

# === Credentials ===
USERNAME = "Pritam"
PASSWORD = "Versa@123"

# === Date Range to Delete ===
START_DATE = datetime.date(2025, 12, 1)
END_DATE = datetime.date(2025, 12, 31)

# === Step 1: Login and get access token ===
login_payload = {
    "username": USERNAME,
    "password": PASSWORD
}

response = requests.post(LOGIN_URL, json=login_payload)

if response.status_code != 200:
    print("❌ Login failed:", response.text)
    exit()

access_token = response.json().get("data", {}).get("accessToken")

if not access_token:
    print("❌ Access token not found.")
    exit()

headers = {
    "Authorization": f"Bearer {access_token}"
}

# === Step 2: Loop through dates and delete ===
current_date = START_DATE

while current_date <= END_DATE:
    formatted_date = current_date.isoformat()
    delete_url = DELETE_URL_TEMPLATE.format(formatted_date)

    res = requests.delete(delete_url, headers=headers)

    if res.status_code == 200:
        print(f"Deleted entry for {formatted_date}")
    elif res.status_code == 404:
        print(f"No entry found for {formatted_date}")
    else:
        print(f"Failed to delete {formatted_date}: {res.status_code} - {res.text}")

    current_date += datetime.timedelta(days=1)
