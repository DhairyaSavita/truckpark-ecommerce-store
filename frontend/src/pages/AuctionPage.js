import React, { useState, useEffect } from 'react';
import { auctionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GiftIcon, ClockIcon, UserIcon, CurrencyRupeeIcon, BellIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AuctionPage = () => {
  const { user } = useAuth();
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [autoBid, setAutoBid] = useState(false);
  const [maxAutoBid, setMaxAutoBid] = useState('');

  useEffect(() => {
    fetchAuctions();
    const interval = setInterval(fetchAuctions, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAuctions = async () => {
    try {
      const [activeRes, upcomingRes] = await Promise.all([
        auctionAPI.getActiveAuctions(),
        auctionAPI.getUpcomingAuctions()
      ]);
      setActiveAuctions(activeRes.data);
      setUpcomingAuctions(upcomingRes.data);
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const placeBid = async () => {
    if (!user) {
      toast.error('Please login to place a bid');
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    try {
      await auctionAPI.placeBid(selectedAuction.id, {
        bid_amount: parseFloat(bidAmount),
        is_auto_bid: autoBid,
        max_auto_bid: autoBid ? parseFloat(maxAutoBid) : null
      });
      toast.success('Bid placed successfully!');
      setBidAmount('');
      fetchAuctions();
      const updatedAuction = await auctionAPI.getAuction(selectedAuction.id);
      setSelectedAuction(updatedAuction.data.auction);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place bid');
    }
  };

  const formatTimeLeft = (endTime) => {
    const diff = new Date(endTime) - new Date();
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (3600000)) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return <div className="text-center py-10">Loading auctions...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        <div className="text-center mb-8">
          <GiftIcon className="h-16 w-16 mx-auto text-purple-600 mb-4" />
          <h1 className="text-3xl font-bold">Live Auctions</h1>
          <p className="text-gray-600 mt-2">Bid on refurbished truck parts at great prices</p>
        </div>

        {/* Active Auctions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">🔥 Live Auctions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeAuctions.map(auction => (
              <div
                key={auction.id}
                onClick={() => setSelectedAuction(auction)}
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
              >
                <div className="flex">
                  <div className="w-32 h-32 bg-gray-100">
                    <img
                      src={auction.Product?.images?.[0] || 'https://via.placeholder.com/150x150?text=Auction'}
                      alt={auction.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-semibold text-lg">{auction.title}</h3>
                    <div className="flex justify-between mt-2">
                      <div>
                        <p className="text-sm text-gray-500">Current Bid</p>
                        <p className="text-xl font-bold text-purple-600">₹{auction.current_price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Time Left</p>
                        <p className="text-sm font-semibold text-red-500">{formatTimeLeft(auction.end_time)}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">Bids: {auction.total_bids}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {activeAuctions.length === 0 && (
            <div className="text-center py-8 text-gray-500">No active auctions at the moment</div>
          )}
        </div>

        {/* Upcoming Auctions */}
        <div>
          <h2 className="text-2xl font-bold mb-4">📅 Upcoming Auctions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingAuctions.map(auction => (
              <div key={auction.id} className="bg-white rounded-xl shadow-md p-4">
                <h3 className="font-semibold">{auction.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Starting at ₹{auction.starting_price}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Starts: {new Date(auction.start_time).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          {upcomingAuctions.length === 0 && (
            <div className="text-center py-8 text-gray-500">No upcoming auctions scheduled</div>
          )}
        </div>
      </div>

      {/* Bid Modal */}
      {selectedAuction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Place Bid on {selectedAuction.title}</h3>
              <button onClick={() => setSelectedAuction(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex justify-between mb-2">
                  <span>Current Price:</span>
                  <span className="font-bold text-purple-600">₹{selectedAuction.current_price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bid Increment:</span>
                  <span>₹{selectedAuction.bid_increment}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Time Left:</span>
                  <span className="text-red-500 font-semibold">{formatTimeLeft(selectedAuction.end_time)}</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Your Bid Amount (₹)</label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Minimum bid: ${selectedAuction.current_price + selectedAuction.bid_increment}`}
                  className="w-full border rounded px-3 py-2"
                  step={selectedAuction.bid_increment}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoBid}
                  onChange={(e) => setAutoBid(e.target.checked)}
                  className="w-4 h-4"
                />
                <label>Enable Auto-bidding</label>
              </div>

              {autoBid && (
                <div>
                  <label className="block text-gray-700 mb-1">Maximum Auto-bid Amount (₹)</label>
                  <input
                    type="number"
                    value={maxAutoBid}
                    onChange={(e) => setMaxAutoBid(e.target.value)}
                    placeholder="Maximum amount you're willing to pay"
                    className="w-full border rounded px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We'll automatically bid for you up to this amount
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button onClick={() => setSelectedAuction(null)} className="px-4 py-2 border rounded">Cancel</button>
                <button onClick={placeBid} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                  Place Bid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionPage;
