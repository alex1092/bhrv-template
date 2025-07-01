# Client Auth UI Implementation Plan

## Executive Summary
> This plan implements a complete authentication user interface for the client application, integrating with the existing Better Auth server setup. The implementation adds React Router for navigation, React Query for data fetching, and a comprehensive auth system with login, signup, and protected routes.

## Goals & Objectives
### Primary Goals
- Complete auth UI with login, signup, and user dashboard pages
- Seamless integration with existing Better Auth server endpoints
- Type-safe authentication state management using React Query
- Protected routing system with automatic redirects

### Secondary Objectives
- Enhanced user experience with loading states and error handling
- Consistent design system using existing shadcn/ui components
- Session persistence and automatic token refresh
- Form validation with proper error messaging

## Solution Overview
### Approach
The solution builds upon the existing client architecture (Vite + React 19 + TanStack Query + shadcn/ui) by adding React Router for navigation and Better Auth client integration. The authentication state is managed through React Query with a custom auth context for easy consumption across components.

### Key Components
1. **React Router Integration**: Page-based routing with protected route guards
2. **Better Auth Client**: Type-safe API integration with existing server endpoints
3. **Auth Context**: Centralized authentication state management
4. **Form Components**: Login and signup forms with validation
5. **Protected Routes**: Automatic authentication checks and redirects
6. **UI Components**: Additional shadcn/ui components for forms

### Architecture Diagram
```
Client App
├── Router (React Router)
│   ├── Public Routes (/, /login, /signup)
│   └── Protected Routes (/dashboard, /profile)
├── Auth Context (Session State)
├── Better Auth Client (API Integration)
└── TanStack Query (Server State)
```

### Data Flow
```
User Action → Form Submit → Better Auth API → Server Response → React Query Cache → Auth Context → UI Update
```

### Expected Outcomes
- Users can register new accounts via signup form
- Users can authenticate via email/password login form
- Protected routes automatically redirect unauthenticated users to login
- Session state persists across browser refreshes
- Users can sign out and session is properly cleared

## Implementation Tasks

### CRITICAL IMPLEMENTATION RULES
1. **NO PLACEHOLDER CODE**: Every implementation must be production-ready. NEVER write "TODO", "in a real implementation", or similar placeholders unless explicitly requested by the user.
2. **CROSS-DIRECTORY TASKS**: Group related changes across directories into single tasks to ensure consistency. Never create isolated changes that require follow-up work in sibling directories.
3. **COMPLETE IMPLEMENTATIONS**: Each task must fully implement its feature including all consumers, type updates, and integration points.
4. **DETAILED SPECIFICATIONS**: Each task must include EXACTLY what to implement, including specific functions, types, and integration points to avoid "breaking change" confusion.
5. **CONTEXT AWARENESS**: Each task is part of a larger system - specify how it connects to other parts.
6. **MAKE BREAKING CHANGES**: Unless explicitly requested by the user, you MUST make breaking changes.

### Visual Dependency Tree

```
client/
├── package.json (Task #0: Install React Router and Better Auth client)
├── src/
│   ├── main.tsx (Task #6: Wrap app with Router and Auth providers)
│   ├── App.tsx (Task #7: Setup routing with all auth pages)
│   │
│   ├── lib/
│   │   ├── auth.ts (Task #1: Better Auth client configuration)
│   │   └── utils.ts (Task #1: Utility functions for auth)
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx (Task #2: Auth state management with React Query)
│   │
│   ├── hooks/
│   │   └── useAuth.ts (Task #3: Custom auth hooks)
│   │
│   ├── components/
│   │   ├── ui/ (existing shadcn/ui components)
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx (Task #4: Login form with validation)
│   │   │   ├── SignupForm.tsx (Task #4: Signup form with validation)
│   │   │   └── ProtectedRoute.tsx (Task #3: Route guard component)
│   │   └── layout/
│   │       ├── Header.tsx (Task #5: Navigation with auth status)
│   │       └── Layout.tsx (Task #5: Main app layout wrapper)
│   │
│   └── pages/
│       ├── HomePage.tsx (Task #6: Landing page)
│       ├── LoginPage.tsx (Task #6: Login page)
│       ├── SignupPage.tsx (Task #6: Signup page)
│       └── DashboardPage.tsx (Task #6: Protected dashboard)
```

