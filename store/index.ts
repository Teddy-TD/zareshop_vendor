import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './rootReducer';
import { buildAppMiddleware } from '@/store/middleware';

export const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({ serializableCheck: false, immutableCheck: true }).concat(
			buildAppMiddleware()
		),
});

export type AppStore = typeof store;
export type AppDispatch = AppStore['dispatch'];
export type RootState = ReturnType<typeof rootReducer>;


