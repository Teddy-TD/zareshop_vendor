import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AuthUser = {
	id: string;
	email: string;
	name?: string;
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
			state.user = action.payload.user;
			state.token = action.payload.token;
		},
		logout(state) {
			state.user = null;
			state.token = null;
		},
	},
});

export const { startLoading, stopLoading, setCredentials, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;


