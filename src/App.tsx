
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom'
import { FrappeProvider } from 'frappe-react-sdk'
import { TestEmployeeProvider } from '@/contexts/TestEmployeeContext'
import { TaskProvider } from '@/contexts/TaskContext'
import Index from "./pages/Index";
import Contributions from "./pages/Contributions";
import Tasks from "./pages/Tasks";
import ProfileData from "./pages/ProfileData";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <FrappeProvider>
      <QueryClientProvider client={queryClient}>
        <TestEmployeeProvider>
          <TaskProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Router>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/profile-data" element={<ProfileData />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </TooltipProvider>
          </TaskProvider>
        </TestEmployeeProvider>
      </QueryClientProvider>
    </FrappeProvider>
  );
};

export default App;
