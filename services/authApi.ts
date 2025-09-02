import { baseApi } from '@/services/baseApi';

type RegisterVendorOwnerRequest = {
	name: string;
	phone_number: string;
	password: string;
	email?: string;
	picture?: { uri: string; name: string; type: string } | any;
};

type RegisterVendorOwnerResponse = {
	success: boolean;
	message?: string;
	data?: unknown;
};

export const authApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		registerVendorOwner: build.mutation<RegisterVendorOwnerResponse, RegisterVendorOwnerRequest>({
			query: (body) => {
				const form = new FormData();
				form.append('name', body.name);
				form.append('phone_number', body.phone_number);
				form.append('password', body.password);
				if (body.email) {
					form.append('email', body.email);
				}
				if (body.picture) {
					// React Native FormData file
					form.append('picture', body.picture as any);
				}
				return {
					url: '/auth/register-vendor-owner',
					method: 'POST',
					body: form,
				};
			},
			invalidatesTags: ['Auth'],
		}),
		verifyOtp: build.mutation<{ success: boolean; message?: string }, { phone_number: string; code: string }>({
			query: (body) => ({
				url: '/auth/verify-otp',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['Auth'],
		}),
		login: build.mutation<{ token: string; user?: any }, { phone_number: string; password: string }>({
			query: (body) => ({
				url: '/auth/login',
				method: 'POST',
				body,
			}),
		}),
	}),
	overrideExisting: false,
});

export const { useRegisterVendorOwnerMutation, useVerifyOtpMutation, useLoginMutation } = authApi;


