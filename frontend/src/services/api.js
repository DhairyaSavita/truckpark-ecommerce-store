import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Token being sent:', token ? 'Present' : 'Missing');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  becomeSeller: (data) => api.post('/auth/become-seller', data),
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

// // Admin endpoints
// export const admin = {
//   getStats: () => api.get('/admin/stats'),
//   getUsers: () => api.get('/admin/users'),
//   getSellers: () => api.get('/admin/sellers'),
//   approveSeller: (id) => api.put(`/admin/sellers/${id}/approve`),
//   rejectSeller: (id, reason) => api.put(`/admin/sellers/${id}/reject`, { reason }),
//   getPendingProducts: () => api.get('/admin/products/pending'),
//   approveProduct: (id) => api.put(`/admin/products/${id}/approve`),
//   rejectProduct: (id, reason) => api.put(`/admin/products/${id}/reject`, { reason }),
//   getAllOrders: () => api.get('/admin/orders'),
//   getAllMessages: () => api.get('/admin/messages'),
//   updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
//   deleteUser: (id) => api.delete(`/admin/users/${id}`),
// };

// Add to admin object
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
  getPendingProducts: () => api.get('/admin/products/pending'),
  approveProduct: (id) => api.put(`/admin/products/${id}/approve`),
  rejectProduct: (id, reason) => api.put(`/admin/products/${id}/reject`, { reason }),
  getAllOrders: () => api.get('/admin/orders'),
  getAllMessages: () => api.get('/admin/messages'),
  getAllProducts: () => api.get('/admin/products'),
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
};

export default api;
