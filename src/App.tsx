import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy load route components for code splitting
const Index = lazy(() => import("./pages/Index"));
const CanvasView = lazy(() => import("./pages/CanvasView"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DistributionCalculator = lazy(() => import("./pages/DistributionCalculator"));
const HapticTest = lazy(() => import("./pages/HapticTest"));
const ExParteRFO = lazy(() => import("./pages/ExParteRFO"));
const MapperPage = lazy(() => import("./pages/MapperPage"));

const queryClient = new QueryClient();

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Index />} />
              <Route path="/canvas" element={<CanvasView />} />
              <Route path="/distribution-calculator" element={<DistributionCalculator />} />
              <Route path="/haptic-test" element={<HapticTest />} />
              <Route path="/ex-parte-rfo" element={<ExParteRFO />} />
              <Route path="/mapper" element={<MapperPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
