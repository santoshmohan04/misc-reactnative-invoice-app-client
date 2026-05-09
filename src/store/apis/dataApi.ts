import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_ENDPOINTS } from '@shared-contracts';
import { unwrapSuccessPayload } from '@shared-api';
import { getApiUrl } from '@config/env';
import type { RootState } from '../index';
import { instrumentApiError, instrumentApiSuccess } from '../../shared/observability/apiInstrumentation';
import { withLatencyMetric } from '../../shared/observability/performance';

/**
 * Base query: adds authorization header from Redux auth state.
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: getApiUrl(),
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQuery: typeof rawBaseQuery = async (args, api, extraOptions) => {
  const operation = typeof args === 'string' ? args : args.url;
  return withLatencyMetric(`data:${operation ?? 'request'}`, () =>
    rawBaseQuery(args, api, extraOptions),
  );
};

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
      // Optimistic update: patch the getInvoices cache to avoid full refetch.
      // If the mutation fails, the patch will be undone automatically.
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          // Use RTK Query internal util to update cached getInvoices result
          (dataApi as any).util.updateQueryData('getInvoices', undefined, (draft: any[]) => {
            try {
              const payload = arg;
              if (!payload._id) {
                // create optimistic entry with temporary id
                draft.unshift({ ...payload, _id: `temp-${Date.now()}` });
              } else {
                const idx = draft.findIndex((d) => d._id === payload._id);
                if (idx >= 0) draft[idx] = { ...draft[idx], ...payload };
                else draft.unshift(payload);
              }
            } catch (e) {
              // noop
            }
          }),
        );
        try {
          await queryFulfilled;
          instrumentApiSuccess('upsert_invoice');
        } catch (err) {
          patchResult.undo();
          instrumentApiError('upsert_invoice', err, {
            hasOptimisticUpdate: true,
          });
        }
      },
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
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          instrumentApiSuccess('upsert_customer');
        } catch (error) {
          instrumentApiError('upsert_customer', error);
        }
      },
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
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          instrumentApiSuccess('upsert_item');
        } catch (error) {
          instrumentApiError('upsert_item', error);
        }
      },
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
