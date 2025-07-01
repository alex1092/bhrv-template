import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoginForm } from '../LoginForm';
import { AuthProvider } from '../../../contexts/AuthContext';
import { authClient } from '../../../lib/auth';

// Mock the auth client
vi.mock('../../../lib/auth', () => ({
  authClient: {
    getSession: vi.fn(),
    signIn: {
      email: vi.fn(),
    },
    signUp: {
      email: vi.fn(),
    },
    signOut: vi.fn(),
  },
}));

const mockedAuthClient = authClient as any;

describe('LoginForm', () => {
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
    user = userEvent.setup();
    vi.clearAllMocks();
    mockedAuthClient.getSession.mockResolvedValue({ data: null });
  });

  const renderWithProviders = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LoginForm {...props} />
        </AuthProvider>
      </QueryClientProvider>
    );
  };

  it('should render login form with all fields', () => {
    renderWithProviders();

    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    renderWithProviders();

    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    renderWithProviders();

    const emailInput = screen.getByLabelText('Email');
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('should show validation error for short password', async () => {
    renderWithProviders();

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123');

    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
    });
  });

  it('should call login function with correct data on valid submission', async () => {
    mockedAuthClient.signIn.email.mockResolvedValue({
      data: { user: { id: '1', email: 'test@example.com' } },
      error: null,
    });

    const onSuccess = vi.fn();
    renderWithProviders({ onSuccess });

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedAuthClient.signIn.email).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should display auth error from context', async () => {
    mockedAuthClient.signIn.email.mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' },
    });

    renderWithProviders();

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    let resolveLogin: (value: unknown) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });

    mockedAuthClient.signIn.email.mockReturnValue(loginPromise as Promise<{ data: null; error: null }>);

    renderWithProviders();

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    await user.click(submitButton);

    // Should show loading state
    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();

    // Inputs should be disabled during loading
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();

    // Resolve the login
    resolveLogin({ data: { user: {} }, error: null });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });
  });

  it('should handle keyboard navigation', async () => {
    renderWithProviders();

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    // Focus should start on email
    emailInput.focus();
    expect(emailInput).toHaveFocus();

    // Tab to password
    await user.tab();
    expect(passwordInput).toHaveFocus();

    // Tab to submit button
    await user.tab();
    expect(submitButton).toHaveFocus();
  });

  it('should submit form on enter key when valid', async () => {
    mockedAuthClient.signIn.email.mockResolvedValue({
      data: { user: { id: '1', email: 'test@example.com' } },
      error: null,
    });

    renderWithProviders();

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    // Press enter in password field
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockedAuthClient.signIn.email).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should accept custom className prop', () => {
    renderWithProviders({ className: 'custom-class' });

    const card = screen.getByRole('heading', { name: 'Sign In' }).closest('div');
    expect(card).toHaveClass('custom-class');
  });
});