// components/WithSuspense.tsx
import { Suspense } from "react";

export default function WithSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}