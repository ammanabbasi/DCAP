import {createSlice, PayloadAction} from '@reduxjs/toolkit';

// Define user interface
export interface User {
  id: number;
  token: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: any; // For additional user properties
}

// Define the state interface
export interface UserState {
  user: User | null;
  isOnboarded: boolean;
  userAssignedUrl: string | null;
}

// Define initial state with proper typing
const initialState: UserState = {
  user: null,
  isOnboarded: false,
  userAssignedUrl: null,
};

export const userSlice = createSlice({
  name: 'userSlice',
  initialState,
  reducers: {
    saveUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    onBoardingCompleted: (state: any) => {
      state.isOnboarded = true;
    },
    saveUserAssignedUrl: (state, action: PayloadAction<string>) => {
      state.userAssignedUrl = action.payload;
    },
    removeUser: (state: any) => {
      state.user = null;
      state.isOnboarded = false;
      state.userAssignedUrl = null;
    },
  },
});

export const {
  saveUser,
  saveUserAssignedUrl,
  removeUser,
  onBoardingCompleted,
} = userSlice.actions;

export default userSlice.reducer;
