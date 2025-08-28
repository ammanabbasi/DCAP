import {combineReducers} from 'redux';
import {persistReducer} from 'redux-persist';

import {MMKVStorage} from './mmkv';
import dropdownSlice from './slices/dropdownSlice';
import snackBarSlice from './slices/snackbarSlice';
import themeSlice from './slices/themeSlice';
import userSlice from './slices/userSlice';
import crmDropdownSlice from './slices/crmDropdownSlice';
import employeeRoleSlice from './slices/employeeRoleSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage: MMKVStorage,
};
const rootReducer = combineReducers({
  userReducer: userSlice,
  snackbarReducer: snackBarSlice,
  themeReducer: themeSlice,
  dropdownReducer: dropdownSlice,
  crmDropdownReducer: crmDropdownSlice,
  employeeRoleReducer: employeeRoleSlice,
});
const persistedRootReducer = persistReducer(persistConfig, rootReducer);
export default persistedRootReducer;
