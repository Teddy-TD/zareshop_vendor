import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { tokenStorage } from '@/utils/tokenStorage';

export type AuthUser = {
	id: string;
	name: string;
	phone_number: string;
	email?: string;
	type: string;
	is_verified: boolean;
	isotpVerified: boolean;
};

export type AuthState = {
	user: AuthUser | null;
	token: string | null;
	isLoading: boolean;
};

const initialState: AuthState = {
	user: null,
	token: null,
	isLoading: false,
};

// Async thunk to restore authentication state from storage
export const restoreAuth = createAsyncThunk(
	'auth/restore',
	async () => {
		console.log('🔄 Starting auth restoration...');
		const [token, user] = await Promise.all([
			tokenStorage.getToken(),
			tokenStorage.getUser(),
		]);
		console.log('📦 Restored data:', { token: !!token, user: !!user });
		return { token, user };
	}
);

// Async thunk to set credentials and persist to storage
export const setCredentialsAndPersist = createAsyncThunk(
	'auth/setCredentialsAndPersist',
	async ({ user, token }: { user: AuthUser; token: string }) => {
		console.log('💾 Setting credentials and persisting...');
		await tokenStorage.setToken(token, user);
		return { user, token };
	}
);

// Async thunk to logout and clear storage
export const logoutAndClear = createAsyncThunk(
	'auth/logoutAndClear',
	async () => {
		console.log('🚪 Logging out and clearing storage...');
		await tokenStorage.removeToken();
		return null;
	}
);

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		startLoading(state) {
			state.isLoading = true;
		},
		stopLoading(state) {
			state.isLoading = false;
		},
		setCredentials(state, action: PayloadAction<{ user: AuthUser; token: string }>) {
			console.log('🎯 Setting credentials in state:', action.payload);
			state.user = action.payload.user;
			state.token = action.payload.token;
		},
		logout(state) {
			console.log('🚪 Logging out from state');
			state.user = null;
			state.token = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(restoreAuth.pending, (state) => {
				console.log('⏳ Auth restoration pending...');
				state.isLoading = true;
			})
			.addCase(restoreAuth.fulfilled, (state, action) => {
				console.log('✅ Auth restoration fulfilled:', action.payload);
				state.isLoading = false;
				if (action.payload.token && action.payload.user) {
					state.token = action.payload.token;
					state.user = action.payload.user;
				}
			})
			.addCase(restoreAuth.rejected, (state, action) => {
				console.log('❌ Auth restoration rejected:', action.error);
				state.isLoading = false;
			})
			.addCase(setCredentialsAndPersist.fulfilled, (state, action) => {
				console.log('✅ Credentials set and persisted:', action.payload);
				state.user = action.payload.user;
				state.token = action.payload.token;
			})
			.addCase(logoutAndClear.fulfilled, (state) => {
				console.log('✅ Logout and clear completed');
				state.user = null;
				state.token = null;
			});
	},
});

export const { startLoading, stopLoading, setCredentials, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;


