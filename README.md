# 📊 Progress Pulse

<div align="center">

![Progress Pulse Logo](Client/public/Dashboard.png)

**A Modern Full-Stack Personal Productivity & Finance Management Platform**

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Latest-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-Automated-4285F4?logo=github-actions&logoColor=white)](https://github.com/features/actions)

</div>

---

## 🚀 Overview

**Progress Pulse** is a comprehensive personal productivity and finance management platform that helps users track their habits, manage expenses, and monitor investments all in one place. Built with modern technologies and following industry best practices, it offers a seamless experience across all aspects of personal development and financial wellness.

### ✨ Key Features

🎯 **Habit Tracking** - Build and maintain positive daily habits
💰 **Expense Management** - Track and categorize your spending
📈 **Investment Portfolio** - Monitor your investment performance
🔐 **Secure Authentication** - JWT-based auth with refresh tokens
📱 **Responsive Design** - Works perfectly on all devices
🐳 **Containerized Deployment** - Docker-ready for any environment
⚡ **CI/CD Pipeline** - Automated testing, building, and deployment

---

## 🏗️ Architecture Overview

Progress Pulse follows a modern **MERN Stack** architecture with a **microservices-inspired** design pattern:

### 🎨 Frontend Architecture (Client)

```
Client/
├── 📁 src/
│   ├── 🎨 components/          # Reusable UI components
│   │   ├── Authentication/     # Login/Signup components
│   │   ├── Dashboard/         # Main dashboard modules
│   │   │   ├── Habit/         # Habit tracking components
│   │   │   ├── Expense/       # Expense management components
│   │   │   └── Investment/    # Investment tracking components
│   │   └── Homepage/          # Landing page components
│   ├── 🧠 Context/            # React Context providers
│   │   ├── JwtAuthContext.jsx # Authentication context
│   │   ├── AxiosInstance.jsx  # API client configuration
│   │   └── LoadingContext.jsx # Loading state management
│   ├── 🎭 pages/              # Page components
│   ├── 🔄 services/           # Redux store and slices
│   ├── 🎯 layouts/            # Layout components
│   └── 🛠️ utils/              # Utility functions and helpers
├── 📋 public/                 # Static assets
└── ⚙️ Configuration Files     # Vite, ESLint, Tailwind configs
```

### 🔧 Backend Architecture (Server)

```
Server/
├── 🎮 controllers/            # Business logic handlers
│   ├── User-controllers/      # User authentication & management
│   ├── Habit-controllers/     # Habit tracking logic
│   └── Expense-controllers/   # Expense management logic
├── 🗄️ models/                # MongoDB schemas
│   ├── User-models/          # User data models
│   ├── Habit-models/         # Habit tracking models
│   └── Expense-models/       # Expense data models
├── 🔒 middlewares/           # Authentication & validation
│   ├── JwtAuthorization.middleware.js
│   ├── JwtRefreshTokenValidation.middleware.js
│   └── OtpVerification.middleware.js
├── 🛤️ routes/                # API endpoints
├── 🗃️ db/                    # Database configuration
└── 🛠️ utils/                 # Utility functions
```

---

## 🔄 Application Flow Diagrams

### 🔐 Authentication & JWT Token Flow

The authentication system uses a **dual-token approach** with access and refresh tokens for enhanced security:

- **Access Token**: Short-lived (15 minutes), stored in localStorage
- **Refresh Token**: Long-lived (7 days), stored in httpOnly cookies
- **Auto-refresh**: Seamless token renewal without user intervention

```mermaid
sequenceDiagram
    participant U as "🔐 User"
    participant C as "⚛️ Client (React)"
    participant S as "🔧 Server (Express)"
    participant DB as "🍃 MongoDB"
    participant E as "📧 Email Service"

    Note over U,E: User Registration Flow
    U->>C: Enter registration details
    C->>S: POST /api/v1/users/registered
    S->>DB: Check if user exists
    alt User not exists
        S->>DB: Create new user (unverified)
        S->>E: Send OTP email
        S->>C: Registration successful, verify OTP
        C->>U: Show OTP verification page
        U->>C: Enter OTP
        C->>S: POST /verify-otp
        S->>DB: Verify OTP & activate user
        S->>C: User activated
    else User exists
        S->>C: User already exists error
    end

    Note over U,E: Login Flow
    U->>C: Enter login credentials
    C->>S: POST /api/v1/users/loggedin
    S->>DB: Validate credentials
    alt Valid credentials
        S->>S: Generate Access & Refresh Tokens
        S->>C: Return tokens
        C->>C: Store tokens (localStorage + cookies)
        C->>U: Redirect to dashboard
    else Invalid credentials
        S->>C: Authentication error
    end

    Note over U,E: Token Refresh Flow
    C->>S: API request with expired token
    S->>C: 401 Unauthorized
    C->>S: POST /refresh-token (with refresh token)
    S->>S: Validate refresh token
    S->>S: Generate new access token
    S->>C: New access token
    C->>S: Retry original request
    S->>C: Success response
```

### 📊 System Architecture Flow

Our architecture follows a **separation of concerns** principle with clear data flow:

1. **Frontend Layer**: React components handle UI interactions
2. **API Layer**: Express.js manages HTTP requests and routing
3. **Business Logic**: Controllers process application logic
4. **Data Layer**: Mongoose models interact with MongoDB
5. **External Services**: Email notifications and logging

```mermaid
flowchart TD
    A["🌐 User Interface<br/>(React Components)"] --> B["⚛️ React Frontend<br/>(Vite Dev Server)"]
    B --> C["🔄 Axios Instance<br/>(HTTP Client)"]
    C --> D["🔒 JWT Middleware<br/>(Token Validation)"]
    D --> E["🛤️ Express Routes<br/>(API Endpoints)"]
    E --> F["🎮 Controllers<br/>(Business Logic)"]
    F --> G["🗄️ Mongoose Models<br/>(Data Layer)"]
    G --> H["📊 MongoDB Database<br/>(Data Storage)"]
    
    B --> I["🏪 Redux Store<br/>(Global State)"]
    I --> J["📱 Local State<br/>(Component State)"]
    
    F --> K["📧 Nodemailer<br/>(Email Service)"]
    F --> L["📝 Winston Logger<br/>(Application Logs)"]
    
    M["🐳 Docker Container<br/>(Containerization)"] --> B
    M --> E
    
    N["⚙️ CI/CD Pipeline<br/>(GitHub Actions)"] --> O["🏗️ Build Process"]
    O --> P["📦 Docker Images"]
    P --> Q["🚀 Production Deployment"]
    
    style A fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    style B fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    style H fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    style K fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style M fill:#e3f2fd,stroke:#0d47a1,stroke-width:2px
    style Q fill:#f1f8e9,stroke:#33691e,stroke-width:2px
```

---

## 💼 Technology Stack

### 🎨 Frontend Technologies

| Technology                  | Version | Purpose                     |
| --------------------------- | ------- | --------------------------- |
| ⚛️**React**         | 19.0.0  | UI Framework                |
| ⚡**Vite**            | 6.2.0   | Build Tool & Dev Server     |
| 🎨**Tailwind CSS**    | 4.0.14  | Utility-First CSS Framework |
| 🌸**DaisyUI**         | 5.0.6   | UI Component Library        |
| 🎭**Material-UI**     | 7.0.1   | React Components            |
| 🔄**Redux Toolkit**   | 2.8.1   | State Management            |
| 📡**Axios**           | 1.8.4   | HTTP Client                 |
| 🎯**React Router**    | 7.3.0   | Client-side Routing         |
| 📊**Chart Libraries** | Latest  | Data Visualization          |
| 🎬**Framer Motion**   | 12.9.2  | Animations                  |

### 🔧 Backend Technologies

| Technology                 | Version | Purpose               |
| -------------------------- | ------- | --------------------- |
| 🟢**Node.js**        | Latest  | Runtime Environment   |
| 🚂**Express.js**     | 4.21.2  | Web Framework         |
| 🍃**MongoDB**        | Latest  | NoSQL Database        |
| 📦**Mongoose**       | 8.12.1  | MongoDB ODM           |
| 🔑**JSON Web Token** | 9.0.2   | Authentication        |
| 🔒**bcryptjs**       | 3.0.2   | Password Hashing      |
| 📧**Nodemailer**     | 6.10.0  | Email Service         |
| 📝**Winston**        | 3.17.0  | Logging               |
| 🍪**Cookie Parser**  | 1.4.7   | Cookie Handling       |
| 🌐**CORS**           | 2.8.5   | Cross-Origin Requests |

### 🐳 DevOps & Deployment

| Technology                   | Purpose                        |
| ---------------------------- | ------------------------------ |
| 🐳**Docker**           | Containerization               |
| 🐙**Docker Compose**   | Multi-container Management     |
| 🌐**Nginx**            | Reverse Proxy & Load Balancing |
| ⚙️**GitHub Actions** | CI/CD Pipeline                 |
| 📊**Monitoring Tools** | Application Monitoring         |

---

## 🔐 Authentication & Security

### JWT Token Management System

Progress Pulse implements a **robust dual-token authentication system** for enhanced security:

#### 🎯 Access Token Workflow

- **Lifespan**: 15 minutes (short-lived for security)
- **Storage**: localStorage (easily accessible for API calls)
- **Usage**: Sent with every API request in Authorization header
- **Auto-renewal**: Automatically refreshed when expired

#### 🔄 Refresh Token Workflow

- **Lifespan**: 7 days (long-lived for convenience)
- **Storage**: httpOnly cookies (XSS protection)
- **Usage**: Used only to generate new access tokens
- **Rotation**: New refresh token issued on each renewal

### 🛡️ Security Features Implemented

✅ **Password Security**

- bcryptjs hashing with salt rounds
- Strong password policy enforcement
- Password reset with OTP verification

✅ **Token Security**

- JWT with RS256 algorithm
- Token expiration and rotation
- Secure cookie settings (httpOnly, secure, sameSite)

✅ **API Security**

- CORS configuration for trusted domains
- Rate limiting middleware
- Input validation and sanitization
- SQL injection prevention

✅ **Authentication Flow**

- OTP-based email verification
- Multi-step authentication process
- Automatic token refresh mechanism
- Secure session management

---

## 🐳 CI/CD Pipeline & Docker Architecture

### 🔄 Continuous Integration/Continuous Deployment

Our project implements a **streamlined CI/CD pipeline** using Docker containerization for consistent deployments across environments.

```mermaid
flowchart LR
    A["👨‍💻 Developer<br/>(Code Changes)"] --> B["📚 Git Repository<br/>(Version Control)"]
    B --> C["🔄 GitHub Actions<br/>(CI/CD Pipeline)"]
    C --> D["🧪 Automated Tests<br/>(Unit & Integration)"]
    D --> E["🏗️ Build Docker Images<br/>(Frontend & Backend)"]
    E --> F["📦 Container Registry<br/>(Docker Hub)"]
    F --> G["🚀 Production Deploy<br/>(Container Orchestration)"]
    
    H["🐳 Development Environment<br/>(Docker Compose)"] --> I["🔧 Backend Container<br/>(Node.js + Express)"]
    H --> J["🎨 Frontend Container<br/>(React + Vite)"]
    I --> K["🗄️ Database<br/>(MongoDB)"]
    
    L["🏭 Production Environment<br/>(Docker Compose)"] --> M["🔧 Backend Container<br/>(Production Build)"]
    L --> N["🎨 Frontend Container<br/>(Nginx + React)"]
    M --> O["🗄️ Production Database<br/>(MongoDB Cloud)"]
    
    style A fill:#e3f2fd,stroke:#0d47a1,stroke-width:2px
    style C fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    style G fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    style H fill:#fff8e1,stroke:#e65100,stroke-width:2px
    style L fill:#f1f8e9,stroke:#33691e,stroke-width:2px
```

### 🐳 Docker Configuration

#### 📁 Development Environment

```yaml
# DevOps/01.Build/Development/docker-compose.yml
version: "3.9"

services:
  backend:
    build:
      context: ../../../Server
      dockerfile: ../DevOps/01.Build/Development/backend.Dockerfile
    container_name: backend
    networks:
      - mern-network
    volumes:
      - backend_data:/app
    env_file:
      - ../../../Server/.env

  frontend:
    build:
      context: ../../../Client
      dockerfile: ../DevOps/01.Build/Development/frontend.Dockerfile
    container_name: frontend
    ports:
      - "5173:5173"
    networks:
      - mern-network
    volumes:
      - frontend_data:/app
    depends_on:
      - backend

networks:
  mern-network:
    driver: bridge

volumes:
  backend_data:
  frontend_data:
```

#### 🚀 Production Environment

```yaml
# DevOps/01.Build/Production/docker-compose.yml
version: "3.9"

services:
  backend:
    build:
      context: ../../../Server
      dockerfile: ../DevOps/01.Build/Production/backend.Dockerfile
    container_name: backend
    networks:
      - mern-network
    ports:
      - "3000:3000"
    env_file:
      - ../../../Server/.env

  frontend:
    build:
      context: ../../../Client
      dockerfile: ../DevOps/01.Build/Production/frontend.Dockerfile
    container_name: frontend
    ports:
      - "80:80"  # Nginx serves on port 80
    networks:
      - mern-network
    depends_on:
      - backend

networks:
  mern-network:
    driver: bridge
```

### 🏗️ Build Process Pipeline

1. **🔍 Code Analysis** - ESLint and code quality checks
2. **🧪 Test Phase** - Unit and integration tests
3. **🏗️ Build Phase** - Create optimized Docker images
4. **📦 Release Phase** - Tag and push to container registry
5. **🚀 Deploy Phase** - Deploy to target environment

### 🛠️ DevOps Directory Structure

```
DevOps/
├── 01.Build/              # Build configurations
│   ├── Development/       # Development environment
│   │   ├── backend.Dockerfile
│   │   ├── frontend.Dockerfile
│   │   ├── docker-compose.yml
│   │   └── Steps.md
│   └── Production/        # Production environment
│       ├── backend.Dockerfile
│       ├── frontend.Dockerfile
│       ├── docker-compose.yml
│       └── nginx.conf
├── 02.Test/              # Testing configurations
├── 03.Release/           # Release management
└── 04.Deploy/            # Deployment scripts
```

---

## 📊 Feature Modules Deep Dive

### 🎯 Habit Tracking Module

**Comprehensive habit management system** to build positive daily routines:

#### 🔧 Core Features

- **📝 Custom Habit Creation** - Set personalized habits with specific goals
- **✅ Daily Progress Tracking** - Mark habits complete with streak counters
- **📊 Visual Analytics** - Interactive charts showing progress over time
- **🎖️ Streak Management** - Track consistency and build momentum
- **📈 Performance Insights** - Weekly, monthly, and yearly reports
- **🔔 Smart Reminders** - Customizable notification system
- **🏆 Achievement System** - Milestone rewards and badges

#### 🛤️ API Endpoints

```javascript
// Habit Management Routes
GET    /api/v1/dashboard/habit              // Get all user habits
POST   /api/v1/dashboard/habit/table-entry  // Create new habit
PUT    /api/v1/dashboard/habit/settings     // Update habit settings
DELETE /api/v1/dashboard/habit/:id          // Delete specific habit
GET    /api/v1/dashboard/habit/dashboard    // Get habit analytics
GET    /api/v1/dashboard/habit/table-view   // Get habit history
```

### 💰 Expense Management Module

**Complete financial tracking system** for personal expense management:

#### 🔧 Core Features

- **💳 Quick Expense Entry** - Fast expense logging with categories
- **🏷️ Smart Categorization** - Custom categories with auto-suggestions
- **📊 Spending Analysis** - Detailed spending patterns and trends
- **💹 Budget Management** - Set monthly/weekly budgets with alerts
- **📱 Receipt Management** - Digital receipt storage and OCR
- **🔍 Advanced Filtering** - Search and filter by date, category, amount
- **📈 Financial Insights** - Cash flow analysis and forecasting

#### 🛤️ API Endpoints

```javascript
// Expense Management Routes
GET    /api/v1/dashboard/expense              // Get all expenses
POST   /api/v1/dashboard/expense/table-entry  // Add new expense
PUT    /api/v1/dashboard/expense/:id          // Update expense
DELETE /api/v1/dashboard/expense/:id          // Delete expense
GET    /api/v1/dashboard/expense/dashboard    // Get expense analytics
GET    /api/v1/dashboard/expense/categories   // Get expense categories
```

### 📈 Investment Portfolio Module

**Advanced investment tracking and portfolio management**:

#### 🔧 Core Features

- **📊 Portfolio Overview** - Real-time portfolio valuation
- **📈 Performance Tracking** - ROI calculations and performance metrics
- **🔔 Price Alerts** - Automated notifications for price changes
- **📱 Market Integration** - Real-time market data and updates
- **📋 Transaction History** - Complete investment transaction log
- **📊 Asset Allocation** - Visual portfolio distribution
- **💹 Risk Analysis** - Portfolio risk assessment and recommendations

#### 🛤️ API Endpoints

```javascript
// Investment Management Routes
GET    /api/v1/dashboard/investment              // Get portfolio overview
POST   /api/v1/dashboard/investment/table-entry  // Add investment
PUT    /api/v1/dashboard/investment/:id          // Update investment
DELETE /api/v1/dashboard/investment/:id          // Delete investment
GET    /api/v1/dashboard/investment/performance  // Get performance data
GET    /api/v1/dashboard/investment/alerts       // Manage price alerts
```

---

## 🚀 Getting Started

### 📋 Prerequisites

Before running Progress Pulse, ensure you have:

- 🟢 **Node.js** (v18 or higher)
- 🐳 **Docker** & Docker Compose
- 🍃 **MongoDB** (local or cloud instance)
- 📧 **Email Service** configuration (Gmail/SendGrid)

### 🔧 Installation & Setup

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/Progress-Pulse.git
cd Progress-Pulse
```

#### 2️⃣ Environment Configuration

**Server Environment Variables** (Server/.env)

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/progress-pulse
DB_NAME=progress_pulse

# JWT Configuration
JWT_SECRET_KEY=your-super-secure-jwt-secret-key-here
REFRESH_TOKEN_SECRET_KEY=your-super-secure-refresh-secret-key
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Email Service Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Client Environment Variables** (Client/.env)

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Progress Pulse
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_NOTIFICATIONS=true
```

#### 3️⃣ Development Setup Options

**🖥️ Manual Setup (Traditional Development)**

```bash
# Install server dependencies
cd Server
npm install

# Install client dependencies
cd ../Client
npm install

# Start MongoDB (if running locally)
mongod

# Start the backend server (in Server directory)
npm run dev

# Start the frontend development server (in Client directory)
npm run dev
```

**🐳 Docker Setup (Recommended)**

```bash
# Development Environment
cd DevOps/01.Build/Development
docker-compose up --build

# Production Environment  
cd DevOps/01.Build/Production
docker-compose up --build -d
```

#### 4️⃣ Access the Application

- **🎨 Frontend (Development)**: http://localhost:5173
- **🎨 Frontend (Production)**: http://localhost
- **🔧 Backend API**: http://localhost:3000
- **📚 API Health Check**: http://localhost:3000/api/health

---

## 📱 Application Screenshots & Demo

<div align="center">

### 🏠 Homepage & Landing

![Homepage Demo](Client/public/Dashboard.png)
*Clean and modern landing page with feature highlights*

### 📊 Dashboard Overview (Light Theme)

![Dashboard Light](Client/public/Dashboard.png)
*Comprehensive dashboard with habit, expense, and investment widgets*

### 🌙 Dashboard Overview (Dark Theme)

![Dashboard Dark](Client/public/Dashboard-Dark.png)
*Dark mode support for comfortable nighttime usage*

### 🎥 Video Demo

![Progress Pulse Demo](Client/public/Video/ProgressPulse.mp4)
*Complete application walkthrough and feature demonstration*

</div>

---

## 📄 Comprehensive API Documentation

### 🔐 Authentication Endpoints

| Method         | Endpoint                                       | Description                  | Auth Required |
| -------------- | ---------------------------------------------- | ---------------------------- | ------------- |
| **POST** | `/api/v1/users/registered`                   | User registration with email | ❌            |
| **POST** | `/api/v1/users/registered/verify-otp`        | OTP verification             | ❌            |
| **POST** | `/api/v1/users/loggedin`                     | User login                   | ❌            |
| **POST** | `/api/v1/users/loggedin/refresh-token`       | Refresh access token         | 🍪            |
| **GET**  | `/api/v1/dashboard/auto-login`               | Token validation             | ✅            |
| **POST** | `/api/v1/users/logout`                       | User logout                  | ✅            |
| **POST** | `/api/v1/users/forgot-password-verification` | Password reset request       | ❌            |

### 🎯 Dashboard & User Management

| Method        | Endpoint                      | Description             | Auth Required |
| ------------- | ----------------------------- | ----------------------- | ------------- |
| **GET** | `/api/v1/dashboard`         | Get user dashboard data | ✅            |
| **PUT** | `/api/v1/dashboard/profile` | Update user profile     | ✅            |
| **GET** | `/api/v1/dashboard/stats`   | Get user statistics     | ✅            |

### 📊 Feature-Specific API Routes

**Habit Tracking Routes**

- `GET /api/v1/dashboard/habit` - Retrieve all habits
- `POST /api/v1/dashboard/habit/table-entry` - Create new habit
- `PUT /api/v1/dashboard/habit/settings` - Update habit configuration
- `GET /api/v1/dashboard/habit/table-view` - Get habit history
- `GET /api/v1/dashboard/habit/dashboard` - Habit analytics

**Expense Management Routes**

- `GET /api/v1/dashboard/expense` - Retrieve all expenses
- `POST /api/v1/dashboard/expense/table-entry` - Add expense
- `PUT /api/v1/dashboard/expense/:id` - Update expense
- `DELETE /api/v1/dashboard/expense/:id` - Delete expense

**Investment Portfolio Routes**

- `GET /api/v1/dashboard/investment` - Portfolio overview
- `POST /api/v1/dashboard/investment/table-entry` - Add investment
- `PUT /api/v1/dashboard/investment/:id` - Update investment
- `DELETE /api/v1/dashboard/investment/:id` - Remove investment

---

## 🛠️ Development Guidelines & Best Practices

### 📁 Project Structure Standards

```
Progress-Pulse/
├── 📁 Client/                    # Frontend React Application
│   ├── src/
│   │   ├── components/           # Reusable UI Components
│   │   │   ├── Authentication/   # Auth-related components
│   │   │   ├── Dashboard/        # Dashboard modules
│   │   │   └── Homepage/         # Landing page components
│   │   ├── Context/              # React Context Providers
│   │   ├── pages/                # Route-based page components
│   │   ├── services/             # Redux store & API services
│   │   ├── layouts/              # Layout wrapper components
│   │   └── utils/                # Utility functions & helpers
│   ├── public/                   # Static assets & media
│   └── DevOps configs            # Vite, ESLint, Tailwind
├── 📁 Server/                    # Backend Node.js Application
│   ├── controllers/              # Route handler logic
│   ├── models/                   # MongoDB schema models
│   ├── middlewares/              # Express middleware functions
│   ├── routes/                   # API endpoint definitions
│   ├── db/                       # Database connection setup
│   └── utils/                    # Server utility functions
├── 📁 DevOps/                    # Deployment & CI/CD
│   ├── 01.Build/                 # Docker configurations
│   ├── 02.Test/                  # Testing setup
│   ├── 03.Release/               # Release management
│   └── 04.Deploy/                # Deployment scripts
└── 📁 Scripts/                   # Database utility scripts
```

### 🧪 Testing Strategy

```bash
# Frontend Testing
cd Client
npm run test              # Run unit tests
npm run test:coverage     # Generate coverage report
npm run test:e2e          # End-to-end tests

# Backend Testing  
cd Server
npm run test              # Run unit tests
npm run test:integration  # Integration tests
npm run test:watch        # Watch mode for development

# Full Application Testing
npm run test:full         # Run all test suites
```

### 🏗️ Build & Deployment

```bash
# Development Build
npm run dev               # Start development servers

# Production Build
npm run build            # Build both client and server
npm run build:client     # Build frontend only
npm run build:server     # Build backend only

# Docker Commands
docker-compose up         # Start development environment
docker-compose -f DevOps/01.Build/Production/docker-compose.yml up -d
```

---

## 🐛 Troubleshooting Guide

### 🔧 Common Issues & Solutions

#### 🐳 Docker-Related Issues

**Issue: Port Already in Use**

```bash
# Find and kill processes using required ports
lsof -ti:3000 | xargs kill -9  # Kill backend processes
lsof -ti:5173 | xargs kill -9  # Kill frontend processes

# Alternative: Use different ports
export PORT=3001  # For backend
export VITE_PORT=5174  # For frontend
```

**Issue: Container Won't Start**

```bash
# Check container logs for errors
docker logs backend
docker logs frontend

# Rebuild containers from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up
```

**Issue: Volume Permission Problems**

```bash
# Fix volume permissions (Linux/macOS)
sudo chown -R $USER:$USER .
docker-compose down
docker volume prune  # Remove unused volumes
docker-compose up --build
```

#### 🔌 Database Connection Issues

**Issue: MongoDB Connection Failed**

```bash
# Check MongoDB service status
sudo systemctl status mongod

# Start MongoDB service
sudo systemctl start mongod

# Verify connection string in .env
MONGODB_URI=mongodb://localhost:27017/progress-pulse

# Test connection manually
mongosh mongodb://localhost:27017/progress-pulse
```

**Issue: Database Authentication Error**

```javascript
// Update connection string with credentials
MONGODB_URI=mongodb://username:password@localhost:27017/progress-pulse?authSource=admin
```

#### 🌐 API & Network Issues

**Issue: Frontend Can't Reach Backend**

```javascript
// Check Vite proxy configuration (vite.config.js)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

**Issue: CORS Errors**

```javascript
// Server CORS configuration (Server/src/app.js)
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));
```

#### 🔐 Authentication Problems

**Issue: JWT Token Errors**

```bash
# Clear localStorage and cookies
localStorage.clear()
document.cookie.split(";").forEach(cookie => {
  document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

# Verify JWT secrets match between client and server
# Check .env files for consistency
```

**Issue: Email OTP Not Sending**

```javascript
// Verify email configuration in Server/.env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password  // Not regular password!

// Generate App Password for Gmail:
// Google Account → Security → 2-Step Verification → App Passwords
```

---

## 🤝 Contributing to Progress Pulse

We welcome contributions from developers of all skill levels! Here's how you can contribute:

### 🚀 Getting Started with Contributions

1. **🍴 Fork the Repository**

   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/your-username/Progress-Pulse.git
   cd Progress-Pulse
   ```
2. **🌿 Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/issue-description
   ```
3. **🔧 Set Up Development Environment**

   ```bash
   # Install dependencies
   cd Client && npm install
   cd ../Server && npm install

   # Copy environment files
   cp Server/.env.example Server/.env
   cp Client/.env.example Client/.env
   ```

### 📋 Development Standards

#### ✅ Code Quality Requirements

- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Use consistent code formatting
- **TypeScript**: Add type definitions where applicable
- **Comments**: Write clear, meaningful comments
- **Tests**: Include tests for new features

#### 🎯 Commit Message Convention

```bash
# Format: type(scope): description
git commit -m "feat(habit): add streak counter functionality"
git commit -m "fix(auth): resolve token refresh issue"
git commit -m "docs(readme): update installation instructions"

# Types: feat, fix, docs, style, refactor, test, chore
```

#### 📝 Pull Request Process

1. **Update Documentation**: Update README if needed
2. **Add Tests**: Ensure new features have appropriate tests
3. **Run Quality Checks**:
   ```bash
   npm run lint      # Check code quality
   npm run test      # Run all tests
   npm run build     # Verify builds work
   ```
4. **Write Clear PR Description**: Explain what, why, and how

### 🎯 Contribution Areas

#### 🐛 Bug Fixes

- Check [Issues](https://github.com/your-username/Progress-Pulse/issues) for bugs
- Reproduce the issue locally
- Create tests that demonstrate the fix
- Submit PR with clear description

#### ✨ New Features

- Discuss major features in [Discussions](https://github.com/your-username/Progress-Pulse/discussions)
- Create feature branch
- Implement with proper tests
- Update documentation
- Submit PR for review

#### 📚 Documentation

- Improve README clarity
- Add code comments
- Create tutorials or guides
- Update API documentation
- Fix typos or formatting

#### 🧪 Testing

- Add unit tests
- Improve test coverage
- Add integration tests
- Create end-to-end tests
- Performance testing

### 🏆 Recognition

Contributors will be recognized in:

- **README Contributors Section**
- **GitHub Contributors Graph**
- **Release Notes** for significant contributions
- **Special Mentions** in project updates

---

## 📊 Performance & Monitoring

### 🚀 Performance Optimizations Implemented

#### Frontend Optimizations

- **⚡ Code Splitting**: Dynamic imports with React.lazy()
- **🗜️ Bundle Optimization**: Vite's advanced tree-shaking
- **📦 Caching Strategy**: Proper HTTP caching headers
- **🖼️ Image Optimization**: WebP format with fallbacks
- **🔄 Request Optimization**: Debouncing and request batching
- **📱 Progressive Web App**: Service worker for offline capability

#### Backend Optimizations

- **🗄️ Database Indexing**: Optimized MongoDB indexes
- **📊 Query Optimization**: Efficient aggregation pipelines
- **🔄 Connection Pooling**: MongoDB connection pool management
- **💾 Caching Layer**: Redis integration for frequently accessed data
- **📈 Response Compression**: Gzip compression for API responses

### 📈 Monitoring & Analytics

#### Application Monitoring

```javascript
// Performance metrics tracked:
- API response times
- Database query performance
- Error rates and types
- User interaction patterns
- Resource usage statistics
```

#### Logging Strategy

```javascript
// Winston logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({stack: true}),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({filename: 'logs/error.log', level: 'error'}),
    new winston.transports.File({filename: 'logs/combined.log'}),
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'
    })
  ]
});
```

---

## 🌟 Project Roadmap & Future Enhancements

### 📅 Phase 1: Foundation (Completed ✅)

- ✅ User authentication system with JWT
- ✅ Basic habit tracking functionality
- ✅ Expense management system
- ✅ Investment portfolio tracking
- ✅ Docker containerization
- ✅ CI/CD pipeline setup

### 📅 Phase 2: Enhancement (In Progress 🚧)

- 🚧 Mobile responsive design improvements
- 🚧 Advanced analytics and reporting
- 🚧 Email notification system
- 🚧 Export functionality (PDF, CSV)
- 🚧 Dark mode implementation
- 🚧 Performance optimizations

### 📅 Phase 3: Advanced Features (Planned 📋)

- 📋 Mobile application (React Native)
- 📋 Real-time collaboration features
- 📋 AI-powered insights and recommendations
- 📋 Third-party integrations (bank APIs, fitness trackers)
- 📋 Advanced security features (2FA, biometric auth)
- 📋 Multi-language support

### 📅 Phase 4: Scale & Optimize (Future 🔮)

- 🔮 Microservices architecture
- 🔮 Advanced caching strategies
- 🔮 Machine learning recommendations
- 🔮 Enterprise features
- 🔮 API monetization
- 🔮 White-label solutions

---

## 📄 License & Legal

### 📜 MIT License

```
MIT License

