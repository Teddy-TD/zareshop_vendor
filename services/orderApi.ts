import { baseApi } from '@/services/baseApi';

// Enums matching Prisma schema
export enum OrderStatus {
  new = 'new',
  processing = 'processing',
  ready_to_delivery = 'ready_to_delivery',
  completed = 'completed'
}

export enum PaymentMethodType {
  wallet = 'wallet',
  external = 'external',
  cod = 'cod'
}

export enum DeliveryStatus {
  not_assigned = 'not_assigned',
  assigned = 'assigned',
  out_for_delivery = 'out_for_delivery',
  delivered = 'delivered'
}

// Base types matching Prisma schema
type Image = {
  id: number;
  image_url: string;
  created_at: string;
  category_id?: number;
  subcategory_id?: number;
  product_id?: number;
};

type Video = {
  id: number;
  video_url: string;
  created_at: string;
  category_id?: number;
  subcategory_id?: number;
  product_id?: number;
};

type Spec = {
  id: number;
  key: string;
  value: string;
};

type Rating = {
  id: number;
  entity_type: 'product' | 'vendor';
  entity_id: number;
  total_ratings: number;
  sum_ratings: number;
  average_rating: number;
};

type Category = {
  id: number;
  name: string;
  description?: string;
  created_at: string;
};

type Subcategory = {
  id: number;
  name: string;
  created_at: string;
  category_id: number;
  category: Category;
};

type User = {
  id: number;
  name?: string;
  phone_number: string;
  email?: string;
  type: 'client' | 'vendor_owner' | 'driver' | 'admin' | 'employee';
  is_verified: boolean;
  isotpVerified: boolean;
  created_at: string;
};

type Client = {
  id: number;
  user_id: number;
  wallet_id?: number;
  image_id?: number;
  user: User;
  wallet?: any;
  image?: Image;
};

type Vendor = {
  id: number;
  name?: string;
  type: 'individual' | 'business';
  description?: string;
  status?: boolean;
  is_approved?: boolean;
  subscription_id: number;
  user_id: number;
  wallet_id?: number;
  rating_id?: number;
  rating?: Rating;
};

type Driver = {
  id: number;
  vehicle_info?: string;
  current_status: 'available' | 'on_delivery' | 'offline';
  profile_image_id?: number;
  license_image_id?: number;
  fayda_image_id?: number;
  isApproved: boolean;
  user_id: number;
  wallet_id?: number;
  user: User;
  wallet?: any;
  profile_image?: Image;
  license_image?: Image;
  fayda_image?: Image;
};

type Product = {
  id: number;
  name: string;
  description?: string;
  has_discount: boolean;
  stock: number;
  stock_status: 'active' | 'low_stock' | 'out_of_stock';
  low_stock_threshold: number;
  is_active: boolean;
  price: number;
  created_at: string;
  vendor_id: number;
  category_id: number;
  subcategory_id: number;
  rating_id?: number;
  vendor: Vendor;
  category: Category;
  subcategory: Subcategory;
  rating?: Rating;
  images: Image[];
  videos: Video[];
  specs: Spec[];
};

type Delivery = {
  id: number;
  qr_code?: string;
  delivery_status: DeliveryStatus;
  delivered_at?: string;
  client_confirmed: boolean;
  tip_amount: number;
  order_id: number;
  driver_id: number;
  rating_id?: number;
  driver: Driver;
  rating?: Rating;
};

type Order = {
  id: number;
  quantity: number;
  unit_price: number;
  total_amount: number;
  payment_method: PaymentMethodType;
  payment_id?: number;
  status: OrderStatus;
  created_at: string;
  client_id: number;
  vendor_id: number;
  product_id: number;
  client: Client;
  vendor: Vendor;
  product: Product;
  delivery?: Delivery;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

// API Response types
export type GetOrdersByVendorResponse = {
  message: string;
  orders: Order[];
  pagination: Pagination;
};

export type GetAllOrdersResponse = {
  message: string;
  orders: Order[];
  pagination: Pagination;
};

export type GetOrderByIdResponse = {
  message: string;
  order: Order;
};

export type UpdateOrderStatusRequest = {
  status: OrderStatus;
};

export type UpdateOrderStatusResponse = {
  message: string;
  order: Order;
};

export type GetOrdersByVendorParams = {
  vendorId: number;
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
};

export type GetAllOrdersParams = {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  vendor_id?: number;
  client_id?: number;
  search?: string;
};

export const orderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Get orders by vendor
    getOrdersByVendor: build.query<
      GetOrdersByVendorResponse,
      GetOrdersByVendorParams
    >({
      query: ({ vendorId, page = 1, limit = 10, status, search }) => ({
        url: `orders/vendor/${vendorId}`,
        method: "GET",
        params: { page, limit, status, search },
      }),
      providesTags: ["Orders"],
    }),

    // Get all orders with optional filters
    getAllOrders: build.query<
      GetAllOrdersResponse,
      GetAllOrdersParams
    >({
      query: ({ page = 1, limit = 10, status, vendor_id, client_id, search }) => ({
        url: "orders",
        method: "GET",
        params: { page, limit, status, vendor_id, client_id, search },
      }),
      providesTags: ["Orders"],
    }),

    // Get order by ID
    getOrderById: build.query<GetOrderByIdResponse, number>({
      query: (orderId) => ({
        url: `orders/${orderId}`,
        method: "GET",
      }),
      providesTags: (result, error, orderId) => [{ type: "Orders", id: orderId }],
    }),

    // Update order status
    updateOrderStatus: build.mutation<
      UpdateOrderStatusResponse,
      { orderId: number; status: OrderStatus }
    >({
      query: ({ orderId, status }) => ({
        url: `orders/${orderId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Orders", id: orderId },
        "Orders",
      ],
    }),

    // Get orders by status (convenience method)
    getOrdersByStatus: build.query<
      GetOrdersByVendorResponse,
      { vendorId: number; status: OrderStatus; page?: number; limit?: number }
    >({
      query: ({ vendorId, status, page = 1, limit = 10 }) => ({
        url: `orders/vendor/${vendorId}`,
        method: "GET",
        params: { page, limit, status },
      }),
      providesTags: ["Orders"],
    }),

    // Search orders
    searchOrders: build.query<
      GetOrdersByVendorResponse,
      { vendorId: number; search: string; page?: number; limit?: number }
    >({
      query: ({ vendorId, search, page = 1, limit = 10 }) => ({
        url: `orders/vendor/${vendorId}`,
        method: "GET",
        params: { page, limit, search },
      }),
      providesTags: ["Orders"],
    }),

    // Get orders statistics for vendor
    getOrdersStats: build.query<
      {
        total_orders: number;
        pending_orders: number;
        processing_orders: number;
        ready_to_delivery_orders: number;
        completed_orders: number;
        total_revenue: number;
      },
      { vendorId: number }
    >({
      query: ({ vendorId }) => ({
        url: `orders/vendor/${vendorId}/stats`,
        method: "GET",
      }),
      providesTags: ["Orders"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetOrdersByVendorQuery,
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useGetOrdersByStatusQuery,
  useSearchOrdersQuery,
  useGetOrdersStatsQuery,
} = orderApi;
