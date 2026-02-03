import {
  BarChart,
  CalendarDays,
  ChevronRight,
  Landmark,
  Menu,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { HelpSystem } from "@/components/HelpSystem";
import {
  AlumnoIcon,
  CaballoIcon,
  CalendarioIcon,
  ClaseIcon,
  InstructorIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import SmartSearch from "@/components/ui/smart-search";
import { UserDropdown } from "@/components/UserDropdown";
import { cn } from "@/lib/utils";

import { OnboardingTour } from "./OnboardingTour";

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Alumnos", href: "/alumnos", icon: Users },
  { name: "Instructores", href: "/instructores", icon: UserCheck },
  { name: "Caballos", href: "/caballos", icon: Landmark },
  { name: "Clases", href: "/clases", icon: CalendarDays },
  { name: "Calendario", href: "/calendario", icon: CalendarDays },
  { name: "Reportes", href: "/reportes", icon: BarChart },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Determinar el tipo de entidad según la ruta actual
  const entityType = useMemo(() => {
    if (location.pathname.startsWith("/alumnos")) return "alumnos";
    if (location.pathname.startsWith("/instructores")) return "instructores";
    if (location.pathname.startsWith("/caballos")) return "caballos";
    if (location.pathname.startsWith("/clases")) return "clases";
    return null;
  }, [location.pathname]);

  // Handler para la búsqueda global
  const handleGlobalSearch = useCallback(
    (filters: Record<string, unknown>) => {
      // Emitir evento personalizado con los filtros
      window.dispatchEvent(
        new CustomEvent("globalSearch", {
          detail: { filters, entityType },
        }),
      );
    },
    [entityType],
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Landmark className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden lg:block">
              {" "}
              {/* Cambiar de sm a lg */}
              <h1 className="font-display text-xl font-semibold text-foreground">
                Escuela de Equitación
              </h1>
              <p className="text-xs text-muted-foreground">
                Sistema de Gestión
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:gap-1">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                  title={item.name}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="hidden 2xl:inline">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Dropdown + Mobile Menu Button */}
          <div className="flex items-center gap-2">
            {/* Buscador Global */}
            {entityType && (
              <div className="hidden lg:block flex-1 max-w-sm xl:max-w-xl mx-4">
                <SmartSearch
                  entityType={entityType}
                  onSearch={handleGlobalSearch}
                />
              </div>
            )}
            <UserDropdown />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="border-t border-border bg-card p-4 md:hidden">
            <div className="flex flex-col gap-2">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="container py-6 md:py-8">{children}</main>
      <HelpSystem />
      <OnboardingTour />
    </div>
  );
}
