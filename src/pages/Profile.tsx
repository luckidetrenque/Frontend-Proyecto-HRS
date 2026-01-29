import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ChangePasswordDialog } from "@/components/profile/ChangePasswordDialog";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Shield, Activity } from "lucide-react";
import { updateProfile } from "@/services/authService";

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
