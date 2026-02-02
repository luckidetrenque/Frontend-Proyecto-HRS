/**
 * exportReportesToExcel.ts
 * Funciones para exportar reportes con formato profesional usando exceljs
 *
 * Reemplazo de las funciones exportarExcel del archivo Reportes.tsx
 */

import { format } from "date-fns";
import { es } from "date-fns/locale";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import { Alumno, Caballo,Clase, Instructor } from "@/lib/api";

/**
 * Convierte un color hex a formato ARGB para Excel
 */
function hexToARGB(hex: string): string {
  const cleanHex = hex.replace("#", "");
  return `FF${cleanHex.toUpperCase()}`;
}

/**
 * Tipo genérico para los datos de reportes
 */
type ReportData = Record<string, unknown>;

/**
 * Configuración para cada tipo de reporte
 */
interface ReportConfig {
  title: string;
  columns: Array<{
    header: string;
    key: string;
    width?: number;
    format?: "text" | "number" | "percentage" | "currency";
  }>;
  headerColor?: string;
  dateRange?: { inicio: string; fin: string };
}

/**
 * Función principal de exportación de reportes con formato
 */
export async function exportarReporte(
  data: ReportData[],
  tipo: "Clases" | "Alumnos" | "Instructores" | "Caballos",
  dateRange?: { inicio: string; fin: string },
) {
  if (!data || data.length === 0) {
    console.warn("No hay datos para exportar");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`Reporte de ${tipo}`);

  // Configuración según el tipo de reporte
  const config = getReportConfig(tipo, data);

  // ==========================================
  // FILA 1: TÍTULO PRINCIPAL
  // ==========================================
  const titleRow = worksheet.addRow([`Reporte de ${tipo}`]);
  worksheet.mergeCells(1, 1, 1, config.columns.length);
  titleRow.height = 30;
  titleRow.font = {
    size: 16,
    bold: true,
    color: { argb: "FF1F4788" },
  };
  titleRow.alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  titleRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE7F3FF" },
  };

  // ==========================================
  // FILA 2: RANGO DE FECHAS (si aplica)
  // ==========================================
  if (dateRange) {
    const subtitleRow = worksheet.addRow([
      `Período: ${format(new Date(dateRange.inicio), "dd 'de' MMMM", { locale: es })} - ${format(new Date(dateRange.fin), "dd 'de' MMMM 'de' yyyy", { locale: es })}`,
    ]);
    worksheet.mergeCells(2, 1, 2, config.columns.length);
    subtitleRow.height = 20;
    subtitleRow.font = {
      size: 11,
      italic: true,
      color: { argb: "FF666666" },
    };
    subtitleRow.alignment = {
      horizontal: "center",
      vertical: "middle",
    };
  } else {
    const subtitleRow = worksheet.addRow([
      `Generado el ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}`,
    ]);
    worksheet.mergeCells(2, 1, 2, config.columns.length);
    subtitleRow.height = 20;
    subtitleRow.font = {
      size: 11,
      italic: true,
      color: { argb: "FF666666" },
    };
    subtitleRow.alignment = {
      horizontal: "center",
      vertical: "middle",
    };
  }

  // ==========================================
  // FILA 3: CABECERA DE COLUMNAS
  // ==========================================
  const headerRow = worksheet.addRow(config.columns.map((col) => col.header));
  headerRow.height = 25;
  headerRow.font = {
    bold: true,
    size: 11,
    color: { argb: "FFFFFFFF" },
  };
  headerRow.alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: config.headerColor || "FF4472C4" },
  };

  // Aplicar bordes a la cabecera
  config.columns.forEach((_, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.border = {
      top: { style: "medium", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "medium", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    };
  });

  // ==========================================
  // FILAS DE DATOS
  // ==========================================
  data.forEach((item, rowIndex) => {
    const rowData = config.columns.map((col) => {
      const value = item[col.key];

      // Formatear según el tipo
      if (col.format === "percentage" && typeof value === "string") {
        return parseFloat(value);
      }
      if (col.format === "currency" && typeof value === "number") {
        return value;
      }
      return value;
    });

    const dataRow = worksheet.addRow(rowData);
    dataRow.height = 20;

    // Aplicar estilos a cada celda
    config.columns.forEach((col, idx) => {
      const cell = dataRow.getCell(idx + 1);

      // Alineación
      cell.alignment = {
        horizontal:
          col.format === "number" ||
          col.format === "percentage" ||
          col.format === "currency"
            ? "center"
            : "left",
        vertical: "middle",
      };

      // Formato de número
      if (col.format === "percentage") {
        cell.numFmt = '0.0"%"';
      } else if (col.format === "currency") {
        cell.numFmt = '"$"#,##0';
      }

      // Estilo de fuente
      cell.font = {
        size: 10,
      };

      // Fondo alternado
      if (rowIndex % 2 === 0) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8F9FA" },
        };
      }

      // Bordes
      cell.border = {
        top: { style: "thin", color: { argb: "FFDDDDDD" } },
        left: { style: "thin", color: { argb: "FFDDDDDD" } },
        bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
        right: { style: "thin", color: { argb: "FFDDDDDD" } },
      };
    });
  });

  // ==========================================
  // FILA DE TOTALES (si aplica)
  // ==========================================
  if (tipo === "Alumnos" || tipo === "Instructores" || tipo === "Caballos") {
    const totalRow = worksheet.addRow([""]);
    worksheet.addRow([""]); // Fila vacía

    const summaryRow = worksheet.addRow(["TOTAL DE REGISTROS:", data.length]);
    summaryRow.font = {
      bold: true,
      size: 11,
    };
    summaryRow.getCell(1).alignment = {
      horizontal: "right",
      vertical: "middle",
    };
    summaryRow.getCell(2).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    summaryRow.getCell(2).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFEB3B" },
    };
  }

  // ==========================================
  // AJUSTAR ANCHOS DE COLUMNAS
  // ==========================================
  config.columns.forEach((col, idx) => {
    worksheet.getColumn(idx + 1).width = col.width || 18;
  });

  // Congelar paneles (primera fila de datos)
  worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 3 }];

  // ==========================================
  // GENERAR Y DESCARGAR
  // ==========================================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const fileName = `Reporte_${tipo}_${format(new Date(), "yyyy-MM-dd_HHmm")}.xlsx`;
  saveAs(blob, fileName);
}

