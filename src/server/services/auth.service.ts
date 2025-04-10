import { AUTH_CONSTANTS } from "@/config/constants";
import { authClient } from "@/lib/client";
import { SignInInput } from "@/schema/sign-in.schema";

interface BetterAuthUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "USER" | "ADMIN" | "TEACHER" | "SUPERVISOR" | "DELEGATE";

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    phone: string;
    role: UserRole;
    createdAt: string;
    updatedAt?: string;
  };
  token: string;
}

export class AuthenticationError extends Error {
  constructor(message: string = "Identifiants incorrects") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthService {
  static async signIn(credentials: SignInInput): Promise<AuthResponse> {
    try {
      const { data, error } = await authClient.signIn.email({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) {
        throw new AuthenticationError(error.message);
      }
      
      const role = this.determineUserRole(data.user.email);
      
      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          phone: "Non spécifié",
          role,
          createdAt: data.user.createdAt.toISOString(),
          updatedAt: data.user.updatedAt?.toISOString(),
        },
        token: data.token,
      };
      
    } catch (error) {
      console.error("Login failed:", error);
      throw new AuthenticationError("Identifiants invalides ou erreur du serveur.");
    }
  }

  static async signOut(): Promise<{ success: boolean }> {
    try {
      const { error } = await authClient.signOut({});
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { success: true };
    } catch (error) {
      console.error("Logout failed:", error);
      return { success: false };
    }
  }

  static async getCurrentUser(): Promise<AuthResponse["user"] | null> {
    try {
      const { data, error } = await authClient.getSession();
      
      if (error || !data || !data.user) {
        return null;
      }
      
      const role = this.determineUserRole(data.user.email);
      
      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        phone: "Non spécifié", 
        role,
        createdAt: data.user.createdAt.toISOString(),
        updatedAt: data.user.updatedAt?.toISOString(),
      };
    } catch (error) {
      console.error("Get current user failed:", error);
      return null;
    }
  }
  
  static async forgotPassword(email: string): Promise<{ success: boolean, error?: string }> {
    try {
      const { error } = await authClient.forgetPassword({
        email
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error("Forgot password failed:", error);
      return { success: false, error: "Une erreur s'est produite lors de la demande de réinitialisation du mot de passe." };
    }
  }
  
  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean, error?: string }> {
    try {
      const { error } = await authClient.resetPassword({
        token,
        newPassword
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error("Reset password failed:", error);
      return { success: false, error: "Une erreur s'est produite lors de la réinitialisation du mot de passe." };
    }
  }
    
  private static determineUserRole(email: string): UserRole {
    if (email === AUTH_CONSTANTS.DEMO_CREDENTIALS.ADMIN.email) {
      return "ADMIN";
    } else if (email.includes("professeur") || email.includes("teacher")) {
      return "TEACHER";
    } else if (email.includes("supervisor")) {
      return "SUPERVISOR";
    } else if (email.includes("delegate")) {
      return "DELEGATE";
    } else {
      return "USER";
    }
  }
}
