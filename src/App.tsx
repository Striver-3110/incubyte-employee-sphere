
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
import { EmployeeProvider } from '@/contexts/EmployeeContext'
import { TaskProvider } from '@/contexts/TaskContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AuthGuard } from '@/components/AuthGuard'
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
        <EmployeeProvider>
          <TaskProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Router>
                <Routes>
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/tasks" element={
                    <ProtectedRoute>
                      <Tasks />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile-data" element={
                    <AuthGuard>
                      <ProfileData />
                    </AuthGuard>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </TooltipProvider>
          </TaskProvider>
        </EmployeeProvider>
      </QueryClientProvider>
    </FrappeProvider>
  );
};

export default App;
