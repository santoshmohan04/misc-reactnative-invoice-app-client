import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
  createApi,
} from '@reduxjs/toolkit/query/react';
import { API_ENDPOINTS, LoginRequestDto, SignupRequestDto } from '@contracts/index';
import {
  extractAccessToken,
  extractRefreshToken,
  RefreshMutex,
  unwrapSuccessPayload,
  withRetry,
} from '@shared-api/index';
import { logout, updateTokens } from './authSlice';
import type { RootState } from './index';
import { observeApiError, observeApiLatency } from '@/lib/observability';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
const refreshMutex = new RefreshMutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const operation = typeof args === 'string' ? args : args.url;
  const startedAt = performance.now();

  let result = await withRetry(
    async () => {
      const queryResult = await rawBaseQuery(args, api, extraOptions);
      if (queryResult.error && (typeof queryResult.error.status === 'number' ? queryResult.error.status >= 500 : true)) {
        throw { status: queryResult.error.status };
      }
      return queryResult;
    },
    {
      maxAttempts: 2,
      baseDelayMs: 200,
    },
  ).catch(() => rawBaseQuery(args, api, extraOptions));

  if (result.error) {
    observeApiError(String(operation ?? 'request'), result.error, {
      phase: 'initial_request',
      status: result.error.status,
    });
  }

  if (result.error?.status !== 401) {
    observeApiLatency(String(operation ?? 'request'), startedAt, !result.error);
    return result;
  }

  const state = api.getState() as RootState;
  const refreshToken = state.auth.refreshToken;

  if (!refreshToken) {
    api.dispatch(logout());
    return result;
  }

  const refreshedTokens = await refreshMutex.run(async () => {
    const refreshEndpoints = [API_ENDPOINTS.user.refreshPrimary, API_ENDPOINTS.user.refreshFallback];

    for (const refreshUrl of refreshEndpoints) {
      const refreshResult = await rawBaseQuery(
        {
          url: refreshUrl,
          method: 'POST',
          body: { refreshToken },
          headers: {
            'x-refresh-token': refreshToken,
          },
        },
        api,
        extraOptions,
      );

      if (refreshResult.error) {
        observeApiError('auth_refresh', refreshResult.error, {
          refreshUrl,
          status: refreshResult.error.status,
        });
        continue;
      }

      const newAccessToken = extractAccessToken(refreshResult.meta?.response, refreshResult.data);
      const newRefreshToken = extractRefreshToken(refreshResult.meta?.response, refreshResult.data) || refreshToken;

      if (!newAccessToken) {
        continue;
      }

      return {
        token: newAccessToken,
        refreshToken: newRefreshToken,
      };
    }

    return null;
  });

  if (!refreshedTokens?.token) {
    api.dispatch(logout());
    observeApiLatency(String(operation ?? 'request'), startedAt, false);
    return result;
  }

  api.dispatch(updateTokens(refreshedTokens));
  result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    observeApiError(String(operation ?? 'request'), result.error, {
      phase: 'retry_after_refresh',
      status: result.error.status,
    });
  }

  observeApiLatency(String(operation ?? 'request'), startedAt, !result.error);
  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Invoice', 'Customer', 'Item', 'User'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials: LoginRequestDto) => ({
        url: API_ENDPOINTS.user.login,
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: unknown, meta: { response?: Response } | undefined) => {
        const payload = unwrapSuccessPayload(response);
        const token = extractAccessToken(meta?.response, response);
        const refreshToken = extractRefreshToken(meta?.response, response);

        if (payload && typeof payload === 'object') {
          const payloadObject = payload as Record<string, unknown>;
          return {
            ...payloadObject,
            token,
            refreshToken,
            user: payloadObject.user ?? null,
          };
        }

        return {
          token,
          refreshToken,
          user: null,
        };
      },
    }),
    signup: builder.mutation({
      query: (userData: SignupRequestDto) => ({
        url: API_ENDPOINTS.user.register,
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response: unknown, meta: { response?: Response } | undefined) => {
        const payload = unwrapSuccessPayload(response);
        const token = extractAccessToken(meta?.response, response);
        const refreshToken = extractRefreshToken(meta?.response, response);

        if (payload && typeof payload === 'object') {
          const payloadObject = payload as Record<string, unknown>;
          return {
            ...payloadObject,
            token,
            refreshToken,
            user: payloadObject.user ?? null,
          };
        }

        return {
          token,
          refreshToken,
          user: null,
        };
      },
    }),
    getCurrentUser: builder.query({
      query: () => ({
        url: API_ENDPOINTS.user.profile,
      }),
      providesTags: ['User'],
      transformResponse: (response: unknown) => unwrapSuccessPayload(response),
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: API_ENDPOINTS.user.logout,
        method: 'DELETE',
      }),
    }),
    getInvoices: builder.query({
      query: () => ({
        url: API_ENDPOINTS.invoice.all,
      }),
      providesTags: ['Invoice'],
      transformResponse: (response: unknown) => unwrapSuccessPayload(response),
    }),
    createInvoice: builder.mutation({
      query: (invoice) => ({
        url: API_ENDPOINTS.invoice.edit,
        method: 'POST',
        body: invoice,
      }),
      invalidatesTags: ['Invoice'],
      transformResponse: (response: unknown) => unwrapSuccessPayload(response),
    }),
    getCustomers: builder.query({
      query: () => ({
        url: API_ENDPOINTS.customer.all,
      }),
      providesTags: ['Customer'],
      transformResponse: (response: unknown) => unwrapSuccessPayload(response),
    }),
    createCustomer: builder.mutation({
      query: (customer) => ({
        url: API_ENDPOINTS.customer.edit,
        method: 'POST',
        body: customer,
      }),
      invalidatesTags: ['Customer'],
      transformResponse: (response: unknown) => unwrapSuccessPayload(response),
    }),
    getItems: builder.query({
      query: () => ({
        url: API_ENDPOINTS.item.all,
      }),
      providesTags: ['Item'],
      transformResponse: (response: unknown) => unwrapSuccessPayload(response),
    }),
    createItem: builder.mutation({
      query: (item) => ({
        url: API_ENDPOINTS.item.edit,
        method: 'POST',
        body: item,
      }),
      invalidatesTags: ['Item'],
      transformResponse: (response: unknown) => unwrapSuccessPayload(response),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useLogoutUserMutation,
  useGetInvoicesQuery,
  useCreateInvoiceMutation,
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useGetItemsQuery,
  useCreateItemMutation,
} = apiSlice;