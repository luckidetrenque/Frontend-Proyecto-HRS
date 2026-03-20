import {
  BarChart,
  CalendarDays,
  ChessKnight,
  ChevronRight,
  CircleDollarSign,
  GraduationCap,
  Menu,
  NotebookPen,
  Shield,
  User,
  X,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import { HelpSystem } from "@/components/HelpSystem";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/UserDropdown";
import { cn } from "@/lib/utils";

import { OnboardingTour } from "./OnboardingTour";

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Alumnos", href: "/alumnos", icon: User },
  { name: "Instructores", href: "/instructores", icon: GraduationCap },
  { name: "Caballos", href: "/caballos", icon: ChessKnight },
  { name: "Clases", href: "/clases", icon: NotebookPen },
  { name: "Calendario", href: "/calendario", icon: CalendarDays },
  { name: "Reportes", href: "/reportes", icon: BarChart },
  { name: "Finanzas", href: "/finanzas", icon: CircleDollarSign },
  { name: "Usuarios", href: "/usuarios", icon: Shield },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const filteredNavigation = navigation.filter((item) => {
    if (user?.rol === "ADMIN") return true;
    if (user?.rol === "INSTRUCTOR") {
      return ["Clases", "Calendario", "Caballos", "Alumnos", "Reportes"].includes(item.name);
    }
    return false; // ALUMNO no ve módulos de gestión
  });

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row transition-all duration-300 overflow-x-hidden">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <ChessKnight className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="font-display text-lg font-semibold text-foreground">
              HRS
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            <UserDropdown />
            <Button
              variant="ghost"
              size="icon"
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
      </header>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <nav className="md:hidden fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-sm border-t border-border p-4">
          <div className="flex flex-col gap-2">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 shadow-sm",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border bg-card/60 backdrop-blur-xl sticky top-0 h-screen overflow-y-auto overflow-x-hidden transition-all duration-300 relative",
          isSidebarCollapsed ? "w-20" : "w-64 lg:w-72",
        )}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-6 bg-card border border-border rounded-full p-1 shadow-sm hover:bg-muted z-50 text-muted-foreground hover:text-foreground transition-colors"
          title={isSidebarCollapsed ? "Expandir" : "Contraer"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </button>

        <div
          className={cn(
            "p-6 flex items-center transition-all",
            isSidebarCollapsed ? "justify-center px-0" : "gap-3",
          )}
        >
          <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-soft">
            <ChessKnight className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isSidebarCollapsed && (
            <div className="animate-fade-in truncate">
              <h1 className="font-display text-lg font-bold text-foreground">
                Escuela HRS
              </h1>
              <p className="text-xs text-muted-foreground">Sistema de Gestión</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                title={isSidebarCollapsed ? item.name : undefined}
                className={cn(
                  "flex items-center rounded-xl py-3 text-sm font-medium transition-all duration-300",
                  isSidebarCollapsed ? "justify-center px-0" : "gap-3 px-4",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-card"
                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "opacity-100" : "opacity-70",
                  )}
                />
                {!isSidebarCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div
          className={cn(
            "p-4 mt-auto border-t border-border/50",
            isSidebarCollapsed ? "flex justify-center" : "",
          )}
        >
          <UserDropdown />
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 max-w-full",
          !isSidebarCollapsed
            ? "md:max-w-[calc(100vw-16rem)] lg:max-w-[calc(100vw-18rem)]"
            : "md:max-w-[calc(100vw-5rem)]",
        )}
      >
        <div className="p-6 md:p-8 flex-1">{children}</div>
        <HelpSystem />
        <OnboardingTour />
      </main>
    </div>
  );
}
