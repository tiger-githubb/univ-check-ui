import { AUTH_CONSTANTS } from "@/config/constants";
import { authClient } from "@/lib/client";
import { SignInInput } from "@/schema/sign-in.schema";
import { AuthResponse, BetterAuthSessionResponse, UserRole, UserRoleAttributes } from "@/types/auth.types";

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
      
      if (!data) {
        throw new AuthenticationError("Aucune donnée reçue du serveur");
      }
      
      let userData: any = data.user;
      
      const dataObj = data as Record<string, any>;
      
      if (!userData && 'email' in dataObj) {
        userData = dataObj;
      }
      
      if (!userData || !userData.email) {
        console.error("Structure de données utilisateur invalide:", data);
        throw new AuthenticationError("Structure de données utilisateur invalide");
      }
      
      const role = this.determineUserRole(userData.email, userData);
      
      return {
        user: {
          id: userData.id || "unknown-id",
          email: userData.email,
          name: userData.name || "Utilisateur",
          phone: userData.phone || "Non spécifié",
          role,
          createdAt: userData.createdAt ? (typeof userData.createdAt === 'string' ? userData.createdAt : userData.createdAt.toISOString()) : new Date().toISOString(),
          updatedAt: userData.updatedAt ? (typeof userData.updatedAt === 'string' ? userData.updatedAt : userData.updatedAt.toISOString()) : undefined,
        },
        token: data.token || "",
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
      
      if (error || !data) {
        return null;
      }
      
      let userData: any = data.user;
      
      if (!userData && data.user?.email) {
        userData = data.user;
      } else if (!userData && typeof data === 'object') {
        const dataObj = data as Record<string, any>;
        for (const key in dataObj) {
          if (dataObj[key] && typeof dataObj[key] === 'object' && 'email' in dataObj[key]) {
            userData = dataObj[key];
            break;
          }
        }
      }
      
      if (!userData || !userData.email) {
        console.error("Structure de données utilisateur invalide dans getCurrentUser:", data);
        return null;
      }
      
      const role = this.determineUserRole(userData.email, userData);
      
      return {
        id: userData.id || "unknown-id",
        email: userData.email,
        name: userData.name || "Utilisateur",
        phone: userData.phone || "Non spécifié",
        role,
        createdAt: userData.createdAt ? (typeof userData.createdAt === 'string' ? userData.createdAt : userData.createdAt.toISOString()) : new Date().toISOString(),
        updatedAt: userData.updatedAt ? (typeof userData.updatedAt === 'string' ? userData.updatedAt : userData.updatedAt.toISOString()) : undefined,
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

  private static determineUserRole(email: string, userData?: any): UserRole {
    if (userData?.metadata?.role) {
      const roleFromMetadata = userData.metadata.role.toUpperCase();
      if (['ADMIN', 'TEACHER', 'SUPERVISOR', 'DELEGATE', 'USER'].includes(roleFromMetadata)) {
        return roleFromMetadata as UserRole;
      }
    }
    
    if (userData?.metadata?.permissions) {
      const permissions = userData.metadata.permissions;
      if (permissions.includes('admin:all')) return 'ADMIN';
      if (permissions.includes('teacher:manage')) return 'TEACHER';
      if (permissions.includes('supervisor:manage')) return 'SUPERVISOR';
      if (permissions.includes('delegate:represent')) return 'DELEGATE';
    }
    
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
