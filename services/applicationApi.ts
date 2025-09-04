import { baseApi } from '@/services/baseApi';

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

type VendorStatusResponse = {
  hasVendor: boolean;
  vendor?: {
    id: number;
    name: string;
    type: 'individual' | 'business';
    isApproved: boolean;
    status: boolean;
    createdAt: string;
  };
  message?: string;
};

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

        
    }),
    overrideExisting: true,
});

export const { 
    useCreateIndividualVendorMutation, 
    useCreateBusinessVendorMutation,
    useGetCategoriesQuery, 
    useGetSubscriptionsQuery,
    useGetUserVendorStatusQuery,
} = applicationApi;


