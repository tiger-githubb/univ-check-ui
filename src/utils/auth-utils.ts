/**
 * Utility functions for authentication
 */
import { AuthService } from "@/server/services/auth.service";
import { AuthResponse } from "@/types/auth.types";
import { getCookie } from "@/utils/cookies";

/**
 * Récupère le token d'authentification stocké localement
 * @returns {string|null} Le token d'authentification ou null si non disponible
 */
export function getAuthToken(): string | null {
  // Try to get from cookie first (available in both client and server)
  const cookieToken = getCookie("auth-token");
  if (cookieToken) return cookieToken;

  // Fallback to localStorage if we're in the browser
  if (typeof window !== "undefined") {
    try {
      const authData = localStorage.getItem("auth-user");
      if (!authData) return null;

      const parsedData = JSON.parse(authData);
      return parsedData?.token || null;
    } catch (error) {
      console.error("Erreur lors de la récupération du token:", error);
    }
  }

  return null;
}

/**
 * Récupère les données utilisateur stockées
 * Cette fonction peut être utilisée côté client ou serveur
 * @returns {Promise<AuthResponse | null>}
 */
export async function getUserData(): Promise<AuthResponse | null> {
  // Get the token
  const token = getAuthToken();
  if (!token) return null;

  try {
    // Try to get the current user from API
    const userData = await AuthService.getCurrentUser(token);
    if (!userData) return null;

    return {
      user: userData,
      token,
    };
  } catch (error) {
    console.error("Failed to get user data:", error);
    return null;
  }
}
