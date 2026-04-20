# 🚨 RapidCare – Emergency Hospital Access System

India's fastest emergency hospital finder. Connects patients with nearby hospitals instantly during medical emergencies.

## ✨ Features

- **Emergency Mode** — One-tap search that contacts all hospitals within a user-defined radius (5–20 km) simultaneously
- **Live Animated Map** — Radar sweep animation shows hospitals being contacted in real time
- **Hospital Response System** — Simulated async responses; hospitals appear live as they accept/decline
- **Turn-by-Turn Navigation** — Route display with step-by-step directions to the selected hospital
- **Bed Availability Checker** — Check ICU, Ventilator, Oxygen, and General bed availability at any hospital
- **Hospital Dashboard** — Mock admin interface for hospitals to accept or decline incoming emergency requests
- **Mobile-First UI** — Designed for high-stress situations: large buttons, minimal steps, high contrast

## 🛠 Tech Stack

- **React 18** + **Vite** (frontend)
- **Pure CSS animations** (no extra libraries needed)
- **Simulated backend** (no server required — all API calls are mocked with realistic delays)
- Google Fonts: Poppins + Inter

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
# 1. Navigate into the project folder
cd rapidcare

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Then open your browser at: **http://localhost:5173**

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
rapidcare/
├── public/
│   └── favicon.svg          # App icon
├── src/
│   ├── main.jsx             # React entry point
│   └── App.jsx              # Full application (single-file architecture)
├── index.html               # HTML shell
├── vite.config.js           # Vite configuration
├── package.json             # Dependencies & scripts
└── README.md                # This file
```

## 🗺 App Screens

| Tab | Description |
|-----|-------------|
| **Home** | Landing page, location display, radius slider, emergency button |
| **Emergency** | Live radar map, hospital contact progress, accepted hospital list, navigation |
| **Beds** | Hospital + resource type selector, real-time availability check |
| **Dashboard** | Hospital admin view to accept/decline incoming requests |

## 🏥 Simulated Hospitals (New Delhi)

The app includes 6 simulated hospitals with realistic data:
- AIIMS Delhi
- Apollo Hospital Delhi
- Safdarjung Hospital
- Max Super Speciality
- Fortis Escorts Heart Institute
- RML Hospital

## 🔌 Simulated API Endpoints (Mock)

| Function | Description |
|----------|-------------|
| `simulateEmergencyRequest(hospital, radius)` | Simulates a hospital accepting/declining an emergency request |
| `simulateBedAvailability(hospital, bedType)` | Returns bed count, availability, and wait time |

## 🎨 Design System

| Token | Color | Usage |
|-------|-------|-------|
| Emergency Red | `#E53935` | Emergency buttons, alerts |
| Healthcare Blue | `#1E88E5` | Primary UI, navigation |
| Availability Green | `#43A047` | Available beds, accepted status |
| Warning Orange | `#FB8C00` | Wait times, caution states |
| Background | `#F5F7FA` | App background |
| Text | `#263238` | Body text |

## 📞 Emergency Contacts (India)

- **112** — National Emergency Number
- **108** — Ambulance
- **102** — Medical Emergency

---

Built with ❤️ for faster emergency healthcare access in India.
