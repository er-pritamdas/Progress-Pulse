#!/bin/bash

# Check if current directory is a Git repository
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "❌ Error: This is not a Git repository."
    exit 1
fi

# Ask for commit message
read -rp "Enter commit message: " COMMIT_MSG

# Validate input
if [ -z "$COMMIT_MSG" ]; then
    echo "❌ Commit message cannot be empty."
    exit 1
fi

echo "📦 Staging all changes..."
sudo git add -A

echo "📝 Committing..."
sudo git commit -m "$COMMIT_MSG"

# Stop if commit failed
if [ $? -ne 0 ]; then
    echo "❌ Commit failed. Nothing was pushed."
    exit 1
fi

echo "🚀 Pushing to remote..."
git push

echo "✅ Done!"