### Execution Plan

#### Group A: Foundation Setup (Execute all in parallel)
- [ ] **Task #0**: Install required dependencies
  - Location: `/client/package.json`
  - Install: `react-router-dom@^6.27.0`, `better-auth@^1.3.0`, `@hookform/resolvers@^3.3.4`, `react-hook-form@^7.48.2`, `zod@^3.22.4`
  - Install shadcn/ui components: `input`, `form`, `card`, `label`, `alert`
  - Context: These are the core dependencies needed for routing, auth client, and form handling

- [ ] **Task #1**: Create Better Auth client and utilities
  - Folder: `src/lib/`
  - Files: `auth.ts`, `utils.ts`
  - Implements:
    ```typescript
    // auth.ts
    import { createAuthClient } from "better-auth/client";
    export const authClient = createAuthClient({
      baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:8787",
      basePath: "/api"
    });
    
    // utils.ts
    export const getAuthHeaders = () => ({ ... });
    export const handleAuthError = (error: unknown) => ({ ... });
    export const isAuthError = (error: unknown): boolean => ({ ... });
    ```
  - Exports: `authClient`, auth utility functions
  - Context: Central auth client configuration used by all auth operations

#### Group B: Auth State Management (Execute all in parallel after Group A)
- [ ] **Task #2**: Create Auth Context with React Query integration
  - Folder: `src/contexts/`
  - File: `AuthContext.tsx`
  - Implements:
    ```typescript
    interface AuthContextType {
      user: User | null;
      isLoading: boolean;
      isAuthenticated: boolean;
      login: (email: string, password: string) => Promise<void>;
      signup: (name: string, email: string, password: string) => Promise<void>;
      logout: () => Promise<void>;
    }
    
    export const AuthContext = createContext<AuthContextType | null>(null);
    export const AuthProvider: React.FC<{ children: React.ReactNode }>;
    ```
  - Uses: TanStack Query for session management, Better Auth client for API calls
  - Exports: `AuthContext`, `AuthProvider`
  - Context: Provides auth state to entire app, integrates with React Query cache

- [ ] **Task #3**: Create auth hooks and route protection
  - Folder: `src/hooks/`, `src/components/auth/`
  - Files: `useAuth.ts`, `ProtectedRoute.tsx`
  - Implements:
    ```typescript
    // useAuth.ts
    export const useAuth = () => {
      const context = useContext(AuthContext);
      if (!context) throw new Error("useAuth must be used within AuthProvider");
      return context;
    };
    
    // ProtectedRoute.tsx
    interface ProtectedRouteProps {
      children: React.ReactNode;
      redirectTo?: string;
    }
    export const ProtectedRoute: React.FC<ProtectedRouteProps>;
    ```
  - Integrates: React Router's `Navigate` for redirects, auth context for state
  - Exports: `useAuth` hook, `ProtectedRoute` component
  - Context: Enables easy auth consumption and automatic route protection

#### Group C: Form Components (Execute all in parallel after Group B)
- [ ] **Task #4**: Create authentication forms with validation
  - Folder: `src/components/auth/`
  - Files: `LoginForm.tsx`, `SignupForm.tsx`
  - Implements:
    ```typescript
    // LoginForm.tsx
    interface LoginFormData {
      email: string;
      password: string;
    }
    export const LoginForm: React.FC<{
      onSuccess?: () => void;
      onError?: (error: string) => void;
    }>;
    
    // SignupForm.tsx
    interface SignupFormData {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
    }
    export const SignupForm: React.FC<{
      onSuccess?: () => void;
      onError?: (error: string) => void;
    }>;
    ```
  - Uses: React Hook Form + Zod validation, shadcn/ui Input/Button/Form components
  - Validation: Email format, password strength, confirm password match
  - Error Handling: Display server errors and validation errors
  - Loading States: Disable form during submission
  - Exports: `LoginForm`, `SignupForm` components
  - Context: Self-contained forms that integrate with auth context

