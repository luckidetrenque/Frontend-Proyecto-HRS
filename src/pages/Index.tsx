import {
  ArrowRight,
  BarChart,
  CalendarDays,
  ChessKnight,
  CircleDollarSign,
  GraduationCap,
  NotebookPen,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Layout } from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const modules = [
  {
    title: "Alumnos",
    description: "Gestiona los alumnos inscriptos en la escuela",
    icon: User,
    href: "/alumnos",
    color: "bg-primary",
  },
  {
    title: "Instructores",
    description: "Administra el equipo de instructores",
    icon: GraduationCap,
    href: "/instructores",
    color: "bg-accent",
  },
  {
    title: "Caballos",
    description: "Control de caballos de la escuela y privados",
    icon: ChessKnight,
    href: "/caballos",
    color: "bg-success",
  },
  {
    title: "Clases",
    description: "Programa y gestiona las clases de equitación",
    icon: NotebookPen,
    href: "/clases",
    color: "bg-info",
  },
  {
    title: "Calendario",
    description: "Vista visual interactiva de todas las clases",
    icon: CalendarDays,
    href: "/calendario",
    color: "bg-primary",
  },
  {
    title: "Reportes",
    description: "Estadísticas y análisis de la escuela",
    icon: BarChart,
    href: "/reportes",
    color: "bg-warning",
  },
  {
    title: "Finanzas",
    description: "Gestión de ingresos y egresos de la escuela",
    icon: CircleDollarSign,
    href: "/finanzas",
    color: "bg-success",
  },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <div className="mb-12 text-center animate-fade-in">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Sistema de Gestión de la Escuela de Equitación
        </h1>
        <p className="text-muted-foreground">
          Administra alumnos, instructores, caballos, clases, calendario,
          reportes y finanzas desde un solo lugar.
        </p>
      </div>

      {/* Module Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {modules.map((module, index) => (
          <Link
            key={module.href}
            to={module.href}
            className="group animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Card className="h-full transition-all duration-300 hover:shadow-hover hover:-translate-y-1 border-border">
              <CardHeader>
                <div
                  className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${module.color} transition-transform duration-300 group-hover:scale-110`}
                >
                  <module.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="font-display text-xl">
                  {module.title}
                </CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-all duration-200 group-hover:gap-3">
                  Gestionar
                  <ArrowRight className="h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Info Banner */}
      <div
        className="mt-12 rounded-2xl bg-secondary/50 p-6 md:p-8 animate-fade-in"
        style={{ animationDelay: "400ms" }}
      >
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-primary">
            <ChessKnight className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Escuela de Equitación
            </h2>
            <p className="mt-1 text-muted-foreground">
              2026 - Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
