# Testing Setup for Auth Components

This project includes comprehensive tests for all authentication-related components using Vitest and React Testing Library.

## Test Configuration

The testing setup includes:

### Dependencies Installed
- `vitest` - Fast Vite-native unit test framework
- `@vitest/ui` - UI for running and viewing tests
- `jsdom` - DOM environment for browser simulation
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom DOM matchers
- `@testing-library/user-event` - User interaction simulation

### Configuration Files
- `vitest.config.ts` - Vitest configuration
- `src/setupTests.ts` - Test environment setup and global mocks

### Scripts Available
- `npm run test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ui` - Open Vitest UI

## Test Files

### 1. AuthContext Tests (`src/contexts/__tests__/AuthContext.test.tsx`)
Tests the authentication context functionality:
- ✅ Initial state management
- ✅ User session handling
- ✅ Login flow (success/error cases)
- ✅ Signup flow (success/error cases)
- ✅ Logout functionality
- ✅ Loading states
- ✅ Error handling and state clearing

### 2. useAuth Hook Tests (`src/hooks/__tests__/useAuth.test.tsx`)
Tests the authentication hook:
- ✅ Context consumption
- ✅ Error when used outside provider
- ✅ User data handling
- ✅ Error handling
- ✅ Type safety
- ✅ Function reference stability

### 3. LoginForm Tests (`src/components/auth/__tests__/LoginForm.test.tsx`)
Tests the login form component:
- ✅ Form rendering
- ✅ Form validation (empty fields, invalid email, short password)
- ✅ Successful submission
- ✅ Error display
- ✅ Loading states
- ✅ Keyboard navigation
- ✅ Form submission via Enter key
- ✅ Custom props handling

### 4. SignupForm Tests (`src/components/auth/__tests__/SignupForm.test.tsx`)
Tests the signup form component:
- ✅ Form rendering with all fields
- ✅ Comprehensive validation (name, email, password, confirmation)
- ✅ Password matching validation
- ✅ Successful submission
- ✅ Error display
- ✅ Loading states
- ✅ Keyboard navigation
- ✅ Real-time validation feedback

### 5. ProtectedRoute Tests (`src/components/auth/__tests__/ProtectedRoute.test.tsx`)
Tests the route protection component:
- ✅ Loading state during auth check
- ✅ Rendering children when authenticated
- ✅ Redirecting when unauthenticated
- ✅ Custom redirect paths
- ✅ Error handling
- ✅ Multiple children support
- ✅ Navigation history handling (replace: true)

## Test Coverage

The test suite covers:

### Form Validation
- **Email validation**: Required field, valid email format
- **Password validation**: Minimum length requirements
- **Name validation**: Required field, minimum length
- **Password confirmation**: Matching validation
- **Real-time feedback**: Error states and clearing

### Authentication Flows
- **Login**: Email/password authentication with Better Auth
- **Signup**: Account creation with validation
- **Logout**: Session termination
- **Session management**: Automatic session restoration
- **Error handling**: Network errors, validation errors, auth errors

### Loading States
- **Form submission**: Disabled inputs and buttons during async operations
- **Session loading**: Loading indicators during auth checks
- **Route protection**: Loading state while determining auth status

### Route Protection
- **Access control**: Authenticated vs unauthenticated users
- **Redirects**: Proper navigation to login pages
- **History management**: Using replace navigation to prevent back button issues

### Error Boundaries
- **Context errors**: Proper error boundaries for auth context
- **Hook usage**: Errors when hooks used outside providers
- **Network errors**: Graceful handling of API failures

### TypeScript Safety
- **Type definitions**: Proper typing for all auth-related interfaces
- **Mock typing**: Properly typed mocks for Better Auth client
- **Component props**: Type-safe component interfaces

## Mocking Strategy

### Better Auth Client
The tests mock the `authClient` from `@/lib/auth` to simulate:
- Session management (`getSession`)
- Email login (`signIn.email`)
- Email signup (`signUp.email`)
- Logout (`signOut`)

### React Router
The `Navigate` component is mocked to track redirections without actual navigation.

### Browser APIs
Global mocks for:
- `IntersectionObserver`
- `ResizeObserver`
- `window.matchMedia`
- `window.scrollTo`

## Running Tests

To run the tests, you would typically use:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Open UI
npm run test:ui
```

## Notes

- Tests use Vitest's `vi` mocking utilities instead of Jest
- All async operations are properly awaited using `waitFor`
- User interactions are simulated using `@testing-library/user-event`
- Tests follow AAA pattern (Arrange, Act, Assert)
- Each test is isolated with proper setup and cleanup

## Future Enhancements

Potential additions to the test suite:
- Integration tests with real API endpoints
- Visual regression tests
- Accessibility tests
- Performance tests
- E2E tests with Playwright
- Authentication flow tests across multiple pages