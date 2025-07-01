import { useQuery } from '@tanstack/react-query'
import beaver from './assets/beaver.svg'
import { Button } from './components/ui/button'
import { hcWithType } from 'server/dist/client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"

const client = hcWithType(SERVER_URL);

function App() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['hello'],
    queryFn: async () => {
      const res = await client.hello.$get()
      if (!res.ok) {
        throw new Error('Failed to fetch data')
      }
      return res.json()
    },
    enabled: false, // Don't fetch on mount, only when button is clicked
  })

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6 items-center justify-center min-h-screen">
      <a href="https://github.com/stevedylandev/bhvr" target="_blank">
        <img
          src={beaver}
          className="w-16 h-16 cursor-pointer"
          alt="beaver logo"
        />
      </a>
      <h1 className="text-5xl font-black">bhvr</h1>
      <h2 className="text-2xl font-bold">Bun + Hono + Vite + React</h2>
      <p>A typesafe fullstack monorepo with TanStack Query</p>
      <p className="text-sm text-gray-500">💡 Open React Query DevTools (bottom-left) to inspect queries</p>
      <div className='flex items-center gap-4'>
        <Button 
          onClick={() => refetch()}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Call API'}
        </Button>
        <Button 
          variant="outline"
          asChild
        >
          <a target='_blank' href="https://tanstack.com/query/latest/docs/framework/react/overview">
          TanStack Query Docs
          </a>
        </Button>
      </div>
      {error && (
        <pre className="bg-red-100 p-4 rounded-md border border-red-200">
          <code>Error: {error.message}</code>
        </pre>
      )}
      {data && (
        <pre className="bg-gray-100 p-4 rounded-md">
          <code>
          Message: {data.message} <br />
          Success: {data.success.toString()}
          </code>
        </pre>
      )}
    </div>
  )
}

export default App