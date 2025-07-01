import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import beaver from '@/assets/beaver.svg';

export function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <a href="https://github.com/stevedylandev/bhvr" target="_blank" rel="noopener noreferrer">
              <img
                src={beaver}
                className="w-20 h-20 cursor-pointer hover:scale-105 transition-transform"
                alt="BHVR logo"
              />
            </a>
          </div>
          
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            bhvr
          </h1>
          
          <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">
            Bun + Hono + Vite + React
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            A typesafe fullstack monorepo with TanStack Query, Better Auth, and modern tooling. 
            Build fast, scale faster.
          </p>

          {/* Auth-aware CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <>
                <div className="text-lg text-gray-700 dark:text-gray-300">
                  Welcome back, <span className="font-semibold">{user?.name}</span>!
                </div>
                <Button asChild size="lg">
                  <Link to="/dashboard">
                    Go to Dashboard
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link to="/signup">
                    Get Started Free
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">
                    Sign In
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div className="text-2xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Built with Bun runtime and Vite for blazing-fast development and deployment.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div className="text-2xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Secure by Default</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Integrated Better Auth with secure session management and authentication flows.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div className="text-2xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Type Safe</h3>
            <p className="text-gray-600 dark:text-gray-300">
              End-to-end type safety with TypeScript, TanStack Query, and Hono RPC.
            </p>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-6">Built with Modern Technologies</h3>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">Bun</span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">Hono</span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">Vite</span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">React 19</span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">TypeScript</span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">TanStack Query</span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">Better Auth</span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">Cloudflare Workers</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}