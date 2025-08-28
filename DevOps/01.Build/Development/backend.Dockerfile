# ---------------------------------------- How to run this file ---------------------------------
# How to run this File :
    # docker build -t ImageName-f DevOps/01.Build/DockerFiles/Development/backend.Dockerfile Client/
# You see the image by below command :
    # docker images
# To run the Container
    # docker run -p 8000:8000 ImageName


# --------------------------------------- How to push to Docker hub ------------------------------
# Tag for Docker Hub
    #docker tag ImageName username/Reponame:latest
# Login (first time only)
    #docker login
# Push
    #docker push username/Reponame:latest


# ---------------------------------------------- Dockerfile --------------------------------------
# Use official Node.js LTS image
FROM node:18
# Set working directory
WORKDIR /app
# Copy package.json and package-lock.json
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy the rest of the backend code
COPY . .
# Expose backend port (e.g., 5000)
EXPOSE 5000
# Run backend in dev mode (hot reload with nodemon)
CMD ["npm", "run", "start"]
