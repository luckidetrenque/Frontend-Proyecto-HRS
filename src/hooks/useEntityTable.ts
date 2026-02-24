import { useState } from "react";

export function useEntityTable<T>() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<T | null>(null);
  const [entityToDelete, setEntityToDelete] = useState<T | null>(null);

  const handleEdit = (entity: T) => {
    setEditingEntity(entity);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingEntity(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEntity(null);
  };

  return {
    isFormOpen,
    setIsFormOpen,
    editingEntity,
    setEditingEntity,
    entityToDelete,
    setEntityToDelete,
    handleEdit,
    handleCreate,
    closeForm,
  };
}
