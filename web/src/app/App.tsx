import React from 'react';
import { Providers } from './Providers';
import { AppRouter } from './Router';
import { ErrorBoundary } from '@/shared/components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <AppRouter />
      </Providers>
    </ErrorBoundary>
  );
}

export default App;