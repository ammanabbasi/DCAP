import { configureStore } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';
import persistedRootReducer from './rootReducer';
import { UserState } from './slices/userSlice';
import { DropdownState } from './slices/dropdownSlice';
import { SnackbarState } from './slices/snackbarSlice';
import { ThemeState } from './slices/themeSlice';
import { CrmDropdownState } from './slices/crmDropdownSlice';
import { EmployeeRoleState } from './slices/employeeRoleSlice';

// Define the complete root state interface
export interface RootState {
  userReducer: UserState;
  dropdownReducer: DropdownState;
  snackbarReducer: SnackbarState;
  themeReducer: ThemeState;
  crmDropdownReducer: CrmDropdownState;
  employeeRoleReducer: EmployeeRoleState;
  _persist?: {
    version: number;
    rehydrated: boolean;
  };
}

const store = configureStore({
  reducer: persistedRootReducer,
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: { 
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'] 
      },
    }),
});

// Export types for TypeScript
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

export default store;
export const persistor = persistStore(store);
