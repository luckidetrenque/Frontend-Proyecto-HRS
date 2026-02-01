import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import IdleHandler from "@/components/auth/IdleHandler";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AlumnosPage from "./pages/Alumnos";
import CaballosPage from "./pages/Caballos";
import CalendarioPage from "./pages/Calendario";
import ClasesPage from "./pages/Clases";
import InstructoresPage from "./pages/Instructores";
import Reportes from "./pages/Reportes";
import AlumnoDetalle from "@/pages/AlumnoDetalle";
import CaballoDetalle from "./pages/CaballoDetalle";
import ClaseDetalle from "./pages/ClaseDetalle";
import InstructorDetalle from "./pages/InstructorDetalle";

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
