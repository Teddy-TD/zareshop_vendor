import { baseApi } from '@/services/baseApi';

// Payment Types
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
export type PaymentMethod = 'manual' | 'integrated';
export type PaymentProvider = 'bank_transfer' | 'stripe' | 'chapa' | 'paypal';

// Request Types
export type CreatePaymentRequest = {
  user_id: number;
  subscription_id: number;
  payment_method: PaymentMethod;
  payment_provider: PaymentProvider;
  currency?: string;
};

export type UpdatePaymentStatusRequest = {
  status: PaymentStatus;
  external_payment_id?: string;
  payment_reference?: string;
};

export type ProcessIntegratedPaymentRequest = {
  external_payment_id: string;
  payment_reference?: string;
};

export type UploadPaymentProofRequest = {
  image_id: number;
};

export type VerifyManualPaymentRequest = {
  approved: boolean;
  admin_notes?: string;
};

// Response Types
export type PaymentInstruction = {
  title: string;
  description: string;
  account_details?: {
    bank_name?: string;
    account_number?: string;
    account_holder?: string;
    reference?: string;
  };
  steps?: string[];
  amount?: number;
  currency?: string;
};

export type Payment = {
  id: number;
  user_id: number;
  subscription_id: number;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_provider: PaymentProvider;
  payment_reference: string;
  status: PaymentStatus;
  external_payment_id?: string;
  vendor_id?: number;
  verified_by?: number;
  verified_at?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  subscription?: {
    id: number;
    plan: string;
    amount: number;
  };
  vendor?: {
    id: number;
    name: string;
    is_approved: boolean;
    status: boolean;
  };
  manual_payment_proof?: {
    id: number;
    image_url: string;
  };
};

export type CreatePaymentResponse = {
  success: boolean;
  message: string;
  data: {
    payment: Payment;
    paymentInstructions?: PaymentInstruction;
  };
};

export type GetPaymentResponse = {
  success: boolean;
  data: Payment;
};

