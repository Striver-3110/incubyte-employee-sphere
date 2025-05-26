
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HashRouter as Router,
  Routes,
  Route
} from 'react-router-dom'
import { FrappeProvider } from 'frappe-react-sdk'
import Index from "./pages/Index";
import Contributions from "./pages/Contributions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Provide default values for environment variables to prevent null context issues
  const socketPort = import.meta.env.VITE_SOCKET_PORT || '9000';
  const siteName = import.meta.env.VITE_SITE_NAME || 'localhost:8000';

  return (
    <FrappeProvider
      socketPort={socketPort}
      siteName={siteName}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* <Route path="/contributions" element={<Contributions />} /> */}
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </FrappeProvider>
  );
};

export default App;
