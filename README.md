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

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Development
```bash
npm run dev
```

### 4. Production
```bash
npm start
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