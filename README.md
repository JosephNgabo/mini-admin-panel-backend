### Mini Admin Panel Backend

##### Backend API for Mini Admin Panel, built with Node.js/Express and PostgreSQL.
##### Provides user management, analytics, cryptography, and protobuf export, fully containerized with Docker.
##### This mini admin panel backend also includes GitHub Actions for automated builds and CI/CD workflows.

##  Features
```
- Health Check: GET /health
- API Documentation: GET /api-docs

User Management (CRUD):

- POST /api/users → Create user
- GET /api/users → List users
- GET /api/users/:id → Get user by ID
- PUT /api/users/:id → Update user
- DELETE /api/users/:id → Delete user
Analytics & Stats:

- GET /api/users/stats → User statistics
- GET /api/users/chart → User creation chart
- Protobuf Export: GET /api/users/export → Export users in protobuf format
- Cryptography: SHA-384 hashing + RSA signatures
```

## Tech Stack
```
- Node.js & Express
- PostgreSQL
- Docker & Docker Compose
- SHA-384 & RSA-2048 for cryptography
- Protocol Buffers (protobufjs)
```

##  Prerequisites
```
- Node.js (v18 or higher)
- npm or yarn
```
##  Quick Start

### 1. Installation
```
git clone https://github.com/JosephNgabo/mini-admin-panel-backend.git
cd mini-admin-panel-backend
```

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

sample .ENV
```
# Server Configuration
PORT=3036
NODE_ENV=development

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mini_admin_panel
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### 4. Development
```bash
npm start
```
### 5. Build & run using Docker Compose
```bash
docker-compose up --build
```
This will start:
```
Backend API → http://localhost:3026
PostgreSQL Database → localhost:5432
```


## Notes / Assumptions

- PostgreSQL is used as the database. Docker-compose sets it up automatically for local development.
- The backend expects environment variables defined in `.env` (e.g., DB connection, secret keys).
- Crypto signature verification is performed in the frontend; invalid users are not displayed.
- Protocol Buffers export is mandatory and implemented at `/api/users/export`.
- On the frontend, All decoded users from the Protocal buffer export as shown in the table after clicking button of `Decode & Display Protocol Buffer`
  from the last section on pannel of PROTOCAL BUFFER
- A `docker-compose.yml` file is included in the backend root folder to easily spin up the backend, frontend, and PostgreSQL database together.
- GitHub Actions are included for CI checks (linting, type-check, and tests).





**Developed by Joseph Ntwali**
