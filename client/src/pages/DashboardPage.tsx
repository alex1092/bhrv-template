import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Here's your personal dashboard to manage your account and explore features.
          </p>
        </div>

        {/* User Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Profile Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <p className="text-lg text-gray-900 dark:text-white">
                {user?.name || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <p className="text-lg text-gray-900 dark:text-white">
                {user?.email || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Created
              </label>
              <p className="text-lg text-gray-900 dark:text-white">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Status
              </label>
              <p className="text-lg text-green-600 dark:text-green-400">
                Active
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <div className="text-2xl">📊</div>
              </div>
              <h3 className="text-lg font-semibold ml-3 text-gray-900 dark:text-white">
                Analytics
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              View your usage statistics and performance metrics.
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <div className="text-2xl">⚙️</div>
              </div>
              <h3 className="text-lg font-semibold ml-3 text-gray-900 dark:text-white">
                Settings
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Customize your account preferences and security.
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <div className="text-2xl">📚</div>
              </div>
              <h3 className="text-lg font-semibold ml-3 text-gray-900 dark:text-white">
                Documentation
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Learn how to make the most of your account.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a 
                href="https://github.com/stevedylandev/bhvr" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View Docs
              </a>
            </Button>
          </div>
        </div>

        {/* Navigation Options */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Quick Navigation
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button asChild variant="outline">
              <Link to="/">
                Home Page
              </Link>
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}