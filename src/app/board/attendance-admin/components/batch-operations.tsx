"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUpdateEmargementStatusMutation } from "@/hooks/queries/use-attendance.query";
import { Emargement } from "@/types/attendance.types";
import { RiBattery2ChargeLine, RiCheckLine, RiCloseLine, RiMoreLine } from "@remixicon/react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import { ExportToPdfButton } from "./export-to-pdf-button";

interface BatchOperationsProps {
  emargements: Emargement[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function BatchOperations({ emargements, isLoading, onRefresh }: BatchOperationsProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { mutate: updateStatus, isPending } = useUpdateEmargementStatusMutation();

  // Gérer la sélection/désélection
  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Sélectionner ou désélectionner tous les éléments
  const toggleAll = () => {
    if (selectedIds.length === emargements.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(emargements.map((e) => e.id));
    }
  };

  // Mettre à jour le statut pour tous les émargements sélectionnés
  const updateBatchStatus = async (status: string) => {
    if (selectedIds.length === 0) {
      toast.error("Veuillez sélectionner au moins un émargement");
      return;
    }

    // Confirmer l'opération
    if (!confirm(`Êtes-vous sûr de vouloir marquer ${selectedIds.length} émargement(s) comme "${status}" ?`)) {
      return;
    }

    try {
      // Traiter chaque émargement sélectionné
      const promises = selectedIds.map(
        (id) =>
          new Promise((resolve, reject) => {
            updateStatus(
              { id, status },
              {
                onSuccess: () => resolve(id),
                onError: (error) => reject({ id, error }),
              }
            );
          })
      );

      // Attendre que toutes les mises à jour soient terminées
      await Promise.all(promises);

      toast.success(`${selectedIds.length} émargement(s) mis à jour avec succès`);
      setSelectedIds([]); // Réinitialiser la sélection
      onRefresh(); // Rafraîchir les données
    } catch (error) {
      console.error("Erreur lors de la mise à jour par lot:", error);
      toast.error("Certains émargements n'ont pas pu être mis à jour");
      onRefresh(); // Rafraîchir quand même pour voir les changements partiels
    }
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RiBattery2ChargeLine className="text-primary" />
              Opérations par lot
            </CardTitle>
            <CardDescription>Effectuez des actions sur plusieurs émargements simultanément</CardDescription>
          </div>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateBatchStatus("PRESENT")}
                  disabled={isPending}
                  className="flex items-center gap-1"
                >
                  <RiCheckLine className="text-green-600" />
                  Marquer présents
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateBatchStatus("ABSENT")}
                  disabled={isPending}
                  className="flex items-center gap-1"
                >
                  <RiCloseLine className="text-red-600" />
                  Marquer absents
                </Button>
                <Button variant="outline" size="sm" onClick={() => updateBatchStatus("SUPERVISOR_CONFIRMED")} disabled={isPending}>
                  Confirmer
                </Button>
              </>
            )}
            {selectedIds.length > 0 && (
              <ExportToPdfButton
                emargements={emargements.filter((e) => selectedIds.includes(e.id))}
                fileName="emargements-selection"
                title="Émargements sélectionnés"
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {emargements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Aucun émargement disponible</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === emargements.length && emargements.length > 0}
                    onCheckedChange={() => toggleAll()}
                    aria-label="Sélectionner tous les émargements"
                  />
                </TableHead>
                <TableHead>Professeur</TableHead>
                <TableHead>Cours</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emargements.slice(0, 10).map((emargement) => (
                <TableRow key={emargement.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(emargement.id)}
                      onCheckedChange={() => toggleSelection(emargement.id)}
                      aria-label={`Sélectionner l'émargement de ${emargement.professor?.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{emargement.professor?.name}</TableCell>
                  <TableCell>{emargement.classSession?.course?.title}</TableCell>
                  <TableCell>{format(parseISO(emargement.classSession?.date), "dd/MM/yyyy", { locale: fr })}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(emargement.status)}`}>
                      {getStatusLabel(emargement.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <RiMoreLine className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            updateStatus(
                              { id: emargement.id, status: "PRESENT" },
                              {
                                onSuccess: () => {
                                  toast.success("Marqué présent");
                                  onRefresh();
                                },
                              }
                            )
                          }
                        >
                          Marquer présent
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateStatus(
                              { id: emargement.id, status: "ABSENT" },
                              {
                                onSuccess: () => {
                                  toast.success("Marqué absent");
                                  onRefresh();
                                },
                              }
                            )
                          }
                        >
                          Marquer absent
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateStatus(
                              { id: emargement.id, status: "SUPERVISOR_CONFIRMED" },
                              {
                                onSuccess: () => {
                                  toast.success("Émargement confirmé");
                                  onRefresh();
                                },
                              }
                            )
                          }
                        >
                          Confirmer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {emargements.length > 10 && (
          <div className="text-center text-sm text-muted-foreground py-2">Affichage des 10 premiers émargements seulement.</div>
        )}
      </CardContent>
      <CardFooter className="justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          {selectedIds.length > 0 ? (
            <span>{selectedIds.length} émargement(s) sélectionné(s)</span>
          ) : (
            <span>0 émargement sélectionné</span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
          Tout désélectionner
        </Button>
      </CardFooter>
    </Card>
  );
}
