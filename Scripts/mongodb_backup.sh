#!/usr/bin/env bash

set -euo pipefail

#############################################
# MongoDB Backup Utility
#############################################

BACKUP_ROOT="$HOME/mongodb-backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="$BACKUP_ROOT/$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

echo "=========================================="
echo "        MongoDB Backup Utility"
echo "=========================================="
echo

#############################################
# Check Required Packages
#############################################

REQUIRED_TOOLS=("mongosh" "mongodump" "mongorestore")

echo "Checking required packages..."
echo

for tool in "${REQUIRED_TOOLS[@]}"; do
    if command -v "$tool" >/dev/null 2>&1; then
        echo "✓ $tool installed"
    else
        echo "✗ $tool NOT installed"
        exit 1
    fi
done

echo
echo "All required packages are installed."
echo

#############################################
# Check MongoDB Server
#############################################

if ! mongosh --quiet --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
    echo "MongoDB server is not running."
    exit 1
fi

echo "MongoDB Server is running."
echo

#############################################
# Get Database List
#############################################

DATABASES=()

while IFS= read -r db; do
    DATABASES+=("$db")
done < <(
mongosh --quiet --eval '
db.adminCommand("listDatabases").databases.forEach(function(d){
    print(d.name)
})
'
)

if [ ${#DATABASES[@]} -eq 0 ]; then
    echo "No databases found."
    exit 1
fi

echo "Available Databases"
echo "------------------------------"

for i in "${!DATABASES[@]}"; do
    printf "%2d. %s\n" "$((i+1))" "${DATABASES[$i]}"
done

echo
echo "0. Backup ALL Databases"
echo

read -rp "Enter your choice (0 or numbers separated by space): " CHOICE

#############################################
# Function : Generate Metadata JSON
#############################################

generate_metadata() {

    local TYPE="$1"
    shift

    local METADATA_FILE="$BACKUP_DIR/backup.metadata.json"

    {
        echo "{"
        echo "  \"backupTimestamp\": \"$(date +"%Y-%m-%d %H:%M:%S")\","
        echo "  \"mongoVersion\": \"$(mongosh --quiet --eval 'db.version()')\","
        echo "  \"hostname\": \"$(hostname)\","
        echo "  \"backupType\": \"$TYPE\","
        echo "  \"databases\": ["

        local FIRST_DB=true

        for DB in "$@"
        do

            $FIRST_DB || echo ","
            FIRST_DB=false

            echo "    {"
            echo "      \"name\": \"$DB\","
            echo "      \"collections\": ["

            FIRST_COL=true

            while read -r COL
            do
                $FIRST_COL || echo ","
                FIRST_COL=false
                printf '        "%s"' "$COL"

            done < <(
                mongosh --quiet --eval "
                db.getSiblingDB('$DB').getCollectionNames().forEach(c=>print(c))
                "
            )

            echo
            echo "      ]"
            echo -n "    }"

        done

        echo
        echo "  ]"
        echo "}"

    } > "$METADATA_FILE"

}

#############################################
# Backup ALL Databases
#############################################

if [[ "$CHOICE" == "0" ]]; then

    FILE="$BACKUP_DIR/backup.archive.gz"

    echo
    echo "Backing up ALL databases..."

    mongodump \
        --archive="$FILE" \
        --gzip

    generate_metadata "ALL" "${DATABASES[@]}"

    echo
    echo "Backup completed."
    echo
    echo "Folder:"
    echo "$BACKUP_DIR"

    exit 0
fi

#############################################
# Backup Selected Databases
#############################################

SELECTED_DBS=()

for num in $CHOICE
do

    if ! [[ "$num" =~ ^[0-9]+$ ]]; then
        continue
    fi

    INDEX=$((num-1))

    if (( INDEX < 0 || INDEX >= ${#DATABASES[@]} )); then
        continue
    fi

    DB="${DATABASES[$INDEX]}"
    SELECTED_DBS+=("$DB")

    echo
    echo "Backing up database: $DB"

    mongodump \
        --db "$DB" \
        --archive="$BACKUP_DIR/${DB}.archive.gz" \
        --gzip

done

generate_metadata "DATABASE" "${SELECTED_DBS[@]}"

echo
echo "=========================================="
echo "Backup Finished Successfully"
echo "=========================================="
echo
echo "Backup Folder:"
echo "$BACKUP_DIR"