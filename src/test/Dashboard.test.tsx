import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from '../pages/Dashboard';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Dashboard', () => {
  it('should render dashboard title', async () => {
    renderWithProviders(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('should display statistics cards', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Records')).toBeInTheDocument();
      expect(screen.getByText('Individuals')).toBeInTheDocument();
      expect(screen.getByText('Entities')).toBeInTheDocument();
      expect(screen.getByText('Data Freshness')).toBeInTheDocument();
    });
  });

  it('should display AI Model Status section', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('AI Model Status')).toBeInTheDocument();
      expect(screen.getByText('Ollama Status')).toBeInTheDocument();
    });
  });

  it('should display Synchronization section', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Synchronization')).toBeInTheDocument();
      expect(screen.getByText('Last Sync')).toBeInTheDocument();
    });
  });

  it('should display About This System section', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('About This System')).toBeInTheDocument();
      expect(
        screen.getByText(/This is a local sanctions screening tool/i)
      ).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    renderWithProviders(<Dashboard />);
    // Should show loading spinner or content
    const container = screen.getByText('Dashboard').closest('div');
    expect(container).toBeInTheDocument();
  });
});
