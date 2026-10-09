import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SearchPage } from '../pages/SearchPage';

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

describe('SearchPage', () => {
  it('should render search page title', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByText('Sanctions Screening')).toBeInTheDocument();
  });

  it('should render search input', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByPlaceholderText(/Enter full name/i)).toBeInTheDocument();
  });

  it('should render search button', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('should render record type filter', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByLabelText(/Record Type/i)).toBeInTheDocument();
  });

  it('should render minimum score slider', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByLabelText(/Minimum Score/i)).toBeInTheDocument();
  });

  it('should show initial state message', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByText('Start Screening')).toBeInTheDocument();
    expect(
      screen.getByText(/Enter a name above to search/i)
    ).toBeInTheDocument();
  });

  it('should show validation error for short query', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchPage />);
    
    const input = screen.getByPlaceholderText(/Enter full name/i);
    const button = screen.getByRole('button', { name: /search/i });
    
    await user.type(input, 'J');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/Name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('should display record type options', () => {
    renderWithProviders(<SearchPage />);
    const select = screen.getByLabelText(/Record Type/i);
    expect(select).toBeInTheDocument();
    
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
  });

  it('should display experimental warning', () => {
    renderWithProviders(<SearchPage />);
    expect(
      screen.getByText(/Score thresholds are experimental/i)
    ).toBeInTheDocument();
  });
});
