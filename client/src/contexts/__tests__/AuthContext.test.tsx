import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider, AuthContext, type User } from '../AuthContext';
import { authClient } from '../../lib/auth';

// Mock the auth client
vi.mock('../../lib/auth', () => ({
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

describe('AuthContext', () => {
  let queryClient: QueryClient;

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
    vi.clearAllMocks();
  });

  const TestComponent = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
      return <div>No context</div>;
    }
    
    const { user, isAuthenticated, isLoading, error } = context;
    
    return (
      <div>
        <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
        <div data-testid="isAuthenticated">{String(isAuthenticated)}</div>
        <div data-testid="isLoading">{String(isLoading)}</div>
        <div data-testid="error">{error || 'null'}</div>
        <button 
          onClick={() => context.login('test@example.com', 'password123')}
          data-testid="login-button"
        >
          Login
        </button>
        <button 
          onClick={() => context.signup('test@example.com', 'password123', 'Test User')}
          data-testid="signup-button"
        >
          Signup
        </button>
        <button 
          onClick={() => context.logout()}
          data-testid="logout-button"
        >
          Logout
        </button>
      </div>
    );
  };

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {component}
        </AuthProvider>
      </QueryClientProvider>
    );
  };

  it('should provide initial state with no user', async () => {
    mockedAuthClient.getSession.mockResolvedValue({ data: null });

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });
  });

  it('should provide authenticated state when user session exists', async () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockedAuthClient.getSession.mockResolvedValue({
      data: {
        user: mockUser,
        session: { id: 'session-1' },
      },
    });

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });
  });

  it('should handle successful login', async () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Initial session check returns null
    mockedAuthClient.getSession
      .mockResolvedValueOnce({ data: null })
      .mockResolvedValueOnce({
        data: {
          user: mockUser,
          session: { id: 'session-1' },
        },
      });

    mockedAuthClient.signIn.email.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    renderWithProviders(<TestComponent />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });

    // Trigger login
    act(() => {
      screen.getByTestId('login-button').click();
    });

    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
    });

    expect(mockedAuthClient.signIn.email).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should handle login error', async () => {
    mockedAuthClient.getSession.mockResolvedValue({ data: null });
    mockedAuthClient.signIn.email.mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' },
    });

    renderWithProviders(<TestComponent />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });

    // Trigger login
    act(() => {
      screen.getByTestId('login-button').click();
    });

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });

  it('should handle successful signup', async () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockedAuthClient.getSession
      .mockResolvedValueOnce({ data: null })
      .mockResolvedValueOnce({
        data: {
          user: mockUser,
          session: { id: 'session-1' },
        },
      });

    mockedAuthClient.signUp.email.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    renderWithProviders(<TestComponent />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });

    // Trigger signup
    act(() => {
      screen.getByTestId('signup-button').click();
    });

    // Wait for signup to complete
    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
    });

    expect(mockedAuthClient.signUp.email).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });
  });

  it('should show loading state during operations', async () => {
    let resolveGetSession: (value: unknown) => void;
    const getSessionPromise = new Promise((resolve) => {
      resolveGetSession = resolve;
    });

    mockedAuthClient.getSession.mockReturnValue(getSessionPromise as Promise<{ data: null }>);

    renderWithProviders(<TestComponent />);

    // Should show loading initially
    expect(screen.getByTestId('isLoading')).toHaveTextContent('true');

    // Resolve the promise
    act(() => {
      resolveGetSession({ data: null });
    });

    // Should stop loading
    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });
  });
});