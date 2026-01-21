"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type ApiStatus = "online" | "offline" | "degraded" | "checking";

interface ApiStatusContextType {
  status: ApiStatus;
  message: string;
  lastChecked: Date | null;
  checkStatus: () => Promise<void>;
  isLoading: boolean;
}

const ApiStatusContext = createContext<ApiStatusContextType | undefined>(undefined);

interface ApiStatusProviderProps {
  children: ReactNode;
}

export function ApiStatusProvider({ children }: ApiStatusProviderProps) {
  // Default to "online" - assume API works until proven otherwise
  // This prevents showing "offline" UI before the health check completes
  const [status, setStatus] = useState<ApiStatus>("online");
  const [message, setMessage] = useState("");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/amiibo/health");
      const data = await response.json();

      setStatus(data.status as ApiStatus);
      setMessage(data.message);
      setLastChecked(new Date(data.timestamp));
    } catch (error) {
      setStatus("offline");
      setMessage("Unable to check AmiiboAPI status");
      setLastChecked(new Date());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check status on mount
  useEffect(() => {
    checkStatus();

    // Recheck every 5 minutes if the page stays open
    const interval = setInterval(checkStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkStatus]);

  return (
    <ApiStatusContext.Provider
      value={{
        status,
        message,
        lastChecked,
        checkStatus,
        isLoading,
      }}
    >
      {children}
    </ApiStatusContext.Provider>
  );
}

export function useApiStatus() {
  const context = useContext(ApiStatusContext);
  if (context === undefined) {
    throw new Error("useApiStatus must be used within an ApiStatusProvider");
  }
  return context;
}
