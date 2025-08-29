import { configureStore } from '@reduxjs/toolkit';
import userReducer, {
  saveUser,
  clearUser,
  updateUser,
  setLoading,
  setError,
  saveUserAssignedUrl,
  clearUserAssignedUrl,
  initialState,
  UserState
} from '../userSlice';
import { mockUser } from '../../../tests/utils/testUtils';

describe('userSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userReducer,
      },
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().user;
      expect(state).toEqual(initialState);
    });
  });

  describe('saveUser action', () => {
    it('should save user data and set authenticated state', () => {
      const action = saveUser(mockUser);
      const result = userReducer(initialState, action);

      expect(result.currentUser).toEqual(mockUser);
      expect(result.isAuthenticated).toBe(true);
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should replace existing user data', () => {
      const existingUser = { ...mockUser, id: '2', email: 'old@example.com' };
      const state: UserState = {
        ...initialState,
        currentUser: existingUser,
        isAuthenticated: true,
      };

      const action = saveUser(mockUser);
      const result = userReducer(state, action);

      expect(result.currentUser).toEqual(mockUser);
      expect(result.currentUser?.id).toBe(mockUser.id);
      expect(result.currentUser?.email).toBe(mockUser.email);
    });

    it('should handle user with missing optional fields', () => {
      const minimalUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer' as const,
        isVerified: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const action = saveUser(minimalUser);
      const result = userReducer(initialState, action);

      expect(result.currentUser).toEqual(minimalUser);
      expect(result.isAuthenticated).toBe(true);
    });
  });

  describe('clearUser action', () => {
    it('should clear user data and reset authentication state', () => {
      const state: UserState = {
        currentUser: mockUser,
        isAuthenticated: true,
        loading: false,
        error: null,
        userAssignedUrl: 'https://test.autodealerscloud.com',
      };

      const action = clearUser();
      const result = userReducer(state, action);

      expect(result.currentUser).toBeNull();
      expect(result.isAuthenticated).toBe(false);
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.userAssignedUrl).toBeNull();
    });

    it('should clear user from already cleared state without error', () => {
      const action = clearUser();
      const result = userReducer(initialState, action);

      expect(result).toEqual(initialState);
    });
  });

  describe('updateUser action', () => {
    it('should update specific user fields', () => {
      const state: UserState = {
        ...initialState,
        currentUser: mockUser,
        isAuthenticated: true,
      };

      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '555-9999',
      };

      const action = updateUser(updateData);
      const result = userReducer(state, action);

      expect(result.currentUser).toEqual({
        ...mockUser,
        ...updateData,
      });
      expect(result.isAuthenticated).toBe(true);
    });

    it('should not update user when no current user exists', () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const action = updateUser(updateData);
      const result = userReducer(initialState, action);

      expect(result.currentUser).toBeNull();
      expect(result.isAuthenticated).toBe(false);
    });

    it('should handle partial updates', () => {
      const state: UserState = {
        ...initialState,
        currentUser: mockUser,
        isAuthenticated: true,
      };

      const action = updateUser({ firstName: 'NewFirstName' });
      const result = userReducer(state, action);

      expect(result.currentUser?.firstName).toBe('NewFirstName');
      expect(result.currentUser?.lastName).toBe(mockUser.lastName);
      expect(result.currentUser?.email).toBe(mockUser.email);
    });

    it('should handle empty update object', () => {
      const state: UserState = {
        ...initialState,
        currentUser: mockUser,
        isAuthenticated: true,
      };

      const action = updateUser({});
      const result = userReducer(state, action);

      expect(result.currentUser).toEqual(mockUser);
      expect(result.isAuthenticated).toBe(true);
    });
  });

  describe('setLoading action', () => {
    it('should set loading state to true', () => {
      const action = setLoading(true);
      const result = userReducer(initialState, action);

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should set loading state to false', () => {
      const state: UserState = {
        ...initialState,
        loading: true,
      };

      const action = setLoading(false);
      const result = userReducer(state, action);

      expect(result.loading).toBe(false);
    });

    it('should clear error when setting loading to true', () => {
      const state: UserState = {
        ...initialState,
        loading: false,
        error: 'Previous error',
      };

      const action = setLoading(true);
      const result = userReducer(state, action);

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('setError action', () => {
    it('should set error message and stop loading', () => {
      const state: UserState = {
        ...initialState,
        loading: true,
      };

      const errorMessage = 'Authentication failed';
      const action = setError(errorMessage);
      const result = userReducer(state, action);

      expect(result.error).toBe(errorMessage);
      expect(result.loading).toBe(false);
    });

    it('should replace existing error message', () => {
      const state: UserState = {
        ...initialState,
        error: 'Old error',
      };

      const newError = 'New error message';
      const action = setError(newError);
      const result = userReducer(state, action);

      expect(result.error).toBe(newError);
    });

    it('should handle null error message', () => {
      const state: UserState = {
        ...initialState,
        error: 'Existing error',
      };

      const action = setError(null);
      const result = userReducer(state, action);

      expect(result.error).toBeNull();
      expect(result.loading).toBe(false);
    });
  });

  describe('saveUserAssignedUrl action', () => {
    it('should save user assigned URL', () => {
      const url = 'https://demo.autodealerscloud.com';
      const action = saveUserAssignedUrl(url);
      const result = userReducer(initialState, action);

      expect(result.userAssignedUrl).toBe(url);
    });

    it('should replace existing URL', () => {
      const state: UserState = {
        ...initialState,
        userAssignedUrl: 'https://old.autodealerscloud.com',
      };

      const newUrl = 'https://new.autodealerscloud.com';
      const action = saveUserAssignedUrl(newUrl);
      const result = userReducer(state, action);

      expect(result.userAssignedUrl).toBe(newUrl);
    });
  });

  describe('clearUserAssignedUrl action', () => {
    it('should clear user assigned URL', () => {
      const state: UserState = {
        ...initialState,
        userAssignedUrl: 'https://test.autodealerscloud.com',
      };

      const action = clearUserAssignedUrl();
      const result = userReducer(state, action);

      expect(result.userAssignedUrl).toBeNull();
    });

    it('should clear URL from already cleared state without error', () => {
      const action = clearUserAssignedUrl();
      const result = userReducer(initialState, action);

      expect(result.userAssignedUrl).toBeNull();
    });
  });

  describe('State immutability', () => {
    it('should not mutate original state', () => {
      const originalState: UserState = {
        ...initialState,
        currentUser: { ...mockUser },
      };
      const stateCopy = JSON.parse(JSON.stringify(originalState));

      const action = updateUser({ firstName: 'Changed' });
      userReducer(originalState, action);

      expect(originalState).toEqual(stateCopy);
    });

    it('should not mutate user object when updating', () => {
      const originalUser = { ...mockUser };
      const state: UserState = {
        ...initialState,
        currentUser: originalUser,
        isAuthenticated: true,
      };

      const action = updateUser({ firstName: 'Changed' });
      const result = userReducer(state, action);

      expect(originalUser.firstName).toBe(mockUser.firstName);
      expect(result.currentUser?.firstName).toBe('Changed');
    });
  });

  describe('Complex state transitions', () => {
    it('should handle login flow sequence', () => {
      let state = initialState;

      // Start loading
      state = userReducer(state, setLoading(true));
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();

      // Save user on successful login
      state = userReducer(state, saveUser(mockUser));
      expect(state.currentUser).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
    });

    it('should handle failed login flow', () => {
      let state = initialState;

      // Start loading
      state = userReducer(state, setLoading(true));
      expect(state.loading).toBe(true);

      // Set error on failed login
      state = userReducer(state, setError('Invalid credentials'));
      expect(state.error).toBe('Invalid credentials');
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.currentUser).toBeNull();
    });

    it('should handle logout flow', () => {
      let state: UserState = {
        currentUser: mockUser,
        isAuthenticated: true,
        loading: false,
        error: null,
        userAssignedUrl: 'https://test.autodealerscloud.com',
      };

      state = userReducer(state, clearUser());

      expect(state.currentUser).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.userAssignedUrl).toBeNull();
    });

    it('should handle profile update flow', () => {
      let state: UserState = {
        ...initialState,
        currentUser: mockUser,
        isAuthenticated: true,
      };

      // Start loading for profile update
      state = userReducer(state, setLoading(true));
      expect(state.loading).toBe(true);

      // Update user profile
      const updatedData = { firstName: 'Updated', lastName: 'Profile' };
      state = userReducer(state, updateUser(updatedData));
      expect(state.currentUser?.firstName).toBe('Updated');
      expect(state.currentUser?.lastName).toBe('Profile');

      // Stop loading
      state = userReducer(state, setLoading(false));
      expect(state.loading).toBe(false);
    });
  });

  describe('Integration with store', () => {
    it('should dispatch actions correctly through store', () => {
      store.dispatch(setLoading(true));
      expect(store.getState().user.loading).toBe(true);

      store.dispatch(saveUser(mockUser));
      expect(store.getState().user.currentUser).toEqual(mockUser);
      expect(store.getState().user.isAuthenticated).toBe(true);
      expect(store.getState().user.loading).toBe(false);

      const updateData = { firstName: 'Store Updated' };
      store.dispatch(updateUser(updateData));
      expect(store.getState().user.currentUser?.firstName).toBe('Store Updated');

      store.dispatch(clearUser());
      expect(store.getState().user.currentUser).toBeNull();
      expect(store.getState().user.isAuthenticated).toBe(false);
    });

    it('should maintain state consistency across multiple actions', () => {
      const url = 'https://multi.autodealerscloud.com';
      
      store.dispatch(saveUserAssignedUrl(url));
      store.dispatch(setLoading(true));
      store.dispatch(saveUser(mockUser));

      const finalState = store.getState().user;

      expect(finalState.userAssignedUrl).toBe(url);
      expect(finalState.currentUser).toEqual(mockUser);
      expect(finalState.isAuthenticated).toBe(true);
      expect(finalState.loading).toBe(false);
      expect(finalState.error).toBeNull();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle undefined payload gracefully', () => {
      // TypeScript should prevent this, but testing runtime behavior
      const state: UserState = {
        ...initialState,
        currentUser: mockUser,
        isAuthenticated: true,
      };

      // @ts-ignore - Testing runtime behavior
      const result = userReducer(state, { type: 'user/updateUser', payload: undefined });

      expect(result.currentUser).toEqual(mockUser);
      expect(result.isAuthenticated).toBe(true);
    });

    it('should handle invalid action types gracefully', () => {
      const state: UserState = {
        ...initialState,
        currentUser: mockUser,
      };

      // @ts-ignore - Testing runtime behavior
      const result = userReducer(state, { type: 'invalid/action', payload: {} });

      expect(result).toEqual(state);
    });

    it('should handle extremely large user objects', () => {
      const largeUser = {
        ...mockUser,
        largeField: 'x'.repeat(10000), // Large string
        arrayField: new Array(1000).fill('data'), // Large array
      };

      const action = saveUser(largeUser as any);
      const result = userReducer(initialState, action);

      expect(result.currentUser).toEqual(largeUser);
      expect(result.isAuthenticated).toBe(true);
    });
  });
});