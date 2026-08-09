import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { App } from "@/app/app";
import "@/styles/globals.css";
import "@/styles/premium-overrides.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

const root = document.getElementById("app");
if (!root) throw new Error("Application root element was not found.");

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster position="top-center" richColors closeButton dir="ltr" />
    </QueryClientProvider>
  </StrictMode>,
);
