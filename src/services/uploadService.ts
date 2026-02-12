import { API_BASE_URL, getStoredCredentials } from "./authService";

// Agregamos userId como parámetro
export const uploadAvatar = async (
  file: File,
  userId: number,
): Promise<string> => {
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

  // AQUÍ VA EL FRAGMENTO:
  const response = await fetch(`${API_BASE_URL}/users/${userId}/avatar`, {
    method: "POST", // O PATCH/PUT según tu backend
    headers: {
      ...(credentials && { Authorization: `Basic ${credentials}` }),
      // NOTA: No agregues "Content-Type": "multipart/form-data",
      // el navegador lo hace solo al detectar el FormData.
    },
    body: formData,
  });

  if (!response.ok) throw new Error("Error al subir imagen");

  const data = await response.json();
  return data.avatarUrl;
};
