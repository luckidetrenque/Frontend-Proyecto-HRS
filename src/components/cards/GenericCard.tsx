import { MoreVertical, Pencil, Trash2 } from "lucide-react";

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
  subtitle?: string;
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
}

export function GenericCard<T>({
  title,
  subtitle,
  fields,
  onClick,
  onEdit,
  onDelete,
}: Props<T>) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-xl border bg-background p-5 shadow-sm hover:shadow-md transition"
    >
      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-destructive"
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
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {fields.map((f) => (
          <div key={f.label}>
            <span className="text-muted-foreground">{f.label}</span>

            {f.type === "badge" && typeof f.value === "boolean" ? (
              <StatusBadge status={f.value ? "success" : "default"}>
                {f.value ? (f.trueLabel ?? "Sí") : (f.falseLabel ?? "No")}
              </StatusBadge>
            ) : (
              <p>{String(f.value)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
