# Mini Admin Panel Backend

 Node.js/Express backend for user management with cryptographic security and Protocol Buffer integration.

##  Architecture

```
src/
├── controllers/     # Business logic separation
├── services/        # Core business services  
├── models/          # Data layer abstraction
├── middleware/      # Reusable middleware
├── routes/          # API route definitions
├── utils/           # Helper functions
├── config/          # Configuration management
├── app.js           # Express app setup
└── server.js        # Server entry point
```

##  Features

- **Express Setup** - Production-ready configuration
- **Security Middleware** - Helmet, CORS, Rate Limiting
- **Comprehensive Logging** - Winston with structured logging
- **API Documentation** - Swagger/OpenAPI integration
- **Unit Testing** - Jest with comprehensive test coverage
- **Code Quality** - Prettier for consistent formatting
- **Error Handling** - Centralized error management
- **Environment Config** -  configuration management

##  Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite3** - Lightweight database
- **Jest** - Testing framework
- **Swagger** - API documentation

##  Prerequisites

- Node.js (v18 or higher)
- npm or yarn

##  Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. PostgreSQL Setup
```bash
# Install PostgreSQL (if not already installed)
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql postgresql-contrib
# Windows: Download from https://www.postgresql.org/download/

# Create database
createdb mini_admin_panel
```

### 3. Environment Setup
```bash
cp .env.example .env
# Edit .env with your PostgreSQL configuration
```

### 4. Development
```bash
npm run dev
```

### 5. Production
```bash
npm start
```

## 🚀 CI/CD Pipeline

This project includes a comprehensive CI/CD pipeline with GitHub Actions:

### 🔧 **Automated Checks**
- **Code Quality**: ESLint with professional rules
- **Code Formatting**: Prettier for consistent style
- **Testing**: Jest with PostgreSQL integration
- **Coverage**: Test coverage reporting
- **Build**: Application packaging

### 📊 **Pipeline Features**
- **Multi-Environment**: Test, Quality, Build, Deploy jobs
- **PostgreSQL Service**: Automated database testing
- **Artifact Management**: Build artifacts for deployment
- **Professional Standards**: Industry best practices

### 🧪 **Local Testing**
```bash
# Run all quality checks
npm run precommit

# Run tests with coverage
npm run test:coverage

# Format and lint code
npm run format && npm run lint
```

##  Testing

### Run Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

##  API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health

##  Development Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run format` - Format code with Prettier

##  Code Quality

This project follows  development practices:

- **Consistent Formatting** - Prettier configuration
- **Comprehensive Testing** - Unit tests for all services
- **Logging** - Structured logging with Winston
- **Security First** - Helmet, CORS, Rate limiting
- **API Documentation** - Swagger/OpenAPI integration
- **Error Handling** - Centralized error management

##  Next Steps

1. Database integration
2. User CRUD operations
3. Cryptographic implementation
4. Protocol Buffer integration
5. Frontend connection

---

**Developed by Joseph Ntwali**