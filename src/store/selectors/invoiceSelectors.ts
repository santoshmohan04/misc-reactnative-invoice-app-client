/**
 * Invoice selectors using createSelector for memoization.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { Invoice } from '../../types';

const selectInvoiceUI = (state: RootState) => state.invoiceUI;
const selectDataApiState = (state: RootState) => state.dataApi;

/**
 * Get RTK Query invoice data and status
 */
export const selectInvoicesQuery = createSelector(
  [selectDataApiState],
  (dataApi) => {
    const queryState = (dataApi as any).queries?.['getInvoices(undefined)'];
    return {
      data: queryState?.data ?? [],
      isLoading: queryState?.status === 'pending',
      isError: queryState?.status === 'rejected',
      error: queryState?.error,
    };
  },
);

/**
 * Get all invoices
 */
export const selectAllInvoices = createSelector(
  [selectInvoicesQuery],
  (query) => query.data as Invoice[],
);

/**
 * Get loading state
 */
export const selectInvoicesLoading = createSelector(
  [selectInvoicesQuery],
  (query) => query.isLoading,
);

/**
 * Get error state
 */
export const selectInvoicesError = createSelector(
  [selectInvoicesQuery],
  (query) => query.error,
);

/**
 * Get invoice sort preference
 */
export const selectInvoiceSortBy = createSelector(
  [selectInvoiceUI],
  (ui) => ui.sortBy,
);

/**
 * Get invoice filter
 */
export const selectInvoiceFilterBy = createSelector(
  [selectInvoiceUI],
  (ui) => ui.filterBy,
);

/**
 * Get filtered and sorted invoices
 */
export const selectFilteredInvoices = createSelector(
  [selectAllInvoices, selectInvoiceFilterBy, selectInvoiceSortBy],
  (invoices, filterBy, sortBy) => {
    let filtered = invoices;

    // Apply filter by status
    if (filterBy !== 'all') {
      filtered = invoices.filter(
        (inv: Invoice) => (inv.status ?? 'draft').toLowerCase() === filterBy,
      );
    }

    // Apply sort
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'customer':
          return (a.customer_name ?? '').localeCompare(b.customer_name ?? '');
        case 'dueDate':
          return Number(b.due_date ?? 0) - Number(a.due_date ?? 0);
        case 'total':
          return (b.total ?? 0) - (a.total ?? 0);
        case 'created':
        default:
          return Number(b.created_at ?? 0) - Number(a.created_at ?? 0);
      }
    });

    return sorted;
  },
);

/**
 * Get invoice by ID
 */
export const selectInvoiceById = createSelector(
  [(state: RootState, id: string) => selectAllInvoices(state), (state, id) => id],
  (invoices, id) => invoices.find((inv: Invoice) => inv._id === id) ?? null,
);

/**
 * Get invoice count
 */
export const selectInvoiceCount = createSelector(
  [selectAllInvoices],
  (invoices) => invoices.length,
);

/**
 * Get total amount across all invoices
 */
export const selectTotalInvoicesAmount = createSelector(
  [selectAllInvoices],
  (invoices) => invoices.reduce((sum: number, inv: Invoice) => sum + (inv.total ?? 0), 0),
);
