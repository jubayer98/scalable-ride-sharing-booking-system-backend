# Ride Booking API

A secure, scalable, and role-based backend API for a ride booking system (similar to Uber or Pathao) built with Node.js, Express.js, TypeScript, and MongoDB.

## Table of Contents
- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [User Management](#user-management)
  - [Ride Management](#ride-management)
  - [Driver Management](#driver-management)
  - [Admin Functions](#admin-functions)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Design Considerations](#design-considerations)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

This project provides a comprehensive backend solution for a ride booking platform where:
- **Riders** can request rides, cancel rides, and view ride history
- **Drivers** can accept/reject rides, update ride status, manage availability, and track earnings
- **Admins** can manage users, approve drivers, generate reports, and oversee the entire system

The API implements role-based access control, secure authentication, and follows RESTful conventions to ensure a robust and scalable architecture.

## Technology Stack

| Category       | Tools                                  |
|----------------|----------------------------------------|
| Runtime        | Node.js                                |
| Framework      | Express.js                             |
| Language       | TypeScript                             |
| Database       | MongoDB with Mongoose ODM              |
| Security       | JWT, bcrypt                            |
| Validation     | Zod                                    |
| Others         | cors, cookie-parser, dotenv, nodemailer |

## Features

### 🔐 Authentication
- JWT-based authentication with refresh tokens
- Secure password hashing using bcrypt
- Password reset functionality via email
- Role-based access control (admin, rider, driver)

### 🧍 Rider Functionality
- Create and manage user accounts
- Request rides with pickup and destination locations
- Cancel rides (before driver acceptance)
- View complete ride history
- Access user profile

### 🚗 Driver Functionality
- Complete driver profile with vehicle information
- Set online/offline availability status
- View available ride requests
- Accept or reject ride requests
- Update ride status (picked up → in transit → completed)
- Track earnings history

### 👨‍💼 Admin Functionality
- Promote/demote users between rider and driver roles
- Approve or suspend drivers
- Block/unblock user accounts
- Generate comprehensive system reports
- View all users and ride data

## API Endpoints

### Authentication

#### Register User
```http
POST /api/v1/user/register
```

**Request Body:**
```json
{
    "name": "Robert Max",
    "email": "robert@cityshare.com",
    "password": "Cityshare@123"
}
```

**Response:**
```json
{
    "statusCode": 201,
    "message": "User created successfully",
    "success": true,
    "data": {
        "name": "Robert Max",
        "email": "robert@cityshare.com",
        "role": "rider",
        "isDeleted": false,
        "isActive": "ACTIVE",
        "isVerified": true,
        "_id": "688a09fb50bf81d995a0f104",
        "createdAt": "2025-07-30T12:03:07.003Z",
        "updatedAt": "2025-07-30T12:03:07.003Z"
    }
}
```

#### Login
```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
    "email": "robert@cityshare.com",
    "password": "Cityshare@123"
}
```

**Response:**
```json
{
    "statusCode": 200,
    "message": "User logged in successfully",
    "success": true,
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "_id": "688a09fb50bf81d995a0f104",
            "name": "Robert Max",
            "email": "robert@cityshare.com",
            "role": "rider",
            "isDeleted": false,
            "isActive": "ACTIVE",
            "isVerified": true,
            "createdAt": "2025-07-30T12:03:07.003Z",
            "updatedAt": "2025-07-30T12:03:07.003Z"
        }
    }
}
```

#### Logout
```http
POST /api/v1/auth/logout
```

#### Refresh Token
```http
POST /api/v1/auth/refresh-token
```

#### Change Password
```http
POST /api/v1/auth/change-password
```

#### Forgot Password
```http
POST /api/v1/auth/forgot-password
```

#### Reset Password
```http
POST /api/v1/auth/reset-password
```

### User Management

#### Get User Profile
```http
GET /api/v1/user/me
```

**Response:**
```json
{
    "statusCode": 200,
    "message": "User profile retrieved successfully",
    "success": true,
    "data": {
        "_id": "688a09fb50bf81d995a0f104",
        "name": "Robert Max",
        "email": "robert@cityshare.com",
        "role": "rider",
        "isDeleted": false,
        "isActive": "ACTIVE",
        "isVerified": true,
        "createdAt": "2025-07-30T12:03:07.003Z",
        "updatedAt": "2025-07-30T12:03:07.003Z"
    }
}
```

### Ride Management

#### Request Ride
```http
POST /api/v1/ride/request
```

**Request Body:**
```json
{
  "pickupLocation": {
    "lat": 23.793540,
    "lng": 90.404478,
    "address": "Jatrabari, Dhaka"
  },
  "destinationLocation": {
    "lat": 23.806018,
    "lng": 90.365417,
    "address": "Gulistan, Dhaka"
  }
}
```

**Response:**
```json
{
    "statusCode": 201,
    "message": "Ride requested",
    "success": true,
    "data": {
        "rider": "688a0c8450bf81d995a0f115",
        "pickupLocation": {
            "lat": 23.79354,
            "lng": 90.404478,
            "address": "Jatrabari, Dhaka"
        },
        "destinationLocation": {
            "lat": 23.806018,
            "lng": 90.365417,
            "address": "Gulistan, Dhaka"
        },
        "status": "requested",
        "timestamps": {
            "requested": "2025-07-30T12:17:47.805Z"
        },
        "_id": "688a0d6b50bf81d995a0f11f",
        "createdAt": "2025-07-30T12:17:47.812Z",
        "updatedAt": "2025-07-30T12:17:47.812Z"
    }
}
```

#### Cancel Ride
```http
PATCH /api/v1/ride/cancel/{rideId}
```

#### Ride History
```http
GET /api/v1/ride/history
```

**Response:**
```json
{
    "statusCode": 200,
    "message": "Ride history fetched",
    "success": true,
    "data": [
        {
            "timestamps": {
                "requested": "2025-07-30T12:24:35.337Z"
            },
            "_id": "688a0f0350bf81d995a0f12f",
            "rider": "688a0c8450bf81d995a0f115",
            "pickupLocation": {
                "lat": 23.79354,
                "lng": 90.404478,
                "address": "Gulshan, Dhaka"
            },
            "destinationLocation": {
                "lat": 23.806018,
                "lng": 90.365417,
                "address": "Banani, Dhaka"
            },
            "status": "requested",
            "createdAt": "2025-07-30T12:24:35.339Z",
            "updatedAt": "2025-07-30T12:24:35.339Z"
        },
        {
            "timestamps": {
                "requested": "2025-07-30T12:17:47.805Z",
                "cancelled": "2025-07-30T12:23:36.423Z"
            },
            "_id": "688a0d6b50bf81d995a0f11f",
            "rider": "688a0c8450bf81d995a0f115",
            "pickupLocation": {
                "lat": 23.79354,
                "lng": 90.404478,
                "address": "Jatrabari, Dhaka"
            },
            "destinationLocation": {
                "lat": 23.806018,
                "lng": 90.365417,
                "address": "Gulistan, Dhaka"
            },
            "status": "cancelled",
            "createdAt": "2025-07-30T12:17:47.812Z",
            "updatedAt": "2025-07-30T12:23:36.425Z"
        }
    ]
}
```

### Driver Management

#### Update Driver Profile
```http
PATCH /api/v1/driver/profile
```

**Request Body:**
```json
{
    "make": "Toyota",
    "model": "Corolla",
    "year": 2018,
    "licensePlate": "ABC-1234"
}
```

**Response:**
```json
{
    "statusCode": 200,
    "message": "Driver profile updated successfully",
    "success": true,
    "data": {
        "_id": "688a09fb50bf81d995a0f104",
        "name": "Robert Max",
        "email": "robert@cityshare.com",
        "approvalStatus": "approved",
        "isOnline": false,
        "vehicleInfo": {
            "make": "Toyota",
            "model": "Corolla",
            "year": 2018,
            "licensePlate": "ABC-1234"
        },
        "earningsHistory": [],
        "createdAt": "2025-07-30T12:33:37.999Z",
        "updatedAt": "2025-07-30T12:35:29.604Z"
    }
}
```

#### Update Availability
```http
PATCH /api/v1/driver/availability
```

**Request Body:**
```json
{
  "isOnline": true
}
```

#### View Available Rides
```http
GET /api/v1/driver/available-rides
```

**Response:**
```json
{
    "statusCode": 200,
    "message": "Available rides retrieved successfully",
    "success": true,
    "data": [
        {
            "timestamps": {
                "requested": "2025-07-30T12:24:35.337Z"
            },
            "_id": "688a0f0350bf81d995a0f12f",
            "rider": "688a0c8450bf81d995a0f115",
            "pickupLocation": {
                "lat": 23.79354,
                "lng": 90.404478,
                "address": "Gulshan, Dhaka"
            },
            "destinationLocation": {
                "lat": 23.806018,
                "lng": 90.365417,
                "address": "Banani, Dhaka"
            },
            "status": "requested",
            "createdAt": "2025-07-30T12:24:35.339Z",
            "updatedAt": "2025-07-30T12:24:35.339Z"
        }
    ],
    "meta": {
        "total": 1
    }
}
```

#### Respond to Ride
```http
POST /api/v1/driver/ride/respond
```

**Request Body (Accept):**
```json
{
  "rideId": "688a0f0350bf81d995a0f12f",
  "action": "accept"
}
```

**Request Body (Reject):**
```json
{
  "rideId": "688a0f0350bf81d995a0f12f",
  "action": "reject"
}
```

#### Update Ride Status
```http
PATCH /api/v1/driver/ride/status
```

**Request Body (Picked Up):**
```json
{
  "rideId": "688a12de54ffe335763ec6dc",
  "status": "picked_up"
}
```

**Request Body (Completed):**
```json
{
  "rideId": "688a12de54ffe335763ec6dc",
  "status": "completed",
  "amount": 300
}
```

#### Earnings History
```http
GET /api/v1/driver/earnings
```

**Response:**
```json
{
    "statusCode": 200,
    "message": "Earnings history retrieved",
    "success": true,
    "data": [
        {
            "rideId": "688a12de54ffe335763ec6dc",
            "amount": 300,
            "completedAt": "2025-07-30T13:22:07.799Z"
        },
        {
            "rideId": "688a0f0350bf81d995a0f12f",
            "amount": 500,
            "completedAt": "2025-07-30T13:25:24.719Z"
        }
    ]
}
```

### Admin Functions

#### Promote User to Driver
```http
POST /api/v1/user/{userId}
```

**Request Body:**
```json
{
    "role": "driver"
}
```

#### Get All Users
```http
GET /api/v1/user/all-users
```

#### Get Single User
```http
GET /api/v1/user/{userId}
```

#### Generate Report
```http
GET /api/v1/user/report
```

**Response:**
```json
{
    "statusCode": 200,
    "message": "User report generated successfully",
    "success": true,
    "data": {
        "totalUsers": 4,
        "activeUsers": 4,
        "blockedUsers": 0,
        "deletedUsers": 0,
        "verifiedUsers": 4,
        "unverifiedUsers": 0
    }
}
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Clone the Repository
```bash
git clone https://github.com/jubayer98/scalable-ride-sharing-booking-system-backend.git
cd scalable-ride-sharing-booking-system-backend
```

### Install Dependencies
```bash
npm install
```

### Environment Variables
Create a `.env` file in the root directory and add the following environment variables:

```env
PORT=4000
DB_URL=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_URL>/<DB_NAME>?retryWrites=true&w=majority&appName=<APP_NAME>
NODE_ENV=development
FRONTEND_URL=https://<your-frontend-url>.com

# JWT
JWT_ACCESS_SECRET=<ACCESS_SECRET>
JWT_ACCESS_EXPIRATION=1d
JWT_REFRESH_SECRET=<REFRESH_SECRET>
JWT_REFRESH_EXPIRATION=7d

# BCRYPT
BCRYPT_SALT_ROUNDS=10

# INITIAL ADMIN
INITIAL_ADMIN_EMAIL=<admin-email@example.com>
INITIAL_ADMIN_PASSWORD=<AdminPassword123>

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=<your-email@gmail.com>
SMTP_PASS=<your-app-password>
SMTP_FROM=<your-email@gmail.com>
```

### Run the Application
```bash
# Development mode
npm run dev
```

## Usage

### Testing with Postman
1. Import the provided Postman collection
2. Set up environment variables for base URL and authentication tokens
3. Follow the API flow:
   - Register a new user
   - Login to get access and refresh tokens
   - Use the access token in the Authorization header for protected routes
   - Explore different endpoints based on user roles

### Authentication Flow
1. Register a new user account (default role: rider)
2. Login with email and password to receive access and refresh tokens
3. Use the access token in the Authorization header: `Authorization: Bearer <access_token>`
4. When the access token expires, use the refresh token to get a new access token

## Project Structure

```
src/app
├── modules/
│   ├── auth/           # Authentication controllers and routes
│   ├── user/           # User management controllers and routes
│   ├── driver/         # Driver management controllers and routes
│   └── ride/           # Ride management controllers and routes
├── middlewares/        # Custom middleware functions
├── config/             # Configuration files
├── utils/              # Utility functions
├── errorHelpers/       # Global error handling
├── routes/             # Handle all the relavent routes
├── interfaces/         # Set global interfaces
├── app.ts              # Express app configuration
└── server.ts           # Server entry point
```

## Design Considerations

### Ride Request & Fulfillment
- Ride requests are manually matched with drivers through the "Available Rides" endpoint
- Drivers can view all requested rides and choose to accept or reject
- Riders can cancel rides only before a driver has accepted
- If no driver accepts a ride within a certain timeframe, the ride remains in the system until canceled
- Pickup and destination locations are stored with both coordinates and formatted addresses

### Ride Lifecycle & Status
Rides progress through the following statuses:
1. `requested` - Initial state when a rider requests a ride
2. `accepted` - Driver has accepted the ride request
3. `picked_up` - Driver has picked up the rider
4. `in_transit` - Ride is in progress
5. `completed` - Ride has finished and payment is processed
6. `cancelled` - Ride was canceled by rider or driver

Each status change is timestamped for tracking and analytics.

### Role Representation
- Single User model with a `role` field (rider, driver, admin)
- Drivers have additional fields in a separate Driver collection:
  - `approvalStatus` (pending, approved, suspended)
  - `isOnline` (availability status)
  - `vehicleInfo` (make, model, year, license plate)
  - `earningsHistory` (array of completed rides with amounts)

### Validations & Business Rules
- Suspended drivers cannot accept rides
- Drivers can only accept one ride at a time
- Riders cannot have multiple active rides simultaneously
- Ride cancellation is restricted to certain statuses
- Password strength requirements enforced during registration

### Access & Visibility
- Riders can view all their past rides
- Drivers can see available rides and their completed ride history
- Admins have full visibility into all system data
- Role-based route protection ensures users can only access appropriate endpoints

## Future Enhancements

1. **Driver Ratings & Reviews**
   - Implement a rating system for riders to rate drivers
   - Allow drivers to review riders

2. **Fare Estimation**
   - Add dynamic fare calculation based on distance, time, and demand
   - Implement surge pricing during peak hours

3. **Real-time Tracking**
   - Integrate WebSockets for real-time location tracking
   - Provide live ride updates to riders and drivers

4. **Payment Processing**
   - Integrate payment gateways for seamless transactions
   - Support multiple payment methods (cards, digital wallets)

5. **Advanced Analytics**
   - Build comprehensive admin dashboard with analytics
   - Generate detailed reports on ride trends, driver performance, and revenue

6. **Geolocation Features**
   - Implement proximity-based ride matching
   - Add geofencing for specific areas or zones

7. **Notification System**
   - Implement push notifications for ride updates
   - Add SMS/email notifications for critical events

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
