# ---------------------------------------- How to run this file ---------------------------------
# How to run this File :
    # docker build -t ImageName-f DevOps/01.Build/DockerFiles/Development/frontend.Dockerfile Client/
# You see the image by below command :
    # docker images
# To run the Container
    # docker run -p 3000:3000 ImageName


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
# Set working directory inside container
WORKDIR /app
# Copy package.json and package-lock.json
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy the rest of the frontend code
COPY . .
# Expose port 3000 (React dev server default)
EXPOSE 3000
# Run the frontend dev server
CMD ["npm", "start"]
