import {
  ArrowRight,
  BarChart,
  Calendar,
  CalendarDays,
  Landmark,
  UserCheck,
  Users,
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
    icon: Users,
    href: "/alumnos",
    color: "bg-primary",
  },
  {
    title: "Instructores",
    description: "Administra el equipo de instructores",
    icon: UserCheck,
    href: "/instructores",
    color: "bg-accent",
  },
  {
    title: "Caballos",
    description: "Control de caballos de la escuela y privados",
    icon: Landmark,
    href: "/caballos",
    color: "bg-success",
  },
  {
    title: "Clases",
    description: "Programa y gestiona las clases de equitación",
    icon: CalendarDays,
    href: "/clases",
    color: "bg-info",
  },
  {
    title: "Calendario",
    description: "Vista visual interactiva de todas las clases",
    icon: Calendar,
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
];

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <div className="mb-12 text-center animate-fade-in">
        <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
          Bienvenido
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Sistema de gestión para la Escuela de Equitación. Administra alumnos,
          instructores, caballos y clases desde un solo lugar.
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
            <Landmark className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              API REST Spring Boot
            </h2>
            <p className="mt-1 text-muted-foreground">
              Este frontend está conectado a una API REST desarrollada en Java
              Spring Boot. Asegúrate de que el servidor esté ejecutándose en{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                http://localhost:5173
              </code>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
