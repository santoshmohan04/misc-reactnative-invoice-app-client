import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
  createApi,
} from '@reduxjs/toolkit/query/react';
import { logout, updateTokens } from './authSlice';
import type { RootState } from './index';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

const unwrapSuccessPayload = <T>(responseBody: T) => {
  if (responseBody && typeof responseBody === 'object' && 'data' in (responseBody as Record<string, unknown>)) {
    return (responseBody as { data: unknown }).data;
  }
  return responseBody;
};

const extractAccessToken = (response: Response | undefined, parsedBody: unknown): string | null => {
  const headerToken = response?.headers.get('x-auth')
    || response?.headers.get('x-access-token')
    || response?.headers.get('authorization');

  if (headerToken) {
    return headerToken.replace(/^Bearer\s+/i, '');
  }

  const payload = unwrapSuccessPayload(parsedBody);
  if (payload && typeof payload === 'object') {
    const tokenPayload = payload as {
      accessToken?: string;
      token?: string;
      authToken?: string;
      tokens?: { accessToken?: string; token?: string };
    };
    return tokenPayload.accessToken
      || tokenPayload.token
      || tokenPayload.authToken
      || tokenPayload.tokens?.accessToken
      || tokenPayload.tokens?.token
      || null;
  }

  return null;
};

const extractRefreshToken = (response: Response | undefined, parsedBody: unknown): string | null => {
  const headerRefreshToken = response?.headers.get('x-refresh-token');
  if (headerRefreshToken) {
    return headerRefreshToken;
  }

  const payload = unwrapSuccessPayload(parsedBody);
  if (payload && typeof payload === 'object') {
    const refreshPayload = payload as {
      refreshToken?: string;
      tokens?: { refreshToken?: string };
    };
    return refreshPayload.refreshToken || refreshPayload.tokens?.refreshToken || null;
  }

  return null;
};

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
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) {
    return result;
  }

  const state = api.getState() as RootState;
  const refreshToken = state.auth.refreshToken;

  if (!refreshToken) {
    api.dispatch(logout());
    return result;
  }

  const refreshEndpoints = ['/user/refresh', '/auth/refresh'];

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
      continue;
    }

    const newAccessToken = extractAccessToken(refreshResult.meta?.response, refreshResult.data);
    const newRefreshToken = extractRefreshToken(refreshResult.meta?.response, refreshResult.data) || refreshToken;

    if (!newAccessToken) {
      continue;
    }

    api.dispatch(updateTokens({ token: newAccessToken, refreshToken: newRefreshToken }));
    result = await rawBaseQuery(args, api, extraOptions);
    return result;
  }

  api.dispatch(logout());
  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Invoice', 'Customer', 'Item', 'User'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/user/login',
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
      query: (userData) => ({
        url: '/user/register',
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
        url: '/user/user',
      }),
      providesTags: ['User'],
      transformResponse: (response: unknown) => unwrapSuccessPayload(response),
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: '/user/logout',
        method: 'DELETE',
      }),
    }),
    getInvoices: builder.query({
      query: () => ({
        url: '/invoice/all',
      }),
      providesTags: ['Invoice'],
      transformResponse: (response: unknown) => unwrapSuccessPayload(response),
    }),
    createInvoice: builder.mutation({
      query: (invoice) => ({
        url: '/invoice/edit',
        method: 'POST',
        body: invoice,
      }),
      invalidatesTags: ['Invoice'],
      transformResponse: (response: unknown) => unwrapSuccessPayload(response),
    }),
    getCustomers: builder.query({
      query: () => ({
        url: '/customer/all',
      }),
      providesTags: ['Customer'],
      transformResponse: (response: unknown) => unwrapSuccessPayload(response),
    }),
    createCustomer: builder.mutation({
      query: (customer) => ({
        url: '/customer/edit',
        method: 'POST',
        body: customer,
      }),
      invalidatesTags: ['Customer'],
      transformResponse: (response: unknown) => unwrapSuccessPayload(response),
    }),
    getItems: builder.query({
      query: () => ({
        url: '/item/all',
      }),
      providesTags: ['Item'],
      transformResponse: (response: unknown) => unwrapSuccessPayload(response),
    }),
    createItem: builder.mutation({
      query: (item) => ({
        url: '/item/edit',
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