import { Mail, MessageCircleMore, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { ReactNode } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status-badge";

interface Props<T> {
  item: T;
  title: string;
  subtitle?: ReactNode;
  fields: {
    label: string;
    value: string | number | boolean;
    type?: "text" | "badge";
    trueLabel?: string;
    falseLabel?: string;
  }[];
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSendWhatsApp: (item: T) => void;
  onSendEmail: (item: T) => void;
}

export function GenericCard<T>({
  item,
  title,
  subtitle,
  fields,
  onClick,
  onEdit,
  onDelete,
  onSendWhatsApp,
  onSendEmail,
}: Props<T>) {
  function hasEmail(obj: unknown): obj is { email: string } {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "email" in obj &&
      typeof (obj as { email: unknown }).email === "string" &&
      ((obj as { email: string }).email.length > 0)
    );
  }
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-6 shadow-sm hover:shadow-hover hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
    >
      {/* Decorative gradient blur in background */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* HEADER */}
      <div className="flex justify-between items-start relative z-10">
        <div>
          <h3 className="text-xl font-display font-semibold text-foreground tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        {/* MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all shrink-0"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-border/50 bg-card/95 backdrop-blur-md">
            <DropdownMenuItem
              className="rounded-lg cursor-pointer my-0.5"
              onClick={(e) => {
                e.stopPropagation();
                onSendWhatsApp(item);
              }}
            >
              <MessageCircleMore className="mr-2 h-4 w-4 text-green-600" />
              Enviar WhatsApp
            </DropdownMenuItem>

            {hasEmail(item) && (
              <DropdownMenuItem
                className="rounded-lg cursor-pointer my-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  onSendEmail(item);
                }}
              >
                <Mail className="mr-2 h-4 w-4 text-blue-600" />
                Enviar correo
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="bg-border/50" />

            <DropdownMenuItem
              className="rounded-lg cursor-pointer my-0.5"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-destructive rounded-lg cursor-pointer my-0.5 focus:text-destructive focus:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* BODY */}
      <div className="mt-5 pt-4 border-t border-border/30 grid grid-cols-2 gap-y-4 gap-x-3 text-sm relative z-10">
        {fields.map((f) => {
          // Ocultar la fila de email si está vacío, es guion o null
          if (
            f.label.toLowerCase() === "email" &&
            (!f.value || f.value === "-" || f.value === null || f.value === "")
          ) {
            return null;
          }
          return (
            <div key={f.label} className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">{f.label}</span>
              {f.type === "badge" && typeof f.value === "boolean" ? (
                <div className="mt-0.5">
                  <StatusBadge status={f.value ? "success" : "default"}>
                    {f.value ? (f.trueLabel ?? "Sí") : (f.falseLabel ?? "No")}
                  </StatusBadge>
                </div>
              ) : (
                <p className="font-medium text-foreground">{String(f.value)}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
