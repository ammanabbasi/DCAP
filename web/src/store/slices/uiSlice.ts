import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
}

interface UiState {
  snackbar: SnackbarState;
  loading: boolean;
  currentPage: string;
}

const initialState: UiState = {
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
  loading: false,
  currentPage: 'dashboard',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showSnackbar: (state, action: PayloadAction<Omit<SnackbarState, 'open'>>) => {
      state.snackbar = { ...action.payload, open: true };
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
  },
});

export const { showSnackbar, hideSnackbar, setLoading, setCurrentPage } = uiSlice.actions;
export default uiSlice.reducer;