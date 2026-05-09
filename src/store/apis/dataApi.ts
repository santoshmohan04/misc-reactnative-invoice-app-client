import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_ENDPOINTS } from '@shared-contracts';
import { unwrapSuccessPayload } from '@shared-api';
import { getApiUrl } from '@config/env';
import type { RootState } from '../index';

/**
 * Base query: adds authorization header from Redux auth state.
 */
const baseQuery = fetchBaseQuery({
  baseUrl: getApiUrl(),
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Data API – CRUD for invoices, customers, and items.
 * Matches actual backend endpoints (single edit endpoint handles create + update).
 */
export const dataApi = createApi({
  reducerPath: 'dataApi',
  baseQuery,
  tagTypes: ['Invoice', 'Customer', 'Item'],
  endpoints: (builder) => ({

    // ── INVOICE ──────────────────────────────────────────────────────────────

    getInvoices: builder.query<any[], void>({
      query: () => API_ENDPOINTS.invoice.all,
      transformResponse: (response: any) => {
        const payload = unwrapSuccessPayload(response);
        return Array.isArray(payload) ? payload : (payload as any)?.invoices ?? [];
      },
      providesTags: [{ type: 'Invoice', id: 'LIST' }],
    }),

    /** Create (no _id) or update (with _id) an invoice via POST /invoice/edit */
    upsertInvoice: builder.mutation<any, any>({
      query: (body) => ({
        url: API_ENDPOINTS.invoice.edit,
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => unwrapSuccessPayload(response),
      invalidatesTags: [{ type: 'Invoice', id: 'LIST' }],
    }),

    /** Send invoice by email (POST /invoice/send) */
    sendInvoice: builder.mutation<any, { invoiceId: string }>({
      query: (body) => ({
        url: API_ENDPOINTS.invoice.send,
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => unwrapSuccessPayload(response),
    }),

    // ── CUSTOMER ─────────────────────────────────────────────────────────────

    getCustomers: builder.query<any[], void>({
      query: () => API_ENDPOINTS.customer.all,
      transformResponse: (response: any) => {
        const payload = unwrapSuccessPayload(response);
        return Array.isArray(payload) ? payload : (payload as any)?.customers ?? [];
      },
      providesTags: [{ type: 'Customer', id: 'LIST' }],
    }),

    /** Create (no _id) or update (with _id) a customer via POST /customer/edit */
    upsertCustomer: builder.mutation<any, any>({
      query: (body) => ({
        url: API_ENDPOINTS.customer.edit,
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => unwrapSuccessPayload(response),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),

    // ── ITEM ─────────────────────────────────────────────────────────────────

    getItems: builder.query<any[], void>({
      query: () => API_ENDPOINTS.item.all,
      transformResponse: (response: any) => {
        const payload = unwrapSuccessPayload(response);
        return Array.isArray(payload) ? payload : (payload as any)?.items ?? [];
      },
      providesTags: [{ type: 'Item', id: 'LIST' }],
    }),

    /** Create (no _id) or update (with _id) an item via POST /item/edit */
    upsertItem: builder.mutation<any, any>({
      query: (body) => ({
        url: API_ENDPOINTS.item.edit,
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => unwrapSuccessPayload(response),
      invalidatesTags: [{ type: 'Item', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useUpsertInvoiceMutation,
  useSendInvoiceMutation,
  useGetCustomersQuery,
  useUpsertCustomerMutation,
  useGetItemsQuery,
  useUpsertItemMutation,
} = dataApi;
