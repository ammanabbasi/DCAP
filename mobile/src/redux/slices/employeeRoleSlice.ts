import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define employee role state interface
export interface EmployeeRoleState {
  data: Record<string, any>;
  loading: boolean;
  error: string | null;
}

// Define initial state with proper typing
const initialState: EmployeeRoleState = {
  data: {},
  loading: false,
  error: null,
};

export const employeeRoleSlice = createSlice({
    name: 'employeeRole',
    initialState,
    reducers: {
      saveEmployeeRole: (state, action: PayloadAction<Record<string, any>>) => {
        state.data = { ...state.data, ...action.payload };
      },
      setEmployeeRoleLoading: (state, action: PayloadAction<boolean>) => {
        state.loading = action.payload;
      },
      setEmployeeRoleError: (state, action: PayloadAction<string | null>) => {
        state.error = action.payload;
      },
    },
  });
  
  export const { saveEmployeeRole, setEmployeeRoleLoading, setEmployeeRoleError } = employeeRoleSlice.actions;
  export default employeeRoleSlice.reducer;
  