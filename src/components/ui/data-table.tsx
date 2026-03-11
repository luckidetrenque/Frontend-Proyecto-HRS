import { Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id?: number | string }>({
  columns,
  data,
  isLoading,
  emptyMessage = "No hay datos disponibles",
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/30">
              {columns.map((column, i) => (
                <TableHead key={i} className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/80">
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i} className="border-b border-border/10">
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-5 w-full bg-secondary/80" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 backdrop-blur-sm py-20 animate-in fade-in duration-500">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50 mb-4 text-muted-foreground">
          <Inbox className="h-8 w-8 opacity-50" />
        </div>
        <p className="text-muted-foreground font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden transition-all duration-300">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border/30 bg-secondary/30">
            {columns.map((column, i) => (
              <TableHead
                key={i}
                className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/80 h-10 align-middle py-3"
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow
              key={row.id ?? i}
              onClick={() => onRowClick?.(row)}
              className={`
                border-b border-border/20 transition-colors duration-200 
                ${i % 2 === 0 ? 'bg-card/20' : 'bg-card/40'}
                ${onRowClick ? "cursor-pointer hover:bg-muted/80" : "hover:bg-transparent"}
              `}
            >
              {columns.map((column, j) => (
                <TableCell key={j} className="py-3.5 text-sm">
                  {column.cell
                    ? column.cell(row)
                    : column.accessorKey
                      ? String(row[column.accessorKey] ?? "-")
                      : "-"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
