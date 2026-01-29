import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Search, X, Loader2, Filter, TrendingUp } from "lucide-react";

// Tipos de entidades
type EntityType = "alumnos" | "instructores" | "caballos" | "clases";

interface SearchConfig {
  entityType: EntityType;
  placeholder?: string;
  onSearch: (filters: Record<string, any>) => void;
  suggestions?: string[];
}

// Palabras clave por entidad
const KEYWORDS = {
  alumnos: {
    activo: ["activo", "activos", "habilitado", "habilitados"],
    inactivo: ["inactivo", "inactivos", "deshabilitado", "deshabilitados"],
    propietario: [
      "propietario",
      "propietarios",
      "dueño",
      "dueños",
      "con caballo",
    ],
    noPropietario: ["sin caballo", "no propietario", "no dueño"],
  },
  instructores: {
    activo: ["activo", "activos", "trabajando", "disponible"],
    inactivo: ["inactivo", "inactivos", "no disponible", "licencia"],
  },
  caballos: {
    escuela: ["escuela", "de escuela", "compartido"],
    privado: ["privado", "privados", "particular", "propio"],
    disponible: ["disponible", "disponibles", "libre", "libres"],
    noDisponible: ["no disponible", "ocupado", "ocupados"],
  },
  clases: {
    programada: ["programada", "programadas", "pendiente", "pendientes"],
    completada: ["completada", "completadas", "finalizada", "finalizadas"],
    cancelada: ["cancelada", "canceladas"],
    iniciada: ["iniciada", "en curso", "activa", "activas", "en progreso"],
  },
};

// Función para detectar fechas en texto natural
const parseFecha = (texto: string): string | null => {
  const patterns = [
    {
      regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      format: (m: RegExpMatchArray) =>
        `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`,
    },
    {
      regex: /(\d{4})-(\d{1,2})-(\d{1,2})/,
      format: (m: RegExpMatchArray) =>
        `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`,
    },
    { regex: /(\d{4})/, format: (m: RegExpMatchArray) => m[1] },
  ];

  for (const pattern of patterns) {
    const match = texto.match(pattern.regex);
    if (match) return pattern.format(match);
  }
  return null;
};

// Función para interpretar la búsqueda
const interpretarBusqueda = (
  query: string,
  entityType: EntityType,
): Record<string, any> => {
  const filters: Record<string, any> = {};
  const queryLower = query.toLowerCase().trim();

  // Detectar palabras clave según entidad
  const keywords = KEYWORDS[entityType];

  if (entityType === "alumnos") {
    if (keywords.activo.some((k) => queryLower.includes(k)))
      filters.activo = true;
    if (keywords.inactivo.some((k) => queryLower.includes(k)))
      filters.activo = false;
    if (keywords.propietario.some((k) => queryLower.includes(k)))
      filters.propietario = true;
    if (keywords.noPropietario.some((k) => queryLower.includes(k)))
      filters.propietario = false;

    // Detectar fecha de inscripción
    const fecha = parseFecha(queryLower);
    if (fecha) {
      if (queryLower.includes("inscri") || queryLower.includes("alta")) {
        filters.fechaInscripcion = fecha;
      } else if (queryLower.includes("naci") || queryLower.includes("edad")) {
        filters.fechaNacimiento = fecha;
      }
    }
  } else if (entityType === "instructores") {
    if (keywords.activo.some((k) => queryLower.includes(k)))
      filters.activo = true;
    if (keywords.inactivo.some((k) => queryLower.includes(k)))
      filters.activo = false;

    const fecha = parseFecha(queryLower);
    if (fecha && (queryLower.includes("naci") || queryLower.includes("edad"))) {
      filters.fechaNacimiento = fecha;
    }
  } else if (entityType === "caballos") {
    if (keywords.escuela.some((k) => queryLower.includes(k)))
      filters.tipo = "ESCUELA";
    if (keywords.privado.some((k) => queryLower.includes(k)))
      filters.tipo = "PRIVADO";
    if (keywords.disponible.some((k) => queryLower.includes(k)))
      filters.disponible = true;
    if (keywords.noDisponible.some((k) => queryLower.includes(k)))
      filters.disponible = false;
  } else if (entityType === "clases") {
    if (keywords.programada.some((k) => queryLower.includes(k)))
      filters.estado = "PROGRAMADA";
    if (keywords.completada.some((k) => queryLower.includes(k)))
      filters.estado = "COMPLETADA";
    if (keywords.cancelada.some((k) => queryLower.includes(k)))
      filters.estado = "CANCELADA";
    if (keywords.iniciada.some((k) => queryLower.includes(k)))
      filters.estado = "INICIADA";

    const fecha = parseFecha(queryLower);
    if (fecha) filters.dia = fecha;
  }

  // Extraer nombres (palabras que no son keywords)
  const words = queryLower.split(/\s+/).filter((w) => w.length > 2);
  const nonKeywords = words.filter((word) => {
    return !Object.values(keywords)
      .flat()
      .some((k) => k.includes(word));
  });

  if (nonKeywords.length > 0) {
    if (entityType === "alumnos" || entityType === "instructores") {
      filters.nombre = nonKeywords[0];
      if (nonKeywords.length > 1) filters.apellido = nonKeywords[1];
    } else if (entityType === "caballos") {
      filters.nombre = nonKeywords[0];
    }
  }

  return filters;
};

