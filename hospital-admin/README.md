# RapidCare Hospital Admin Panel

Complete hospital management system with real-time bed tracking and patient requests.

## 🚀 Setup Instructions

### 1. Firebase Configuration

1. Go to [firebase.google.com](https://firebase.google.com)
2. Create a new project
3. Enable these services:
   - Firestore Database
   - Realtime Database
   - Authentication (Email/Password)
   - Storage
4. Get your credentials from: **Project Settings → Service Accounts**

### 2. Environment Variables

Create `.env.local` file in `hospital-admin/` folder:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

Server will run on: **http://localhost:5174**

## 📁 Project Structure

```
hospital-admin/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx          # Hospital overview
│   │   ├── BedManagement.jsx      # Manage bed availability
│   │   ├── RequestApproval.jsx    # Approve/reject requests
│   │   └── Analytics.jsx          # Statistics & reports
│   ├── pages/
│   │   ├── LoginPage.jsx          # Hospital admin login
│   │   └── AdminDashboard.jsx     # Main admin interface
│   ├── services/
│   │   ├── firebaseConfig.js      # Firebase setup
│   │   ├── authService.js         # Authentication
│   │   ├── bedService.js          # Bed management
│   │   └── hospitalService.js     # Hospital operations
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎯 Features

### Phase 1 (Implemented)

✅ Hospital Admin Login/Register
✅ Dashboard with real-time bed status
✅ Bed Management (add, remove, update)
✅ Patient Request Approval/Rejection
✅ Analytics & Occupancy Reports

### Phase 2 (To Implement)

- QR Code Generation & Scanning
- Patient QR-based bed requests
- Real-time notifications

### Phase 3 (Future)

- Ambulance tracking
- Emergency SOS mode
- Patient profile management
- AI symptom suggestions

## 🔑 Key Functions

### Authentication

- `registerHospital(email, password, hospitalData)` - Register new hospital
- `loginHospital(email, password)` - Hospital admin login
- `getCurrentAdmin(userId)` - Get hospital details

### Bed Management

- `initializeBeds(hospitalId, bedsData)` - Setup initial bed counts
- `getBedStatus(hospitalId)` - Get current bed availability
- `updateBedStatus(hospitalId, bedType, bedNumber, isOccupied)` - Update bed status
- `listenToBedChanges(hospitalId, callback)` - Real-time bed updates

### Request Management

- `getPendingRequests(hospitalId)` - Get bed requests
- `approveBedRequest(requestId, hospitalId, bedType, bedNumber)` - Approve request
- `rejectBedRequest(requestId, reason)` - Reject request

## 📊 Firestore Schema

**Collection: hospitals**

```javascript
{
  hospitalId: string,
  name: string,
  email: string,
  phone: string,
  address: string,
  bedsInitialized: boolean,
  createdAt: timestamp
}
```

**Collection: bedRequests**

```javascript
{
  requestId: string,
  hospitalId: string,
  patientName: string,
  bedType: "general" | "icu" | "oxygen",
  status: "pending" | "approved" | "rejected",
  symptoms: string,
  createdAt: timestamp,
  approvedAt: timestamp,
  approvedBy: string
}
```

## 🛠️ Technologies

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore + Realtime DB)
- **Real-time**: Firebase Realtime Database + WebSockets
- **UI Components**: Lucide React Icons
- **Notifications**: React Hot Toast

## 📱 Responsive Design

- Mobile-first approach
- Responsive navigation
- Tablet & desktop optimized layouts
- Touch-friendly controls

## 🔐 Security

- Firebase Authentication
- Firestore Security Rules (configure in Firebase Console)
- Protected routes
- Session persistence

## 🚀 Deployment

### Vercel

```bash
npm run build
vercel
```

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

## 📞 Support

For issues or questions, check the [IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md)

---

**Built with ❤️ for emergency healthcare management**
