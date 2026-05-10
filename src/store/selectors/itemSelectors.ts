/**
 * Item selectors using createSelector for memoization.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { Item } from '../../types';

const selectItemUI = (state: RootState) => state.itemUI;
const selectDataApiState = (state: RootState) => state.dataApi;

/**
 * Get RTK Query item data and status
 */
export const selectItemsQuery = createSelector(
  [selectDataApiState],
  (dataApi) => {
    const queryState = (dataApi as any).queries?.['getItems(undefined)'];
    return {
      data: queryState?.data ?? [],
      isLoading: queryState?.status === 'pending',
      isError: queryState?.status === 'rejected',
      error: queryState?.error,
    };
  },
);

/**
 * Get all items
 */
export const selectAllItems = createSelector(
  [selectItemsQuery],
  (query) => query.data as Item[],
);

/**
 * Get loading state
 */
export const selectItemsLoading = createSelector(
  [selectItemsQuery],
  (query) => query.isLoading,
);

/**
 * Get error state
 */
export const selectItemsError = createSelector(
  [selectItemsQuery],
  (query) => query.error,
);

/**
 * Get item sort preference
 */
export const selectItemSortBy = createSelector(
  [selectItemUI],
  (ui) => ui.sortBy,
);

/**
 * Get item filter text
 */
export const selectItemFilterText = createSelector(
  [selectItemUI],
  (ui) => ui.filterText,
);

/**
 * Get filtered and sorted items
 */
export const selectFilteredItems = createSelector(
  [selectAllItems, selectItemFilterText, selectItemSortBy],
  (items, filterText, sortBy) => {
    let filtered = items;

    // Apply filter
    if (filterText.trim()) {
      const lowerFilter = filterText.toLowerCase();
      filtered = items.filter(
        (item: Item) => (item.name?.toLowerCase() ?? '').includes(lowerFilter),
      );
    }

    // Apply sort
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (b.price ?? 0) - (a.price ?? 0);
        case 'created':
          return (b.createdAt ?? 0) - (a.createdAt ?? 0);
        case 'name':
        default:
          return (a.name ?? '').localeCompare(b.name ?? '');
      }
    });

    return sorted;
  },
);

/**
 * Get item by ID
 */
export const selectItemById = createSelector(
  [(state: RootState, id: string) => selectAllItems(state), (state, id) => id],
  (items, id) => items.find((item: Item) => item._id === id) ?? null,
);

/**
 * Get item count
 */
export const selectItemCount = createSelector(
  [selectAllItems],
  (items) => items.length,
);
