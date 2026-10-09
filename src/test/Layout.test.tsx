import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '../components/Layout';

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

describe('Layout', () => {
  it('should render navigation links', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Administration')).toBeInTheDocument();
  });

  it('should render the app title', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('UN Sanctions Screening')).toBeInTheDocument();
  });

  it('should render children content', () => {
    renderWithProviders(
      <Layout>
        <div data-testid="child-content">Test Child Content</div>
      </Layout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should render disclaimer in footer', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Disclaimer')).toBeInTheDocument();
    expect(
      screen.getByText(/This system supports screening/i)
    ).toBeInTheDocument();
  });

  it('should show Local Mode indicator', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Local Mode')).toBeInTheDocument();
  });
});
