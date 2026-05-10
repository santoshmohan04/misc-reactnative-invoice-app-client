import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_ENDPOINTS } from '@shared-contracts';
import { RefreshMutex, extractAccessToken, unwrapSuccessPayload } from '@shared-api';
import { getApiUrl } from '@config/env';
import { setCredentials, updateTokens, logout } from '../slices/authSlice';
import type { RootState } from '../index';
import { instrumentApiError, instrumentApiSuccess } from '../../shared/observability/apiInstrumentation';
import { withLatencyMetric } from '../../shared/observability/performance';

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
  let result = await withLatencyMetric(`auth:${typeof args.url === 'string' ? args.url : 'request'}`, () =>
    baseQuery(args, api, extraOptions),
  );

  if (result.error && (result.error as any).status === 401) {
    // Use mutex to prevent concurrent refresh races
    const newTokens = await refreshMutex.run(async () => {
      const refreshState = api.getState() as RootState;
      const refreshResult = await withLatencyMetric('auth:refresh_token', () =>
        baseQuery(
          {
            url: API_ENDPOINTS.user.refreshPrimary,
            method: 'POST',
            body: { refresh_token: refreshState.auth.refreshToken },
          },
          api,
          extraOptions,
        ),
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
          instrumentApiSuccess('auth_refresh_success');
          return { token: newAccessToken, refreshToken: newRefreshToken };
        }
      }

      instrumentApiError('auth_refresh_failure', refreshResult.error ?? new Error('Token refresh failed'));
      api.dispatch(logout());
      return null;
    });

    if (newTokens?.token) {
      args.headers.authorization = `Bearer ${newTokens.token}`;
      result = await withLatencyMetric(`auth:retry:${typeof args.url === 'string' ? args.url : 'request'}`, () =>
        baseQuery(args, api, extraOptions),
      );
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
              access_token: accessToken ?? undefined,
              refresh_token: (payload as any)?.refreshToken ?? undefined,
            }),
          );
          instrumentApiSuccess('login');
        } catch (error) {
          instrumentApiError('login', error, {
            baseUrl: getApiUrl(),
            endpoint: API_ENDPOINTS.user.login,
          });
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
              access_token: accessToken ?? undefined,
              refresh_token: (payload as any)?.refreshToken ?? undefined,
            }),
          );
          instrumentApiSuccess('register');
        } catch (error) {
          instrumentApiError('register', error);
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
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const payload = unwrapSuccessPayload(data);
          if (payload?.user) {
            // Update Redux auth state with new user data from server
            dispatch(
              setCredentials({
                user: payload.user,
                access_token: undefined,
                refresh_token: undefined,
              }),
            );
          }
          instrumentApiSuccess('update_user');
        } catch (error) {
          instrumentApiError('update_user', error);
        }
      },
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
          instrumentApiSuccess('logout');
        } catch {
          dispatch(logout());
          instrumentApiError('logout', new Error('Logout request failed'));
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
