import { combineReducers } from '@reduxjs/toolkit';
import { baseApi } from '@/services/baseApi';
import { authReducer } from '@/features/auth/authSlice';

export const rootReducer = combineReducers({
	auth: authReducer,
	[baseApi.reducerPath]: baseApi.reducer,
});


