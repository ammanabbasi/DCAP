import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import Toast from 'react-native-toast-message';
import { render, TestHelpers, mockUser, mockApiResponses } from '../../../../tests/utils/testUtils';
import LogIn from '../index';
import * as authAPIs from '../../../../Services/apis/authAPIs';

// Mock the navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
  setOptions: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
};

const mockRoute = {
  key: 'login-key',
  name: 'Login' as const,
  params: undefined,
  path: undefined,
};

// Mock the auth API
jest.mock('../../../../Services/apis/authAPIs', () => ({
  login: jest.fn(),
}));

// Mock Toast
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

describe('LogIn Screen', () => {
  const mockLoginApi = authAPIs.login as jest.MockedFunction<typeof authAPIs.login>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
  });

  const renderLoginScreen = (preloadedState = {}) => {
    return render(
      <LogIn navigation={mockNavigation} route={mockRoute} />,
      {
        preloadedState: TestHelpers.createMockState({
          user: {
            currentUser: null,
            isAuthenticated: false,
            loading: false,
            error: null,
            ...preloadedState,
          },
        }),
      }
    );
  };

  describe('Rendering', () => {
    it('should render login form correctly', () => {
      const { getByTestId, getByText } = renderLoginScreen();

      expect(getByText('Welcome Back')).toBeTruthy();
      expect(getByTestId('email-input')).toBeTruthy();
      expect(getByTestId('password-input')).toBeTruthy();
      expect(getByTestId('login-button')).toBeTruthy();
    });

    it('should show loading modal when loading', () => {
      const { getByTestId } = renderLoginScreen({
        loading: true,
      });

      expect(getByTestId('loading-modal')).toBeTruthy();
    });

    it('should display app logo', () => {
      const { getByTestId } = renderLoginScreen();

      expect(getByTestId('app-logo')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty email field', async () => {
      const { getByTestId, getByText } = renderLoginScreen();
      const loginButton = getByTestId('login-button');

      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText('Email is required')).toBeTruthy();
      });
    });

    it('should show error for invalid email format', async () => {
      const { getByTestId, getByText } = renderLoginScreen();
      const emailInput = getByTestId('email-input');
      const loginButton = getByTestId('login-button');

      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText('Please enter a valid email')).toBeTruthy();
      });
    });

    it('should show error for empty password field', async () => {
      const { getByTestId, getByText } = renderLoginScreen();
      const emailInput = getByTestId('email-input');
      const loginButton = getByTestId('login-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText('Password is required')).toBeTruthy();
      });
    });

    it('should validate password minimum length', async () => {
      const { getByTestId, getByText } = renderLoginScreen();
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, '123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText('Password must be at least 6 characters')).toBeTruthy();
      });
    });
  });

  describe('URL Configuration', () => {
    it('should show URL input when no URL is configured', () => {
      const { getByTestId } = renderLoginScreen();

      expect(getByTestId('url-input')).toBeTruthy();
      expect(getByTestId('next-button')).toBeTruthy();
    });

    it('should validate URL format', async () => {
      const { getByTestId, getByText } = renderLoginScreen();
      const urlInput = getByTestId('url-input');
      const nextButton = getByTestId('next-button');

      fireEvent.changeText(urlInput, 'invalid-url');
      fireEvent.press(nextButton);

      await waitFor(() => {
        expect(getByText('Invalid URL format')).toBeTruthy();
      });
    });

    it('should accept valid dealership URL', async () => {
      const { getByTestId, queryByTestId } = renderLoginScreen();
      const urlInput = getByTestId('url-input');
      const nextButton = getByTestId('next-button');

      fireEvent.changeText(urlInput, 'https://demo.autodealerscloud.com');
      fireEvent.press(nextButton);

      await waitFor(() => {
        expect(queryByTestId('url-input')).toBeFalsy();
        expect(getByTestId('email-input')).toBeTruthy();
      });
    });

    it('should show error for empty URL', async () => {
      const { getByTestId, getByText } = renderLoginScreen();
      const nextButton = getByTestId('next-button');

      fireEvent.press(nextButton);

      await waitFor(() => {
        expect(getByText('URL is required')).toBeTruthy();
      });
    });
  });

  describe('Login Functionality', () => {
    it('should successfully login with valid credentials', async () => {
      mockLoginApi.mockResolvedValue({
        success: true,
        data: mockApiResponses.login.data,
      });

      const { getByTestId } = renderLoginScreen();
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(mockLoginApi).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('Dashboard');
      });

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Welcome back!',
      });
    });

    it('should handle login failure with error message', async () => {
      const errorMessage = 'Invalid email or password';
      mockLoginApi.mockResolvedValue({
        success: false,
        message: errorMessage,
      });

      const { getByTestId } = renderLoginScreen();
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Login Failed',
          text2: errorMessage,
        });
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      mockLoginApi.mockRejectedValue(new Error('Network error'));

      const { getByTestId } = renderLoginScreen();
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Connection Error',
          text2: 'Please check your internet connection and try again',
        });
      });
    });

    it('should store user data in AsyncStorage on successful login', async () => {
      mockLoginApi.mockResolvedValue({
        success: true,
        data: mockApiResponses.login.data,
      });

      const { getByTestId } = renderLoginScreen();
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          'access_token',
          mockApiResponses.login.data.token
        );
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          'refresh_token',
          mockApiResponses.login.data.refreshToken
        );
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          'user_data',
          JSON.stringify(mockApiResponses.login.data.user)
        );
      });
    });
  });

  describe('User Experience', () => {
    it('should disable login button while loading', async () => {
      mockLoginApi.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({
            success: true,
            data: mockApiResponses.login.data,
          }), 1000);
        });
      });

      const { getByTestId } = renderLoginScreen();
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(loginButton).toBeDisabled();
      });
    });

    it('should show loading text on button while processing', async () => {
      mockLoginApi.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({
            success: true,
            data: mockApiResponses.login.data,
          }), 100);
        });
      });

      const { getByTestId, getByText } = renderLoginScreen();
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText('Signing In...')).toBeTruthy();
      });
    });

    it('should clear form errors when user starts typing', async () => {
      const { getByTestId, getByText, queryByText } = renderLoginScreen();
      const emailInput = getByTestId('email-input');
      const loginButton = getByTestId('login-button');

      // Trigger validation error
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText('Email is required')).toBeTruthy();
      });

      // Start typing to clear error
      fireEvent.changeText(emailInput, 'test@example.com');

      await waitFor(() => {
        expect(queryByText('Email is required')).toBeFalsy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByTestId } = renderLoginScreen();

      expect(getByTestId('email-input')).toHaveProp('accessibilityLabel', 'Email address input');
      expect(getByTestId('password-input')).toHaveProp('accessibilityLabel', 'Password input');
      expect(getByTestId('login-button')).toHaveProp('accessibilityLabel', 'Sign in button');
    });

    it('should have proper accessibility roles', () => {
      const { getByTestId } = renderLoginScreen();

      expect(getByTestId('login-button')).toHaveProp('accessibilityRole', 'button');
      expect(getByTestId('email-input')).toHaveProp('accessibilityRole', 'text');
      expect(getByTestId('password-input')).toHaveProp('accessibilityRole', 'text');
    });

    it('should announce errors to screen readers', async () => {
      const { getByTestId, getByText } = renderLoginScreen();
      const loginButton = getByTestId('login-button');

      fireEvent.press(loginButton);

      await waitFor(() => {
        const errorText = getByText('Email is required');
        expect(errorText).toHaveProp('accessibilityLiveRegion', 'polite');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent login attempts', async () => {
      mockLoginApi.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({
            success: true,
            data: mockApiResponses.login.data,
          }), 100);
        });
      });

      const { getByTestId } = renderLoginScreen();
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');

      // Press login button multiple times quickly
      fireEvent.press(loginButton);
      fireEvent.press(loginButton);
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(mockLoginApi).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle component unmount during login', async () => {
      mockLoginApi.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({
            success: true,
            data: mockApiResponses.login.data,
          }), 100);
        });
      });

      const { getByTestId, unmount } = renderLoginScreen();
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      // Unmount component during login
      unmount();

      // Should not cause any errors or memory leaks
      await TestHelpers.waitFor(150);
    });

    it('should handle malformed API responses', async () => {
      mockLoginApi.mockResolvedValue({
        success: true,
        data: null, // Malformed response
      });

      const { getByTestId } = renderLoginScreen();
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Something went wrong. Please try again.',
        });
      });
    });
  });

  describe('Security', () => {
    it('should not log sensitive information', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      const { getByTestId } = renderLoginScreen();
      const passwordInput = getByTestId('password-input');

      fireEvent.changeText(passwordInput, 'secretpassword123');

      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('secretpassword123')
      );

      consoleSpy.mockRestore();
    });

    it('should handle password field securely', () => {
      const { getByTestId } = renderLoginScreen();
      const passwordInput = getByTestId('password-input');

      expect(passwordInput).toHaveProp('secureTextEntry', true);
    });
  });
});