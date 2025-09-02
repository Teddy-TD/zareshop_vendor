import { Middleware } from '@reduxjs/toolkit';
import { baseApi } from '@/services/baseApi';

export const buildAppMiddleware = (): Middleware[] => {
	const middleware: Middleware[] = [baseApi.middleware];
	return middleware;
};


