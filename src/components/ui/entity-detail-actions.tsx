import { Edit, Trash2 } from "lucide-react";

import { Button } from "./button";

interface EntityDetailActionsProps {
  /**
   * Callback ejecutado al hacer click en el botón Editar
   */
  onEdit: () => void;

  /**
   * Callback ejecutado al hacer click en el botón Eliminar
   */
  onDelete: () => void;

  /**
   * Nombre de la entidad para accesibilidad y mensajes
   * @default "registro"
   */
  entityName?: string;

  /**
   * Deshabilita ambos botones
   * @default false
   */
  disabled?: boolean;
}

/**
 * Componente de acciones para páginas de detalle
 *
 * Proporciona botones consistentes de Editar y Eliminar para usar
 * en el header de las páginas de detalle de entidades.
 *
 * @example
 * ```typescript
 * <PageHeader
 *   title="Perfil de Caballo"
 *   description={`Información de ${caballo.nombre}`}
 *   action={
 *     <EntityDetailActions
 *       onEdit={() => openEdit(caballo)}
 *       onDelete={() => openDelete(caballo)}
 *       entityName="caballo"
 *     />
 *   }
 * />
 * ```
 */
export function EntityDetailActions({
  onEdit,
  onDelete,
  entityName = "registro",
  disabled = false,
}: EntityDetailActionsProps) {
  return (
    <div className="flex gap-2">
      <Button
        onClick={onEdit}
        disabled={disabled}
        aria-label={`Editar ${entityName}`}
      >
        <Edit className="mr-2 h-4 w-4" />
        Editar
      </Button>
      <Button
        variant="destructive"
        onClick={onDelete}
        disabled={disabled}
        aria-label={`Eliminar ${entityName}`}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Eliminar
      </Button>
    </div>
  );
}
