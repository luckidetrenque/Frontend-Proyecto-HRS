/**
 * exportToExcel.ts
 * Función para exportar el calendario del día a Excel con formato profesional
 *
 * Instalación requerida:
 * npm install exceljs file-saver
 * npm install --save-dev @types/file-saver
 */

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clase, Caballo } from "@/lib/api";
import { TIME_SLOTS } from "@/components/calendar/calendar.styles";

interface ExportToExcelParams {
  selectedDate: Date;
  clases: Clase[];
  caballos: Caballo[];
  instructores: Array<{
    id: number;
    nombre: string;
    apellido: string;
    color: string;
  }>;
  getAlumnoNombre: (id: number) => string;
  getAlumnoNombreCompleto: (id: number) => string;
  getInstructorNombre: (id: number) => string;
  getInstructorColor: (id: number) => string;
  getCaballoNombre: (id: number) => string;
}

/**
 * Convierte un color hex a formato ARGB para Excel
 */
function hexToARGB(hex: string): string {
  const cleanHex = hex.replace("#", "");
  return `FF${cleanHex.toUpperCase()}`;
}

/**
 * Obtiene un color más claro (tint) para fondos
 */
function lightenColor(hex: string, percent: number = 50): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(
    255,
    ((num >> 16) & 255) +
      Math.floor((255 - ((num >> 16) & 255)) * (percent / 100)),
  );
  const g = Math.min(
    255,
    ((num >> 8) & 255) +
      Math.floor((255 - ((num >> 8) & 255)) * (percent / 100)),
  );
  const b = Math.min(
    255,
    (num & 255) + Math.floor((255 - (num & 255)) * (percent / 100)),
  );
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export async function exportToExcel({
  selectedDate,
  clases,
  caballos,
  instructores,
  getAlumnoNombre,
  getAlumnoNombreCompleto,
  getInstructorNombre,
  getInstructorColor,
  getCaballoNombre,
}: ExportToExcelParams) {
  // Crear workbook y worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Clases del Día", {
    views: [{ state: "frozen", xSplit: 1, ySplit: 3 }], // Congelar columna hora y primeras 3 filas
  });

  // ==========================================
  // PREPARAR DATOS
  // ==========================================

  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const clasesDelDia = clases.filter((clase) => clase.dia === dateKey);

  // Mapa de clases por caballo y hora
  const claseMap: Record<string, Clase> = {};
  clasesDelDia.forEach((clase) => {
    const horaKey = clase.hora.slice(0, 5);
    const key = `${clase.caballoId}-${horaKey}`;
    claseMap[key] = clase;
  });

  // Caballos ordenados
  const caballosOrdenados = [...caballos].sort((a, b) =>
    a.nombre.localeCompare(b.nombre),
  );

  // ==========================================
  // FILA 1: TÍTULO PRINCIPAL
  // ==========================================

  const titleRow = worksheet.addRow([
    `Clases de Equitación - ${format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}`,
  ]);

  worksheet.mergeCells(1, 1, 1, caballosOrdenados.length + 1);
  titleRow.height = 30;
  titleRow.font = {
    size: 16,
    bold: true,
    color: { argb: "FF1F4788" }, // Azul oscuro
  };
  titleRow.alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  titleRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE7F3FF" }, // Azul muy claro
  };

  // ==========================================
  // FILA 2: SUBTÍTULO CON ESTADÍSTICAS
  // ==========================================

  const totalClases = clasesDelDia.length;
  const subtitleRow = worksheet.addRow([
    `Total de clases programadas: ${totalClases}`,
  ]);

  worksheet.mergeCells(2, 1, 2, caballosOrdenados.length + 1);
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

  // ==========================================
  // FILA 3: CABECERA DE CABALLOS
  // ==========================================

  const headerRow = worksheet.addRow([
    "Hora",
    ...caballosOrdenados.map((c) => c.nombre),
  ]);

  headerRow.height = 35;
  headerRow.font = {
    bold: true,
    size: 12,
    color: { argb: "FFFFFFFF" },
  };
  headerRow.alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };

  // Estilo para celda "Hora"
  headerRow.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2C3E50" }, // Gris oscuro
  };
  headerRow.getCell(1).border = {
    top: { style: "medium", color: { argb: "FF000000" } },
    left: { style: "medium", color: { argb: "FF000000" } },
    bottom: { style: "medium", color: { argb: "FF000000" } },
    right: { style: "medium", color: { argb: "FF000000" } },
  };

  // Estilo para cada caballo según tipo
  caballosOrdenados.forEach((caballo, idx) => {
    const cell = headerRow.getCell(idx + 2);

    if (caballo.tipo === "PRIVADO") {
      // Caballos PRIVADOS - Dorado/Amarillo
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD4A017" }, // Dorado
      };
      cell.font = {
        bold: true,
        size: 12,
        color: { argb: "FFFFFFFF" },
      };
    } else {
      // Caballos ESCUELA - Azul
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" }, // Azul
      };
      cell.font = {
        bold: true,
        size: 12,
        color: { argb: "FFFFFFFF" },
      };
    }

    cell.border = {
      top: { style: "medium", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "medium", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    };
  });

  // ==========================================
  // FILAS DE DATOS: HORARIOS Y CLASES
  // ==========================================

  TIME_SLOTS.forEach((hora) => {
    const dataRow = worksheet.addRow([
      hora,
      ...caballosOrdenados.map(() => ""), // Inicializar vacías
    ]);

    dataRow.height = 30;

    // Celda de HORA
    const horaCell = dataRow.getCell(1);
    horaCell.font = {
      bold: true,
      size: 11,
      color: { argb: "FF2C3E50" },
    };
    horaCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF8F9FA" }, // Gris muy claro
    };
    horaCell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    horaCell.border = {
      top: { style: "thin", color: { argb: "FFCCCCCC" } },
      left: { style: "medium", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
      right: { style: "medium", color: { argb: "FF000000" } },
    };

    // Celdas de CLASES
    caballosOrdenados.forEach((caballo, idx) => {
      const key = `${caballo.id}-${hora}`;
      const clase = claseMap[key];
      const cell = dataRow.getCell(idx + 2);

      if (clase) {
        // HAY CLASE PROGRAMADA
        const alumnoNombre = getAlumnoNombre(clase.alumnoId);
        const instructorColor = getInstructorColor(clase.instructorId);
        const instructorNombre = getInstructorNombre(clase.instructorId);

        // Texto de la celda
        let cellText = alumnoNombre;
        if (clase.esPrueba) {
          cellText = `🎓 ${alumnoNombre} (PRUEBA)`;
        }

        cell.value = cellText;

        // Color de fondo según instructor (más claro)
        const bgColor = lightenColor(instructorColor, 70);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: hexToARGB(bgColor) },
        };

        // Estilo de texto
        cell.font = {
          bold: true,
          size: 10,
          color: { argb: "FF000000" },
        };

        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };

        // Borde especial para clases de prueba
        if (clase.esPrueba) {
          cell.border = {
            top: { style: "medium", color: { argb: "FFFF8C00" } },
            left: { style: "medium", color: { argb: "FFFF8C00" } },
            bottom: { style: "medium", color: { argb: "FFFF8C00" } },
            right: { style: "medium", color: { argb: "FFFF8C00" } },
          };
        } else {
          cell.border = {
            top: { style: "thin", color: { argb: "FFCCCCCC" } },
            left: { style: "thin", color: { argb: "FFCCCCCC" } },
            bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
            right: { style: "thin", color: { argb: "FFCCCCCC" } },
          };
        }

        // Agregar comentario con detalles
        cell.note = {
          texts: [
            {
              font: { size: 10, bold: true },
              text: `Detalles de la clase:\n`,
            },
            {
              font: { size: 9 },
              text: `Alumno: ${getAlumnoNombreCompleto(clase.alumnoId)}\n`,
            },
            {
              font: { size: 9 },
              text: `Instructor: ${instructorNombre}\n`,
            },
            {
              font: { size: 9 },
              text: `Caballo: ${getCaballoNombre(clase.caballoId)}\n`,
            },
            {
              font: { size: 9 },
              text: `Especialidad: ${clase.especialidad}\n`,
            },
            {
              font: { size: 9 },
              text: `Estado: ${clase.estado}`,
            },
          ],
        };
      } else {
        // CELDA VACÍA
        cell.value = "—";

        // Fondo diferente según tipo de caballo
        if (caballo.tipo === "PRIVADO") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFEF0" }, // Crema muy claro
          };
        } else {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFFFF" }, // Blanco
          };
        }

        cell.font = {
          color: { argb: "FFCCCCCC" },
          size: 9,
        };

        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
        };

        cell.border = {
          top: { style: "thin", color: { argb: "FFEEEEEE" } },
          left: { style: "thin", color: { argb: "FFEEEEEE" } },
          bottom: { style: "thin", color: { argb: "FFEEEEEE" } },
          right: { style: "thin", color: { argb: "FFEEEEEE" } },
        };
      }
    });
  });

  // ==========================================
  // LEYENDA DE INSTRUCTORES
  // ==========================================

  const lastRow = 3 + TIME_SLOTS.length + 2; // +2 para espacio

  const legendTitleRow = worksheet.addRow([""]);
  legendTitleRow.getCell(1).value = "LEYENDA DE INSTRUCTORES";
  worksheet.mergeCells(lastRow, 1, lastRow, caballosOrdenados.length + 1);
  legendTitleRow.font = {
    bold: true,
    size: 12,
    color: { argb: "FF2C3E50" },
  };
  legendTitleRow.alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  legendTitleRow.height = 25;

  // Crear fila de leyenda con los instructores
  instructores.forEach((instructor, idx) => {
    const legendRow = worksheet.addRow([
      "",
      `${instructor.nombre} ${instructor.apellido}`,
    ]);

    const colorCell = legendRow.getCell(1);
    const nameCell = legendRow.getCell(2);

    // Celda de color
    const bgColor = lightenColor(instructor.color, 70);
    colorCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: hexToARGB(bgColor) },
    };
    colorCell.border = {
      top: { style: "thin", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    };

    // Celda de nombre
    nameCell.font = {
      size: 10,
      bold: true,
    };
    nameCell.alignment = {
      horizontal: "left",
      vertical: "middle",
    };

    legendRow.height = 20;
  });

  // ==========================================
  // LEYENDA DE TIPOS DE CABALLO
  // ==========================================

  const caballoLegendRow = worksheet.addRow([""]);
  const caballoLegendRowNum = lastRow + instructores.length + 2;

  caballoLegendRow.getCell(1).value = "TIPOS DE CABALLO";
  worksheet.mergeCells(
    caballoLegendRowNum,
    1,
    caballoLegendRowNum,
    caballosOrdenados.length + 1,
  );
  caballoLegendRow.font = {
    bold: true,
    size: 12,
    color: { argb: "FF2C3E50" },
  };
  caballoLegendRow.alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  caballoLegendRow.height = 25;

  // Leyenda Escuela
  const escuelaRow = worksheet.addRow(["", "Caballo de Escuela"]);
  escuelaRow.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };
  escuelaRow.getCell(1).border = {
    top: { style: "thin", color: { argb: "FF000000" } },
    left: { style: "thin", color: { argb: "FF000000" } },
    bottom: { style: "thin", color: { argb: "FF000000" } },
    right: { style: "thin", color: { argb: "FF000000" } },
  };
  escuelaRow.getCell(2).font = { size: 10, bold: true };
  escuelaRow.getCell(2).alignment = { horizontal: "left", vertical: "middle" };
  escuelaRow.height = 20;

  // Leyenda Privado
  const privadoRow = worksheet.addRow(["", "Caballo Privado"]);
  privadoRow.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD4A017" },
  };
  privadoRow.getCell(1).border = {
    top: { style: "thin", color: { argb: "FF000000" } },
    left: { style: "thin", color: { argb: "FF000000" } },
    bottom: { style: "thin", color: { argb: "FF000000" } },
    right: { style: "thin", color: { argb: "FF000000" } },
  };
  privadoRow.getCell(2).font = { size: 10, bold: true };
  privadoRow.getCell(2).alignment = { horizontal: "left", vertical: "middle" };
  privadoRow.height = 20;

  // Leyenda Clase de Prueba
  const pruebaRow = worksheet.addRow([
    "",
    "🎓 Clase de Prueba (borde naranja)",
  ]);
  pruebaRow.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFD700" },
  };
  pruebaRow.getCell(1).border = {
    top: { style: "medium", color: { argb: "FFFF8C00" } },
    left: { style: "medium", color: { argb: "FFFF8C00" } },
    bottom: { style: "medium", color: { argb: "FFFF8C00" } },
    right: { style: "medium", color: { argb: "FFFF8C00" } },
  };
  pruebaRow.getCell(2).font = { size: 10, bold: true };
  pruebaRow.getCell(2).alignment = { horizontal: "left", vertical: "middle" };
  pruebaRow.height = 20;

  // ==========================================
  // AJUSTAR ANCHOS DE COLUMNAS
  // ==========================================

  worksheet.getColumn(1).width = 12; // Columna Hora
  caballosOrdenados.forEach((_, idx) => {
    worksheet.getColumn(idx + 2).width = 18; // Columnas de caballos
  });

  // ==========================================
  // GENERAR Y DESCARGAR
  // ==========================================

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const fileName = `clases-${format(selectedDate, "yyyy-MM-dd")}.xlsx`;
  saveAs(blob, fileName);
}
