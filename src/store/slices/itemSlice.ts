/**
 * Item UI state slice.
 * Manages item list filters and sorting.
 * 
 * API state (data, loading, error) is managed by RTK Query.
 * This slice manages only UI state related to items.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ItemUIState {
  sortBy: 'name' | 'price' | 'created';
  filterText: string;
}

const initialState: ItemUIState = {
  sortBy: 'name',
  filterText: '',
};

const itemSlice = createSlice({
  name: 'itemUI',
  initialState,
  reducers: {
    setSortBy(state, action: PayloadAction<ItemUIState['sortBy']>) {
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

export const { setSortBy, setFilterText, resetFilters } = itemSlice.actions;
export default itemSlice.reducer;
