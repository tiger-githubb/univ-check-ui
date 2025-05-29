import { SignInInput } from "@/schema/sign-in.schema";
import { AuthService } from "@/server/services/auth.service";
import { AuthResponse } from "@/types/auth.types";
import { setCookie } from "@/utils/cookies";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export const authQueryKeys = {
  user: ["currentUser"],
  session: ["session"],
};

export function useSignInMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: SignInInput) => AuthService.signIn(credentials),
    onSuccess: async (data) => {
      try {
        // Stocker les infos utilisateur dans le localStorage pour la compatibilité avec le code existant
        if (typeof window !== "undefined") {
          localStorage.setItem("auth-user", JSON.stringify(data));
        }

        // Toujours définir le cookie pour le token (fonctionne côté client et est accessible côté serveur)
        if (data.token) {
          setCookie("auth-token", data.token, 7); // Cookie valide pour 7 jours
        }

        // Mettre à jour le cache React Query
        queryClient.setQueryData(authQueryKeys.user, data);
      } catch (error) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-user");
        }
        throw error;
      }
    },
  });
}

export function useSignOutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AuthService.signOut(),
    onSuccess: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-user");
      }
      // Supprimer le cookie d'authentification
      setCookie("auth-token", "", -1);
      queryClient.setQueryData(authQueryKeys.user, null);
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user });
    },
  });
}

export function useCurrentUser() {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const queryClient = useQueryClient();

  // This effect handles the localStorage-based authentication
  useEffect(() => {
    // Check if window is defined (we're in the browser)
    if (typeof window !== "undefined") {
      const updateUser = () => {
        // Try to get from localStorage first for backward compatibility
        const stored = localStorage.getItem("auth-user");
        if (stored) {
          try {
            const parsedUser = JSON.parse(stored);
            setUser(parsedUser);
            // Also update the query cache to ensure consistency
            queryClient.setQueryData(authQueryKeys.user, parsedUser);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      };
      updateUser();
      window.addEventListener("storage", updateUser);
      return () => window.removeEventListener("storage", updateUser);
    }
  }, [queryClient]);
  // This effect handles the cookie-based authentication
  useEffect(() => {
    // Always try to get user data on mount, regardless of user state
    if (typeof window !== "undefined") {
      import("@/utils/auth-utils").then((module) => {
        module.getUserData().then((userData) => {
          if (userData) {
            setUser(userData);
            // Update localStorage for backward compatibility
            localStorage.setItem("auth-user", JSON.stringify(userData));
            // Update query cache
            queryClient.setQueryData(authQueryKeys.user, userData);
          }
        });
      });
    }
  }, [queryClient]);

  return useQuery({
    queryKey: authQueryKeys.user,
    queryFn: async () => {
      // During server-side rendering or build time, we won't execute this code
      // because React Query handles SSR properly

      // Try to get from in-memory state first
      if (user) return user;

      // If not available in state, try to get from getUserData function
      try {
        const userData = await import("@/utils/auth-utils").then((module) => module.getUserData());
        if (userData) {
          // Store the user data in state and localStorage for future use
          setUser(userData);
          if (typeof window !== "undefined") {
            localStorage.setItem("auth-user", JSON.stringify(userData));
          }
          return userData;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }

      return null;
    },
    enabled: true,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 1,
    refetchOnWindowFocus: true, // Refetch when window gets focus
    refetchOnMount: true, // Important: refetch when component mounts
  });
}
