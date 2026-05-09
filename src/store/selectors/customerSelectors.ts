/**
 * Customer selectors using createSelector for memoization.
 * Prevents unnecessary re-renders when derived state hasn't changed.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { Customer } from '../../types';

const selectCustomerUI = (state: RootState) => state.customerUI;
const selectDataApiState = (state: RootState) => state.dataApi;

/**
 * Get RTK Query customer data and status
 */
export const selectCustomersQuery = createSelector(
  [selectDataApiState],
  (dataApi) => {
    const queryState = (dataApi as any).queries?.['getCustomers(undefined)'];
    return {
      data: queryState?.data ?? [],
      isLoading: queryState?.status === 'pending',
      isError: queryState?.status === 'rejected',
      error: queryState?.error,
    };
  },
);

/**
 * Get all customers from RTK Query
 */
export const selectAllCustomers = createSelector(
  [selectCustomersQuery],
  (query) => query.data as Customer[],
);

/**
 * Get loading state
 */
export const selectCustomersLoading = createSelector(
  [selectCustomersQuery],
  (query) => query.isLoading,
);

/**
 * Get error state
 */
export const selectCustomersError = createSelector(
  [selectCustomersQuery],
  (query) => query.error,
);

/**
 * Get customer sort preference
 */
export const selectCustomerSortBy = createSelector(
  [selectCustomerUI],
  (ui) => ui.sortBy,
);

/**
 * Get customer filter text
 */
export const selectCustomerFilterText = createSelector(
  [selectCustomerUI],
  (ui) => ui.filterText,
);

/**
 * Get filtered and sorted customers
 */
export const selectFilteredCustomers = createSelector(
  [selectAllCustomers, selectCustomerFilterText, selectCustomerSortBy],
  (customers, filterText, sortBy) => {
    let filtered = customers;

    // Apply filter
    if (filterText.trim()) {
      const lowerFilter = filterText.toLowerCase();
      filtered = customers.filter(
        (c: Customer) =>
          (c.name?.toLowerCase() ?? '').includes(lowerFilter) ||
          (c.email?.toLowerCase() ?? '').includes(lowerFilter),
      );
    }

    // Apply sort
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name ?? '').localeCompare(b.name ?? '');
        case 'email':
          return (a.email ?? '').localeCompare(b.email ?? '');
        case 'created':
        default:
          return (b.createdAt ?? 0) - (a.createdAt ?? 0);
      }
    });

    return sorted;
  },
);

/**
 * Get customer by ID
 */
export const selectCustomerById = createSelector(
  [(state: RootState, id: string) => selectAllCustomers(state), (state, id) => id],
  (customers, id) => customers.find((c: Customer) => c._id === id) ?? null,
);
