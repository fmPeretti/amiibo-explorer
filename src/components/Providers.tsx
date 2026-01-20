"use client";

import { ReactNode } from "react";
import ErrorBoundary from "./ErrorBoundary";
import { ApiStatusProvider } from "@/contexts/ApiStatusContext";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <ApiStatusProvider>
        {children}
      </ApiStatusProvider>
    </ErrorBoundary>
  );
}
