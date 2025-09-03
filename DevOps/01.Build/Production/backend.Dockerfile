# Use official Node.js LTS image
FROM node:18
# Set working directory
# WORKDIR /app
# Declare /app as a volume
VOLUME /app
# Copy package.json and package-lock.json
COPY package*.json ./
# Install dependencies
RUN npm install --production
# Copy the rest of the backend code
COPY . .
# Expose backend port (e.g., 3000)
EXPOSE 3000
# Run backend in dev mode (hot reload with nodemon)
CMD ["npm", "run", "start"]