import { baseApi } from '@/services/baseApi';
import { CreatePaymentRequest, CreatePaymentResponse } from '@/services/paymentApi';

type CreateVendorOwnerRequest = FormData;

type CreateBusinessVendorRequest = FormData;

type CreateVendorResponse = {
    success: boolean;
    message?: string;
    data?: unknown;
};

type CategoryImage = {
    id: string;
    url: string;
    alt?: string;
};

type Category = {
    id: string;
    name: string;
    description?: string;
    images: CategoryImage[];
    created_at: string;
};

type Subscription = {
    id: string;
    amount: number;
    plan: string;
    start_date: string;
    end_date: string;
    status: string;
};



type CategoriesResponse = Category[];

type SubscriptionsResponse = Subscription[];

type PaymentMethod = {
  name: string;
  account_number: string;
  account_holder: string;
  type?: string | null;
  details?: Record<string, unknown>;
};

type VendorStatusResponse = {
  hasVendor: boolean;
  vendor?: {
    id: number;
    name: string;
    type: 'individual' | 'business';
    isApproved: boolean;
    status: boolean;
    createdAt: string;
    address_line1?: string;
    payment_method?: PaymentMethod;
    categories: Array<{
      id: number;
      name: string;
      description?: string;
    }>;
  };
  message?: string;
};

// Re-export payment types for backward compatibility
type CreateRegistrationPaymentRequest = CreatePaymentRequest;
type CreateRegistrationPaymentResponse = CreatePaymentResponse;

export const applicationApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        createIndividualVendor: build.mutation<CreateVendorResponse, CreateVendorOwnerRequest>({
            query: (body) => ({
                url: '/vendors/individual',
                method: 'POST',
                body: body,
            }),
            invalidatesTags: ['Application'],
        }),
        createBusinessVendor: build.mutation<CreateVendorResponse, CreateBusinessVendorRequest>({
            query: (body) => ({
                url: '/vendors/business',
                method: 'POST',
                body: body,
            }),
            invalidatesTags: ['Application'],
        }),
        getCategories: build.query<CategoriesResponse, void>({
            query: () => ({
                url: '/category',
                method: 'GET',
            }),
            providesTags: ['Categories'],
        }),
        getSubscriptions: build.query<SubscriptionsResponse, void>({
            query: () => ({
                url: '/subscription/',
                method: 'GET',
            }),
            providesTags: ['Subscriptions'],
        }),
        getUserVendorStatus: build.query<VendorStatusResponse, void>({
            query: () => ({
                url: '/vendors/my-status',
                method: 'GET',
            }),
            providesTags: ['VendorStatus'],
        }),

        // Minimal payment creation to pair with application submission
        createRegistrationPayment: build.mutation<
          CreateRegistrationPaymentResponse,
          CreateRegistrationPaymentRequest
        >({
          query: (body) => ({
            url: '/vendor-registration/payment', // Updated to use correct endpoint
            method: 'POST',
            body,
          }),
          invalidatesTags: ['Payment', 'UserPayments'],
        }),
    }),
    overrideExisting: true,
});

export const { 
    useCreateIndividualVendorMutation, 
    useCreateBusinessVendorMutation,
    useGetCategoriesQuery, 
    useGetSubscriptionsQuery,
    useGetUserVendorStatusQuery,
    useCreateRegistrationPaymentMutation,
} = applicationApi;


