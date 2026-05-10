/**
 * Customer UI state slice.
 * Manages customer list filters and sorting.
 * 
 * API state (data, loading, error) is managed by RTK Query.
 * This slice manages only UI state related to customers.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CustomerUIState {
  sortBy: 'name' | 'email' | 'created';
  filterText: string;
}

const initialState: CustomerUIState = {
  sortBy: 'name',
  filterText: '',
};

const customerSlice = createSlice({
  name: 'customerUI',
  initialState,
  reducers: {
    setSortBy(state, action: PayloadAction<CustomerUIState['sortBy']>) {
      state.sortBy = action.payload;
    },
    setFilterText(state, action: PayloadAction<string>) {
      state.filterText = action.payload;
    },
    resetFilters(state) {
      state.sortBy = 'name';
      state.filterText = '';
    },
  },
});

export const { setSortBy, setFilterText, resetFilters } = customerSlice.actions;
export default customerSlice.reducer;
