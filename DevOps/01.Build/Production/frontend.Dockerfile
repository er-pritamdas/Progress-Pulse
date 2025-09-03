# This File is a Multi-Stage Dockerfile

# ------------------------
# Stage 1: Build frontend
# ------------------------
FROM node:18 AS build
# Set working directory
WORKDIR /app
# Copy package.json and package-lock.json
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy the rest of the app
COPY . .
# Build the app (Vite/CRA → "dist" or "build" folder)
RUN npm run build


# ------------------------
# Stage 2: Serve with Nginx
# ------------------------
FROM nginx:alpine
# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*
# Copy build files from previous stage to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx config (optional, e.g. for SPA routing)
# Below path is in the context of the docker-compose.yml
# Example : if this docker file is runnig by the docker-copmose.yml, then in the ocker-compose.yml we mention the context and all the path will be relative to that path  
COPY ../DevOps/01.Build/Production/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80
# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
