import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  becomeSeller: (data) => api.post('/auth/become-seller', data),
  setup2FA: () => api.post('/auth/setup-2fa'),
  verify2FA: (token) => api.post('/auth/verify-2fa', { token }),
  disable2FA: (data) => api.post('/auth/disable-2fa', data),
  get2FAStatus: () => api.get('/auth/2fa-status'),
  generateBackupCodes: (data) => api.post('/auth/generate-backup-codes', data),
  verify2FALogin: (data) => api.post('/auth/verify-2fa-login', data),
  logout: () => api.post('/auth/logout'),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

// Product endpoints
export const products = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getBySeller: (sellerId) => api.get(`/products/seller/${sellerId}`),
  getCategories: () => api.get('/categories'),
  getAllProducts: () => api.get('/admin/products'),
};

// Cart endpoints
export const cart = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (id, quantity) => api.put(`/cart/${id}`, { quantity }),
  remove: (id) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart'),
};

// Order endpoints
export const orders = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
};

// Review endpoints
export const productReviews = {
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  add: (data) => api.post('/reviews', data),
};

// Seller endpoints
export const sellerAPI = {
  getDashboard: () => api.get('/seller/dashboard'),
  getProducts: () => api.get('/seller/products'),
  addProduct: (data) => api.post('/seller/products', data),
  updateProduct: (id, data) => api.put(`/seller/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/seller/products/${id}`),
  getOrders: () => api.get('/seller/orders'),
  updateOrderStatus: (id, status) => api.put(`/seller/orders/${id}/status`, { status }),
  getEarnings: () => api.get('/seller/earnings'),
};

// Technician API
export const technicianAPI = {
  register: (data) => api.post('/technician/auth/register', data),
  getProfile: () => api.get('/technician/auth/profile'),
  updateProfile: (data) => api.put('/technician/auth/profile', data),
  updateAvailability: (isAvailable) => api.put('/technician/auth/availability', { is_available: isAvailable }),
  getNearbyRequests: () => api.get('/technician/requests/nearby'),
  acceptRequest: (id) => api.post(`/technician/requests/${id}/accept`),
  getMyRequests: () => api.get('/technician/requests/my-requests'),
  updateRequestStatus: (id, status) => api.put(`/technician/requests/${id}/status`, { status }),
  getEarnings: () => api.get('/technician/earnings'),
  // Hire system
  browseTechnicians: (params) => api.get('/technician/hire/browse', { params }),
  getTechnicianPublicProfile: (id) => api.get(`/technician/hire/${id}/profile`),
  sendHireRequest: (technicianId, data) => api.post(`/technician/hire/${technicianId}/request`, data),
  getMyHireRequests: () => api.get('/technician/hire/my-hire-requests'),
  respondToHire: (requestId, action, notes) => api.put(`/technician/hire/${requestId}/respond`, { action, technician_notes: notes }),
  startHireWork: (requestId) => api.put(`/technician/hire/${requestId}/start`),
  completeHireWork: (requestId, data) => api.put(`/technician/hire/${requestId}/complete`, data),
  getMyHires: (params) => api.get('/technician/hire/my-hires', { params }),
  confirmHireCompletion: (requestId) => api.put(`/technician/hire/${requestId}/confirm`),
  cancelHire: (requestId, reason) => api.put(`/technician/hire/${requestId}/cancel`, { reason }),
  updateCertifications: (data) => api.put('/technician/hire/certifications', data),
};

