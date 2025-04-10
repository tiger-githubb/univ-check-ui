import { createAuthClient } from "better-auth/react";
import axios from "axios";

// URL de base de l'API (s'assurer qu'elle n'a pas de slash à la fin)
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:19200").replace(/\/+$/, "");

// Client better-auth standard
const betterAuthClient = createAuthClient({
    baseURL: API_BASE_URL,
    authEndpoint: "/api/v1/auth",
    signInPath: "signin",
    signOutPath: "signout",
    signUpPath: "signup",
    forgotPasswordPath: "forgot-password",
    resetPasswordPath: "reset-password",
    tokenStorageKey: "token",
    userStorageKey: "user",
    redirectToSignIn: true,
    usePrefixedPaths: false,
});

export const authClient = {
    ...betterAuthClient,
    signIn: {
        ...betterAuthClient.signIn,
        email: async ({ email, password }: { email: string; password: string }) => {
            try {
                const response = await axios.post(`${API_BASE_URL}/api/v1/auth/signin`, {
                    email,
                    password
                });
                
                return {
                    data: response.data,
                    error: null
                };
            } catch (error: any) {
                console.error("Login error:", error);
                return {
                    data: null,
                    error: {
                        message: error.response?.data?.message || "Échec de la connexion"
                    }
                };
            }
        }
    }
};
