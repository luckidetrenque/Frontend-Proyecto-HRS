import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { clearCredentials, getStoredCredentials } from "@/services/authService";
import { toast } from "sonner";

const IdleHandler = () => {
  const navigate = useNavigate();
  const timer = useRef<number | null>(null);

  const handleLogout = useCallback(() => {
    const isLogged = getStoredCredentials();
    if (isLogged) {
      clearCredentials();
      navigate("/login");
      toast.info("Sesión cerrada por inactividad");
    }
  }, [navigate]);

  useEffect(() => {
    const timeout = 15 * 60 * 1000; // 15 minutos

    const resetTimer = () => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(handleLogout, timeout);
    };

    // Eventos que reinician el contador
    const events = ["mousedown", "keydown", "scroll", "click", "touchstart"];

    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [handleLogout]);

  return null;
};

export default IdleHandler;
