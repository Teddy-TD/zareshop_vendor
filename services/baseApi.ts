import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
	reducerPath: 'baseApi',
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
		prepareHeaders: (headers) => {
			return headers;
		},
	}),
	tagTypes: ['Auth', 'Products', 'Orders', 'Payouts', 'Profile', 'Notifications'],
	endpoints: () => ({}),
});


