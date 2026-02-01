import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterConfig {
  name: string;
  label: string;
  type: "select" | "date" | "time";
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onReset: () => void;
  defaultOpen?: boolean;
  isLoading?: boolean;
}

export function FilterBar({
  filters,
  values,
  onChange,
  onReset,
  defaultOpen = false,
  isLoading = false,
}: FilterBarProps) {
  const hasActiveFilters = Object.values(values).some(
    (v) => v !== "all" && v !== "",
  );

  return (
    <details
      className="group rounded-lg border border-border bg-secondary/30 w-full sm:flex-1"
      open={defaultOpen}
    >
      <summary className="flex h-9 cursor-pointer items-center justify-between p-4 list-none hover:bg-secondary/50 transition-colors rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Filtros</span>
          {hasActiveFilters && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {
                Object.values(values).filter((v) => v !== "all" && v !== "")
                  .length
              }
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onReset();
              }}
            >
              <X className="mr-1 h-4 w-4" />
              Limpiar
            </Button>
          )}
          <svg
            className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </summary>
      {isLoading && (
        <div className="p-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm">Aplicando filtros...</span>
          </div>
        </div>
      )}
      <div className="border-t border-border p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filters.map((filter) => (
            <div key={filter.name} className="space-y-2">
              <Label
                htmlFor={filter.name}
                className="text-xs text-muted-foreground"
              >
                {filter.label}
              </Label>
              {filter.type === "select" ? (
                <Select
                  value={values[filter.name] || "all"}
                  onValueChange={(value) => onChange(filter.name, value)}
                >
                  <SelectTrigger id={filter.name} className="h-9">
                    <SelectValue placeholder={filter.placeholder || "Todos"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {filter.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={filter.name}
                  type={filter.type}
                  value={values[filter.name] || ""}
                  onChange={(e) => onChange(filter.name, e.target.value)}
                  className="h-9"
                  placeholder={filter.placeholder}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
