import { Suspense } from 'react';

export default function NewEstimateLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
