import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import IdleHandler from "@/components/auth/IdleHandler";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthProvider";

// Lazy loading components
const AlumnoDetalle = lazy(() => import("@/pages/AlumnoDetalle"));
const AlumnosPage = lazy(() => import("./pages/Alumnos"));
const CaballoDetalle = lazy(() => import("./pages/CaballoDetalle"));
const CaballosPage = lazy(() => import("./pages/Caballos"));
const CalendarioPage = lazy(() => import("./pages/Calendario"));
const ClaseDetalle = lazy(() => import("./pages/ClaseDetalle"));
const ClasesPage = lazy(() => import("./pages/Clases"));
const Finanzas = lazy(() => import("./pages/Finanzas"));
const Index = lazy(() => import("./pages/Index"));
const InstructorDetalle = lazy(() => import("./pages/InstructorDetalle"));
const InstructoresPage = lazy(() => import("./pages/Instructores"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const Register = lazy(() => import("./pages/Register"));
const Reportes = lazy(() => import("./pages/Reportes"));
const UsuariosPage = lazy(() => import("./pages/Usuarios"));
const MisClasesPage = lazy(() => import("./pages/MisClases"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <IdleHandler />
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          }>
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
                  <ProtectedRoute allowedRoles={["ADMIN", "INSTRUCTOR"]}>
                    <AlumnosPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/caballos"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN", "INSTRUCTOR"]}>
                    <CaballosPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructores"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN", "INSTRUCTOR"]}>
                    <InstructoresPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clases"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN", "INSTRUCTOR"]}>
                    <ClasesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendario"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN", "INSTRUCTOR", "ALUMNO"]}>
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
                  <ProtectedRoute allowedRoles={["ADMIN", "INSTRUCTOR"]}>
                    <Reportes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finanzas"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <Finanzas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/usuarios"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <UsuariosPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alumnos/:id"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN", "INSTRUCTOR"]}>
                    <AlumnoDetalle />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/caballos/:id"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN", "INSTRUCTOR"]}>
                    <CaballoDetalle />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructores/:id"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN", "INSTRUCTOR"]}>
                    <InstructorDetalle />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clases/:id"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN", "INSTRUCTOR"]}>
                    <ClaseDetalle />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/mis-clases"
                element={
                  <ProtectedRoute allowedRoles={["ALUMNO"]}>
                    <MisClasesPage />
                  </ProtectedRoute>
                }
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
