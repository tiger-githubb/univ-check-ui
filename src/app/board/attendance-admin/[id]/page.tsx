"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBreadcrumb } from "@/contexts/breadcrumb.context";
import { useEmargementQuery, useUpdateEmargementStatusMutation } from "@/hooks/queries/use-attendance.query";
import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import { RiArrowLeftLine, RiCheckLine, RiCloseLine, RiFileTextLine, RiTimeLine } from "@remixicon/react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { redirect } from "next/navigation";
import { use, useEffect } from "react";
import { PiSpinnerGap } from "react-icons/pi";
import { toast } from "sonner";

interface AttendanceDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AttendanceDetailPage({ params }: AttendanceDetailPageProps) {
  const { id } = use(params);
  const { data: user } = useCurrentUser();
  const isAdmin = user?.user?.role === "ADMIN";
  const { setPageTitle } = useBreadcrumb();

  // Si l'utilisateur n'est pas administrateur, rediriger vers le tableau de bord
  if (user && !isAdmin) {
    redirect("/board");
  }

  const { data: emargement, isLoading, error, refetch } = useEmargementQuery(id);

  const { mutate: updateStatus, isPending } = useUpdateEmargementStatusMutation();

  useEffect(() => {
    setPageTitle("Détail de l'émargement");
  }, [setPageTitle]);

  const handleStatusChange = (newStatus: string) => {
    updateStatus(
      { id: id, status: newStatus },
      {
        onSuccess: () => {
          toast.success("Statut de l'émargement mis à jour avec succès");
          refetch();
        },
        onError: (error) => {
          toast.error("Erreur lors de la mise à jour du statut");
          console.error("Erreur mise à jour du statut:", error);
        },
      }
    );
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-500/20 text-green-600";
      case "ABSENT":
        return "bg-red-500/20 text-red-600";
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-600";
      case "SUPERVISOR_CONFIRMED":
        return "bg-blue-500/20 text-blue-600";
      case "CLASS_HEADER_CONFIRMED":
        return "bg-purple-500/20 text-purple-600";
      default:
        return "bg-gray-500/20 text-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "Présent";
      case "ABSENT":
        return "Absent";
      case "PENDING":
        return "En attente";
      case "SUPERVISOR_CONFIRMED":
        return "Confirmé (supervision)";
      case "CLASS_HEADER_CONFIRMED":
        return "Confirmé (responsable)";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <PiSpinnerGap className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !emargement) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Erreur</h2>
          <p className="text-muted-foreground mt-2">Impossible de charger les détails de l&apos;émargement.</p>
          <Link href="/board/attendance-admin">
            <Button variant="outline" className="mt-4">
              <RiArrowLeftLine className="mr-2 h-4 w-4" />
              Retour à la liste
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/board/attendance-admin">
          <Button variant="outline" size="sm">
            <RiArrowLeftLine className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </Link>
      </div>

      <PageHeader
        icon={<RiFileTextLine className="text-primary" />}
        title="Détail de l'émargement"
        subtitle="Informations complètes sur l'émargement"
      />

      <div className="container mx-auto py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations du cours</CardTitle>
                <CardDescription>Détails de la session de cours et de l&apos;émargement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">Cours</h3>
                    <p className="font-medium">{emargement.classSession?.course?.title}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">Professeur</h3>
                    <p className="font-medium">{emargement.professor?.name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">Date</h3>
                    <p className="font-medium">
                      {format(parseISO(emargement.classSession?.date), "EEEE d MMMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">Horaire</h3>
                    <p className="font-medium flex items-center gap-1">
                      <RiTimeLine className="h-4 w-4" />
                      {format(parseISO(emargement.classSession?.heureDebut), "HH:mm", { locale: fr })} -
                      {format(parseISO(emargement.classSession?.heureFin), "HH:mm", { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">Lieu</h3>
                    <p className="font-medium">{emargement.classSession?.course?.location || "Non spécifié"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">Statut actuel</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(emargement.status)}`}>
                      {getStatusLabel(emargement.status)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historique</CardTitle>
                <CardDescription>Suivi des modifications apportées à cet émargement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Émargement créé</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(emargement.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Dernière mise à jour</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(emargement.updatedAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Modifier le statut de l&apos;émargement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant={emargement.status === "PRESENT" ? "default" : "outline"}
                  onClick={() => handleStatusChange("PRESENT")}
                  disabled={isPending}
                >
                  <RiCheckLine className="mr-2 h-4 w-4" />
                  Marquer présent
                </Button>
                <Button
                  className="w-full justify-start"
                  variant={emargement.status === "ABSENT" ? "destructive" : "outline"}
                  onClick={() => handleStatusChange("ABSENT")}
                  disabled={isPending}
                >
                  <RiCloseLine className="mr-2 h-4 w-4" />
                  Marquer absent
                </Button>
                <Button
                  className="w-full justify-start"
                  variant={emargement.status === "SUPERVISOR_CONFIRMED" ? "default" : "outline"}
                  onClick={() => handleStatusChange("SUPERVISOR_CONFIRMED")}
                  disabled={isPending}
                >
                  <RiCheckLine className="mr-2 h-4 w-4" />
                  Confirmer (superviseur)
                </Button>
                <Button
                  className="w-full justify-start"
                  variant={emargement.status === "CLASS_HEADER_CONFIRMED" ? "default" : "outline"}
                  onClick={() => handleStatusChange("CLASS_HEADER_CONFIRMED")}
                  disabled={isPending}
                >
                  <RiCheckLine className="mr-2 h-4 w-4" />
                  Confirmer (responsable)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informations techniques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">ID Émargement:</span>
                  <p className="text-muted-foreground font-mono text-xs">{emargement.id}</p>
                </div>
                <div>
                  <span className="font-medium">ID Session:</span>
                  <p className="text-muted-foreground font-mono text-xs">{emargement.classSession?.id}</p>
                </div>
                <div>
                  <span className="font-medium">ID Professeur:</span>
                  <p className="text-muted-foreground font-mono text-xs">{emargement.professor?.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
