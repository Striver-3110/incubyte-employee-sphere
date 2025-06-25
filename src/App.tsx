
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
import { EmployeeProvider } from '@/contexts/EmployeeContext'
import Index from "./pages/Index";
import Contributions from "./pages/Contributions";
import ProfileData from "./pages/ProfileData";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {

  return (
    <FrappeProvider>
      <QueryClientProvider client={queryClient}>
        <EmployeeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/profile-data" element={<ProfileData />} />
                {/* <Route path="/contributions" element={<Contributions />} /> */}
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </TooltipProvider>
        </EmployeeProvider>
      </QueryClientProvider>
    </FrappeProvider>
  );
};

export default App;
