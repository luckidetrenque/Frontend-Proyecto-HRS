import { useEffect, useState } from "react";
import { User, getUsers, updateUserAdmin, deleteUser } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Shield, Trash2, ShieldAlert } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (targetUserId: number, newRole: string) => {
    try {
      await updateUserAdmin(targetUserId, { rol: newRole });
      toast({ title: "Rol actualizado exitosamente" });
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleStatusChange = async (targetUserId: number, isActive: boolean) => {
    try {
      await updateUserAdmin(targetUserId, { activo: isActive });
      toast({ title: "Estado actualizado exitosamente" });
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (targetUserId: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este usuario permanentemente? Esta acción no se puede deshacer.")) return;
    try {
      await deleteUser(targetUserId);
      toast({ title: "Usuario eliminado" });
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-in fade-in-50 duration-500">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-primary" />
              Gestión de Usuarios
            </h1>
            <p className="text-muted-foreground">Administración centralizada de cuentas, accesos y roles de seguridad.</p>
          </div>
          <Button onClick={fetchUsers} variant="outline">Actualizar Lista</Button>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Nombre de Usuario</TableHead>
                  <TableHead>Correo Electrónico</TableHead>
                  <TableHead>Rol de Seguridad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <div className="flex justify-center items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        Cargando usuarios...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No hay usuarios en la base de datos.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{u.username}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.rol === "ADMIN" ? "default" : u.rol === "INSTRUCTOR" ? "secondary" : "outline"} className="font-semibold shadow-sm">
                          {u.rol || "ALUMNO"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.activo ? "default" : "destructive"} className={u.activo ? "bg-green-600 hover:bg-green-700 text-white" : ""}>
                          {u.activo ? "Activo" : "Suspendido"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(u.fechaCreacion).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Modificar Permisos</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleRoleChange(u.id, "ADMIN")} className="cursor-pointer">
                              Hacer Administrador
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRoleChange(u.id, "INSTRUCTOR")} className="cursor-pointer">
                              Hacer Instructor
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRoleChange(u.id, "ALUMNO")} className="cursor-pointer">
                              Hacer Alumno
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange(u.id, !u.activo)} className="cursor-pointer font-medium">
                              {u.activo ? "Bloquear Acceso (Suspender)" : "Desbloquear (Activar)"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(u.id)} className="text-destructive font-medium cursor-pointer">
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar Usuario
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
