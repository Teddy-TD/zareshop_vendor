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

type LoginResponse = {
	message: string;
	token: string;
	user: {
		id: string;
		name: string;
		phone_number: string;
		email?: string;
		type: string;
		is_verified: boolean;
		isotpVerified: boolean;
	};
};

type VerifyOtpResponse = {
	message: string;
	user: {
		id: string;
		phone_number: string;
		isotpVerified: boolean;
		is_verified: boolean;
		type: string;
	};
};
type ResendOtpResponse  = {
	message : String;
	user : {
		id: string;
		phone_number: string;
		isotpVerified: boolean;
		is_verified: boolean;
		type: string;
	}
}

type Wallet = {
	id: number;
	balance: number;
	status: 'active' | 'suspended' | 'closed';
	created_at: string;
	updated_at: string;
};

type Subscription = {
	id: number;
	name: string;
	description?: string;
	price: number;
	duration_days: number;
	features: string[];
	created_at: string;
};

type Vendor = {
	id: number;
	name?: string;
	type: 'individual' | 'business';
	description?: string;
	status?: boolean;
	is_approved?: boolean;
	subscription?: Subscription;
	wallet?: Wallet;
};

type Client = {
	id: number;
	image?: {
		id: number;
		image_url: string;
	};
	wallet?: Wallet;
};

type Driver = {
	id: number;
	vehicle_info?: string;
	current_status: 'available' | 'on_delivery' | 'offline';
	isApproved: boolean;
	profile_image?: {
		id: number;
		image_url: string;
	};
	license_image?: {
		id: number;
		image_url: string;
	};
	fayda_image?: {
		id: number;
		image_url: string;
	};
	wallet?: Wallet;
};

type UserProfileResponse = {
	id: string;
	name: string;
	phone_number: string;
	email?: string;
	type: string;
	is_verified: boolean;
	isotpVerified: boolean;
	created_at: string;
	client?: Client;
	vendor?: Vendor;
	driver?: Driver;
};

type RequestPasswordResetRequest = {
	phone_number: string;
};

type RequestPasswordResetResponse = {
	message: string;
};

type VerifyResetOtpRequest = {
	phone_number: string;
	otp: string;
};

type VerifyResetOtpResponse = {
	message: string;
	resetToken: string;
};

type ResetPasswordRequest = {
	new_password: string;
	resetToken: string;
};

type ResetPasswordResponse = {
	message: string;
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
		verifyOtp: build.mutation<VerifyOtpResponse, { phone_number: string; code: string }>({
			query: (body) => ({
				url: '/auth/verify-otp',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['Auth'],
		}),

		resendOtp: build.mutation<ResendOtpResponse, { phone_number: string }>({
			query: (body) => ({
				url: '/auth/resend-otp',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['Auth'],
		}),
		login: build.mutation<LoginResponse, { phone_number: string; password: string }>({
			query: (body) => ({
				url: '/auth/login',
				method: 'POST',
				body,
			}),
		}),
		getUserProfile: build.query<UserProfileResponse, void>({
			query: () => ({
				url: '/auth/profile',
				method: 'GET',
			}),
			providesTags: ['Auth'],
		}),

		// Forgot password: request reset (send OTP/code)
		requestPasswordReset: build.mutation<RequestPasswordResetResponse, RequestPasswordResetRequest>({
			query: (body) => ({
				url: '/auth/forgot-password', // This sends OTP
				method: 'POST',
				body,
			}),
		}),

		// Forgot password: verify OTP and get reset token
		verifyResetOtp: build.mutation<VerifyResetOtpResponse, VerifyResetOtpRequest>({
			query: (body) => ({
				url: '/auth/verify-reset-otp',
				method: 'POST',
				body,
			}),
		}),

		// Forgot password: set new password using reset token
		resetPassword: build.mutation<ResetPasswordResponse, ResetPasswordRequest>({
			query: (body) => ({
				url: '/auth/reset-password',
				method: 'POST',
				body,
			}),
		}),
	}),
	overrideExisting: false,
});

export const { 
	useRegisterVendorOwnerMutation, 
	useVerifyOtpMutation, 
	useLoginMutation,
	useGetUserProfileQuery,
	useResendOtpMutation,
	useRequestPasswordResetMutation,
	useVerifyResetOtpMutation,
	useResetPasswordMutation
} = authApi;

export type { UserProfileResponse, Vendor, Client, Driver, Wallet, Subscription };


