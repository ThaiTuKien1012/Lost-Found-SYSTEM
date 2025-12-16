# FPTU Lost & Found System - Frontend

React frontend application for the FPTU Lost & Found Tracking System.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3001`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/              # API service files
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── context/         # React contexts
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utility functions
│   ├── styles/          # CSS files
│   ├── App.jsx          # Main app component
│   └── index.jsx        # Entry point
├── public/              # Static files
├── package.json
└── vite.config.js
```

## 🔧 Configuration

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=FPTU Lost & Found
```

## 📦 Features

- ✅ React 18 with Vite
- ✅ React Router for navigation
- ✅ Context API for state management
- ✅ Custom hooks for reusable logic
- ✅ API services for backend communication
- ✅ Protected routes
- ✅ Form handling and validation
- ✅ Responsive design
- ✅ Toast notifications

## 🎨 Styling

The app uses custom CSS with CSS variables for theming. All styles are in `src/styles/index.css`.

## 📱 Pages

- Login/Register
- Home Dashboard
- Lost Items
- Found Items
- Matching
- Reports
- Profile

## 🔐 Authentication

The app uses JWT tokens stored in localStorage. Protected routes require authentication.

## 📄 License

ISC

