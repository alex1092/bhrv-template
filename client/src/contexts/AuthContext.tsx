import React, { createContext, useCallback, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authClient } from '../lib/auth'

export interface User {
  id: string
  email: string
  name: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name?: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Query for getting current session
  const {
    data: sessionData,
    isLoading: isSessionLoading,
    refetch: refetchSession
  } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      try {
        const { data } = await authClient.getSession()
        return data
      } catch (err) {
        // If session fetch fails, user is not authenticated
        return null
      }
    },
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await authClient.signIn.email({
        email,
        password,
      })
      if (response.error) {
        throw new Error(response.error.message || 'Login failed')
      }
      return response.data
    },
    onSuccess: () => {
      setError(null)
      // Refetch session data after successful login
      refetchSession()
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: async ({ 
      email, 
      password, 
      name 
    }: { 
      email: string; 
      password: string; 
      name?: string 
    }) => {
      const response = await authClient.signUp.email({
        email,
        password,
        name: name || '',
      })
      if (response.error) {
        throw new Error(response.error.message || 'Signup failed')
      }
      return response.data
    },
    onSuccess: () => {
      setError(null)
      // Refetch session data after successful signup
      refetchSession()
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await authClient.signOut()
      if (response.error) {
        throw new Error(response.error.message || 'Logout failed')
      }
      return response.data
    },
    onSuccess: () => {
      setError(null)
      // Clear all cached data
      queryClient.clear()
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  // Auth functions
  const login = useCallback(async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password })
  }, [loginMutation])

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    await signupMutation.mutateAsync({ email, password, name })
  }, [signupMutation])

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync()
  }, [logoutMutation])

  // Clear error when mutations are retried
  useEffect(() => {
    if (loginMutation.isPending || signupMutation.isPending || logoutMutation.isPending) {
      setError(null)
    }
  }, [loginMutation.isPending, signupMutation.isPending, logoutMutation.isPending])

  const value: AuthContextType = {
    user: sessionData?.user || null,
    isLoading: isSessionLoading || loginMutation.isPending || signupMutation.isPending || logoutMutation.isPending,
    isAuthenticated: !!sessionData?.user,
    login,
    signup,
    logout,
    error,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}