#!/bin/bash
set -e

# -------- CONFIGURATION --------
CONTAINER_NAME="jenkins"            # Name of your running container
DOCKERHUB_USER="progresspulse"      # Your Docker Hub username
REPO_NAME="pulse"                    # Repo name
IMAGE_NAME="$DOCKERHUB_USER/$REPO_NAME"
MAX_KEEP_VERSIONS=1                  # How many latest versions to keep
TAG_PREFIX="jenkins"                 # Prefix for version tags (jenkins-v1, jenkins-v2)
# --------------------------------

# Function to check Docker login
check_docker_login() {
    if ! docker info | grep -q "Username:"; then
        echo "⚠️ Docker not logged in! Run 'docker login' first."
        exit 1
    fi
}

# Function to determine next version
next_version() {
    tags=$(curl -s "https://hub.docker.com/v2/repositories/$DOCKERHUB_USER/$REPO_NAME/tags?page_size=100" \
        | jq -r '.results[].name' | grep -E "^$TAG_PREFIX-v[0-9]+$" | sort -V)

    if [[ -z "$tags" ]]; then
        echo "$TAG_PREFIX-v1"
    else
        last_tag=$(echo "$tags" | tail -n1)
        last_version=${last_tag##*-v}     # Extract number after 'jenkins-v'
        next_version=$((last_version + 1))
        echo "$TAG_PREFIX-v$next_version"
    fi
}

# Function to commit the running container
commit_container() {
    new_tag="$1"
    echo "🔹 Committing container '$CONTAINER_NAME' as image: $IMAGE_NAME:$new_tag"
    docker commit "$CONTAINER_NAME" "$IMAGE_NAME:$new_tag"
}

# Function to push to Docker Hub
push_image() {
    new_tag="$1"
    echo "🚀 Pushing $IMAGE_NAME:$new_tag to Docker Hub"
    docker push "$IMAGE_NAME:$new_tag"
}

# Function to delete older images from Docker Hub
delete_old_images_hub() {
    echo "🗑️ Deleting older images from Docker Hub..."
    tags=$(curl -s "https://hub.docker.com/v2/repositories/$DOCKERHUB_USER/$REPO_NAME/tags?page_size=100" \
        | jq -r '.results[].name' | grep -E "^$TAG_PREFIX-v[0-9]+$" | sort -V)
    
    old_tags=$(echo "$tags" | head -n -$MAX_KEEP_VERSIONS || true)

    for tag in $old_tags; do
        echo "Deleting $IMAGE_NAME:$tag from Docker Hub"
        token=$(curl -s -H "Content-Type: application/json" -X POST -d "{\"username\":\"$DOCKERHUB_USER\",\"password\":\"$DOCKER_PASSWORD\"}" \
            https://hub.docker.com/v2/users/login/ | jq -r .token)
        curl -s -X DELETE -H "Authorization: JWT $token" "https://hub.docker.com/v2/repositories/$DOCKERHUB_USER/$REPO_NAME/tags/$tag/"
    done
}

# Function to delete older local images
delete_old_images_local() {
    echo "🗑️ Deleting older local images..."
    local_tags=$(docker images --format "{{.Tag}}" "$IMAGE_NAME" | grep -E "^$TAG_PREFIX-v[0-9]+$" | sort -V)
    
    old_local_tags=$(echo "$local_tags" | head -n -$MAX_KEEP_VERSIONS || true)
    
    for tag in $old_local_tags; do
        echo "Deleting local image $IMAGE_NAME:$tag"
        docker rmi -f "$IMAGE_NAME:$tag"
    done
}

# -------- MAIN SCRIPT --------
check_docker_login
NEW_TAG=$(next_version)
commit_container "$NEW_TAG"
push_image "$NEW_TAG"
delete_old_images_hub
delete_old_images_local

echo "✅ Jenkins container updated and pushed as $IMAGE_NAME:$NEW_TAG"
