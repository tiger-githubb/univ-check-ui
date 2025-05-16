"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUpdateEmargementStatusMutation } from "@/hooks/queries/use-attendance.query";
import { Emargement } from "@/types/attendance.types";
import { RiMoreLine } from "@remixicon/react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";

interface AttendanceListProps {
  emargements: Emargement[];
  isLoading: boolean;
  onRefresh: () => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  totalItems?: number;
}

export function AttendanceList({
  emargements,
  isLoading,
  onRefresh,
  currentPage,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems = 0,
}: AttendanceListProps) {
  const [selectedEmargement, setSelectedEmargement] = useState<Emargement | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { mutate: updateStatus, isPending } = useUpdateEmargementStatusMutation();

  const handleStatusChange = (emargementId: string, newStatus: string) => {
    updateStatus(
      { id: emargementId, status: newStatus },
      {
        onSuccess: () => {
          toast.success("Statut de l'émargement mis à jour avec succès");
          onRefresh();
        },
        onError: (error) => {
          toast.error("Erreur lors de la mise à jour du statut");
          console.error("Erreur mise à jour du statut:", error);
        },
      }
    );
  };

  const openDetailsDialog = (emargement: Emargement) => {
    setSelectedEmargement(emargement);
    setDialogOpen(true);
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
        <p>Chargement des émargements...</p>
      </div>
    );
  }

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Professeur</TableHead>
              <TableHead>Cours</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Horaire</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emargements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Aucun émargement trouvé
                </TableCell>
              </TableRow>
            ) : (
              emargements.map((emargement) => (
                <TableRow key={emargement.id}>
                  <TableCell className="font-medium">{emargement.professor?.name}</TableCell>
                  <TableCell>{emargement.classSession?.course?.title}</TableCell>
                  <TableCell>{format(parseISO(emargement.classSession?.date), "dd/MM/yyyy", { locale: fr })}</TableCell>
                  <TableCell>
                    {format(parseISO(emargement.classSession?.heureDebut), "HH:mm", { locale: fr })} -
                    {format(parseISO(emargement.classSession?.heureFin), "HH:mm", { locale: fr })}
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => openDetailsDialog(emargement)}>Voir les détails</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusChange(emargement.id, "PRESENT")}>
                          Marquer présent
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(emargement.id, "ABSENT")}>Marquer absent</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(emargement.id, "SUPERVISOR_CONFIRMED")}>
                          Confirmer (superviseur)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Lignes par page</span>
          <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger className="h-8 w-16">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {`${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalItems)} sur ${totalItems}`}
          </span>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(1);
                }}
                isActive={currentPage === 1}
                aria-label="Première page"
              >
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;

              if (pageNumber <= 0 || pageNumber > totalPages) return null;

              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(pageNumber);
                    }}
                    isActive={currentPage === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onPageChange(currentPage + 1);
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(totalPages);
                }}
                isActive={currentPage === totalPages}
                aria-label="Dernière page"
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Dialog de détails */}
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
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedEmargement) {
                    handleStatusChange(selectedEmargement.id, "ABSENT");
                    setDialogOpen(false);
                  }
                }}
                disabled={isPending}
              >
                Marquer absent
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  if (selectedEmargement) {
                    handleStatusChange(selectedEmargement.id, "PRESENT");
                    setDialogOpen(false);
                  }
                }}
                disabled={isPending}
              >
                Marquer présent
              </Button>
            </div>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
