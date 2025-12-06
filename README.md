# 🕳️ BoketesPR - Boketes Tracker for Puerto Rico

A mobile-first web application for reporting and tracking boketes across Puerto Rico. Built with React, TypeScript, Firebase, and Mapbox.

![BoketesPR Screenshot](https://via.placeholder.com/800x400?text=BoketesPR+Screenshot)

## ✨ Features

- 📸 **Photo Capture** - Take photos of potholes with automatic GPS extraction from EXIF
- 🗺️ **Interactive Map** - View all reported potholes on a Mapbox-powered map
- 📍 **Geolocation** - Automatic location detection with manual adjustment
- 👍 **Upvoting** - Confirm potholes reported by others
- 🔐 **Authentication** - Email/password and Google sign-in
- 📱 **Mobile-First** - Optimized for iOS and Android browsers
- 🌙 **Dark Theme** - Beautiful dark UI design

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account
- Mapbox account

### Installation

1. **Clone the repository**
   ```bash
   cd "Pothole App"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_MAPBOX_TOKEN=your_mapbox_token
   ```

4. **Set up Firebase**
   
   In Firebase Console, enable:
   - Authentication (Email/Password, Google)
   - Firestore Database
   - Storage

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   
   Visit `http://localhost:5173`

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS
- **State**: Zustand
- **Maps**: Mapbox GL JS, react-map-gl
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Routing**: React Router v6

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/       # Navigation, Header
│   ├── map/          # MapView, MiniMap
│   ├── pothole/      # PotholeCard, ReportForm
│   └── ui/           # Button, Card, Badge, etc.
├── hooks/            # useAuth, useGeolocation, usePotholes
├── lib/              # Firebase, Mapbox config, utilities
├── pages/            # MapPage, ListPage, ReportPage, etc.
├── store/            # Zustand store
├── types/            # TypeScript types
├── App.tsx           # Main app component
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## 🔥 Firebase Setup

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /potholes/{potholeId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /potholes/{userId}/{imageId} {
      allow read: if true;
      allow write: if request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## 📱 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

### Deploy to Vercel

```bash
vercel --prod
```

## 🇵🇷 Made for Puerto Rico

This app is specifically designed for use in Puerto Rico, with:
- Map bounds restricted to PR
- Spanish language UI
- Optimized for local road conditions

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

Built with ❤️ for Puerto Rico's roads

