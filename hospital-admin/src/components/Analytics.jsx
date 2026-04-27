import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { getBedStatus } from '../services/bedService';

export const Analytics = ({ hospitalId }) => {
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

  const OccupancyCard = ({ type, stats }) => {
    const occupancyRate = Math.round((stats.occupied / stats.total) * 100);
    
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 capitalize mb-4">{type} Beds</h3>
        
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Occupancy Rate</span>
            <span className="text-lg font-bold text-gray-800">{occupancyRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${occupancyRate}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            <p className="text-xs text-gray-600">Available</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
            <p className="text-xs text-gray-600">Occupied</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-600">{stats.total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp size={32} />
          Analytics & Reports
        </h2>
        <p className="text-gray-600 mt-1">Hospital occupancy and bed usage statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bedStats && (
          <>
            <OccupancyCard type="General" stats={bedStats.general} />
            <OccupancyCard type="ICU" stats={bedStats.icu} />
            <OccupancyCard type="Oxygen" stats={bedStats.oxygen} />
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={24} />
          Overall Statistics
        </h3>
        
        {bedStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">
                {bedStats.general.total + bedStats.icu.total + bedStats.oxygen.total}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Beds</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-600">
                {bedStats.general.occupied + bedStats.icu.occupied + bedStats.oxygen.occupied}
              </p>
              <p className="text-sm text-gray-600 mt-1">Occupied</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {bedStats.general.available + bedStats.icu.available + bedStats.oxygen.available}
              </p>
              <p className="text-sm text-gray-600 mt-1">Available</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">
                {Math.round(
                  ((bedStats.general.occupied + bedStats.icu.occupied + bedStats.oxygen.occupied) /
                    (bedStats.general.total + bedStats.icu.total + bedStats.oxygen.total)) *
                    100
                )}%
              </p>
              <p className="text-sm text-gray-600 mt-1">Overall Occupancy</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
