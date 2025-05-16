"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUpdateEmargementStatusMutation } from "@/hooks/queries/use-attendance.query";
import { Emargement } from "@/types/attendance.types";
import { RiCheckDoubleLine, RiCheckboxCircleFill, RiInformationLine } from "@remixicon/react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import { PrintAttendance } from "./print-attendance";

interface SupervisorValidationProps {
  emargements: Emargement[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function SupervisorValidation({ emargements, isLoading, onRefresh }: SupervisorValidationProps) {
  const [selectedEmargement, setSelectedEmargement] = useState<Emargement | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { mutate: updateStatus, isPending } = useUpdateEmargementStatusMutation();

  // Filtrer les émargements par statut
  const pendingEmargements = emargements.filter((e) => e.status === "PENDING" || e.status === "PRESENT");
  const confirmedEmargements = emargements.filter((e) => e.status === "SUPERVISOR_CONFIRMED" || e.status === "CLASS_HEADER_CONFIRMED");

  // Fonction pour confirmer un émargement
  const handleConfirmEmargement = (emargementId: string) => {
    updateStatus(
      { id: emargementId, status: "SUPERVISOR_CONFIRMED" },
      {
        onSuccess: () => {
          toast.success("Émargement confirmé avec succès");
          setDialogOpen(false);
          onRefresh();
        },
        onError: (error) => {
          toast.error("Erreur lors de la confirmation de l'émargement");
          console.error("Erreur confirmation émargement:", error);
        },
      }
    );
  };

  // Ouvrir la boîte de dialogue de détails
  const openDetailsDialog = (emargement: Emargement) => {
    setSelectedEmargement(emargement);
    setDialogOpen(true);
  };

  // Fonction pour obtenir la classe CSS du badge de statut
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

  // Fonction pour obtenir l'étiquette de statut
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
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="h-6 bg-muted rounded-md w-3/4"></CardTitle>
          <CardDescription className="h-4 bg-muted rounded-md w-1/4 mt-2"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-md w-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RiCheckDoubleLine className="text-primary" />
          Validation des émargements
        </CardTitle>
        <CardDescription>Confirmez et supervisez les enregistrements de présence des professeurs</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <span>À confirmer</span>
              <span className="bg-amber-100 text-amber-800 text-xs rounded-full px-2 py-0.5">{pendingEmargements.length}</span>
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="flex items-center gap-2">
              <span>Confirmés</span>
              <span className="bg-green-100 text-green-800 text-xs rounded-full px-2 py-0.5">{confirmedEmargements.length}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingEmargements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <RiInformationLine className="mx-auto mb-2 h-10 w-10 opacity-50" />
                <p>Aucun émargement en attente de confirmation</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Professeur</TableHead>
                    <TableHead>Cours</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingEmargements.map((emargement) => (
                    <TableRow key={emargement.id}>
                      <TableCell className="font-medium">{emargement.professor?.name}</TableCell>
                      <TableCell>{emargement.classSession?.course?.title}</TableCell>
                      <TableCell>{format(parseISO(emargement.classSession?.date), "dd/MM/yyyy", { locale: fr })}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(emargement.status)}`}>
                          {getStatusLabel(emargement.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openDetailsDialog(emargement)}>
                            Détails
                          </Button>
                          <Button variant="default" size="sm" onClick={() => handleConfirmEmargement(emargement.id)}>
                            Confirmer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="confirmed">
            {confirmedEmargements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <RiInformationLine className="mx-auto mb-2 h-10 w-10 opacity-50" />
                <p>Aucun émargement confirmé trouvé</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Professeur</TableHead>
                    <TableHead>Cours</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {confirmedEmargements.map((emargement) => (
                    <TableRow key={emargement.id}>
                      <TableCell className="font-medium">{emargement.professor?.name}</TableCell>
                      <TableCell>{emargement.classSession?.course?.title}</TableCell>
                      <TableCell>{format(parseISO(emargement.classSession?.date), "dd/MM/yyyy", { locale: fr })}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(emargement.status)}`}>
                          {getStatusLabel(emargement.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openDetailsDialog(emargement)}>
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-4 justify-between">
        <div className="text-xs text-muted-foreground">
          <RiCheckboxCircleFill className="inline-block mr-1 text-primary" />
          Les émargements confirmés sont pris en compte dans les statistiques officielles
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          Actualiser
        </Button>
      </CardFooter>

      {/* Dialogue de détails d'émargement */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de l&apos;émargement</DialogTitle>
            <DialogDescription>Informations complètes sur l&apos;émargement du cours</DialogDescription>
          </DialogHeader>

          {selectedEmargement && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Professeur</h3>
                  <p>{selectedEmargement.professor?.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Cours</h3>
                  <p>{selectedEmargement.classSession?.course?.title}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Date</h3>
                  <p>{format(parseISO(selectedEmargement.classSession?.date), "EEEE d MMMM yyyy", { locale: fr })}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Horaire</h3>
                  <p>
                    {format(parseISO(selectedEmargement.classSession?.heureDebut), "HH:mm", { locale: fr })} -
                    {format(parseISO(selectedEmargement.classSession?.heureFin), "HH:mm", { locale: fr })}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Statut</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(selectedEmargement.status)}`}>
                    {getStatusLabel(selectedEmargement.status)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Lieu</h3>
                  <p>{selectedEmargement.classSession?.course?.location || "Non spécifié"}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Dernière mise à jour</h3>
                <p>{format(parseISO(selectedEmargement.updatedAt), "dd/MM/yyyy HH:mm", { locale: fr })}</p>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {selectedEmargement &&
                selectedEmargement.status !== "SUPERVISOR_CONFIRMED" &&
                selectedEmargement.status !== "CLASS_HEADER_CONFIRMED" && (
                  <Button
                    variant="default"
                    onClick={() => {
                      if (selectedEmargement) {
                        handleConfirmEmargement(selectedEmargement.id);
                      }
                    }}
                    disabled={isPending}
                  >
                    Confirmer l&apos;émargement
                  </Button>
                )}
            </div>
            <div className="flex gap-2">
              {selectedEmargement && <PrintAttendance emargement={selectedEmargement} />}
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Fermer
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