// Driver API
export const driverAPI = {
  register: (data) => api.post('/driver/auth/register', data),
  getProfile: () => api.get('/driver/auth/profile'),
  updateProfile: (data) => api.put('/driver/auth/profile', data),
  updateAvailability: (isAvailable, location) => api.put('/driver/auth/availability', { is_available: isAvailable, ...location }),
  getAvailableTrips: () => api.get('/driver/trips/available'),
  acceptTrip: (id) => api.post(`/driver/trips/${id}/accept`),
  getMyTrips: () => api.get('/driver/trips/my-trips'),
  updateTripStatus: (id, status) => api.put(`/driver/trips/${id}/status`, { status }),
  getEarnings: () => api.get('/driver/earnings'),
  // Hire system
  browseDrivers: (params) => api.get('/driver/hire/browse', { params }),
  getDriverPublicProfile: (id) => api.get(`/driver/hire/${id}/profile`),
  sendHireRequest: (driverId, data) => api.post(`/driver/hire/${driverId}/request`, data),
  getMyHireRequests: () => api.get('/driver/hire/my-hire-requests'),
  respondToHire: (requestId, action, notes) => api.put(`/driver/hire/${requestId}/respond`, { action, driver_notes: notes }),
  startHireTrip: (requestId) => api.put(`/driver/hire/${requestId}/start`),
  completeHireTrip: (requestId, data) => api.put(`/driver/hire/${requestId}/complete`, data),
  getMyHires: (params) => api.get('/driver/hire/my-hires', { params }),
  confirmHireTrip: (requestId) => api.put(`/driver/hire/${requestId}/confirm`),
  cancelHire: (requestId, reason) => api.put(`/driver/hire/${requestId}/cancel`, { reason }),
};

// Logistics API
export const logisticsAPI = {
  register: (data) => api.post('/logistics/auth/register', data),
  getProfile: () => api.get('/logistics/auth/profile'),
  updateProfile: (data) => api.put('/logistics/auth/profile', data),
  getAvailableShipments: () => api.get('/logistics/shipments/available'),
  acceptShipment: (id) => api.post(`/logistics/shipments/${id}/accept`),
  getMyShipments: () => api.get('/logistics/shipments/my-shipments'),
  updateShipmentStatus: (id, status) => api.put(`/logistics/shipments/${id}/status`, { status }),
  getEarnings: () => api.get('/logistics/shipments/earnings'),
};

// Refurbisher API
export const refurbisherAPI = {
  register: (data) => api.post('/refurbisher/auth/register', data),
  getProfile: () => api.get('/refurbisher/auth/profile'),
  addProduct: (data) => api.post('/refurbisher/products/add', data),
  getMyProducts: () => api.get('/refurbisher/products/my-products'),
  updateProduct: (id, data) => api.put(`/refurbisher/products/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/refurbisher/products/products/${id}`),
  createAuction: (data) => api.post('/refurbisher/auctions/create', data),
  getMyAuctions: () => api.get('/refurbisher/auctions/my-auctions'),
};

// Public Auction API
export const auctionAPI = {
  getActiveAuctions: () => api.get('/auctions/active/list'),
  getUpcomingAuctions: () => api.get('/auctions/upcoming'),
  getAuction: (id) => api.get(`/auctions/${id}`),
  placeBid: (id, data) => api.post(`/refurbisher/auctions/${id}/bid`, data),
  addToWatchlist: (id) => api.post(`/refurbisher/auctions/${id}/watchlist`),
};

// Refurbished Products API
export const refurbishedAPI = {
  getAllProducts: (params) => api.get('/refurbished/products', { params }),
  getProduct: (id) => api.get(`/refurbished/products/${id}`),
  addReview: (id, data) => api.post(`/refurbished/products/${id}/review`, data),
};

// Message endpoints
export const messages = {
  send: (data) => api.post('/messages', data),
  getAll: () => api.get('/messages'),
  getMyMessages: () => api.get('/messages/my-messages'),
  markRead: (id) => api.put(`/messages/${id}/read`),
  delete: (id) => api.delete(`/messages/${id}`),
};

// Forum endpoints
export const forumAPI = {
  getPosts: (params) => api.get('/forum/posts', { params }),
  getPost: (id) => api.get(`/forum/posts/${id}`),
  createPost: (data) => api.post('/forum/posts', data),
  likePost: (id) => api.post(`/forum/posts/${id}/like`),
  addComment: (postId, content) => api.post(`/forum/posts/${postId}/comments`, { content }),
  likeComment: (id) => api.post(`/forum/comments/${id}/like`),
  getConversations: () => api.get('/forum/messages/conversations'),
  sendMessage: (data) => api.post('/forum/messages', data),
  getMessages: (userId) => api.get(`/forum/messages/${userId}`),
};

