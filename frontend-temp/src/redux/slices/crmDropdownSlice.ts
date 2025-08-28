import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define CRM dropdown state interface (same as DropdownState)
export interface CrmDropdownState {
  data: Record<string, any>;
  loading: boolean;
  error: string | null;
}

// Define initial state with proper typing
const initialState: CrmDropdownState = {
  data: {},
  loading: true,
  error: null,
};

export const crmDropdownSlice = createSlice({
    name: 'crmDropdown',
    initialState,
    reducers: {
      saveCrmDropDown: (state, action: PayloadAction<Record<string, any>>) => {
        state.data = { ...state.data, ...action.payload };
      },
      setCrmDropdownLoading: (state, action: PayloadAction<boolean>) => {
        state.loading = action.payload;
      },
      setCrmDropdownError: (state, action: PayloadAction<string | null>) => {
        state.error = action.payload;
      },
    },
  });
  
  export const { saveCrmDropDown, setCrmDropdownLoading, setCrmDropdownError } = crmDropdownSlice.actions;
  export default crmDropdownSlice.reducer;