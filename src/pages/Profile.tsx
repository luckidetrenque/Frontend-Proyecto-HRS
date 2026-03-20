import { Activity,Lock, Shield } from "lucide-react";

import { Layout } from "@/components/Layout";
import { ChangePasswordDialog } from "@/components/profile/ChangePasswordDialog";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/contexts/AuthContext";
import { Instructor, instructoresApi } from "@/lib/api";
import { updateProfile } from "@/services/authService";
import { useQuery } from "@tanstack/react-query";

export default function Profile() {
  const { user } = useAuth();

  // Función para actualizar el perfil (conectar con tu API)
  const handleUpdateProfile = async (updatedData: {
    name?: string;
    email?: string;
    password?: string;
    rol?: string;
    activo?: boolean;
    fechaCreacion?: string;
  }) => {
    // Aquí deberías llamar a tu API
    await updateProfile(user?.id || 0, updatedData);

    // Por ahora simulamos:
    // await new Promise((resolve) => setTimeout(resolve, 1500));

    // Actualizar el contexto de autenticación si es necesario
    const updatedUser = { ...user, ...updatedData };
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const { data: miPerfilInstructor } = useQuery<Instructor>({
    queryKey: ["instructor-me"],
    queryFn: instructoresApi.obtenerMiPerfil,
    enabled: user?.rol === "INSTRUCTOR",
    retry: 1,
  });

  if (!user) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        title="Mi Perfil"
        description="Administra tu información personal y configuración de cuenta"
      />

      {/* Profile Information */}
      <ProfileInfo onUpdate={handleUpdateProfile} />

      {/* Si es instructor, mostramos info extendida del Instructor */}
      {user.rol === "INSTRUCTOR" && miPerfilInstructor && (
        <Card className="mt-6 border-accent/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg">Datos de Instructor</CardTitle>
                <CardDescription>Esta es tu vinculación oficial en el sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Nombre Completo</p>
                  <p className="font-medium">{miPerfilInstructor.nombre} {miPerfilInstructor.apellido}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">DNI</p>
                  <p className="font-medium">{miPerfilInstructor.dni}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Teléfono</p>
                  <p className="font-medium">{miPerfilInstructor.codigoArea && `${miPerfilInstructor.codigoArea}`} {miPerfilInstructor.telefono}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Fecha de Alta</p>
                  <p className="font-medium">{miPerfilInstructor.activo ? "Alta Activa" : "Baja"}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Color de Agenda</p>
                  <div className="flex items-center gap-2">
                     <div className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: miPerfilInstructor.color || '#cccccc' }} />
                     <p className="font-medium">{miPerfilInstructor.color || 'Gris por defecto'}</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Estado</p>
                  <p className={`font-medium ${miPerfilInstructor.activo ? 'text-success' : 'text-destructive'}`}>
                    {miPerfilInstructor.activo ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
             </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Cards */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Security Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Seguridad</CardTitle>
                <CardDescription>
                  Gestiona la seguridad de tu cuenta
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
              <div>
                <p className="text-sm font-medium">Contraseña</p>
                <p className="text-xs text-muted-foreground">
                  Última actualización: Hace 2 meses
                </p>
              </div>
              <ChangePasswordDialog />
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4">
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

        {/* Activity Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Activity className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg">Actividad Reciente</CardTitle>
                <CardDescription>
                  Historial de accesos a tu cuenta
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  action: "Inicio de sesión",
                  time: "Hace 2 horas",
                  location: "La Plata, AR",
                },
                {
                  action: "Cambio de perfil",
                  time: "Hace 1 día",
                  location: "La Plata, AR",
                },
                {
                  action: "Inicio de sesión",
                  time: "Hace 3 días",
                  location: "Buenos Aires, AR",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
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

      {/* Danger Zone */}
      <Card className="mt-6 border-destructive/50">
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
    </Layout>
  );
}
