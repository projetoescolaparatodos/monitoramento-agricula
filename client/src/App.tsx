import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import Home from "@/pages/Home";
import Report from "@/pages/Report";
import AgriculturaMap from "@/pages/AgriculturaMap";
import PescaMap from "@/pages/PescaMap";
import PAAMap from "@/pages/PAAMap";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";
import NavBar from "@/components/NavBar";
import { auth } from "./utils/firebase";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agricultura" element={<AgriculturaMap />} />
        <Route path="/pesca" element={<PescaMap />} />
        <Route path="/paa" element={<PAAMap />} />
        <Route path="/report" element={<Report />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={
          auth.currentUser ? <Admin /> : <Navigate to="/login" replace />
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;