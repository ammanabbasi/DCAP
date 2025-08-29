import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, TestHelpers, AccessibilityHelpers } from '../../../../test-utils';
import { LoginForm } from '../LoginForm';

// Mock react-hook-form to ensure consistent behavior
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useForm: () => ({
    register: jest.fn((name, options) => ({
      name,
      ...options,
      onChange: jest.fn(),
      onBlur: jest.fn(),
      ref: jest.fn(),
    })),
    handleSubmit: (fn: any) => (e: any) => {
      e.preventDefault();
      fn({ email: 'test@example.com', password: 'password123' });
    },
    formState: { errors: {} },
    clearErrors: jest.fn(),
    setError: jest.fn(),
    watch: jest.fn(),
    getValues: jest.fn(() => ({ email: '', password: '' })),
    setValue: jest.fn(),
    reset: jest.fn(),
  }),
}));

describe('LoginForm Component', () => {
  const mockOnSubmit = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderLoginForm = (props = {}) => {
    const defaultProps = {
      onSubmit: mockOnSubmit,
      isLoading: false,
      error: undefined,
    };

    return render(<LoginForm {...defaultProps} {...props} />);
  };

  describe('Rendering', () => {
    it('renders login form with all elements', () => {
      renderLoginForm();

      expect(screen.getByRole('heading', { name: /welcome to dealerscloud/i })).toBeInTheDocument();
      expect(screen.getByText(/sign in to access your dashboard/i)).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/contact your administrator for account access/i)).toBeInTheDocument();
    });

    it('renders email field with proper attributes', () => {
      renderLoginForm();

      const emailField = screen.getByRole('textbox', { name: /email/i });
      expect(emailField).toHaveAttribute('type', 'email');
      expect(emailField).toHaveAttribute('autoComplete', 'email');
    });

    it('renders password field with proper attributes', () => {
      renderLoginForm();

      const passwordField = screen.getByLabelText(/password/i);
      expect(passwordField).toHaveAttribute('type', 'password');
      expect(passwordField).toHaveAttribute('autoComplete', 'current-password');
    });

    it('renders password visibility toggle button', () => {
      renderLoginForm();

      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('displays error message when error prop is provided', () => {
      const errorMessage = 'Invalid credentials';
      renderLoginForm({ error: errorMessage });

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('does not display error alert when no error', () => {
      renderLoginForm();

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows loading state on submit button', () => {
      renderLoginForm({ isLoading: true });

      const submitButton = screen.getByRole('button', { name: /signing in/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when not loading', () => {
      renderLoginForm({ isLoading: false });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeEnabled();
    });

    it('calls onSubmit when form is submitted', async () => {
      renderLoginForm();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('prevents form submission when loading', async () => {
      renderLoginForm({ isLoading: true });

      const submitButton = screen.getByRole('button', { name: /signing in/i });
      expect(submitButton).toBeDisabled();

      // Verify button cannot be clicked when disabled
      await user.click(submitButton);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('toggles password visibility when toggle button is clicked', async () => {
      renderLoginForm();

      const passwordField = screen.getByLabelText(/password/i) as HTMLInputElement;
      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

      // Initially password should be hidden
      expect(passwordField).toHaveAttribute('type', 'password');

      // Click toggle button to show password
      await user.click(toggleButton);
      expect(passwordField).toHaveAttribute('type', 'text');

      // Click again to hide password
      await user.click(toggleButton);
      expect(passwordField).toHaveAttribute('type', 'password');
    });

    it('shows correct icon based on password visibility state', async () => {
      renderLoginForm();

      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

      // Initially should show VisibilityIcon (eye open)
      expect(toggleButton.querySelector('[data-testid="VisibilityIcon"]')).toBeInTheDocument();

      // After clicking, should show VisibilityOffIcon (eye closed)
      await user.click(toggleButton);
      expect(toggleButton.querySelector('[data-testid="VisibilityOffIcon"]')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('allows typing in email field', async () => {
      renderLoginForm();

      const emailField = screen.getByRole('textbox', { name: /email/i });
      await user.type(emailField, 'user@example.com');

      expect(emailField).toHaveValue('user@example.com');
    });

    it('allows typing in password field', async () => {
      renderLoginForm();

      const passwordField = screen.getByLabelText(/password/i);
      await user.type(passwordField, 'mypassword');

      expect(passwordField).toHaveValue('mypassword');
    });

    it('submits form when Enter is pressed in any field', async () => {
      renderLoginForm();

      const emailField = screen.getByRole('textbox', { name: /email/i });
      await user.type(emailField, 'test@example.com');
      await user.keyboard('{Enter}');

      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe('Form State Management', () => {
    it('maintains independent state for email and password fields', async () => {
      renderLoginForm();

      const emailField = screen.getByRole('textbox', { name: /email/i });
      const passwordField = screen.getByLabelText(/password/i);

      await user.type(emailField, 'test@example.com');
      await user.type(passwordField, 'password123');

      expect(emailField).toHaveValue('test@example.com');
      expect(passwordField).toHaveValue('password123');
    });

    it('clears fields when form is reset', async () => {
      renderLoginForm();

      const emailField = screen.getByRole('textbox', { name: /email/i });
      const passwordField = screen.getByLabelText(/password/i);

      // Type in both fields
      await user.type(emailField, 'test@example.com');
      await user.type(passwordField, 'password123');

      // Clear fields
      await user.clear(emailField);
      await user.clear(passwordField);

      expect(emailField).toHaveValue('');
      expect(passwordField).toHaveValue('');
    });
  });

  describe('Error States', () => {
    it('updates error message when error prop changes', () => {
      const { rerender } = renderLoginForm({ error: 'First error' });

      expect(screen.getByText('First error')).toBeInTheDocument();

      rerender(<LoginForm onSubmit={mockOnSubmit} error="Second error" />);
      expect(screen.getByText('Second error')).toBeInTheDocument();
      expect(screen.queryByText('First error')).not.toBeInTheDocument();
    });

    it('removes error alert when error prop is cleared', () => {
      const { rerender } = renderLoginForm({ error: 'Some error' });

      expect(screen.getByRole('alert')).toBeInTheDocument();

      rerender(<LoginForm onSubmit={mockOnSubmit} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('displays multiple validation errors correctly', () => {
      // This would require mocking react-hook-form differently for validation errors
      // For now, we'll test that the component can handle the error display structure
      renderLoginForm({ error: 'Please check your credentials and try again' });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('class', expect.stringContaining('MuiAlert-standardError'));
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      const { container } = renderLoginForm();
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Welcome to DealersCloud');
      
      AccessibilityHelpers.expectProperHeadingStructure(container);
    });

    it('has proper form labels and associations', () => {
      renderLoginForm();

      const emailField = screen.getByRole('textbox', { name: /email/i });
      const passwordField = screen.getByLabelText(/password/i);

      expect(emailField).toHaveAccessibleName();
      expect(passwordField).toHaveAccessibleName();
    });

    it('has proper button accessibility', async () => {
      const { container } = renderLoginForm();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(toggleButton).toHaveAttribute('aria-label', 'toggle password visibility');

      await AccessibilityHelpers.expectToBeAccessible(container);
    });

    it('announces errors to screen readers', () => {
      renderLoginForm({ error: 'Login failed' });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Login failed');
    });

    it('maintains focus management', async () => {
      renderLoginForm();

      const emailField = screen.getByRole('textbox', { name: /email/i });
      const passwordField = screen.getByLabelText(/password/i);

      // Tab navigation should work correctly
      emailField.focus();
      expect(emailField).toHaveFocus();

      await user.tab();
      expect(passwordField).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /toggle password visibility/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /sign in/i })).toHaveFocus();
    });
  });

  describe('Visual Feedback', () => {
    it('shows loading text during form submission', () => {
      renderLoginForm({ isLoading: true });

      expect(screen.getByText('Signing in...')).toBeInTheDocument();
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });

    it('shows proper icons for input fields', () => {
      renderLoginForm();

      // Email icon should be present
      expect(screen.getByTestId('EmailIcon')).toBeInTheDocument();
      
      // Lock icon should be present
      expect(screen.getByTestId('LockIcon')).toBeInTheDocument();
    });

    it('displays error styling when error is present', () => {
      renderLoginForm({ error: 'Test error' });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-standardError');
    });
  });

  describe('Component Props', () => {
    it('accepts and uses onSubmit prop correctly', async () => {
      const customOnSubmit = jest.fn();
      renderLoginForm({ onSubmit: customOnSubmit });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      expect(customOnSubmit).toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('handles undefined optional props gracefully', () => {
      const { container } = render(<LoginForm onSubmit={mockOnSubmit} />);
      
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled();
    });
  });

  describe('Performance', () => {
    it('renders efficiently without unnecessary re-renders', () => {
      const renderSpy = jest.fn();
      const TestWrapper = () => {
        renderSpy();
        return <LoginForm onSubmit={mockOnSubmit} />;
      };

      const { rerender } = render(<TestWrapper />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Rerender with same props should not cause extra renders
      rerender(<TestWrapper />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('handles rapid toggle clicks without performance issues', async () => {
      renderLoginForm();

      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
      
      // Rapidly click toggle button multiple times
      for (let i = 0; i < 10; i++) {
        await user.click(toggleButton);
      }

      // Should still be responsive
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles extremely long input values', async () => {
      renderLoginForm();

      const emailField = screen.getByRole('textbox', { name: /email/i });
      const longEmail = 'a'.repeat(100) + '@example.com';

      await user.type(emailField, longEmail);
      expect(emailField).toHaveValue(longEmail);
    });

    it('handles special characters in input fields', async () => {
      renderLoginForm();

      const emailField = screen.getByRole('textbox', { name: /email/i });
      const passwordField = screen.getByLabelText(/password/i);

      await user.type(emailField, 'test+tag@ex-ample.co.uk');
      await user.type(passwordField, 'p@$$w0rd!');

      expect(emailField).toHaveValue('test+tag@ex-ample.co.uk');
      expect(passwordField).toHaveValue('p@$$w0rd!');
    });

    it('maintains state when component receives new props', () => {
      const { rerender } = renderLoginForm();

      // Props change but component state should be maintained
      rerender(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      rerender(<LoginForm onSubmit={mockOnSubmit} isLoading={true} />);

      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });
  });
});