// Chatbot endpoints
export const chatbotAPI = {
  sendMessage: (message) => api.post('/chatbot/message', { message }),
  getHistory: () => api.get('/chatbot/history'),
  clearHistory: () => api.delete('/chatbot/history'),
};

// Support API
export const supportAPI = {
  createTicket: (data) => api.post('/support/tickets', data),
  getMyTickets: () => api.get('/support/tickets/my-tickets'),
  getTicket: (id) => api.get(`/support/tickets/${id}`),
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist', { product_id: productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
  check: (productId) => api.get(`/wishlist/check/${productId}`),
};

// Price Alert API
export const priceAlertAPI = {
  getAlerts: () => api.get('/price-alerts'),
  create: (data) => api.post('/price-alerts', data),
  remove: (id) => api.delete(`/price-alerts/${id}`),
  checkDrops: () => api.post('/price-alerts/check-drops'),
};

// B2B API
export const b2bAPI = {
  requestQuote: (data) => api.post('/b2b/quotes', data),
  getMyQuotes: () => api.get('/b2b/my-quotes'),
  respondToQuote: (id, data) => api.put(`/b2b/quotes/${id}/respond`, data),
};

// Compatibility API
export const compatibilityAPI = {
  check: (productId, vehicleData) => api.post(`/compatibility/check/${productId}`, vehicleData),
  getCompatibleProducts: (vehicleData) => api.post('/compatibility/products', vehicleData),
};

// Booking API
export const bookingAPI = {
  getMechanics: () => api.get('/installations/mechanics'),
  createBooking: (data) => api.post('/installations', data),
  getMyBookings: () => api.get('/installations/my-bookings'),
  getBooking: (id) => api.get(`/installations/${id}`),
  updateBookingStatus: (id, status) => api.put(`/installations/${id}/status`, { status }),
  cancelBooking: (id) => api.put(`/installations/${id}/cancel`),
  deleteBooking: (id) => api.delete(`/installations/${id}`),
};

// Admin Support API
export const adminSupportAPI = {
  getAllTickets: () => api.get('/admin/support-tickets'),
  getUrgentTickets: () => api.get('/admin/support-tickets/urgent'),
  updateTicket: (id, data) => api.put(`/admin/support-tickets/${id}`, data),
  deleteTicket: (id) => api.delete(`/admin/support-tickets/${id}`),
};

