import { Filter, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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
  const activeFilters = Object.entries(values).filter(
    ([, v]) => v !== "all" && v !== "",
  );
  
  const hasActiveFilters = activeFilters.length > 0;

  // Function to get a human-readable label for a filter value
  const getFilterLabel = (key: string, val: string) => {
    const config = filters.find((f) => f.name === key);
    if (!config) return val;
    if (config.type === "select" && config.options) {
      return config.options.find((o) => o.value === val)?.label || val;
    }
    return val;
  };

  // Function to get the filter config label
  const getFilterConfigLabel = (key: string) => {
    return filters.find((f) => f.name === key)?.label || key;
  };

  return (
    <div className="flex flex-col gap-3">
      <details
        className="group rounded-2xl border border-border/50 bg-secondary/20 shadow-sm w-full sm:flex-1 backdrop-blur-md overflow-hidden transition-all duration-300"
        open={defaultOpen}
      >
        <summary className="flex h-12 cursor-pointer items-center justify-between px-5 list-none hover:bg-secondary/40 transition-colors rounded-2xl group-open:rounded-b-none">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Filtros Avanzados</span>
            {hasActiveFilters && (
              <span className="ml-2 rounded-full bg-primary flex items-center justify-center h-5 w-5 text-[10px] font-bold text-primary-foreground shadow-card shadow-primary/30">
                {activeFilters.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onReset();
                }}
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Limpiar todo
              </Button>
            )}
            <svg
              className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180 duration-300 ml-2"
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
          <div className="px-5 py-3 border-t border-border/30 bg-card/30">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              <span className="text-xs font-medium text-muted-foreground">Aplicando filtros...</span>
            </div>
          </div>
        )}
        
        <div className="border-t border-border/30 p-5 bg-card/40">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filters.map((filter) => (
              <div key={filter.name} className="space-y-1.5">
                <Label
                  htmlFor={filter.type === "select" ? `select-${filter.name}` : filter.name}
                  className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80"
                >
                  {filter.label}
                </Label>
                {filter.type === "select" ? (
                  <div className="space-y-2">
                    <Select
                      value={values[filter.name] ?? "all"}
                      onValueChange={(value) => onChange(filter.name, value)}
                    >
                      <SelectTrigger className="h-10 bg-background/50 border-border/60 hover:border-border transition-colors shadow-none focus:ring-1 focus:ring-primary/30" id={`select-${filter.name}`}>
                        <SelectValue
                          placeholder={filter.placeholder || "Todos"}
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/50 shadow-lg backdrop-blur-xl bg-card/95">
                        <SelectItem value="all" className="cursor-pointer">Todos</SelectItem>
                        {filter.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
  
                    <input
                      type="hidden"
                      id={filter.name}
                      name={filter.name}
                      value={values[filter.name] ?? "all"}
                      readOnly
                    />
                  </div>
                ) : (
                  <Input
                    id={filter.name}
                    name={filter.name}
                    type={filter.type}
                    value={values[filter.name] ?? ""}
                    onChange={(e) => onChange(filter.name, e.target.value)}
                    className="h-10 bg-background/50 border-border/60 hover:border-border transition-colors shadow-none focus-visible:ring-1 focus-visible:ring-primary/30"
                    placeholder={filter.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </details>
      
      {/* Active Filter Pills (outside the accordion) */}
      {!defaultOpen && hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-1 animate-fade-in">
          <span className="text-xs text-muted-foreground mr-1">Activos:</span>
          {activeFilters.map(([key, val]) => (
            <Badge 
              key={key} 
              variant="secondary" 
              className="px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-none cursor-pointer flex items-center gap-1.5"
              onClick={() => {
                if(filters.find(f => f.name === key)?.type === 'select') {
                    onChange(key, "all")
                } else {
                    onChange(key, "")
                }
              }}
            >
              <span className="opacity-70">{getFilterConfigLabel(key)}:</span> {getFilterLabel(key, val)}
              <X className="h-3 w-3 ml-0.5 opacity-50 hover:opacity-100" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
