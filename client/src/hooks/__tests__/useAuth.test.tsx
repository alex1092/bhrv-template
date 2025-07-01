import { renderHook } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuth } from '../useAuth';
import { AuthProvider, type User } from '../../contexts/AuthContext';
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

describe('useAuth', () => {
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

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    );
  };

  it('should return auth context when used within AuthProvider', async () => {
    mockedAuthClient.getSession.mockResolvedValue({ data: null });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBeDefined();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.signup).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('should throw error when used outside AuthProvider', () => {
    // Mock console.error to prevent error output in tests
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    console.error = originalError;
  });

  it('should return user data when authenticated', async () => {
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

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Wait for the query to resolve
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle session fetch errors gracefully', async () => {
    mockedAuthClient.getSession.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Wait for the query to resolve
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should maintain type safety', async () => {
    mockedAuthClient.getSession.mockResolvedValue({ data: null });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Type assertions to ensure TypeScript compliance
    const authResult = result.current;
    
    expect(typeof authResult.user?.id).toBe('undefined'); // user is null initially
    expect(typeof authResult.isAuthenticated).toBe('boolean');
    expect(typeof authResult.isLoading).toBe('boolean');
    expect(typeof authResult.login).toBe('function');
    expect(typeof authResult.signup).toBe('function');
    expect(typeof authResult.logout).toBe('function');
    expect(authResult.error === null || typeof authResult.error === 'string').toBe(true);
  });
});