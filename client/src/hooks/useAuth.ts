import { useContext } from 'react'
import { AuthContext, type AuthContextType } from '../contexts/AuthContext'

/**
 * Custom hook to access the authentication context
 * 
 * @throws {Error} If used outside of AuthProvider
 * @returns {AuthContextType} The authentication context value
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}