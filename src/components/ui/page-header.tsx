import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

// page-header.tsx
export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="w-full mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {title}
        </h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      {/* Contenedor de acciones: le damos un ancho total en móvil y auto en desktop */}
      {action && <div className="w-full md:w-auto flex-shrink-0">{action}</div>}
    </div>
  );
}
