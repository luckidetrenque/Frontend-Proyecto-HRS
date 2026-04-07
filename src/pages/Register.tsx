import { Eye, EyeOff, UserPlus, ShieldCheck, AlertCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/services/authService";

const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const invitationCode = searchParams.get("code");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState<string>("");
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [invitationInfo, setInvitationInfo] = useState<{
    nombre: string;
    email: string;
  } | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verificar código de invitación al cargar si existe
  useEffect(() => {
    if (invitationCode) {
      verifyInvitation(invitationCode);
    }
  }, [invitationCode]);

  const verifyInvitation = async (code: string) => {
    setIsVerifyingCode(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/verify-code/${code}`);
      if (response.ok) {
        const data = await response.json();
        setInvitationInfo(data);
        if (data.email) {
          setFormData((prev) => ({ ...prev, email: data.email }));
        }
      } else {
        const errorData = await response.json();
        setError(errorData.mensaje || "El código de invitación no es válido o ha expirado");
      }
    } catch (err) {
      setError("Error al verificar el código de invitación");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 20;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 20;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
    return strength;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { email, password, confirmPassword } = formData;

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("El correo y la contraseña son obligatorios");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Ingresa un correo electrónico válido");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        email: email.trim(),
        password,
        codigoInvitacion: invitationCode || undefined,
        activo: true,
        fechaCreacion: new Date().toISOString(),
      });
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
      });
      navigate("/login");
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo crear la cuenta");
      toast({
        title: "Error al registrar",
        description: error instanceof Error ? error.message : "No se pudo crear la cuenta",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-in fade-in-50 duration-500">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {invitationCode ? "Completar Registro" : "Crear Cuenta"}
          </CardTitle>
          <CardDescription className="text-center">
            {invitationCode 
              ? "Vincula tu cuenta de alumno al sistema" 
              : "Completa el formulario para registrarte"}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {isVerifyingCode && (
              <div className="flex justify-center py-4">
                <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></span>
              </div>
            )}

            {invitationInfo && !isVerifyingCode && (
              <Alert className="bg-primary/5 border-primary/20">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <AlertTitle>Invitación para {invitationInfo.nombre}</AlertTitle>
                <AlertDescription>
                  Tu cuenta se vinculará automáticamente con tu perfil de alumno.
                </AlertDescription>
              </Alert>
            )}

            {error && !isVerifyingCode && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting || !!invitationInfo?.email}
                autoComplete="email"
              />
              {invitationInfo?.email && (
                <p className="text-xs text-muted-foreground">
                  Este correo está asignado a tu invitación.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {formData.password && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Seguridad de la contraseña
                  </span>
                  <span className="font-medium">
                    {passwordStrength < 40
                      ? "Débil"
                      : passwordStrength < 80
                        ? "Regular"
                        : "Fuerte"}
                  </span>
                </div>
                <Progress value={passwordStrength} className="h-2" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isVerifyingCode || (!!invitationCode && !!error)}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></span>
                  Procesando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  {invitationCode ? "Completar Registro" : "Crear Cuenta"}
                </span>
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              ¿Ya tienes cuenta?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;