// Admin API (Super Admin) - Single declaration
export const admin = {
  // Super Admin endpoints
  getSuperAdminStats: () => api.get('/admin/super-stats'),
  getLogistics: () => api.get('/admin/logistics'),
  approveLogistics: (id) => api.put(`/admin/logistics/${id}/approve`),
  rejectLogistics: (id, reason) => api.put(`/admin/logistics/${id}/reject`, { reason }),
  getPendingSellers: () => api.get('/admin/pending/sellers'),
  getPendingTechnicians: () => api.get('/admin/pending/technicians'),
  getPendingDrivers: () => api.get('/admin/pending/drivers'),
  getPendingLogistics: () => api.get('/admin/pending/logistics'),
  getPendingRefurbishers: () => api.get('/admin/pending/refurbishers'),
  approveUser: (type, id) => api.put(`/admin/approve/${type}/${id}`),
  rejectUser: (type, id, reason) => api.put(`/admin/reject/${type}/${id}`, { reason }),
  // Regular Admin endpoints
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  blockUser: (id, block) => api.put(`/admin/users/${id}/block`, { block }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getSellers: () => api.get('/admin/sellers'),
  approveSeller: (id) => api.put(`/admin/sellers/${id}/approve`),
  rejectSeller: (id, reason) => api.put(`/admin/sellers/${id}/reject`, { reason }),
  getAllOrders: () => api.get('/admin/orders'),
  getAllMessages: () => api.get('/admin/messages'),
  getAllProducts: () => api.get('/admin/products'),
  getSupportTickets: () => api.get('/admin/support-tickets'),
  getUrgentTickets: () => api.get('/admin/support-tickets/urgent'),
  updateSupportTicket: (id, data) => api.put(`/admin/support-tickets/${id}`, data),
  deleteSupportTicket: (id) => api.delete(`/admin/support-tickets/${id}`),
  // Technician Admin endpoints
  getTechnicians: (params) => api.get('/admin/technicians', { params }),
  getTechnicianDetail: (id) => api.get(`/admin/technicians/${id}`),
  approveTechnician: (id, notes) => api.put(`/admin/technicians/${id}/approve`, { notes }),
  rejectTechnician: (id, reason, notes) => api.put(`/admin/technicians/${id}/reject`, { reason, notes }),
  suspendTechnician: (id, reason) => api.put(`/admin/technicians/${id}/suspend`, { reason }),
  updateTechnicianRole: (id, data) => api.put(`/admin/technicians/${id}/role`, data),
  getTechnicianStats: () => api.get('/admin/technicians/stats/overview'),
  getAllHireRequests: (params) => api.get('/admin/technician-hires', { params }),
  approveHireRequest: (id, notes) => api.put(`/admin/technician-hires/${id}/approve`, { notes }),
  rejectHireRequest: (id, reason) => api.put(`/admin/technician-hires/${id}/reject`, { reason }),
  // Driver Admin endpoints
  getDrivers: (params) => api.get('/admin/drivers', { params }),
  getDriverDetail: (id) => api.get(`/admin/drivers/${id}`),
  approveDriver: (id, notes) => api.put(`/admin/drivers/${id}/approve`, { notes }),
  rejectDriver: (id, reason, notes) => api.put(`/admin/drivers/${id}/reject`, { reason, notes }),
  suspendDriver: (id, reason) => api.put(`/admin/drivers/${id}/suspend`, { reason }),
  updateDriverRole: (id, data) => api.put(`/admin/drivers/${id}/role`, data),
  getDriverStats: () => api.get('/admin/drivers/stats/overview'),
  getAllDriverHireRequests: (params) => api.get('/admin/driver-hires', { params }),
  approveDriverHireRequest: (id, notes) => api.put(`/admin/driver-hires/${id}/approve`, { notes }),
  rejectDriverHireRequest: (id, reason) => api.put(`/admin/driver-hires/${id}/reject`, { reason }),
};

// Vendor Technician API
export const vendorTechnicianAPI = {
  getAvailable: (params) => api.get('/vendor/technicians/available', { params }),
  getTechnicianDetail: (id) => api.get(`/vendor/technicians/${id}`),
  hire: (data) => api.post('/vendor/technicians/hire', data),
  getMyHires: (params) => api.get('/vendor/technicians/my-hires/list', { params }),
  approveCompletion: (requestId) => api.put(`/vendor/technicians/hires/${requestId}/approve-completion`),
  cancelHire: (requestId, reason) => api.put(`/vendor/technicians/hires/${requestId}/cancel`, { reason }),
  appoint: (technicianId, notes) => api.put(`/vendor/technicians/${technicianId}/appoint`, { notes }),
  removeAppoint: (technicianId) => api.delete(`/vendor/technicians/${technicianId}/appoint`),
  getAppointed: () => api.get('/vendor/technicians/appointed/list'),
};

// Vendor Driver API
export const vendorDriverAPI = {
  getAvailable: (params) => api.get('/vendor/drivers/available', { params }),
  getDriverDetail: (id) => api.get(`/vendor/drivers/${id}`),
  hire: (data) => api.post('/vendor/drivers/hire', data),
  getMyHires: (params) => api.get('/vendor/drivers/my-hires/list', { params }),
  approveCompletion: (requestId) => api.put(`/vendor/drivers/hires/${requestId}/approve-completion`),
  cancelHire: (requestId, reason) => api.put(`/vendor/drivers/hires/${requestId}/cancel`, { reason }),
  appoint: (driverId, notes) => api.put(`/vendor/drivers/${driverId}/appoint`, { notes }),
  removeAppoint: (driverId) => api.delete(`/vendor/drivers/${driverId}/appoint`),
  getAppointed: () => api.get('/vendor/drivers/appointed/list'),
};

// Logistics Communication API (role-gated: logistics + admin + driver only; sellers BLOCKED)
export const logisticsChatAPI = {
  getConversations: ()           => api.get('/logistics/messages'),
  getThread: (peerId)            => api.get(`/logistics/messages/thread/${peerId}`),
  sendMessage: (data)            => api.post('/logistics/messages', data),
  markRead: (id)                 => api.put(`/logistics/messages/${id}/read`),
  getVendors: ()                 => api.get('/logistics/messages/vendors'),
};

export const uploadAPI = {
  uploadProductImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/product-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteProductImage: (filename) => api.delete(`/upload/product-image/${filename}`),
};

// ─── Appointment Booking API ──────────────────────────────────────────────────
export const appointmentAPI = {
  getSlots:     (params) => api.get('/appointments/slots', { params }),
  createSlots:  (slots)  => api.post('/appointments/slots', { slots }),
  deleteSlot:   (id)     => api.delete(`/appointments/slots/${id}`),
  bookSlot:     (data)   => api.post('/appointments/book', data),
  updateBooking:(id, data)=> api.patch(`/appointments/book/${id}`, data),
  getMyAppointments:(role)=> api.get('/appointments/my', { params: { role } }),
};

// ─── Fleet Management API ─────────────────────────────────────────────────────
export const fleetAPI = {
  getDrivers:        (params) => api.get('/logistics/fleet/drivers', { params }),
  getAssignments:    (params) => api.get('/logistics/fleet/assignments', { params }),
  assignDriver:      (data)   => api.post('/logistics/fleet/assign', data),
  updateAssignment:  (id, data)=> api.patch(`/logistics/fleet/assignments/${id}`, data),
  getMyAssignment:   ()       => api.get('/logistics/fleet/my-assignment'),
  updateMyStatus:    (id, status) => api.patch(`/logistics/fleet/my-assignment/${id}/status`, { status }),
};

// ─── Auto-Scheduler API ───────────────────────────────────────────────────────
export const schedulerAPI = {
  getRules:   ()      => api.get('/logistics/scheduler/rules'),
  saveRules:  (rules) => api.post('/logistics/scheduler/rules', { rules }),
  getQueue:   ()      => api.get('/logistics/scheduler/queue'),
  runScheduler: ()    => api.post('/logistics/scheduler/run'),
};

// ─── Notification API ─────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll:   (params) => api.get('/notifications', { params }),
  markRead: (id)     => api.patch(`/notifications/${id}/read`),
  readAll:  ()       => api.post('/notifications/read-all'),
};

// ─── Provider Community (extended forum) API ──────────────────────────────────
export const communityAPI = {
  getPosts:      (params) => api.get('/forum/posts', { params }),
  getPost:       (id)     => api.get(`/forum/posts/${id}`),
  createPost:    (data)   => api.post('/forum/posts', data),
  upvotePost:    (id)     => api.post(`/forum/posts/${id}/upvote`),
  resolvePost:   (id, comment_id) => api.patch(`/forum/posts/${id}/resolve`, { solved_by_comment_id: comment_id }),
  addComment:    (id, content) => api.post(`/forum/posts/${id}/comments`, { content }),
  upvoteComment: (id)     => api.post(`/forum/comments/${id}/upvote`),
  getChannels:   ()       => api.get('/forum/channels'),
  getStats:      ()       => api.get('/forum/stats'),
};

export default api;

