# FPTU Lost & Found System

Complete full-stack application for FPTU Lost & Found Tracking System with 40 APIs.

## 🚀 Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Swagger API Documentation

### Frontend
- React 18 + Vite
- Three.js + GSAP Animations
- React Router
- Axios

## 📁 Project Structure

```
SWP-TEST/
├── backend/          # Node.js Backend API
│   ├── src/
│   │   ├── models/      # 8 MongoDB models
│   │   ├── controllers/ # 8 controllers (40 APIs)
│   │   ├── routes/      # 8 route files
│   │   ├── middleware/  # Auth & validation
│   │   ├── services/    # Business logic
│   │   └── utils/       # Helpers
│   └── server.js
├── frontend/        # React Frontend
│   ├── src/
│   │   ├── api/         # API services
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React contexts
│   │   └── hooks/       # Custom hooks
│   └── vite.config.js
└── ảnh/            # Documentation
```

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Configure your .env
npm run dev
```

Backend runs on: http://localhost:5000
Swagger Docs: http://localhost:5000/api-docs

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3001

## 📡 API Endpoints

### 40 Complete APIs

- **Authentication** (4 APIs) - Register, Login, Refresh, Logout
- **Lost Items** (6 APIs) - Create, Read, Update, Delete, Search, My Reports
- **Found Items** (6 APIs) - Create, Read, Update, Delete, Search, List
- **Upload** (2 APIs) - Upload Images, Delete Image
- **Matching** (5 APIs) - Suggestions, Confirm, Reject, List, Resolve
- **Returns** (5 APIs) - Create, Detail, My Transactions, List, Update
- **Reports** (7 APIs) - Dashboard, Category, Campus, Monthly, Weekly, Statistics, Export
- **Users** (5 APIs) - Profile, Update Profile, Change Password, List, Update

## 🔐 Authentication

JWT-based authentication with role-based access control:
- Student
- Staff
- Security
- Admin

## 📚 Documentation

- Backend API: Swagger UI at `/api-docs`
- Frontend: React components with TypeScript-ready structure

## 🎨 Features

- ✅ 40 Complete APIs
- ✅ JWT Authentication
- ✅ Role-based Authorization
- ✅ File Upload Support
- ✅ MongoDB Integration
- ✅ Swagger Documentation
- ✅ React Frontend with Animations
- ✅ Three.js & GSAP Effects
- ✅ Video Background
- ✅ Responsive Design

## 📄 License

ISC

## 👥 Contributors

FPTU Development Team

