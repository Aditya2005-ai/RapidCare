import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { getPendingRequests, approveBedRequest, rejectBedRequest, getBedStatus } from '../services/bedService';

export const RequestApproval = ({ hospitalId }) => {
  const [requests, setRequests] = useState([]);
  const [bedStats, setBedStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBedType, setSelectedBedType] = useState('general');
  const [selectedBedNumber, setSelectedBedNumber] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      const reqResult = await getPendingRequests(hospitalId);
      const bedResult = await getBedStatus(hospitalId);
      
      if (reqResult.success) setRequests(reqResult.data);
      if (bedResult.success) setBedStats(bedResult.data);
      
      setLoading(false);
    };
    fetchData();
  }, [hospitalId]);

  const handleApprove = async (request) => {
    const result = await approveBedRequest(request.id, hospitalId, selectedBedType, selectedBedNumber);
    if (result.success) {
      setRequests(requests.filter(r => r.id !== request.id));
      alert('Request approved! Patient notified.');
    }
  };

  const handleReject = async (request) => {
    const reason = prompt('Reason for rejection:');
    if (reason) {
      const result = await rejectBedRequest(request.id, reason);
      if (result.success) {
        setRequests(requests.filter(r => r.id !== request.id));
        alert('Request rejected.');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Bed Requests</h2>
        <p className="text-gray-600 mt-1">Approve or reject patient bed requests</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Clock size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No pending requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-gray-600 text-sm">Patient Name</p>
                  <p className="font-semibold text-gray-800">{request.patientName}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Bed Type Requested</p>
                  <p className="font-semibold text-gray-800 capitalize">{request.bedType}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Symptoms</p>
                  <p className="font-semibold text-gray-800">{request.symptoms || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Requested At</p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Bed Selection for Approval */}
              <div className="bg-blue-50 p-4 rounded mb-4 space-y-4">
                <h4 className="font-semibold text-blue-900">Select Bed to Assign:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bed Type</label>
                    <select
                      value={selectedBedType}
                      onChange={(e) => setSelectedBedType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="general">General</option>
                      <option value="icu">ICU</option>
                      <option value="oxygen">Oxygen</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Beds</label>
                    <select
                      value={selectedBedNumber}
                      onChange={(e) => setSelectedBedNumber(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {bedStats && bedStats[selectedBedType].beds
                        .filter(b => !b.isOccupied)
                        .map(b => (
                          <option key={b.bedNumber} value={b.bedNumber}>
                            Bed {b.bedNumber}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => handleApprove(request)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Approve
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleReject(request)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <XCircle size={20} />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestApproval;
