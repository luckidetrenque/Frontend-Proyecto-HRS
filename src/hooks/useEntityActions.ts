import { useState } from "react";

export interface UseEntityActionsReturn<T> {
  // Estados
  editingEntity: T | null;
  entityToDelete: T | null;
  isDialogOpen: boolean;

  // Actions - Edición
  openEdit: (entity?: T) => void;
  closeEdit: () => void;

  // Actions - Eliminación
  openDelete: (entity: T) => void;
  closeDelete: () => void;

  // Actions - General
  closeAll: () => void;
}

/**
 * Hook para manejar la lógica común de edición y eliminación de entidades
 *
 * Este hook unifica el manejo de estados y acciones para las operaciones CRUD,
 * eliminando código duplicado en las páginas de listado y detalle.
 *
 * @template T - Tipo de la entidad (Alumno, Caballo, Instructor, Clase)
 * @returns Objeto con estados y métodos para manejar dialogs de edición/eliminación
 *
 * @example
 * // Uso en página de listado
 * ```typescript
 * const {
 *   editingEntity,
 *   entityToDelete,
 *   isDialogOpen,
 *   openEdit,
 *   closeEdit,
 *   openDelete,
 *   closeDelete,
 * } = useEntityActions<Caballo>();
 *
 * // Crear nuevo
 * <Button onClick={() => openEdit()}>Nuevo</Button>
 *
 * // Editar existente
 * <Button onClick={() => openEdit(caballo)}>Editar</Button>
 *
 * // Eliminar
 * <Button onClick={() => openDelete(caballo)}>Eliminar</Button>
 * ```
 *
 * @example
 * // Uso en página de detalle
 * ```typescript
 * const {
 *   entityToDelete: caballoToDelete,
 *   isDialogOpen: isEditOpen,
 *   openEdit,
 *   closeEdit,
 *   openDelete,
 *   closeDelete,
 * } = useEntityActions<Caballo>();
 *
 * <EntityDetailActions
 *   onEdit={() => openEdit(caballo)}
 *   onDelete={() => openDelete(caballo)}
 * />
 * ```
 */
export function useEntityActions<T>(): UseEntityActionsReturn<T> {
  const [editingEntity, setEditingEntity] = useState<T | null>(null);
  const [entityToDelete, setEntityToDelete] = useState<T | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /**
   * Abre el dialog de edición
   * @param entity - Entidad a editar. Si es undefined, se abre para crear nueva
   */
  const openEdit = (entity?: T) => {
    setEditingEntity(entity || null);
    setIsDialogOpen(true);
  };

  /**
   * Cierra el dialog de edición y limpia el estado de edición
   */
  const closeEdit = () => {
    setEditingEntity(null);
    setIsDialogOpen(false);
  };

  /**
   * Abre el dialog de confirmación de eliminación
   * @param entity - Entidad a eliminar
   */
  const openDelete = (entity: T) => {
    setEntityToDelete(entity);
  };

  /**
   * Cierra el dialog de eliminación y limpia el estado
   */
  const closeDelete = () => {
    setEntityToDelete(null);
  };

  /**
   * Cierra todos los dialogs y limpia todos los estados
   * Útil para resetear completamente el componente
   */
  const closeAll = () => {
    setEditingEntity(null);
    setEntityToDelete(null);
    setIsDialogOpen(false);
  };

  return {
    // Estados
    editingEntity,
    entityToDelete,
    isDialogOpen,

    // Actions
    openEdit,
    closeEdit,
    openDelete,
    closeDelete,
    closeAll,
  };
}
