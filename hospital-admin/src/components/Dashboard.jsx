import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Bed, AlertCircle } from 'lucide-react';
import { getBedStatus } from '../services/bedService';

export const Dashboard = ({ hospitalId }) => {
  const [bedStats, setBedStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBeds = async () => {
      const result = await getBedStatus(hospitalId);
      if (result.success) {
        setBedStats(result.data);
      }
      setLoading(false);
    };
    fetchBeds();
  }, [hospitalId]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const StatCard = ({ label, value, total, icon: Icon, color }) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}/{total}</p>
          <p className="text-xs text-gray-500 mt-1">
            Available: {total - value}
          </p>
        </div>
        <Icon className="text-gray-400" size={32} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Hospital Dashboard</h2>
        <p className="text-gray-600 mt-1">Real-time bed availability overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="General Beds"
          value={bedStats?.general?.occupied || 0}
          total={bedStats?.general?.total || 0}
          icon={Bed}
          color="border-blue-500"
        />
        <StatCard
          label="ICU Beds"
          value={bedStats?.icu?.occupied || 0}
          total={bedStats?.icu?.total || 0}
          icon={AlertCircle}
          color="border-red-500"
        />
        <StatCard
          label="Oxygen Beds"
          value={bedStats?.oxygen?.occupied || 0}
          total={bedStats?.oxygen?.total || 0}
          icon={Users}
          color="border-green-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 size={24} />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition">
            <p className="text-sm font-medium text-blue-900">Manage Beds</p>
          </button>
          <button className="bg-green-50 hover:bg-green-100 p-4 rounded-lg transition">
            <p className="text-sm font-medium text-green-900">Approve Requests</p>
          </button>
          <button className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition">
            <p className="text-sm font-medium text-purple-900">View Analytics</p>
          </button>
          <button className="bg-orange-50 hover:bg-orange-100 p-4 rounded-lg transition">
            <p className="text-sm font-medium text-orange-900">Hospital Settings</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
