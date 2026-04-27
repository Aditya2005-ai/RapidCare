#!/bin/bash
# RapidCare - Automated Setup Script
# Run this after extracting the zip file

set -e

echo "🚀 RapidCare Setup Script"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js is not installed. Please install from: https://nodejs.org${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js detected: $(node --version)${NC}"
echo ""

# Step 1: Install Patient App
echo -e "${BLUE}Step 1: Setting up Patient App (RapidCare)${NC}"
cd rapidcare
echo "Installing dependencies..."
npm install --silent
echo -e "${GREEN}✓ Patient app ready${NC}"
echo ""

# Step 2: Install Hospital Admin
cd ..
echo -e "${BLUE}Step 2: Setting up Hospital Admin Panel${NC}"
cd hospital-admin
echo "Installing dependencies..."
npm install --silent
echo -e "${GREEN}✓ Hospital admin ready${NC}"
echo ""

# Step 3: Firebase Setup Instructions
cd ..
echo -e "${BLUE}Step 3: Firebase Configuration${NC}"
echo -e "${YELLOW}⚠️  ACTION REQUIRED:${NC}"
echo "1. Go to https://firebase.google.com"
echo "2. Create a new project named 'RapidCare'"
echo "3. Enable: Firestore, Realtime DB, Authentication, Storage"
echo "4. Copy credentials from Project Settings"
echo "5. Create 'hospital-admin/.env.local' with your credentials"
echo ""

cat > hospital-admin/.env.local.example << 'EOF'
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
EOF

echo -e "${GREEN}✓ Created hospital-admin/.env.local.example${NC}"
echo ""

# Step 4: Create run script
echo -e "${BLUE}Step 4: Creating startup scripts${NC}"

# For Linux/Mac
cat > run-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting RapidCare..."
echo "📱 Patient App: http://localhost:5173"
echo "🏥 Admin Panel: http://localhost:5174"
echo ""

# Start patient app
cd rapidcare
npm run dev &
PATIENT_PID=$!

# Start admin panel
cd ../hospital-admin
npm run dev &
ADMIN_PID=$!

# Wait for both
wait $PATIENT_PID $ADMIN_PID
EOF

chmod +x run-dev.sh

# For Windows
cat > run-dev.bat << 'EOF'
@echo off
echo 🚀 Starting RapidCare...
echo 📱 Patient App: http://localhost:5173
echo 🏥 Admin Panel: http://localhost:5174
echo.

start cmd /k "cd rapidcare && npm run dev"
start cmd /k "cd hospital-admin && npm run dev"

echo Waiting for servers to start...
timeout /t 3
echo Setup complete! Both servers running.
EOF

echo -e "${GREEN}✓ Created run-dev scripts${NC}"
echo ""

# Step 5: Summary
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ RapidCare Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📱 Patient App (Port 5173)${NC}"
echo "   Location: rapidcare/"
echo "   Command: npm run dev"
echo ""
echo -e "${BLUE}🏥 Hospital Admin (Port 5174)${NC}"
echo "   Location: hospital-admin/"
echo "   Command: npm run dev"
echo "   Note: Requires Firebase setup first"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Setup Firebase (see instructions above)"
echo "2. Copy credentials to hospital-admin/.env.local"
echo ""
echo -e "${YELLOW}To start development:${NC}"
echo "  Linux/Mac: ./run-dev.sh"
echo "  Windows:   run-dev.bat"
echo ""
echo "  Or manually:"
echo "    Terminal 1: cd rapidcare && npm run dev"
echo "    Terminal 2: cd hospital-admin && npm run dev"
echo ""
echo -e "${BLUE}📖 Documentation:${NC}"
echo "  - IMPLEMENTATION_GUIDE.md (Complete technical guide)"
echo "  - DELIVERY_SUMMARY.md (Quick start)"
echo "  - hospital-admin/README.md (Admin panel setup)"
echo ""
