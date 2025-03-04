import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ExpenseProvider } from "@/context/ExpenseContext";
import Index from "./pages/Index";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import NotFound from "./pages/NotFound";
import { auth } from "./lib/firebase";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./PrivateRoute";
import Login from "./components/AuthForm";
import Register from "./components/Register";
import AuthForm from "./components/AuthForm";

const queryClient = new QueryClient();

const App = () => {
  const { user } = useAuth();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
          <ExpenseProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={ !user ? <AuthForm /> : <Navigate to='/'/>} />

                {/* Protected Routes */}
                <Route element={<PrivateRoute />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/categories" element={<Categories />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ExpenseProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
