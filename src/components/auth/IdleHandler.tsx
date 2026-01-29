import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { clearCredentials, getStoredCredentials } from "@/services/authService";
import { toast } from "sonner";

const IdleHandler = () => {
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    const isLogged = getStoredCredentials();
    if (isLogged) {
      clearCredentials();
      navigate("/login");
      toast.info("Sesión cerrada por inactividad");
    }
  }, [navigate]);

  useEffect(() => {
    let timer: number;
    const timeout = 15 * 60 * 1000; // 15 minutos

    const resetTimer = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(handleLogout, timeout);
    };

    // Eventos que reinician el contador
    const events = ["mousedown", "keydown", "scroll", "click", "touchstart"];

    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      window.clearTimeout(timer);
    };
  }, [handleLogout]);

  return null;
};

export default IdleHandler;
