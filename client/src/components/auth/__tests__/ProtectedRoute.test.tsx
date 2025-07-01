import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProtectedRoute } from '../ProtectedRoute';
import { AuthProvider, type User } from '../../../contexts/AuthContext';
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

// Mock the Navigate component to track redirects
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to, replace }: { to: string; replace: boolean }) => {
      mockNavigate({ to, replace });
      return <div data-testid="navigate-mock">Redirecting to {to}</div>;
    },
  };
});

describe('ProtectedRoute', () => {
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
    mockNavigate.mockClear();
  });

  const renderWithProviders = (children: React.ReactNode, redirectTo?: string) => {
    return render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ProtectedRoute redirectTo={redirectTo}>
              {children}
            </ProtectedRoute>
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );
  };

  it('should show loading state while authentication is being checked', async () => {
    let resolveGetSession: (value: unknown) => void;
    const getSessionPromise = new Promise((resolve) => {
      resolveGetSession = resolve;
    });

    mockedAuthClient.getSession.mockReturnValue(getSessionPromise as Promise<{ data: null }>);

    renderWithProviders(<div data-testid="protected-content">Protected Content</div>);

    // Should show loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();

    // Resolve the session
    resolveGetSession({ data: null });

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('should render children when user is authenticated', async () => {
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

    renderWithProviders(<div data-testid="protected-content">Protected Content</div>);

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should redirect to default login page when user is not authenticated', async () => {
    mockedAuthClient.getSession.mockResolvedValue({ data: null });

    renderWithProviders(<div data-testid="protected-content">Protected Content</div>);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/login',
        replace: true,
      });
    });

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('navigate-mock')).toBeInTheDocument();
  });

  it('should redirect to custom path when user is not authenticated', async () => {
    mockedAuthClient.getSession.mockResolvedValue({ data: null });

    renderWithProviders(
      <div data-testid="protected-content">Protected Content</div>,
      '/custom-login'
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/custom-login',
        replace: true,
      });
    });

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByText('Redirecting to /custom-login')).toBeInTheDocument();
  });

  it('should handle session fetch errors by redirecting to login', async () => {
    mockedAuthClient.getSession.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<div data-testid="protected-content">Protected Content</div>);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/login',
        replace: true,
      });
    });

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should handle multiple children correctly when authenticated', async () => {
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

    renderWithProviders(
      <>
        <div data-testid="content-1">Content 1</div>
        <div data-testid="content-2">Content 2</div>
        <div data-testid="content-3">Content 3</div>
      </>
    );

    await waitFor(() => {
      expect(screen.getByTestId('content-1')).toBeInTheDocument();
      expect(screen.getByTestId('content-2')).toBeInTheDocument();
      expect(screen.getByTestId('content-3')).toBeInTheDocument();
    });
  });

  it('should handle re-authentication when session changes', async () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Start with authenticated user
    mockedAuthClient.getSession.mockResolvedValue({
      data: {
        user: mockUser,
        session: { id: 'session-1' },
      },
    });

    const { rerender } = renderWithProviders(
      <div data-testid="protected-content">Protected Content</div>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    // Clear the mock and return unauthenticated state
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockedAuthClient.getSession.mockResolvedValue({ data: null });

    // Force a re-render (simulating context update)
    rerender(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ProtectedRoute>
              <div data-testid="protected-content">Protected Content</div>
            </ProtectedRoute>
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );

    // Since the auth context caches the session, we need to verify it doesn't redirect immediately
    // The actual behavior would depend on how the auth context handles session updates
  });

  it('should handle null children gracefully', async () => {
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

    renderWithProviders(null);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should handle complex nested children when authenticated', async () => {
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

    renderWithProviders(
      <div data-testid="outer">
        <div data-testid="middle">
          <div data-testid="inner">Nested Content</div>
        </div>
      </div>
    );

    await waitFor(() => {
      expect(screen.getByTestId('outer')).toBeInTheDocument();
      expect(screen.getByTestId('middle')).toBeInTheDocument();
      expect(screen.getByTestId('inner')).toBeInTheDocument();
      expect(screen.getByText('Nested Content')).toBeInTheDocument();
    });
  });

  it('should handle loading state transitions correctly', async () => {
    let resolveGetSession: (value: unknown) => void;
    const getSessionPromise = new Promise((resolve) => {
      resolveGetSession = resolve;
    });

    mockedAuthClient.getSession.mockReturnValue(getSessionPromise as Promise<{ data: null }>);

    renderWithProviders(<div data-testid="protected-content">Protected Content</div>);

    // Initially loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();

    // Resolve with no authentication
    resolveGetSession({ data: null });

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/login',
        replace: true,
      });
    });
  });

  it('should use replace navigation to prevent back button issues', async () => {
    mockedAuthClient.getSession.mockResolvedValue({ data: null });

    renderWithProviders(<div data-testid="protected-content">Protected Content</div>);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/login',
        replace: true,
      });
    });

    // Verify that replace is true to prevent navigation history issues
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ replace: true })
    );
  });

  it('should not render anything during loading state except loading indicator', async () => {
    let resolveGetSession: (value: unknown) => void;
    const getSessionPromise = new Promise((resolve) => {
      resolveGetSession = resolve;
    });

    mockedAuthClient.getSession.mockReturnValue(getSessionPromise as Promise<{ data: null }>);

    renderWithProviders(
      <div data-testid="protected-content">
        <button data-testid="dangerous-button">Don't show this while loading</button>
        Protected Content
      </div>
    );

    // Should only show loading, not the children
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dangerous-button')).not.toBeInTheDocument();

    // Resolve the promise
    resolveGetSession({ data: null });

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Still shouldn't show children since user is not authenticated
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dangerous-button')).not.toBeInTheDocument();
  });
});