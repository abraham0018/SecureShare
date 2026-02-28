import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VaultProvider } from "@/context/VaultContext";
import VaultPage from "./pages/VaultPage";
import EncryptPage from "./pages/EncryptPage";
import DecryptPage from "./pages/DecryptPage";
import SharePage from "./pages/SharePage";
import ReceivePage from "./pages/ReceivePage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <VaultProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<VaultPage />} />
            <Route path="/encrypt" element={<EncryptPage />} />
            <Route path="/decrypt" element={<DecryptPage />} />
            <Route path="/share" element={<SharePage />} />
            <Route path="/receive" element={<ReceivePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </VaultProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
