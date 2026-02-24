import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import IdleHandler from "@/components/auth/IdleHandler";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthProvider";
import AlumnoDetalle from "@/pages/AlumnoDetalle";

import AlumnosPage from "./pages/Alumnos";
import CaballoDetalle from "./pages/CaballoDetalle";
import CaballosPage from "./pages/Caballos";
import CalendarioPage from "./pages/Calendario";
import ClaseDetalle from "./pages/ClaseDetalle";
import ClasesPage from "./pages/Clases";
import Finanzas from "./pages/Finanzas";
import Index from "./pages/Index";
import InstructorDetalle from "./pages/InstructorDetalle";
import InstructoresPage from "./pages/Instructores";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Reportes from "./pages/Reportes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <IdleHandler />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alumnos"
              element={
                <ProtectedRoute>
                  <AlumnosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/caballos"
              element={
                <ProtectedRoute>
                  <CaballosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructores"
              element={
                <ProtectedRoute>
                  <InstructoresPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clases"
              element={
                <ProtectedRoute>
                  <ClasesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendario"
              element={
                <ProtectedRoute>
                  <CalendarioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reportes"
              element={
                <ProtectedRoute>
                  <Reportes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finanzas"
              element={
                <ProtectedRoute>
                  <Finanzas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alumnos/:id"
              element={
                <ProtectedRoute>
                  <AlumnoDetalle />
                </ProtectedRoute>
              }
            />

            <Route
              path="/caballos/:id"
              element={
                <ProtectedRoute>
                  <CaballoDetalle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructores/:id"
              element={
                <ProtectedRoute>
                  <InstructorDetalle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clases/:id"
              element={
                <ProtectedRoute>
                  <ClaseDetalle />
                </ProtectedRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
