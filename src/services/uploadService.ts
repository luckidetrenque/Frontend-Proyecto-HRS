import { API_BASE_URL,getStoredCredentials } from "./authService";

export const uploadAvatar = async (file: File): Promise<string> => {
  // Validar tamaño (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("La imagen no debe superar 2MB");
  }

  // Validar tipo
  if (!file.type.startsWith("image/")) {
    throw new Error("Solo se permiten imágenes");
  }

  const formData = new FormData();
  formData.append("avatar", file);

  const credentials = getStoredCredentials();
  const response = await fetch(`${API_BASE_URL}/upload-avatar`, {
    method: "POST",
    headers: {
      ...(credentials && { Authorization: `Basic ${credentials}` }),
    },
    body: formData,
  });

  if (!response.ok) throw new Error("Error al subir imagen");

  const { avatarUrl } = await response.json();
  return avatarUrl;
};
