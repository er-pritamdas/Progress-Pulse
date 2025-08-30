# ---------------------------------------- How to run this file ---------------------------------
# How to run this File :
    # docker build -t frontendImage -f DevOps/01.Build/Development/frontend.Dockerfile Client/
# You see the image by below command :
    # docker images
# To run the Container
    # docker run -d -p 5173:5173 --name frontend -v Client:/app --network mern-network frontendImage


# --------------------------------------- How to push to Docker hub ------------------------------
# Tag for Docker Hub
    #docker tag frontendImage username/Reponame:latest
# Login (first time only)
    #docker login
# Push
    #docker push username/Reponame:latest


# ---------------------------------------------- Dockerfile --------------------------------------
# Use official Node.js LTS image
FROM node:18
# Set working directory inside container
WORKDIR /app
# Declare /app as a volume
VOLUME /app
# Copy package.json and package-lock.json
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy the rest of the frontend code
COPY . .
# Expose port 5173 (React dev server)
EXPOSE 5173
# Run the frontend dev server
CMD ["npm", "run", "dev", "--", "--host"]

