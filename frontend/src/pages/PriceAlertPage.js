import React from 'react';
import PriceAlert from '../components/PriceAlert';

/**
 * Price Alert & Wishlist page
 * Renders the full PriceAlert component which handles both
 * Wishlist items and user-defined Price Alerts.
 */
const PriceAlertPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <PriceAlert />
    </div>
  );
};

export default PriceAlertPage;
