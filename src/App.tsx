import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { SearchPage } from './pages/SearchPage';
import { RecordDetails } from './pages/RecordDetails';
import { AdminPage } from './pages/AdminPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/records/:id" element={<RecordDetails />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Layout>
      </HashRouter>
    </QueryClientProvider>
  );
}

export default App;
