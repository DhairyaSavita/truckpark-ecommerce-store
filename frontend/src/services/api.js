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

// Auth API with 2FA
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

// Admin endpoints
export const admin = {
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
  getAllTickets: () => admin.getSupportTickets(),
  getUrgentTickets: () => admin.getUrgentTickets(),
  updateTicket: (id, data) => admin.updateSupportTicket(id, data),
  deleteTicket: (id) => admin.deleteSupportTicket(id),
};

export default api;
