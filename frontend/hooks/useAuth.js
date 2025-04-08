import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export const useAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      router.push("/login");
      return false;
    }

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
      return true;
    } catch (error) {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      router.push("/login");
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, [router]);

  return { isAuthenticated, checkAuth };
};
