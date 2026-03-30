// User Types
export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'seller' | 'admin';
  phone?: string;
  address?: string;
  store_name?: string;
  store_description?: string;
  store_logo?: string;
  is_approved?: boolean;
  created_at: Date;
  updated_at: Date;
}

// Product Types
export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category_id: string;
  seller_id: string;
  brand: string;
  part_number: string;
  specifications: Record<string, any>;
  images: string[];
  is_approved: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
  updated_at: Date;
}

// Order Types
export interface IOrder {
  id: string;
  user_id: string;
  seller_id: string;
  items: IOrderItem[];
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  tracking_number?: string;
  created_at: Date;
}

export interface IOrderItem {
  product_id: string;
  quantity: number;
  price: number;
}

// API Response Types
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Pagination
export interface IPaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Search Types
export interface ISearchParams extends IPaginationParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  seller?: string;
}

// Notification Types
export interface INotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'product' | 'payout' | 'system';
  is_read: boolean;
  created_at: Date;
}

// Review Types
export interface IReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  review: string;
  created_at: Date;
}

// Seller Analytics
export interface ISellerAnalytics {
  total_sales: number;
  total_revenue: number;
  total_products: number;
  average_rating: number;
  monthly_sales: {
    month: string;
    sales: number;
    revenue: number;
  }[];
  top_products: IProduct[];
}

// Platform Analytics
export interface IPlatformAnalytics {
  total_users: number;
  total_sellers: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  pending_approvals: {
    sellers: number;
    products: number;
  };
  daily_stats: {
    date: string;
    users: number;
    orders: number;
    revenue: number;
  }[];
}

// WebSocket Events
export interface IWebSocketEvent {
  type: string;
  payload: any;
  timestamp: Date;
}

// Payment Types
export interface IPaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  payment_method: string;
  created_at: Date;
}
