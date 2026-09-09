import React from 'react';
import RiderPortalPage from '../../admin-app/src/pages/RiderPortalPage';
import ErrorBoundary from '../../admin-app/src/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <RiderPortalPage />
    </ErrorBoundary>
  );
}