/**
 * Obtener configuración específica para cada tipo de reporte
 */
function getReportConfig(
  tipo: "Clases" | "Alumnos" | "Instructores" | "Caballos",
  data: ReportData[],
): ReportConfig {
  switch (tipo) {
    case "Clases":
      return {
        title: "Reporte de Clases",
        headerColor: "FF4472C4", // Azul
        columns: [
          { header: "Alumno", key: "alumno", width: 25 },
          { header: "Instructor", key: "instructor", width: 25 },
          { header: "Caballo", key: "caballo", width: 20 },
          { header: "Fecha", key: "dia", width: 15 },
          { header: "Hora", key: "hora", width: 12 },
          { header: "Especialidad", key: "especialidad", width: 18 },
          { header: "Estado", key: "estado", width: 15 },
        ],
      };

    case "Alumnos":
      return {
        title: "Reporte de Alumnos",
        headerColor: "FF2E7D32", // Verde
        columns: [
          { header: "Nombre", key: "nombre", width: 20 },
          { header: "Apellido", key: "apellido", width: 20 },
          { header: "Estado", key: "estado", width: 15 },
          { header: "Plan", key: "plan", width: 15 },
          {
            header: "Clases Tomadas",
            key: "clases",
            width: 18,
            format: "number",
          },
          {
            header: "Porcentaje",
            key: "porcentaje",
            width: 15,
            format: "percentage",
          },
        ],
      };

    case "Instructores":
      return {
        title: "Reporte de Instructores",
        headerColor: "FF7B1FA2", // Púrpura
        columns: [
          { header: "Nombre", key: "nombre", width: 25 },
          { header: "Total Clases", key: "total", width: 15, format: "number" },
          {
            header: "Completadas",
            key: "completadas",
            width: 15,
            format: "number",
          },
          {
            header: "Canceladas",
            key: "canceladas",
            width: 15,
            format: "number",
          },
          {
            header: "Eficiencia",
            key: "eficiencia",
            width: 15,
            format: "percentage",
          },
        ],
      };

    case "Caballos":
      return {
        title: "Reporte de Caballos",
        headerColor: "FFD4A017", // Dorado
        columns: [
          { header: "Nombre", key: "nombre", width: 20 },
          { header: "Tipo", key: "tipo", width: 15 },
          { header: "Clases", key: "cantidad", width: 15, format: "number" },
          {
            header: "Uso (%)",
            key: "porcentaje",
            width: 15,
            format: "percentage",
          },
        ],
      };

    default:
      return {
        title: "Reporte",
        columns: Object.keys(data[0] || {}).map((key) => ({
          header: key.charAt(0).toUpperCase() + key.slice(1),
          key: key,
          width: 18,
        })),
      };
  }
}

/**
 * Función específica para exportar el reporte de clases
 */
export async function exportarClases(
  clases: Clase[],
  alumnos: Alumno[],
  instructores: Instructor[],
  caballos: Caballo[],
  dateRange: { inicio: string; fin: string },
) {
  const data = clases.map((clase) => ({
    alumno:
      `${alumnos.find((a) => a.id === clase.alumnoId)?.nombre || ""} ${alumnos.find((a) => a.id === clase.alumnoId)?.apellido || ""}`.trim(),
    instructor:
      `${instructores.find((i) => i.id === clase.instructorId)?.nombre || ""} ${instructores.find((i) => i.id === clase.instructorId)?.apellido || ""}`.trim(),
    caballo: caballos.find((c) => c.id === clase.caballoId)?.nombre || "",
    dia: clase.dia,
    hora: clase.hora.slice(0, 5),
    especialidad: clase.especialidad,
    estado: clase.estado,
  }));

  await exportarReporte(data, "Clases", dateRange);
}

/**
 * Función para exportar datos genéricos (compatible con la función original)
 * Mantiene la misma firma que exportarExcel del archivo original
 */
export async function exportarExcel(
  data: ReportData[],
  tipo: "Clases" | "Alumnos" | "Instructores" | "Caballos",
) {
  await exportarReporte(data, tipo);
}
