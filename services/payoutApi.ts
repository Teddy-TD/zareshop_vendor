import { baseApi } from '@/services/baseApi';

// Enums matching Prisma schema
export enum CashOutRequestStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected'
}

// Base types matching Prisma schema
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
};

type Transaction = {
  id: number;
  transaction_id: string;
  type: 'credit' | 'debit';
  amount: number;
  reason?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
  wallet_id: number;
};

type Wallet = {
  id: number;
  balance: number;
  created_at: string;
  updated_at: string;
  status: 'active' | 'suspended' | 'closed';
  user_id: number;
  transactions: Transaction[];
};

type CashOutRequest = {
  id: number;
  amount: number;
  status: CashOutRequestStatus;
  reason?: string;
  created_at: string;
  vendor_id?: number;
  user_id: number;
  vendor?: Vendor;
  user: User;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

// API Response types
export type GetVendorPayoutStatsResponse = {
  message: string;
  availableBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  pendingPayouts: number;
  thisMonthPayouts: number;
  wallet: Wallet;
};

export type GetVendorPayoutHistoryResponse = {
  message: string;
  payouts: CashOutRequest[];
  pagination: Pagination;
};

export type CreatePayoutRequestRequest = {
  amount: number;
  reason?: string;
};

export type CreatePayoutRequestResponse = {
  message: string;
  payoutRequest: CashOutRequest;
};

export type GetPayoutRequestByIdResponse = {
  message: string;
  payoutRequest: CashOutRequest;
};

export type UpdatePayoutRequestStatusRequest = {
  status: CashOutRequestStatus;
  reason?: string;
};

export type UpdatePayoutRequestStatusResponse = {
  message: string;
  payoutRequest: CashOutRequest;
};

export type GetVendorPayoutHistoryParams = {
  vendorId: number;
  page?: number;
  limit?: number;
  status?: CashOutRequestStatus;
};

export const payoutApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Get vendor payout statistics
    getVendorPayoutStats: build.query<
      GetVendorPayoutStatsResponse,
      { vendorId: number }
    >({
      query: ({ vendorId }) => ({
        url: `payouts/vendor/${vendorId}/stats`,
        method: "GET",
      }),
      providesTags: ["Payouts"],
    }),

    // Get vendor payout history
    getVendorPayoutHistory: build.query<
      GetVendorPayoutHistoryResponse,
      GetVendorPayoutHistoryParams
    >({
      query: ({ vendorId, page = 1, limit = 10, status }) => ({
        url: `payouts/vendor/${vendorId}/history`,
        method: "GET",
        params: { page, limit, status },
      }),
      providesTags: ["Payouts"],
    }),

    // Create payout request
    createPayoutRequest: build.mutation<
      CreatePayoutRequestResponse,
      { vendorId: number; data: CreatePayoutRequestRequest }
    >({
      query: ({ vendorId, data }) => ({
        url: `payouts/vendor/${vendorId}/request`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Payouts"],
    }),

    // Get payout request by ID
    getPayoutRequestById: build.query<
      GetPayoutRequestByIdResponse,
      { payoutId: number }
    >({
      query: ({ payoutId }) => ({
        url: `payouts/${payoutId}`,
        method: "GET",
      }),
      providesTags: (result, error, { payoutId }) => [
        { type: "Payouts", id: payoutId }
      ],
    }),

    // Update payout request status (admin only)
    updatePayoutRequestStatus: build.mutation<
      UpdatePayoutRequestStatusResponse,
      { payoutId: number; data: UpdatePayoutRequestStatusRequest }
    >({
      query: ({ payoutId, data }) => ({
        url: `payouts/${payoutId}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { payoutId }) => [
        { type: "Payouts", id: payoutId },
        "Payouts",
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetVendorPayoutStatsQuery,
  useGetVendorPayoutHistoryQuery,
  useCreatePayoutRequestMutation,
  useGetPayoutRequestByIdQuery,
  useUpdatePayoutRequestStatusMutation,
} = payoutApi;

