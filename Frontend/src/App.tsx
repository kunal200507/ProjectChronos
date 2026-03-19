import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "./pages/LandingPage";
import DemoLayout from "./components/DemoLayout";
import DashboardPage from "./pages/demo/DashboardPage";
import PatientsPage from "./pages/demo/PatientsPage";
import AlertsPage from "./pages/demo/AlertsPage";
import ReportsPage from "./pages/demo/ReportsPage";
import SettingsPage from "./pages/demo/SettingsPage";
import VitalsPage from "./pages/demo/VitalsPage";
import TransferPage from "./pages/demo/TransferPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/demo" element={<DemoLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="vitals" element={<VitalsPage />} />
            <Route path="transfer" element={<TransferPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
