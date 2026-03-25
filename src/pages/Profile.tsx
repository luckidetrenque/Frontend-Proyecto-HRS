import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Activity,
  Calendar,
  Camera,
  ChessKnight,
  Edit2,
  GraduationCap,
  Lock,
  Mail,
  Save,
  Shield,
  User,
  X,
} from "lucide-react";
import { useContext, useState } from "react";
import { toast } from "sonner";

import { InstructorForm } from "@/components/forms/InstructorForm";
import { AlumnoForm } from "@/components/forms/AlumnoForm";
import { ChangePasswordDialog } from "@/components/profile/ChangePasswordDialog";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { AuthContext } from "@/contexts/AuthContext";
import { Alumno, alumnosApi, caballosApi, Instructor, instructoresApi } from "@/lib/api";
import { updateProfile } from "@/services/authService";
import { uploadAvatar } from "@/services/uploadService";

export default function Profile() {
  const { user, refreshUser } = useContext(AuthContext)!;
  const queryClient = useQueryClient();

  // ── Estado de edición de la cuenta ──────────────────────────────────────────
  const [isEditingCuenta, setIsEditingCuenta] = useState(false);
  const [isSavingCuenta, setIsSavingCuenta] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const [cuentaData, setCuentaData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });

  // ── Estado de edición del perfil de dominio ──────────────────────────────────
  const [isEditingPerfil, setIsEditingPerfil] = useState(false);

  // ── Query: perfil de instructor ──────────────────────────────────────────────
  const { data: miInstructor, isLoading: loadingInstructor } = useQuery<Instructor>({
    queryKey: ["instructor-me"],
    queryFn: instructoresApi.obtenerMiPerfil,
    enabled: user?.rol === "INSTRUCTOR",
    retry: 1,
  });

  // ── Query: perfil de alumno ──────────────────────────────────────────────────
  const { data: miAlumno, isLoading: loadingAlumno } = useQuery<Alumno>({
    queryKey: ["alumno-me"],
    queryFn: alumnosApi.obtenerMiPerfil,
    enabled: user?.rol === "ALUMNO",
    retry: 1,
  });

  // ── Query: caballos (necesario para AlumnoForm) ──────────────────────────────
  const { data: caballosData } = useQuery({
    queryKey: ["caballos-select"],
    queryFn: () => caballosApi.listar({ page: 0, size: 100, sort: "nombre,asc" }),
    enabled: user?.rol === "ALUMNO" && isEditingPerfil,
  });
  const caballos = caballosData?.content ?? [];

  // ── Mutation: actualizar instructor ─────────────────────────────────────────
  const updateInstructorMutation = useMutation({
    mutationFn: (data: Partial<Instructor>) =>
      instructoresApi.actualizar(miInstructor!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-me"] });
      setIsEditingPerfil(false);
      toast.success("Datos de instructor actualizados correctamente");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al actualizar el perfil de instructor"),
  });

  // ── Mutation: actualizar alumno ──────────────────────────────────────────────
  const updateAlumnoMutation = useMutation({
    mutationFn: (data: Partial<Alumno>) =>
      alumnosApi.actualizar(miAlumno!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumno-me"] });
      setIsEditingPerfil(false);
      toast.success("Datos de alumno actualizados correctamente");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al actualizar el perfil de alumno"),
  });

  // ── Handlers cuenta ──────────────────────────────────────────────────────────
  const handleEditCuenta = () => {
    setCuentaData({ username: user?.username || "", email: user?.email || "" });
    setIsEditingCuenta(true);
  };

  const handleSaveCuenta = async () => {
    setIsSavingCuenta(true);
    try {
      await updateProfile(user!.id, cuentaData);
      const updatedUser = { ...user, ...cuentaData };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      refreshUser?.();
      setIsEditingCuenta(false);
      toast.success("Datos de cuenta actualizados correctamente");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar la cuenta"
      );
    } finally {
      setIsSavingCuenta(false);
    }
  };

  const handleAvatarUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setIsUploadingAvatar(true);
      try {
        const avatarUrl = await uploadAvatar(file, user!.id);
        const updatedUser = { ...user, avatarUrl };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        refreshUser?.();
        toast.success("Avatar actualizado correctamente");
      } catch (error) {
        toast.error("Error al subir el avatar");
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    input.click();
  };

  const getInitials = () =>
    user?.username ? user.username.slice(0, 2).toUpperCase() : "U";

  if (!user) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </Layout>
    );
  }

  const loadingPerfil =
    (user.rol === "INSTRUCTOR" && loadingInstructor) ||
    (user.rol === "ALUMNO" && loadingAlumno);

  return (
    <Layout>
      <PageHeader
        title="Mi Perfil"
        description="Administrá tu cuenta y tus datos personales"
      />

      <div className="space-y-6">

        {/* ══════════════════════════════════════════════════════
            SECCIÓN 1 — CUENTA DEL SISTEMA
        ══════════════════════════════════════════════════════ */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Cuenta del Sistema</CardTitle>
                  <CardDescription>
                    Credenciales de acceso y configuración de la cuenta
                  </CardDescription>
                </div>
              </div>
              {!isEditingCuenta ? (
                <Button variant="outline" size="sm" onClick={handleEditCuenta}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingCuenta(false)}
                    disabled={isSavingCuenta}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveCuenta} disabled={isSavingCuenta}>
                    {isSavingCuenta ? (
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

          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="relative inline-block"
                  onMouseEnter={() => setAvatarHover(true)}
                  onMouseLeave={() => setAvatarHover(false)}
                >
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage
                      src={
                        user.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`
                      }
                      alt={user.username}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                    className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/60 transition-opacity ${
                      avatarHover ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isUploadingAvatar ? "Subiendo..." : "Clic para cambiar"}
                </p>
              </div>

              {/* Campos */}
              <div className="flex-1 grid gap-4 md:grid-cols-2">
                {/* Username */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Nombre de Usuario</Label>
                  {isEditingCuenta ? (
                    <Input
                      value={cuentaData.username}
                      onChange={(e) =>
                        setCuentaData({ ...cuentaData, username: e.target.value })
                      }
                      disabled={isSavingCuenta}
                    />
                  ) : (
                    <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.username}</span>
                    </div>
                  )}
                </div>

                {/* Email de cuenta */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Email de acceso
                    <span className="ml-1 text-xs text-muted-foreground font-normal">
                      (usado para ingresar al sistema)
                    </span>
                  </Label>
                  {isEditingCuenta ? (
                    <Input
                      type="email"
                      value={cuentaData.email}
                      onChange={(e) =>
                        setCuentaData({ ...cuentaData, email: e.target.value })
                      }
                      disabled={isSavingCuenta}
                    />
                  ) : (
                    <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  )}
                </div>

                {/* Rol — solo lectura siempre */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Rol</Label>
                  <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="font-medium">
                      {user.rol || "ALUMNO"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      — solo el administrador puede cambiarlo
                    </span>
                  </div>
                </div>

                {/* Fecha de creación — solo lectura siempre */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Miembro desde</Label>
                  <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(user.fechaCreacion), "d 'de' MMMM, yyyy", {
                        locale: es,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {isEditingCuenta && (
              <p className="mt-4 text-xs text-muted-foreground rounded-lg bg-muted/50 p-3">
                <strong>Nota:</strong> El rol y la fecha de creación no se pueden
                editar desde aquí. Para cambiarlos, contactá al administrador.
              </p>
            )}
          </CardContent>
        </Card>

        {/* ══════════════════════════════════════════════════════
            SECCIÓN 2 — PERFIL DE INSTRUCTOR
        ══════════════════════════════════════════════════════ */}
        {user.rol === "INSTRUCTOR" && (
          <Card className="border-accent/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <GraduationCap className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Perfil de Instructor</CardTitle>
                    <CardDescription>
                      Tus datos personales y de contacto en el sistema de clases
                    </CardDescription>
                  </div>
                </div>
                {miInstructor && !isEditingPerfil && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingPerfil(true)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {loadingInstructor ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : !miInstructor ? (
                <div className="rounded-lg bg-warning/10 border border-warning/30 p-4 text-sm text-warning-foreground">
                  Tu cuenta no está vinculada a un perfil de instructor. Contactá
                  al administrador.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoField label="Nombre Completo">
                    {miInstructor.nombre} {miInstructor.apellido}
                  </InfoField>
                  <InfoField label="DNI">{miInstructor.dni}</InfoField>
                  <InfoField label="Teléfono">
                    {miInstructor.codigoArea} {miInstructor.telefono}
                  </InfoField>
                  <InfoField label="Email de contacto">
                    <span className="text-sm">{miInstructor.email || "—"}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      Visible para alumnos y admin
                    </span>
                  </InfoField>
                  <InfoField label="Color de Agenda">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-5 w-5 rounded-full border border-border shadow-sm"
                        style={{ backgroundColor: miInstructor.color || "#cccccc" }}
                      />
                      <span className="font-mono text-xs">{miInstructor.color}</span>
                      <span className="text-xs text-muted-foreground">
                        — solo el admin puede cambiarlo
                      </span>
                    </div>
                  </InfoField>
                  <InfoField label="Estado">
                    <StatusBadge status={miInstructor.activo ? "success" : "error"}>
                      {miInstructor.activo ? "Activo" : "Inactivo"}
                    </StatusBadge>
                  </InfoField>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Diálogo editar instructor */}
        {user.rol === "INSTRUCTOR" && miInstructor && (
          <Dialog open={isEditingPerfil} onOpenChange={setIsEditingPerfil}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Editar datos de Instructor</DialogTitle>
                <DialogDescription>
                  Podés actualizar tus datos personales y de contacto. El color de
                  agenda solo puede cambiarlo el administrador.
                </DialogDescription>
              </DialogHeader>
              <InstructorForm
                instructor={miInstructor}
                onSubmit={(data) => updateInstructorMutation.mutate(data)}
                isPending={updateInstructorMutation.isPending}
                onCancel={() => setIsEditingPerfil(false)}
                // Ocultar el campo color — el instructor no puede cambiarlo
                ocultarColor
              />
            </DialogContent>
          </Dialog>
        )}

        {/* ══════════════════════════════════════════════════════
            SECCIÓN 2 — PERFIL DE ALUMNO
        ══════════════════════════════════════════════════════ */}
        {user.rol === "ALUMNO" && (
          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <ChessKnight className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Perfil de Alumno</CardTitle>
                    <CardDescription>
                      Tus datos personales, plan de clases y caballo asignado
                    </CardDescription>
                  </div>
                </div>
                {miAlumno && !isEditingPerfil && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingPerfil(true)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {loadingAlumno ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : !miAlumno ? (
                <div className="rounded-lg bg-warning/10 border border-warning/30 p-4 text-sm">
                  Tu cuenta no está vinculada a un perfil de alumno. Contactá al
                  administrador.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoField label="Nombre Completo">
                    {miAlumno.nombre} {miAlumno.apellido}
                  </InfoField>
                  <InfoField label="DNI">{miAlumno.dni}</InfoField>
                  <InfoField label="Teléfono">
                    {miAlumno.codigoArea} {miAlumno.telefono}
                  </InfoField>
                  <InfoField label="Email de contacto">
                    {miAlumno.email || "—"}
                  </InfoField>
                  <InfoField label="Clases por mes">
                    <span className="text-lg font-bold">{miAlumno.cantidadClases}</span>
                  </InfoField>
                  <InfoField label="Fecha de inscripción">
                    {miAlumno.fechaInscripcion
                      ? new Date(
                          miAlumno.fechaInscripcion + "T00:00:00"
                        ).toLocaleDateString("es-AR")
                      : "—"}
                  </InfoField>
                  {miAlumno.tipoPension !== "SIN_CABALLO" && (
                    <>
                      <InfoField label="Tipo de pensión">
                        {miAlumno.tipoPension === "CABALLO_PROPIO"
                          ? "Caballo propio"
                          : "Reserva escuela"}
                      </InfoField>
                      {miAlumno.cuotaPension && (
                        <InfoField label="Cuota">
                          <StatusBadge status="info">
                            {miAlumno.cuotaPension}
                          </StatusBadge>
                        </InfoField>
                      )}
                      {miAlumno.caballoNombre && (
                        <InfoField label="Caballo">
                          {miAlumno.caballoNombre}
                        </InfoField>
                      )}
                    </>
                  )}
                  <InfoField label="Estado">
                    <StatusBadge status={miAlumno.activo ? "success" : "default"}>
                      {miAlumno.activo ? "Activo" : "Inactivo"}
                    </StatusBadge>
                  </InfoField>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Diálogo editar alumno */}
        {user.rol === "ALUMNO" && miAlumno && (
          <Dialog open={isEditingPerfil} onOpenChange={setIsEditingPerfil}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Editar datos de Alumno</DialogTitle>
                <DialogDescription>
                  Podés actualizar tus datos personales y de contacto. El plan de
                  clases y el caballo solo puede modificarlos el administrador.
                </DialogDescription>
              </DialogHeader>
              <AlumnoForm
                alumno={miAlumno}
                caballos={caballos}
                onSubmit={(data) => updateAlumnoMutation.mutate(data)}
                isPending={updateAlumnoMutation.isPending}
                onCancel={() => setIsEditingPerfil(false)}
                // Campos de solo lectura para el alumno
                soloContacto
              />
            </DialogContent>
          </Dialog>
        )}

        {/* ══════════════════════════════════════════════════════
            SECCIÓN 3 — SEGURIDAD
        ══════════════════════════════════════════════════════ */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Seguridad</CardTitle>
                  <CardDescription>Gestiona la seguridad de tu cuenta</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                <div>
                  <p className="text-sm font-medium">Contraseña</p>
                  <p className="text-xs text-muted-foreground">
                    Cambiá tu contraseña de acceso
                  </p>
                </div>
                <ChangePasswordDialog />
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Autenticación de dos factores
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Agrega una capa extra de seguridad a tu cuenta
                </p>
                <button className="text-xs text-primary hover:underline font-medium">
                  Configurar 2FA (Próximamente)
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Activity className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-lg">Actividad Reciente</CardTitle>
                  <CardDescription>Historial de accesos a tu cuenta</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: "Inicio de sesión", time: "Hace 2 horas", location: "La Plata, AR" },
                  { action: "Cambio de perfil", time: "Hace 1 día", location: "La Plata, AR" },
                  { action: "Inicio de sesión", time: "Hace 3 días", location: "Buenos Aires, AR" },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.location}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ══════════════════════════════════════════════════════
            SECCIÓN 4 — ZONA DE PELIGRO
        ══════════════════════════════════════════════════════ */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">
              Zona de Peligro
            </CardTitle>
            <CardDescription>
              Acciones irreversibles que afectan permanentemente tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                <div>
                  <p className="text-sm font-medium">Desactivar cuenta</p>
                  <p className="text-xs text-muted-foreground">
                    Tu cuenta será desactivada temporalmente
                  </p>
                </div>
                <button className="text-sm text-destructive hover:underline font-medium">
                  Desactivar
                </button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                <div>
                  <p className="text-sm font-medium">Eliminar cuenta</p>
                  <p className="text-xs text-muted-foreground">
                    Esta acción no se puede deshacer
                  </p>
                </div>
                <button className="text-sm text-destructive hover:underline font-medium">
                  Eliminar
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
}

// ── Componente auxiliar local ────────────────────────────────────────────────
function InfoField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-1">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        {label}
      </p>
      <div className="font-medium text-sm">{children}</div>
    </div>
  );
}