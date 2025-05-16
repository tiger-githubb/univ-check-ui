import { SignInInput } from "@/schema/sign-in.schema";
import { AuthResponse } from "@/types/auth.types";
import api from "@/utils/axios";

export class AuthenticationError extends Error {
  constructor(message: string = "Identifiants incorrects") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthService {
  static async signIn(credentials: SignInInput): Promise<AuthResponse> {
    try {
      const response = await api.post("/api/v1/auth/signin", credentials);
      const data = response.data;
      if (!data || !data.token || !data.email) {
        throw new AuthenticationError("Aucune donnée reçue du serveur");
      }
      return {
        user: {
          id: data.id || "unknown-id",
          email: data.email,
          name: data.name || "Utilisateur",
          phone: data.phone || "Non spécifié",
          role: data.role || "USER",
          createdAt: data.createdAt
            ? typeof data.createdAt === "string"
              ? data.createdAt
              : new Date(data.createdAt).toISOString()
            : new Date().toISOString(),
          updatedAt: data.updatedAt
            ? typeof data.updatedAt === "string"
              ? data.updatedAt
              : new Date(data.updatedAt).toISOString()
            : undefined,
        },
        token: data.token,
      };
    } catch (error: unknown) {
      console.error("Login failed:", error);
      const errorResponse = error as { response?: { data?: { message?: string } } };
      throw new AuthenticationError(errorResponse?.response?.data?.message || "Identifiants invalides ou erreur du serveur.");
    }
  }

  static async signOut(): Promise<{ success: boolean }> {
    // Si le backend ne gère pas la session côté serveur, il suffit de supprimer le token côté client
    return { success: true };
  }
  static async getCurrentUser(token: string): Promise<AuthResponse["user"] | null> {
    try {
      if (!token) {
        console.log("No token provided for user authentication");
        return null;
      }
      console.log("Fetching current user with token:", token.substring(0, 10) + "...");
      const response = await api.get("/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = response.data;
      if (!userData || !userData.email) {
        console.log("Invalid user data received:", userData);
        return null;
      }
      return {
        id: userData.id || "unknown-id",
        email: userData.email,
        name: userData.name || "Utilisateur",
        phone: userData.phone || "Non spécifié",
        role: userData.role || "USER",
        createdAt: userData.createdAt
          ? typeof userData.createdAt === "string"
            ? userData.createdAt
            : new Date(userData.createdAt).toISOString()
          : new Date().toISOString(),
        updatedAt: userData.updatedAt
          ? typeof userData.updatedAt === "string"
            ? userData.updatedAt
            : new Date(userData.updatedAt).toISOString()
          : undefined,
      };
    } catch (error) {
      console.error("Get current user failed:", error);
      return null;
    }
  }

  static async forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await api.post("/api/v1/auth/forgot-password", { email });
      return { success: true };
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      return { success: false, error: apiError?.response?.data?.message || "Erreur lors de la demande." };
    }
  }
  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      await api.post("/api/v1/auth/reset-password", { token, newPassword });
      return { success: true };
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      return { success: false, error: apiError?.response?.data?.message || "Erreur lors de la réinitialisation." };
    }
  }
}
