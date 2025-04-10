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
      if (router.pathname.startsWith('/admin')) {
        router.push("/login");
      }
      return false;
    }

    // Implementar un mecanismo de caché para evitar verificaciones frecuentes
    const now = Date.now();
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
    
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

      if (response.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        if (router.pathname.startsWith('/admin')) {
          router.push("/login");
        }
        return false;
      }

      if (!response.ok) {
        throw new Error("Error al verificar la autenticación");
      }

      setIsAuthenticated(true);
      lastCheckTime.current = now;
      return true;
    } catch (error) {
      console.error("Error en la verificación de autenticación:", error);
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      if (router.pathname.startsWith('/admin')) {
        router.push("/login");
      }
      return false;
    } finally {
      checkInProgress.current = false;
    }
  };

  useEffect(() => {
    // Verificar autenticación en la carga inicial y cuando cambia la ruta
    if (router.isReady) {
      checkAuth(true); // Forzar verificación en la carga inicial
    }
  }, [router.isReady, router.pathname]);

  // Verificar autenticación cada 24 horas
  useEffect(() => {
    const interval = setInterval(() => {
      checkAuth(true);
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { isAuthenticated, checkAuth };
};
