import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define snackbar state interface
export interface SnackbarState {
  snackbarVisible: boolean;
  snackbarMessage: string;
}

// Define initial state with proper typing
const initialState: SnackbarState = {
  snackbarVisible: false,
  snackbarMessage: '',
};

export const snackBarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    enableSnackbar: (state, action: PayloadAction<string>) => {
      state.snackbarVisible = true;
      state.snackbarMessage = action.payload;
    },
    disableSnackbar: (state: any) => {
      state.snackbarVisible = false;
      state.snackbarMessage = '';
    },
  },
});

export const { enableSnackbar, disableSnackbar } = snackBarSlice.actions;
export default snackBarSlice.reducer;
