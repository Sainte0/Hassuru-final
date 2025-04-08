import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";

export const useAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const lastCheckTime = useRef(0);
  const checkInProgress = useRef(false);

  const checkAuth = async (force = false) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      router.push("/login");
      return false;
    }

    // Implementar un mecanismo de caché para evitar verificaciones frecuentes
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
    
    // Si la última verificación fue hace menos de CACHE_DURATION y no se fuerza la verificación
    if (!force && now - lastCheckTime.current < CACHE_DURATION) {
      return isAuthenticated;
    }
    
    // Evitar múltiples verificaciones simultáneas
    if (checkInProgress.current) {
      return isAuthenticated;
    }
    
    checkInProgress.current = true;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/admin/verify`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Token inválido o expirado");
      }

      setIsAuthenticated(true);
      lastCheckTime.current = now;
      return true;
    } catch (error) {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      router.push("/login");
      return false;
    } finally {
      checkInProgress.current = false;
    }
  };

  useEffect(() => {
    // Solo verificar en la carga inicial o cuando cambia la ruta
    if (router.isReady) {
      checkAuth();
    }
  }, [router.isReady]);

  return { isAuthenticated, checkAuth };
};
