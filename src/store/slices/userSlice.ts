/**
 * User profile state slice.
 * Manages current user data.
 * 
 * Note: Authentication data (token, refreshToken, isLoggedIn) is managed by authSlice.
 * This slice manages only user profile data.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  _id?: string;
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  address?: string;
  base_currency?: string;
}

interface UserState {
  userDetails: UserProfile | null;
}

const initialState: UserState = {
  userDetails: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile(state, action: PayloadAction<UserProfile>) {
      state.userDetails = action.payload;
    },
    updateUserProfile(state, action: PayloadAction<Partial<UserProfile>>) {
      if (state.userDetails) {
        state.userDetails = { ...state.userDetails, ...action.payload };
      }
    },
    clearUserProfile(state) {
      state.userDetails = null;
    },
  },
});

export const { setUserProfile, updateUserProfile, clearUserProfile } = userSlice.actions;
export default userSlice.reducer;