Copyright (c) 2024 Progress Pulse

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Team & Acknowledgments

### 💼 Development Team

<table>
<tr>
<td align="center">
<img src="https://github.com/your-username.png" width="100px;" alt=""/><br />
<b>Lead Developer</b><br />
<a href="https://github.com/your-username">@your-username</a>
</td>
<td align="center">
<img src="https://github.com/designer-username.png" width="100px;" alt=""/><br />
<b>UI/UX Designer</b><br />
<a href="https://github.com/designer-username">@designer</a>
</td>
<td align="center">
<img src="https://github.com/devops-username.png" width="100px;" alt=""/><br />
<b>DevOps Engineer</b><br />
<a href="https://github.com/devops-username">@devops</a>
</td>
</tr>
</table>

### 🙏 Special Thanks & Acknowledgments

- **Open Source Community** for incredible tools and libraries
- **MERN Stack Contributors** for robust development frameworks
- **Docker Team** for containerization excellence
- **Modern Web Technologies** that make development enjoyable
- **All Contributors** who helped improve Progress Pulse
- **Beta Testers** for valuable feedback and bug reports

### 🏆 Technology Credits

- **⚛️ React Team** - For the amazing frontend framework
- **🟢 Node.js Foundation** - For the powerful runtime environment
- **🍃 MongoDB Team** - For the flexible database solution
- **🐳 Docker Inc** - For containerization technology
- **🎨 Tailwind CSS** - For the utility-first CSS framework
- **📊 Chart.js & ApexCharts** - For beautiful data visualizations

