"use client";

import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import { routes } from "@/config/routes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PiSpinnerGap } from "react-icons/pi";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: user, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    // Si l'authentification est terminée et qu'il n'y a pas d'utilisateur
    if (!isLoading && !user) {
      router.replace(`/${routes.auth.signIn}`);
    }
  }, [user, isLoading, router]);

  // Afficher le fallback personnalisé ou le loader par défaut
  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <PiSpinnerGap className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Vérification de l&apos;authentification...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur, ne rien afficher (la redirection se fera)
  if (!user) {
    return null;
  }

  // Si l'utilisateur est connecté, afficher le contenu
  return <>{children}</>;
} 