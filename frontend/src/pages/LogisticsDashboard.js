import React, { useState, useEffect } from 'react';
import { logisticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  TruckIcon, 
  CurrencyRupeeIcon, 
  ShoppingBagIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const LogisticsDashboard = () => {
  const { user } = useAuth();
  const [availableShipments, setAvailableShipments] = useState([]);
  const [myShipments, setMyShipments] = useState([]);
  const [earnings, setEarnings] = useState({ total_earnings: 0, pending_earnings: 0, completed_shipments: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [availableRes, myShipmentsRes, earningsRes] = await Promise.all([
        logisticsAPI.getAvailableShipments(),
        logisticsAPI.getMyShipments(),
        logisticsAPI.getEarnings()
      ]);
      setAvailableShipments(availableRes.data);
      setMyShipments(myShipmentsRes.data);
      setEarnings(earningsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const acceptShipment = async (shipmentId) => {
    try {
      await logisticsAPI.acceptShipment(shipmentId);
      toast.success('Shipment accepted successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to accept shipment');
    }
  };

  const updateShipmentStatus = async (shipmentId, status) => {
    try {
      await logisticsAPI.updateShipmentStatus(shipmentId, status);
      toast.success(`Shipment ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Logistics Dashboard</h1>
            <p className="text-gray-600">Manage your shipments and track earnings</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Company Status</p>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user?.logistics_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {user?.logistics_verified ? 'Verified' : 'Pending Verification'}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">₹{earnings.total_earnings.toLocaleString()}</p>
              </div>
              <CurrencyRupeeIcon className="h-10 w-10 text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed Shipments</p>
                <p className="text-2xl font-bold text-blue-600">{earnings.completed_shipments}</p>
              </div>
              <CheckCircleIcon className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Earnings</p>
                <p className="text-2xl font-bold text-yellow-600">₹{earnings.pending_earnings.toLocaleString()}</p>
              </div>
              <ClockIcon className="h-10 w-10 text-yellow-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-2 font-semibold ${activeTab === 'available' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
          >
            Available Shipments ({availableShipments.length})
          </button>
          <button
            onClick={() => setActiveTab('my-shipments')}
            className={`px-6 py-2 font-semibold ${activeTab === 'my-shipments' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
          >
            My Shipments ({myShipments.length})
          </button>
        </div>

        {/* Available Shipments Tab */}
        {activeTab === 'available' && (
          <div>
            {availableShipments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <TruckIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No available shipments</h3>
                <p className="text-gray-500">Check back later for new shipment requests</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {availableShipments.map(shipment => (
                  <div key={shipment.id} className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-gray-500">#{shipment.id}</span>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(shipment.status)}`}>
                            {shipment.status}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPinIcon className="h-4 w-4 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-semibold">Pickup:</p>
                              <p className="text-gray-600">{shipment.pickup_address}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPinIcon className="h-4 w-4 text-red-600 mt-0.5" />
                            <div>
                              <p className="font-semibold">Delivery:</p>
                              <p className="text-gray-600">{shipment.delivery_address}</p>
                            </div>
                          </div>
                          <div className="flex justify-between pt-2">
                            <span>Weight: {shipment.weight_kg} kg</span>
                            <span className="font-semibold text-green-600">₹{shipment.estimated_cost}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => acceptShipment(shipment.id)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 ml-4"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Shipments Tab */}
        {activeTab === 'my-shipments' && (
          <div>
            {myShipments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <ShoppingBagIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments yet</h3>
                <p className="text-gray-500">Accept shipments to see them here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myShipments.map(shipment => (
                  <div key={shipment.id} className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-gray-500">#{shipment.id}</span>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(shipment.status)}`}>
                            {shipment.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            Customer: {shipment.Customer?.name}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPinIcon className="h-4 w-4 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-semibold">Pickup:</p>
                              <p className="text-gray-600">{shipment.pickup_address}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPinIcon className="h-4 w-4 text-red-600 mt-0.5" />
                            <div>
                              <p className="font-semibold">Delivery:</p>
                              <p className="text-gray-600">{shipment.delivery_address}</p>
                            </div>
                          </div>
                          <div className="flex justify-between pt-2">
                            <span>Weight: {shipment.weight_kg} kg</span>
                            <span className="font-semibold text-green-600">₹{shipment.final_cost || shipment.estimated_cost}</span>
                          </div>
                          {shipment.tracking_number && (
                            <div className="text-xs text-blue-600">
                              Tracking: {shipment.tracking_number}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {shipment.status === 'accepted' && (
                          <button
                            onClick={() => updateShipmentStatus(shipment.id, 'in_transit')}
                            className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Start Transit
                          </button>
                        )}
                        {shipment.status === 'in_transit' && (
                          <button
                            onClick={() => updateShipmentStatus(shipment.id, 'delivered')}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogisticsDashboard;
