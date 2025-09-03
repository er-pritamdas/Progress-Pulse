# This File is a Multi-Stage Dockerfile


# Stage 1: Build React app
FROM node:18 AS build

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build


# Stage 2: Nginx server
FROM nginx:latest

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/

# Copy React build from first stage
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