export default function SmartSearch({
  entityType,
  placeholder,
  onSearch,
  suggestions = [],
}: SearchConfig) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Default placeholder based on entity type
  const defaultPlaceholder = useMemo(() => {
    const placeholders = {
      alumnos: "Buscar alumnos por nombre, estado, fecha...",
      instructores: "Buscar instructores por nombre, disponibilidad...",
      caballos: "Buscar caballos por nombre, tipo, disponibilidad...",
      clases: "Buscar clases por estado, fecha, especialidad...",
    };
    return placeholders[entityType];
  }, [entityType]);

  // Sugerencias dinámicas basadas en el tipo de entidad
  const defaultSuggestions = React.useMemo(() => {
    const base = {
      alumnos: [
        "activos",
        "inactivos",
        "propietarios",
        "sin caballo",
        "inscritos 2024",
      ],
      instructores: ["activos", "disponibles", "en licencia"],
      caballos: ["escuela", "privados", "disponibles", "ocupados"],
      clases: [
        "programadas",
        "completadas",
        "canceladas",
        "hoy",
        "esta semana",
      ],
    };
    return suggestions.length > 0 ? suggestions : base[entityType];
  }, [entityType, suggestions]);

  // Debounce search
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      setIsSearching(true);
      timeoutRef.current = setTimeout(() => {
        const filters = interpretarBusqueda(searchQuery, entityType);
        onSearch(filters);
        setIsSearching(false);
      }, 300);
    },
    [entityType, onSearch],
  );

  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query);
    } else {
      onSearch({});
      setIsSearching(false);
    }
  }, [query, debouncedSearch, onSearch]);

  // Manejo de teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev < defaultSuggestions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && activeSuggestionIndex >= 0) {
      e.preventDefault();
      setQuery(defaultSuggestions[activeSuggestionIndex]);
      setShowSuggestions(false);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearSearch = () => {
    setQuery("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {isSearching ? (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || defaultPlaceholder}
          className="w-full h-10 pl-10 pr-10 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />

        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="p-2 border-b border-border bg-secondary/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Búsquedas sugeridas</span>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {defaultSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(suggestion);
                  setShowSuggestions(false);
                  inputRef.current?.focus();
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  index === activeSuggestionIndex
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 opacity-60" />
                  <span>{suggestion}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Ayuda contextual */}
          <div className="p-3 bg-secondary/20 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <strong>Tip:</strong> Puedes combinar términos como "activos
              propietarios 2024"
            </p>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {/* {query && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(interpretarBusqueda(query, entityType)).map(
            ([key, value]) => (
              <div
                key={key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-xs font-medium text-primary"
              >
                <span className="capitalize">{key}:</span>
                <span className="font-semibold">{String(value)}</span>
              </div>
            ),
          )}
        </div>
      )} */}
    </div>
  );
}
