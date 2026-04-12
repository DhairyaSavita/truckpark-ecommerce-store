import React from 'react';
import SupportTicket from '../components/SupportTicket';

/**
 * Support Tickets page
 * Renders the full SupportTicket component which handles
 * creating, viewing, and managing support tickets with emergency mode.
 */
const SupportTicketsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <SupportTicket />
    </div>
  );
};

export default SupportTicketsPage;
