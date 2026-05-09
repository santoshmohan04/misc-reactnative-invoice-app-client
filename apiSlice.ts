import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('x-auth', token);
      }
      return headers;
    },
  }),
  tagTypes: ['Invoice', 'Customer', 'Item', 'User'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/invoice/all', // Re-using your mobile API endpoint
      transformResponse: (response: any) => {
        // Add logic to calculate totals/stats from the invoice list
        return response;
      },
    }),
  }),
});

export const { useGetDashboardStatsQuery } = apiSlice;