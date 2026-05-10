/**
 * Invoice UI state slice.
 * Manages invoice list filters and sorting.
 * 
 * API state (data, loading, error) is managed by RTK Query.
 * This slice manages only UI state related to invoices.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InvoiceUIState {
  sortBy: 'created' | 'dueDate' | 'customer' | 'total';
  filterBy: 'all' | 'draft' | 'sent' | 'paid';
}

const initialState: InvoiceUIState = {
  sortBy: 'created',
  filterBy: 'all',
};

const invoiceSlice = createSlice({
  name: 'invoiceUI',
  initialState,
  reducers: {
    setSortBy(state, action: PayloadAction<InvoiceUIState['sortBy']>) {
      state.sortBy = action.payload;
    },
    setFilterBy(state, action: PayloadAction<InvoiceUIState['filterBy']>) {
      state.filterBy = action.payload;
    },
    resetFilters(state) {
      state.sortBy = 'created';
      state.filterBy = 'all';
    },
  },
});

export const { setSortBy, setFilterBy, resetFilters } = invoiceSlice.actions;
export default invoiceSlice.reducer;
