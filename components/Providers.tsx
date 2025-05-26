"use client";

import React, { useState, useEffect, type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const queryClient = new QueryClient();

  return (
    // First check if it's client-side to avoid hydration issues
    isClient ? (
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="system" storageKey="yuco-theme">
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </ThemeProvider>
        </QueryClientProvider>
      </SessionProvider>
    ) : (
      <ClientSideRenderingFallback />
    )
  );
}

// Simple fallback component that has the same structure as your app layout
// but with minimal content to avoid hydration errors
function ClientSideRenderingFallback() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b">
        {/* Navbar placeholder to maintain layout structure */}
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
      </div>
    </div>
  );
}
