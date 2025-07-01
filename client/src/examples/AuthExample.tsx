/**
 * Example of how to use the authentication system
 * 
 * This file demonstrates:
 * 1. Wrapping app with AuthProvider
 * 2. Using the useAuth hook
 * 3. Using ProtectedRoute component
 */

import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { useAuth } from '../hooks/useAuth'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'

// Example protected component
function Dashboard() {
  const { user, logout } = useAuth()
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.email}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

// Example login component
function LoginExample() {
  const { login, isLoading, error } = useAuth()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    try {
      await login(email, password)
    } catch (err) {
      console.error('Login failed:', err)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}

// Example app setup
export function AuthExampleApp() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginExample />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}