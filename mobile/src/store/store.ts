import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { reduxPersistStorage } from '../redux/mmkv/storage';
import { baseApi } from './api/baseApi';

// Import existing slices
import userReducer from '../redux/slices/userSlice';
import dropdownReducer from '../redux/slices/dropdownSlice';
import snackbarReducer from '../redux/slices/snackbarSlice';
import themeReducer from '../redux/slices/themeSlice';
import crmDropdownReducer from '../redux/slices/crmDropdownSlice';
import employeeRoleReducer from '../redux/slices/employeeRoleSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: reduxPersistStorage,
  whitelist: ['userReducer', 'themeReducer', 'employeeRoleReducer'],
  blacklist: [baseApi.reducerPath],
};

// Root reducer combining all slices
const rootReducer = {
  // Existing slices
  userReducer,
  dropdownReducer,
  snackbarReducer,
  themeReducer,
  crmDropdownReducer,
  employeeRoleReducer,
  // RTK Query API reducer
  [baseApi.reducerPath]: baseApi.reducer,
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer as any);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates'],
      },
      immutableCheck: {
        warnAfter: 128,
      },
    }).concat(baseApi.middleware),
});

// Setup listeners for refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export persistor
export const persistor = persistStore(store);

export default store;