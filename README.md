# Backend - License Plate Monitoring System

## Overview
This is the backend service for a license plate monitoring system. It provides a RESTful API for managing license plate detections, cameras, cities, departments, and user authentication.

## Tech Stack
- Node.js
- Express.js
- MySQL (via Sequelize ORM)
- JWT for authentication
- Bcrypt for password hashing

## Project Structure
```
backend/
├── models/              # Database models
│   ├── camaras.js      # Camera model
│   ├── ciudad.js       # City model
│   ├── departamento.js # Department model
│   ├── detecciones.js  # License plate detections model
│   ├── usuarios.js     # User model
│   └── init-models.js  # Model initialization
├── placas/             # Frontend static files
├── index.js            # Main application file
└── package.json        # Project dependencies
```

## Database Models
- **Detecciones**: Stores license plate detection records
- **Camaras**: Manages camera information
- **Ciudad**: City information
- **Departamento**: Department information
- **Usuarios**: User accounts and authentication

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check authentication status

### License Plates
- `GET /api/get-plates` - Get license plate detections
  - Query parameters:
    - `idRegistro`: Specific record ID
    - `repetirRegistros`: Boolean to show repeated records
    - `fechaInicio`: Start date
    - `fechaFinal`: End date

### Cities
- `GET /api/get-cities` - Get list of cities with departments

## Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes with authentication middleware
- HTTP-only cookies for token storage

## Environment Variables
Create a `.env` file with the following variables (do not commit this file to version control):
```
SECRET_JWT=your_jwt_secret
DB_HOST=your_database_host
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
```

## Installation
1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your environment variables

3. Start the server:
```bash
node index.js
```

The server runs on port 3000 by default.

## Dependencies
- express: ^4.18.3
- sequelize: ^6.37.1
- mysql2: ^3.9.2
- bcryptjs: ^2.4.3
- jsonwebtoken: ^9.0.2
- cors: ^2.8.5
- dotenv: ^16.4.5
- cookie-parser: ^1.4.6
