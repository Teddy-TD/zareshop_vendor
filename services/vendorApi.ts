import { baseApi } from '@/services/baseApi';

// Types for vendor data
export type Vendor = {
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

export type GetVendorByPhoneResponse = {
  vendor: Vendor;
  user: {
    id: number;
    name: string;
    email: string;
    phone_number: string;
  };
};

export const vendorApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Get vendor by phone number
    getVendorByPhone: build.query<GetVendorByPhoneResponse, string>({
      query: (phoneNumber) => ({
        url: `vendors/by-phone/${phoneNumber}`,
        method: "GET",
      }),
      providesTags: ["Vendor"],
    }),

  }),
  overrideExisting: true,
});

export const {
  useGetVendorByPhoneQuery,
} = vendorApi;