#### Group D: Layout and Navigation (Execute all in parallel after Group C)
- [ ] **Task #5**: Create layout components with auth-aware navigation
  - Folder: `src/components/layout/`
  - Files: `Header.tsx`, `Layout.tsx`
  - Implements:
    ```typescript
    // Header.tsx
    export const Header: React.FC = () => {
      const { user, isAuthenticated, logout } = useAuth();
      // Navigation with conditional auth links
      // Sign In/Sign Up buttons when not authenticated
      // User menu with profile/logout when authenticated
    };
    
    // Layout.tsx
    interface LayoutProps {
      children: React.ReactNode;
      showHeader?: boolean;
    }
    export const Layout: React.FC<LayoutProps>;
    ```
  - Uses: shadcn/ui Button, DropdownMenu components, Lucide icons
  - Navigation: Dynamic menu based on auth state
  - Responsive: Mobile-friendly header with hamburger menu
  - Exports: `Header`, `Layout` components
  - Context: Provides consistent layout across all pages

#### Group E: Pages and Routing (Execute all in parallel after Group D)
- [ ] **Task #6**: Create all application pages
  - Folder: `src/pages/`
  - Files: `HomePage.tsx`, `LoginPage.tsx`, `SignupPage.tsx`, `DashboardPage.tsx`
  - Implements:
    ```typescript
    // HomePage.tsx
    export const HomePage: React.FC = () => {
      // Landing page with hero section, features, CTA to sign up
      // Links to login/signup for unauthenticated users
      // Link to dashboard for authenticated users
    };
    
    // LoginPage.tsx
    export const LoginPage: React.FC = () => {
      // Page wrapper with LoginForm
      // Link to signup page
      // Redirect to dashboard on successful login
    };
    
    // SignupPage.tsx
    export const SignupPage: React.FC = () => {
      // Page wrapper with SignupForm
      // Link to login page
      // Redirect to dashboard on successful signup
    };
    
    // DashboardPage.tsx (Protected)
    export const DashboardPage: React.FC = () => {
      // Protected dashboard showing user info
      // Welcome message with user.name
      // Quick actions and app navigation
    };
    ```
  - Uses: Layout component, auth forms, shadcn/ui Card/Button components
  - Navigation: React Router Link components for page transitions
  - Protection: DashboardPage wrapped in ProtectedRoute
  - Exports: All page components
  - Context: Complete page implementations with proper layouts

- [ ] **Task #7**: Setup React Router with all routes and App component
  - Folder: `src/`
  - Files: `App.tsx` (modify existing)
  - Implements:
    ```typescript
    import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
    import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
    
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false }
      }
    });
    
    export default function App() {
      return (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      );
    }
    ```
  - Replaces: Existing App.tsx with complete routing setup
  - Providers: QueryClient, AuthProvider, BrowserRouter
  - Routes: All public and protected routes with proper nesting
  - Fallback: Redirect unknown routes to home page
  - Context: Main app entry point with all providers and routing

#### Group F: Integration and Polish (Execute after Group E)
- [ ] **Task #8**: Update main.tsx and environment configuration
  - Folder: `src/`
  - File: `main.tsx`
  - Implements:
    ```typescript
    import React from 'react'
    import ReactDOM from 'react-dom/client'
    import App from './App.tsx'
    import './index.css'
    
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
    ```
  - Environment: Ensure `VITE_SERVER_URL` is set for local development
  - Context: Clean main entry point, all providers moved to App.tsx

---

## Implementation Workflow

This plan file serves as the authoritative checklist for implementation. When implementing:

### Required Process
1. **Load Plan**: Read this entire plan file before starting
2. **Sync Tasks**: Create TodoWrite tasks matching the checkboxes below
3. **Execute & Update**: For each task:
   - Mark TodoWrite as `in_progress` when starting
   - Update checkbox `[ ]` to `[x]` when completing
   - Mark TodoWrite as `completed` when done
4. **Maintain Sync**: Keep this file and TodoWrite synchronized throughout

### Critical Rules
- This plan file is the source of truth for progress
- Update checkboxes in real-time as work progresses
- Never lose synchronization between plan file and TodoWrite
- Mark tasks complete only when fully implemented (no placeholders)
- Tasks should be run in parallel, unless there are dependencies, using subtasks, to avoid context bloat.

### Progress Tracking
The checkboxes above represent the authoritative status of each task. Keep them updated as you work.