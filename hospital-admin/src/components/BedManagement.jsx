import React, { useState, useEffect } from 'react';
import { Bed, Plus, Minus, Save } from 'lucide-react';
import { getBedStatus, updateBedStatus } from '../services/bedService';

export const BedManagement = ({ hospitalId }) => {
  const [bedStats, setBedStats] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
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

  const handleToggleBed = async (bedType, bedNumber) => {
    const bed = bedStats[bedType].beds[bedNumber - 1];
    await updateBedStatus(hospitalId, bedType, bedNumber, !bed.isOccupied, null);
    
    // Refresh beds
    const result = await getBedStatus(hospitalId);
    if (result.success) {
      setBedStats(result.data);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const BedGrid = ({ type, beds }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 capitalize">{type} Beds</h3>
        <div className="text-sm text-gray-600">
          Available: <span className="font-bold text-green-600">{beds.available}</span> / {beds.total}
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {beds.beds.map((bed) => (
          <button
            key={bed.bedNumber}
            onClick={() => handleToggleBed(type, bed.bedNumber)}
            className={`p-3 rounded-lg font-semibold transition transform hover:scale-105 ${
              bed.isOccupied
                ? 'bg-red-500 text-white'
                : 'bg-green-500 text-white'
            }`}
          >
            <Bed size={20} className="mx-auto mb-1" />
            <span className="text-xs">{bed.bedNumber}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Bed Management</h2>
        <p className="text-gray-600 mt-1">Click bed to mark as occupied/available</p>
      </div>

      <div className="flex gap-4 border-b">
        {['general', 'icu', 'oxygen'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium transition ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {bedStats && <BedGrid type={activeTab} beds={bedStats[activeTab]} />}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Legend:</h4>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded"></div>
            <span>Occupied</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BedManagement;
