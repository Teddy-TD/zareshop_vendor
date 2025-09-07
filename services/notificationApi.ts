import { baseApi } from '@/services/baseApi';

export type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  user_id: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUserNotifications: build.query<
      { notifications: Notification[]; pagination: Pagination },
      { userId: number; page?: number; limit?: number; is_read?: boolean }
    >({
      query: ({ userId, page = 1, limit = 20, is_read }) => ({
        url: `notifications/user/${userId}`,
        method: 'GET',
        params: { page, limit, is_read },
      }),
      providesTags: (result) =>
        result?.notifications
          ? [
              ...result.notifications.map((n) => ({ type: 'Notifications' as const, id: n.id })),
              { type: 'Notifications' as const, id: 'LIST' },
            ]
          : [{ type: 'Notifications' as const, id: 'LIST' }],
    }),

    getUserUnreadCount: build.query<{ count: number }, number>({
      query: (userId) => ({
        url: `notifications/user/${userId}/unread-count`,
        method: 'GET',
      }),
      providesTags: [{ type: 'Notifications', id: 'UNREAD' }],
    }),

    markNotificationRead: build.mutation<{ notification: Notification }, number>({
      query: (id) => ({
        url: `notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Notifications', id },
        { type: 'Notifications', id: 'LIST' },
        { type: 'Notifications', id: 'UNREAD' },
      ],
    }),

    markNotificationUnread: build.mutation<{ notification: Notification }, number>({
      query: (id) => ({
        url: `notifications/${id}/unread`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Notifications', id },
        { type: 'Notifications', id: 'LIST' },
        { type: 'Notifications', id: 'UNREAD' },
      ],
    }),

    markAllRead: build.mutation<{ updated: number }, number>({
      query: (userId) => ({
        url: `notifications/user/${userId}/read-all`,
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'Notifications', id: 'LIST' },
        { type: 'Notifications', id: 'UNREAD' },
      ],
    }),

    createNotification: build.mutation<
      { notification: Notification },
      { user_id: number; type?: string; title: string; message: string }
    >({
      query: (body) => ({
        url: 'notifications',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Notifications', id: 'LIST' },
        { type: 'Notifications', id: 'UNREAD' },
      ],
    }),

    deleteNotification: build.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Notifications', id },
        { type: 'Notifications', id: 'LIST' },
        { type: 'Notifications', id: 'UNREAD' },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetUserNotificationsQuery,
  useGetUserUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkNotificationUnreadMutation,
  useMarkAllReadMutation,
  useCreateNotificationMutation,
  useDeleteNotificationMutation,
} = notificationApi;


