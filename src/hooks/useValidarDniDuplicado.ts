import { useQuery } from "@tanstack/react-query";

import { alumnosApi, instructoresApi } from "@/lib/api";

export const useValidarDniDuplicado = (
  entidad: "alumnos" | "instructores",
  dni: string,
  idActual?: number,
) => {
  return useQuery({
    queryKey: [`${entidad}-validar-dni`, dni, idActual],
    queryFn: async () => {
      if (!dni || dni.length < 7) {
        return { duplicado: false, mensaje: "" };
      }

      const api = entidad === "alumnos" ? alumnosApi : instructoresApi;
      const resultados = await api.buscar({ dni });

      const duplicado = resultados.some((r) => r.id !== idActual);

      return {
        duplicado,
        mensaje: duplicado
          ? `Ya existe ${entidad === "alumnos" ? "un alumno" : "un instructor"} con DNI ${dni}`
          : "",
      };
    },
    enabled: dni.length >= 7,
    staleTime: 10000,
  });
};
