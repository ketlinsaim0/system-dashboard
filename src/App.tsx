import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/hooks/useTheme";
import { DashboardConfigProvider } from "@/hooks/useDashboardConfig";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Customers from "./pages/Customers.tsx";
import Leads from "./pages/Leads.tsx";
import Products from "./pages/Products.tsx";
import Invoices from "./pages/Invoices.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AuthProvider>
            <DashboardConfigProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                  <Route path="/" element={<Index />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/invoices" element={<Invoices />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DashboardConfigProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
