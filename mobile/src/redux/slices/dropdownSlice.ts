import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define dropdown state interface
export interface DropdownState {
  data: Record<string, any>;
  loading: boolean;
  error: string | null;
}

// Define initial state with proper typing
const initialState: DropdownState = {
  data: {},
  loading: false,
  error: null,
};

export const dropdownSlice = createSlice({
    name: 'dropdown',
    initialState,
    reducers: {
      saveDropDown: (state, action: PayloadAction<Record<string, any>>) => {
        state.data = { ...state.data, ...action.payload };
      },
      setDropdownLoading: (state, action: PayloadAction<boolean>) => {
        state.loading = action.payload;
      },
      setDropdownError: (state, action: PayloadAction<string | null>) => {
        state.error = action.payload;
      },
    },
  });
  
  export const { saveDropDown, setDropdownLoading, setDropdownError } = dropdownSlice.actions;
  export default dropdownSlice.reducer;
  