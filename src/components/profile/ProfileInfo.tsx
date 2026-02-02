import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  Camera,
  Edit2,
  Lock,
  Mail,
  Save,
  Shield,
  Upload,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { uploadAvatar } from "@/services/uploadService";

interface ProfileInfoProps {
  onUpdate?: (data: {
    username?: string;
    email?: string;
    avatarUrl?: string;
  }) => Promise<void>;
}

export function ProfileInfo({ onUpdate }: ProfileInfoProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const [editedData, setEditedData] = useState({
    email: user?.email || "",
    username: user?.username || "",
    password: user?.password || "",
    rol: user?.rol || "",
    activo: user?.activo || false,
    fechaCreacion: user?.fechaCreacion || "",
  });
  const [isUploading, setIsUploading] = useState(false);

  const getInitials = () => {
    if (!user?.username) return "U";
    return user.username.slice(0, 2).toUpperCase();
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      if (onUpdate) {
        await onUpdate(editedData);
      } else {
        // Simulación por defecto si no hay callback
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Actualizar sessionStorage
        const updatedUser = { ...user, ...editedData };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
      }

      toast.success("Perfil actualizado correctamente");
      setIsEditing(false);
    } catch (error) {
      toast.error("Error al actualizar el perfil", {
        description:
          error instanceof Error ? error.message : "Inténtalo de nuevo",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData({
      email: user?.email || "",
      username: user?.username || "",
      password: user?.password || "",
      rol: user?.rol || "",
      activo: user?.activo || false,
      fechaCreacion: user?.fechaCreacion || "",
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const avatarUrl = await uploadAvatar(file);

        // Actualizar perfil con nueva URL
        await onUpdate?.({ avatarUrl });

        toast.success("Avatar actualizado correctamente");
      } catch (error) {
        toast.error("Error al subir avatar", {
          description:
            error instanceof Error ? error.message : "Inténtalo de nuevo",
        });
      } finally {
        setIsUploading(false);
      }
    };

    input.click();
  };

  if (!user) return null;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Sidebar - Avatar y Info Básica */}
      <Card className="md:col-span-1">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 relative">
            <div
              className="relative inline-block"
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
            >
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage
                  src={user.avatarUrl || "https://via.placeholder.com"}
                  alt={user.username}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              {/* Overlay de Upload */}
              <button
                onClick={handleAvatarUpload}
                className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/60 transition-opacity ${
                  avatarHover ? "opacity-100" : "opacity-0"
                }`}
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          <CardTitle className="text-xl font-display">
            {user.username}
          </CardTitle>
          <CardDescription className="text-sm">{user.email}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Separator />

          <div className="space-y-3">
            {/* Rol */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Rol</span>
              </div>
              <Badge variant="outline" className="font-medium">
                {user.rol || "Usuario"}
              </Badge>
            </div>

            {/* Fecha de Registro */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Miembro desde</span>
              </div>
              <p className="pl-6 text-sm font-medium">
                {format(new Date(user.fechaCreacion), "d 'de' MMMM, yyyy", {
                  locale: es,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Datos Editables */}
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Información Personal</CardTitle>
                <CardDescription>
                  {isEditing
                    ? "Edita tus datos y guarda los cambios"
                    : "Administra tu información personal"}
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Nombre de Usuario
                </Label>
                {isEditing ? (
                  <Input
                    id="username"
                    value={editedData.username}
                    onChange={(e) =>
                      setEditedData({ ...editedData, username: e.target.value })
                    }
                    disabled={isSaving}
                    placeholder="Ingresa tu nombre de usuario"
                    className="transition-all"
                  />
                ) : (
                  <div className="flex items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-2 transition-colors">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.username}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo Electrónico
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editedData.email}
                    onChange={(e) =>
                      setEditedData({ ...editedData, email: e.target.value })
                    }
                    disabled={isSaving}
                    placeholder="Ingresa tu correo"
                    className="transition-all"
                  />
                ) : (
                  <div className="flex items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-2 transition-colors">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info adicional de solo lectura */}
            {isEditing && (
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Nota:</strong> El rol y fecha de creación no se pueden
                  editar. Si necesitas cambiar estos datos, contacta al
                  administrador.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
