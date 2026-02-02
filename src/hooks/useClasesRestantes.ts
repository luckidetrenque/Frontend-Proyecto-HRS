import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import { alumnosApi,clasesApi } from "@/lib/api";

export const useClasesRestantes = (alumnoId: number, fecha: Date) => {
  const mes = format(fecha, "yyyy-MM");

  const { data: clasesDelMes = [] } = useQuery({
    queryKey: ["clases-alumno-mes", alumnoId, mes],
    queryFn: async () => {
      const inicio = `${mes}-01`;
      const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
      const fin = format(ultimoDia, "yyyy-MM-dd");

      const todasLasClases = await clasesApi.listar();
      return todasLasClases.filter(
        (c) => c.alumnoId === alumnoId && c.dia >= inicio && c.dia <= fin,
      );
    },
    enabled: !!alumnoId && alumnoId > 0,
  });

  const { data: alumno } = useQuery({
    queryKey: ["alumno", alumnoId],
    queryFn: () => alumnosApi.obtener(alumnoId),
    enabled: !!alumnoId && alumnoId > 0,
  });

  const clasesTomadas = clasesDelMes.filter((c) =>
    ["COMPLETADA", "PROGRAMADA", "INICIADA"].includes(c.estado),
  ).length;

  const clasesContratadas = alumno?.cantidadClases || 0;
  const clasesRestantes = clasesContratadas - clasesTomadas;

  return {
    clasesTomadas,
    clasesContratadas,
    clasesRestantes,
    estaAgotado: clasesRestantes <= 0,
    cercaDelLimite: clasesRestantes <= 2 && clasesRestantes > 0,
    porcentajeUsado:
      clasesContratadas > 0 ? (clasesTomadas / clasesContratadas) * 100 : 0,
  };
};
