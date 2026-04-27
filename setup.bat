@echo off
REM RapidCare - Automated Setup Script for Windows
REM Run this after extracting the zip file

setlocal enabledelayedexpansion

echo.
echo 🚀 RapidCare Setup Script for Windows
echo ======================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Node.js is not installed.
    echo Please download from: https://nodejs.org
    pause
    exit /b 1
)

echo ✓ Node.js detected: 
node --version
echo.

REM Step 1: Install Patient App
echo 📱 Step 1: Setting up Patient App (RapidCare)
cd rapidcare
echo Installing dependencies...
call npm install --silent
echo ✓ Patient app ready
echo.
cd ..

REM Step 2: Install Hospital Admin
echo 🏥 Step 2: Setting up Hospital Admin Panel
cd hospital-admin
echo Installing dependencies...
call npm install --silent
echo ✓ Hospital admin ready
echo.
cd ..

REM Step 3: Firebase Setup Instructions
echo 🔧 Step 3: Firebase Configuration
echo.
echo ⚠️  ACTION REQUIRED:
echo 1. Go to https://firebase.google.com
echo 2. Create a new project named 'RapidCare'
echo 3. Enable: Firestore, Realtime DB, Authentication, Storage
echo 4. Copy credentials from Project Settings
echo 5. Create 'hospital-admin\.env.local' with your credentials
echo.

REM Create .env.local.example
(
echo VITE_FIREBASE_API_KEY=YOUR_API_KEY
echo VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
echo VITE_FIREBASE_PROJECT_ID=your-project-id
echo VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
echo VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
echo VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
echo VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
) > hospital-admin\.env.local.example

echo ✓ Created hospital-admin\.env.local.example
echo.

REM Step 4: Create run script
echo 📋 Step 4: Creating startup scripts
(
echo @echo off
echo echo 🚀 Starting RapidCare...
echo echo 📱 Patient App: http://localhost:5173
echo echo 🏥 Admin Panel: http://localhost:5174
echo echo.
echo echo Opening terminal windows...
echo start cmd /k "cd rapidcare && npm run dev"
echo start cmd /k "cd hospital-admin && npm run dev"
echo.
echo echo Servers starting in new windows...
echo pause
) > run-dev.bat

echo ✓ Created run-dev.bat
echo.

REM Final Summary
echo.
echo ===================================================
echo ✓ RapidCare Setup Complete!
echo ===================================================
echo.
echo 📱 Patient App (Port 5173)
echo    Location: rapidcare\
echo    Command: npm run dev
echo.
echo 🏥 Hospital Admin (Port 5174)
echo    Location: hospital-admin\
echo    Command: npm run dev
echo    Note: Requires Firebase setup first
echo.
echo 📝 Next Steps:
echo 1. Setup Firebase (see instructions above)
echo 2. Copy credentials to hospital-admin\.env.local
echo.
echo 🚀 To start development:
echo    Option 1: Double-click run-dev.bat
echo    Option 2: Manual setup:
echo      Terminal 1: cd rapidcare ^&^& npm run dev
echo      Terminal 2: cd hospital-admin ^&^& npm run dev
echo.
echo 📖 Documentation:
echo    - IMPLEMENTATION_GUIDE.md (Complete technical guide)
echo    - DELIVERY_SUMMARY.md (Quick start)
echo    - hospital-admin\README.md (Admin panel setup)
echo.
pause