export type GetUserPaymentsResponse = {
  success: boolean;
  data: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type UpdatePaymentResponse = {
  success: boolean;
  message: string;
  data: Payment;
};

export type Subscription = {
  id: number;
  plan: string;
  amount: number;
  duration_months: number;
  features: string[];
  is_active: boolean;
};

export type GetSubscriptionsResponse = {
  success: boolean;
  data: Subscription[];
};

export type PaymentStatistics = {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  cancelled: number;
};

export type GetPaymentStatsResponse = {
  success: boolean;
  data: PaymentStatistics;
};

// Mobile Payment Types
export type CreateMobilePaymentRequest = {
  subscription_id: number;
  payment_method: PaymentMethod;
  payment_provider: PaymentProvider;
  currency?: string;
};

export type CapturePaymentProofRequest = FormData; // Contains image file

export type GenerateQRCodeResponse = {
  success: boolean;
  data: {
    qr_code: string; // Base64 encoded QR code
    payment_url: string;
    expires_at: string;
  };
};

// API Endpoints
export const paymentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Create new payment
    createPayment: build.mutation<CreatePaymentResponse, CreatePaymentRequest>({
      query: (body) => ({
        url: '/vendor-registration/payment',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payment', 'UserPayments'],
    }),

    // Get payment by ID
    getPaymentById: build.query<GetPaymentResponse, number>({
      query: (id) => ({
        url: `/vendor-registration/payment/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Payment', id }],
    }),

    // Get user's own payments
    getUserPayments: build.query<GetUserPaymentsResponse, {
      status?: PaymentStatus;
      payment_method?: PaymentMethod;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/vendor-registration/my-payments',
        method: 'GET',
        params,
      }),
      providesTags: ['UserPayments'],
    }),

    // Update payment status
    updatePaymentStatus: build.mutation<UpdatePaymentResponse, {
      id: number;
      data: UpdatePaymentStatusRequest;
    }>({
      query: ({ id, data }) => ({
        url: `/vendor-registration/payment/${id}/status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Payment', id },
        'UserPayments',
      ],
    }),

    // Process integrated payment
    processIntegratedPayment: build.mutation<UpdatePaymentResponse, {
      id: number;
      data: ProcessIntegratedPaymentRequest;
    }>({
      query: ({ id, data }) => ({
        url: `/vendor-registration/payment/${id}/process`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Payment', id },
        'UserPayments',
      ],
    }),

    // Upload payment proof for manual payment
    uploadPaymentProof: build.mutation<UpdatePaymentResponse, {
      id: number;
      data: UploadPaymentProofRequest;
    }>({
      query: ({ id, data }) => ({
        url: `/vendor-registration/payment/${id}/proof`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Payment', id },
        'UserPayments',
      ],
    }),

    // Mobile: Create payment
    createMobilePayment: build.mutation<CreatePaymentResponse, CreateMobilePaymentRequest>({
      query: (body) => ({
        url: '/mobile/vendor-registration/payment',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payment', 'UserPayments'],
    }),

    // Mobile: Capture payment proof
    capturePaymentProof: build.mutation<UpdatePaymentResponse, {
      id: number;
      data: CapturePaymentProofRequest;
    }>({
      query: ({ id, data }) => ({
        url: `/mobile/vendor-registration/payment/${id}/capture`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Payment', id },
        'UserPayments',
      ],
    }),

    // Mobile: Upload payment proof file directly
    uploadPaymentProofFile: build.mutation<UpdatePaymentResponse, {
      id: number;
      data: FormData;
    }>({
      query: ({ id, data }) => ({
        url: `/mobile/vendor-registration/payment/${id}/upload-proof`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Payment', id },
        'UserPayments',
      ],
    }),

    // Mobile: Proceed to next step
    proceedToNextStep: build.mutation<{
      success: boolean;
      data: {
        payment: {
          id: number;
          status: string;
          amount: number;
          currency: string;
          has_proof: boolean;
          has_vendor: boolean;
        };
        next_step: {
          step: string;
          can_proceed: boolean;
          message: string;
          actions: Array<{
            action: string;
            label: string;
            description?: string;
            url?: string;
            primary: boolean;
            warning?: boolean;
          }>;
        };
      };
    }, {
      id: number;
      force_proceed?: boolean;
    }>({
      query: ({ id, force_proceed = false }) => ({
        url: `/mobile/vendor-registration/payment/${id}/proceed`,
        method: 'POST',
        body: { force_proceed },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Payment', id },
        'UserPayments',
      ],
    }),

    // Mobile: Generate QR code
    generatePaymentQRCode: build.query<GenerateQRCodeResponse, number>({
      query: (id) => ({
        url: `/mobile/vendor-registration/payment/${id}/qr`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'PaymentQR', id }],
    }),

    // Get available subscriptions
    getAvailableSubscriptions: build.query<GetSubscriptionsResponse, void>({
      query: () => ({
        url: '/vendor-registration/subscriptions/available',
        method: 'GET',
      }),
      providesTags: ['Subscriptions'],
    }),

    // Get subscription details
    getSubscriptionDetails: build.query<{ success: boolean; data: Subscription }, number>({
      query: (id) => ({
        url: `/vendor-registration/subscriptions/${id}/details`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Subscriptions', id }],
    }),

    // Get payment instructions
    getPaymentInstructions: build.query<{
      success: boolean;
      data: PaymentInstruction;
    }, PaymentProvider>({
      query: (provider) => ({
        url: `/vendor-registration/payment/instructions/${provider}`,
        method: 'GET',
      }),
      providesTags: (result, error, provider) => [{ type: 'PaymentInstructions', id: provider }],
    }),

    // Admin endpoints (if user has admin access)
    getPaymentsWithFilters: build.query<{
      success: boolean;
      data: Payment[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }, {
      status?: PaymentStatus;
      payment_method?: PaymentMethod;
      payment_provider?: PaymentProvider;
      start_date?: string;
      end_date?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/admin/vendor-payments',
        method: 'GET',
        params,
      }),
      providesTags: ['AdminPayments'],
    }),

    // Admin: Verify manual payment
    verifyManualPayment: build.mutation<UpdatePaymentResponse, {
      id: number;
      data: VerifyManualPaymentRequest;
    }>({
      query: ({ id, data }) => ({
        url: `/admin/vendor-payments/${id}/verify`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Payment', id },
        'AdminPayments',
        'UserPayments',
      ],
    }),

    // Get payment statistics
    getPaymentStatistics: build.query<GetPaymentStatsResponse, void>({
      query: () => ({
        url: '/admin/vendor-payments/statistics',
        method: 'GET',
      }),
      providesTags: ['UserPayments'],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreatePaymentMutation,
  useGetPaymentByIdQuery,
  useGetUserPaymentsQuery,
  useUpdatePaymentStatusMutation,
  useProcessIntegratedPaymentMutation,
  useUploadPaymentProofMutation,
  useCreateMobilePaymentMutation,
  useCapturePaymentProofMutation,
  useUploadPaymentProofFileMutation,
  useProceedToNextStepMutation,
  useGeneratePaymentQRCodeQuery,
  useGetAvailableSubscriptionsQuery,
  useGetSubscriptionDetailsQuery,
  useGetPaymentInstructionsQuery,
  useGetPaymentsWithFiltersQuery,
  useVerifyManualPaymentMutation,
  useGetPaymentStatisticsQuery,
} = paymentApi;
