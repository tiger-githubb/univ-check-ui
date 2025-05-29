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
  // First try to get from localStorage if we're in the browser
  if (typeof window !== "undefined") {
    try {
      const localStorageData = localStorage.getItem("auth-user");
      if (localStorageData) {
        const parsedData = JSON.parse(localStorageData);
        if (parsedData?.token && parsedData?.user) {
          return parsedData;
        }
      }
    } catch (e) {
      console.error("Error reading from localStorage:", e);
    }
  }

  // If not found in localStorage, try to get with token from cookie
  const token = getAuthToken();
  if (!token) return null;

  try {
    // Try to get the current user from API
    const userData = await AuthService.getCurrentUser(token);
    if (!userData) return null;

    const authResponse = {
      user: userData,
      token,
    };

    // Store in localStorage for future use if we're in browser
    if (typeof window !== "undefined") {
      localStorage.setItem("auth-user", JSON.stringify(authResponse));
    }

    return authResponse;
  } catch (error) {
    console.error("Failed to get user data:", error);
    return null;
  }
}
