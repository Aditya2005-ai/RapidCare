import React, { useState, useEffect } from 'react';
import { Menu, LogOut, Settings, LayoutDashboard, Bed, ClipboardList, BarChart3, AlertCircle } from 'lucide-react';
import Dashboard from '../components/Dashboard';
import BedManagement from '../components/BedManagement';
import RequestApproval from '../components/RequestApproval';
import Analytics from '../components/Analytics';
import { getCurrentAdmin, logoutAdmin } from '../services/authService';
import { initializeBeds } from '../services/bedService';
import toast, { Toaster } from 'react-hot-toast';

const AdminDashboard = ({ userId, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hospitalData, setHospitalData] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [bedsInitialized, setBedsInitialized] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [bedCounts, setBedCounts] = useState({ general: 50, icu: 20, oxygen: 30 });

  useEffect(() => {
    const fetchHospitalData = async () => {
      const result = await getCurrentAdmin(userId);
      if (result.success) {
        setHospitalData(result.data);
        setBedsInitialized(result.data.bedsInitialized || false);
      }
    };
    fetchHospitalData();
  }, [userId]);

  const handleInitializeBeds = async () => {
    const result = await initializeBeds(userId, bedCounts);
    if (result.success) {
      toast.success('Beds initialized successfully!');
      setBedsInitialized(true);
      setShowSetupModal(false);
    } else {
      toast.error(result.error || 'Failed to initialize beds');
    }
  };

  const handleLogout = async () => {
    const result = await logoutAdmin();
    if (result.success) {
      toast.success('Logged out successfully');
      setTimeout(() => onLogout(), 1000);
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'beds', label: 'Bed Management', icon: Bed },
    { id: 'requests', label: 'Bed Requests', icon: ClipboardList },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'beds':
        return <BedManagement hospitalId={userId} />;
      case 'requests':
        return <RequestApproval hospitalId={userId} />;
      case 'analytics':
        return <Analytics hospitalId={userId} />;
      default:
        return <Dashboard hospitalId={userId} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />

      {/* Setup Modal */}
      {showSetupModal && !bedsInitialized && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Initialize Hospital Beds</h2>
            <p className="text-gray-600 mb-6">Set the number of beds for each category</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">General Beds</label>
                <input
                  type="number"
                  value={bedCounts.general}
                  onChange={(e) => setBedCounts({...bedCounts, general: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ICU Beds</label>
                <input
                  type="number"
                  value={bedCounts.icu}
                  onChange={(e) => setBedCounts({...bedCounts, icu: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Oxygen Beds</label>
                <input
                  type="number"
                  value={bedCounts.oxygen}
                  onChange={(e) => setBedCounts({...bedCounts, oxygen: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>
            </div>

            <button
              onClick={handleInitializeBeds}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
            >
              Initialize Beds
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {hospitalData?.name || 'Hospital'}
            </h1>
            <p className="text-gray-600 text-sm">{hospitalData?.address}</p>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {!bedsInitialized && (
              <button
                onClick={() => setShowSetupModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <AlertCircle size={20} />
                Setup Beds
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>

          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
        {/* Sidebar */}
        <div className={`${showMobileMenu ? 'block' : 'hidden'} md:block md:col-span-1`}>
          <nav className="bg-white rounded-lg shadow p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="md:col-span-4">
          <div className="bg-white rounded-lg shadow p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