---

## 📞 Support & Community

### 🆘 Getting Help & Support

#### 💬 Community Channels

- **💡 GitHub Discussions**: [Join the conversation](https://github.com/your-username/Progress-Pulse/discussions)
- **🐛 Bug Reports**: [Report issues](https://github.com/your-username/Progress-Pulse/issues)
- **🚀 Feature Requests**: [Suggest improvements](https://github.com/your-username/Progress-Pulse/issues/new?template=feature_request.md)
- **📧 Direct Support**: support@progress-pulse.com

#### 📚 Resources & Documentation

- **🔗 Live Demo**: [Try Progress Pulse](https://progress-pulse-demo.com)
- **📖 Developer Docs**: [API Documentation](https://docs.progress-pulse.com)
- **🎥 Video Tutorials**: [YouTube Channel](https://youtube.com/progress-pulse)
- **📝 Blog**: [Latest Updates](https://blog.progress-pulse.com)

#### 🤝 Community Guidelines

- **Be Respectful**: Treat all community members with respect
- **Stay On Topic**: Keep discussions relevant to Progress Pulse
- **Help Others**: Share knowledge and help fellow developers
- **Follow Code of Conduct**: Maintain a positive, inclusive environment

### 📈 Project Statistics

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/your-username/Progress-Pulse?style=social)
![GitHub forks](https://img.shields.io/github/forks/your-username/Progress-Pulse?style=social)
![GitHub issues](https://img.shields.io/github/issues/your-username/Progress-Pulse)
![GitHub pull requests](https://img.shields.io/github/issues-pr/your-username/Progress-Pulse)
![GitHub license](https://img.shields.io/github/license/your-username/Progress-Pulse)
![GitHub last commit](https://img.shields.io/github/last-commit/your-username/Progress-Pulse)
![GitHub contributors](https://img.shields.io/github/contributors/your-username/Progress-Pulse)

</div>

---

<div align="center">

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=your-username/Progress-Pulse&type=Date)](https://star-history.com/#your-username/Progress-Pulse&Date)

---

### 💝 Show Your Support

**If Progress Pulse has helped you become more productive or manage your finances better, please consider:**

⭐ **Starring this repository** to show your appreciation
🍴 **Forking and contributing** to help improve the project
📢 **Sharing with friends** who might benefit from Progress Pulse
☕ **Sponsoring development** to support ongoing improvements

---

## 🎉 Thank You!

**Progress Pulse** is made possible by the amazing open source community and contributors who believe in building better productivity tools for everyone.

*Made with ❤️ for developers, by developers*

**Happy tracking! 📊✨**




</div>
