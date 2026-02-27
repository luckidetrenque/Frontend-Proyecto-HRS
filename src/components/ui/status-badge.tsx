import { cn } from "@/lib/utils";

type Status =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "default"
  | "escuela"
  | "propio";

interface StatusBadgeProps {
  status: Status;
  children: React.ReactNode;
}

const statusStyles: Record<Status, string> = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  error: "bg-destructive/15 text-destructive border-destructive/30",
  info: "bg-info/15 text-info border-info/30",
  default: "bg-muted text-muted-foreground border-border",
  escuela: "ml-2 bg-yellow-100 text-yellow-800 border-yellow-300",
  propio: "ml-2 bg-blue-100 text-blue-800 border-blue-300",
};

export function StatusBadge({ status, children }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status],
      )}
    >
      {children}
    </span>
  );
}
