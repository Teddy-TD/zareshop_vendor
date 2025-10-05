import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/store';
import { logout } from '@/features/auth/authSlice';
import { router } from 'expo-router';

// Custom base query with error handling
const baseQueryWithAuth = fetchBaseQuery({
	baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api',
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
});

// Enhanced base query with automatic logout on auth errors
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
	const result = await baseQueryWithAuth(args, api, extraOptions);
	
	// Handle authentication errors
	if (result.error) {
		const { status, data } = result.error as any;
		
		// Check for authentication/authorization errors
		if (status === 401 || status === 403) {
			console.log('🚨 Authentication error detected:', { status, data });
			
			// Check for specific admin access error
			if (data?.error === 'Admins access required' || data?.error === 'Admin access required') {
				console.log('❌ Admin access required error - logging out user');
				
				// Dispatch logout action
				api.dispatch(logout());
				
				// Navigate to login screen
				router.replace('/auth/login');
				
				// Return a more user-friendly error
				return {
					error: {
						status: 403,
						data: { 
							error: 'Your session has expired or you don\'t have the required permissions. Please log in again.' 
						}
					}
				};
			}
			
			// Handle other auth errors
			if (status === 401) {
				console.log('❌ Unauthorized - token may be expired');
				api.dispatch(logout());
				router.replace('/auth/login');
			}
		}
	}
	
	return result;
};

export const baseApi = createApi({
	reducerPath: 'baseApi',
	baseQuery: baseQueryWithReauth,
	tagTypes: ['Auth', 'Application', 'Products', 'Orders', 'Payouts', 'Profile', 'Notifications', 'Categories', 'Subscriptions', 'VendorStatus', 'Subcategories', 'Vendor', 'Payment', 'UserPayments', 'AdminPayments', 'PaymentInstructions', 'PaymentQR'],
	endpoints: () => ({}),
});


