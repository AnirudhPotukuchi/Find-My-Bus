# Find My Bus

<p align="center">
  <img src="public/logo.svg" width="120" alt="Find My Bus Logo" style="border-radius: 22px;" />
</p>

> A real-time Student Transport Tracking System designed for Chaitanya Bharathi Institute of Technology (CBIT) routes.

**Find My Bus** is an interactive, digital transit deck that allows students and drivers to share and monitor bus commutes in real-time. Designed with a clean, document-inspired editorial aesthetic (Notion visual style), it tracks route lines, locates schedule milestones, and renders live GPS signals on highly responsive map viewports.

---

## 🌟 Key Features

- **Real-Time Coordinates Sync**: Updates and synchronizes coordinates across all users instantly. Uses Firebase Realtime Database for cloud updates and falls back to browser tab `BroadcastChannel` streams if offline.
- **Exclusive Route Locking**: Leverages database-level transactions to ensure that only one session can broadcast coordinate streams for any given bus number at a time. Locks automatically expire after 20 seconds of inactivity.
- **Intelligent Timeline & ETAs**: Automatically calculates proximity to stop locations along the route, marks passed milestones, and triggers auto-termination of the GPS stream once the bus arrives within 100 meters of the CBIT campus.
- **Dual Map Engine**: Automatically connects to the **Mappls (MapMyIndia)** Web Vector SDK. Fallbacks seamlessly to **Leaflet.js** with theme-matching map tiles (CartoDB Light/Dark) if API limits or keys are unavailable.
- **Notion Visual Theme**: Redesigned utilizing humanist-geometric aesthetics, featuring a custom SVG wave transition brim, breakout mockup widgets, pastel active boards, and clean layout geometry.
- **Fully Responsive**: Optimized for touch targets and collapsible sidebar panels across wide desktop screens down to mobile viewports.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Styling**: Vanilla CSS (Notion Design Tokens System)
- **Database / Sync**: Firebase Realtime Database + Web `BroadcastChannel` API
- **Mapping APIs**: Leaflet.js, CartoDB Maps, Mappls Web Vector API SDK
- **Icons**: Lucide React Icons

---

## 🚀 Getting Started

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Installation
Clone the repository and install the npm dependencies:
```bash
git clone https://github.com/AnirudhPotukuchi/Find-My-Bus.git
cd find-my-bus
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory of the project and populate it with your Firebase database and Mappls credentials:
```env
# Firebase Realtime Database configuration
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_DATABASE_URL="your-database-url"

# MapMyIndia (Mappls) Developer API Key
VITE_MAPPLS_KEY="your-mappls-api-key"
```
*Note: If no Firebase configurations are provided, the system will automatically run in local sandbox mode, synchronizing GPS states locally across open browser tabs.*

### 4. Running Locally
Launch the local Vite development server:
```bash
npm run dev
```
Open the output URL (usually `http://localhost:5173`) in your browser to view the tracking deck.

### 5. Production Compilation
Generate the optimized production assets inside the `/dist` directory:
```bash
npm run build
```

---

## 📂 Project Architecture

```
find-my-bus/
├── public/                 # Static assets (including favicon/logo.svg)
├── src/
│   ├── assets/             # Asset files and schedule diagrams
│   ├── App.jsx             # Main application and views router
│   ├── App.css             # Supplementary layout tweaks
│   ├── BusMap.jsx          # Leaflet & Mappls Map integration component
│   ├── config.js           # Environment parameters validator
│   ├── firebase.js         # Firebase App instantiation
│   ├── index.css           # Notion Design System stylesheet
│   ├── main.jsx            # Application entrypoint
│   ├── routesData.js       # Official CBIT route stop names & coordinates
│   └── syncService.js      # Sync controller (Firebase or BroadcastChannel)
├── DESIGN.md               # Visual brand design specification
├── package.json            # NPM packages registry
└── vite.config.js          # Vite compiler settings
```

---

## 📄 License
Created by **Raghavendra Anirudh**. All rights reserved.
