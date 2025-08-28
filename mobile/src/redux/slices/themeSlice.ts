import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define theme state interface
export interface ThemeState {
  safeAreaViewBackground: string;
  statusBarColor: string;
}

// Define initial state with proper typing
const initialState: ThemeState = {
  safeAreaViewBackground: 'white',
  statusBarColor: 'white',
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    updateSafeAreaBackground: (state, action: PayloadAction<string>) => {
      state.safeAreaViewBackground = action.payload;
    },
    updateStatusBarColor: (state, action: PayloadAction<string>) => {
      state.statusBarColor = action.payload;
    },
  },
});

export const { updateSafeAreaBackground,updateStatusBarColor } = themeSlice.actions;
export default themeSlice.reducer;
