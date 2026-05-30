import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider, SUPPORTED_LANGUAGES } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Game from "./pages/Game";
import LeaderboardPage from "./pages/LeaderboardPage";
import HistoryPage from "./pages/HistoryPage";
import MyAccountPage from "./pages/MyAccountPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const appRoutes = (
  <>
    <Route index element={<Index />} />
    <Route path="game" element={<Game />} />
    <Route path="leaderboard" element={<LeaderboardPage />} />
    <Route path="history" element={<HistoryPage />} />
    <Route path="my-account" element={<MyAccountPage />} />
    <Route path="admin" element={<AdminPage />} />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <Routes>
            {/* Language-prefixed routes */}
            {SUPPORTED_LANGUAGES.map((lang) => (
              <Route key={lang} path={`/${lang}`}>
                <Route index element={<Index />} />
                <Route path="game" element={<Game />} />
                <Route path="leaderboard" element={<LeaderboardPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="my-account" element={<MyAccountPage />} />
                <Route path="admin" element={<AdminPage />} />
              </Route>
            ))}
            {/* Default routes (no language prefix) */}
            <Route path="/" element={<Index />} />
            <Route path="/game" element={<Game />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/my-account" element={<MyAccountPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
