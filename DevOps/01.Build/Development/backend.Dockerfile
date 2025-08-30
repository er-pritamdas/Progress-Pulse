# ---------------------------------------- How to run this file ---------------------------------
# How to run this File :
    # docker build -t backendImage -f DevOps/01.Build/Development/backend.Dockerfile Server/
# You see the image by below command :
    # docker images
    # docker ps -a
# To run the Container
    # docker run -d -p 3000:3000 --name backend -v Server:/app  --network mern-network backendImage

# --------------------------------------- How to push to Docker hub ------------------------------
# Tag for Docker Hub
    #docker tag backendImage username/Reponame:latest
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
# Expose backend port (e.g., 3000)
EXPOSE 3000
# Run backend in dev mode (hot reload with nodemon)
CMD ["npm", "run", "start"]
