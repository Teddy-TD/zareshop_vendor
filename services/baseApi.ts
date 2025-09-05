import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/store';

export const baseApi = createApi({
	reducerPath: 'baseApi',
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
		prepareHeaders: (headers, { getState }) => {
			// Get token from Redux state
			const token = (getState() as RootState).auth.token;
			
			// If we have a token, add it to the headers
			if (token) {
				headers.set('authorization', `Bearer ${token}`);
			}
			
			// Don't set Content-Type for FormData - let the browser set it with boundary
			// This is important for file uploads
			if (headers.get('content-type')?.includes('multipart/form-data')) {
				headers.delete('content-type');
			}
			
			return headers;
		},
	}),
	tagTypes: ['Auth', 'Application', 'Products', 'Orders', 'Payouts', 'Profile', 'Notifications', 'Categories', 'Subscriptions', 'VendorStatus', 'Subcategories'],
	endpoints: () => ({}),
});


