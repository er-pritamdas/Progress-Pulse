# ---------------------------------------- How to run this file ---------------------------------
# How to run this File :
    # docker build -t backendimage -f DevOps/01.Build/Development/backend.Dockerfile Server/
# You see the image by below command :
    # docker images
    # docker ps -a
# To run the Container
    # docker run -it --name backend -v backend_data:/app --env-file Server/.env --network mern-network backendimage
    # -v backend_data:/app -> This is just the name of the volume

# --------------------------------------- How to push to Docker hub ------------------------------
# Tag for Docker Hub
    #docker tag backendimage username/Reponame:latest
# Login (first time only)
    #docker login
# Push
    #docker push username/Reponame:latest
    

# ---------------------------------------------- Dockerfile --------------------------------------
# Use official Node.js LTS image
FROM node:18
# Set working directory
WORKDIR /app
# Declare /app as a volume
VOLUME /app
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
