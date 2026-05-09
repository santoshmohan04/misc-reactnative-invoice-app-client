import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_ENDPOINTS } from '@shared-contracts';
import { RefreshMutex, extractAccessToken, unwrapSuccessPayload } from '@shared-api';
import { getApiUrl } from '@config/env';
import { setCredentials, updateTokens, logout } from '../slices/authSlice';
import type { RootState } from '../index';

// Single shared mutex prevents concurrent token refresh calls
const refreshMutex = new RefreshMutex();

/**
 * Custom base query that adds auth header and handles automatic token refresh on 401.
 */
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  const state = api.getState() as RootState;
  const token = state.auth.token;

  if (typeof args === 'string') {
    args = { url: args };
  }
  if (!args.headers) {
    args.headers = {};
  }
  if (token) {
    args.headers.authorization = `Bearer ${token}`;
  }

  const baseQuery = fetchBaseQuery({ baseUrl: getApiUrl() });
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && (result.error as any).status === 401) {
    // Use mutex to prevent concurrent refresh races
    const newTokens = await refreshMutex.run(async () => {
      const refreshState = api.getState() as RootState;
      const refreshResult = await baseQuery(
        {
          url: API_ENDPOINTS.user.refreshPrimary,
          method: 'POST',
          body: { refresh_token: refreshState.auth.refreshToken },
        },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        const payload = unwrapSuccessPayload(refreshResult.data);
        const newAccessToken = extractAccessToken(undefined, payload);
        const newRefreshToken = (payload as any)?.refreshToken ?? null;

        if (newAccessToken) {
          api.dispatch(
            updateTokens({
              access_token: newAccessToken,
              refresh_token: newRefreshToken,
            }),
          );
          return { token: newAccessToken, refreshToken: newRefreshToken };
        }
      }

      api.dispatch(logout());
      return null;
    });

    if (newTokens?.token) {
      args.headers.authorization = `Bearer ${newTokens.token}`;
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    login: builder.mutation<any, { email: string; password: string }>({
      query: (credentials) => ({
        url: API_ENDPOINTS.user.login,
        method: 'POST',
        body: credentials,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const payload = unwrapSuccessPayload(data);
          const accessToken = extractAccessToken(undefined, payload);
          dispatch(
            setCredentials({
              user: (payload as any)?.user,
              access_token: accessToken,
              refresh_token: (payload as any)?.refreshToken ?? null,
            }),
          );
        } catch (error) {
          console.error('Login error:', error);
        }
      },
    }),

    register: builder.mutation<any, { email: string; password: string; name: string }>({
      query: (credentials) => ({
        url: API_ENDPOINTS.user.register,
        method: 'POST',
        body: credentials,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const payload = unwrapSuccessPayload(data);
          const accessToken = extractAccessToken(undefined, payload);
          dispatch(
            setCredentials({
              user: (payload as any)?.user,
              access_token: accessToken,
              refresh_token: (payload as any)?.refreshToken ?? null,
            }),
          );
        } catch (error) {
          console.error('Register error:', error);
        }
      },
    }),

    getCurrentUser: builder.query<any, void>({
      query: () => API_ENDPOINTS.user.profile,
      providesTags: ['User'],
    }),

    updateUser: builder.mutation<any, any>({
      query: (body) => ({
        url: API_ENDPOINTS.user.edit,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    logoutUser: builder.mutation<any, void>({
      query: () => ({
        url: API_ENDPOINTS.user.logout,
        method: 'DELETE',
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch {
          dispatch(logout());
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useUpdateUserMutation,
  useLogoutUserMutation,
} = authApi;
