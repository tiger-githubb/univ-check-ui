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
import { useCreateEmargementMutation, useDeleteClassSessionMutation } from "@/hooks/queries/use-attendance.query";
import { ClassSession } from "@/types/attendance.types";
import { RiCalendarCheckLine, RiMoreLine } from "@remixicon/react";
import { format, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";

interface ClassSessionWithEmargement extends ClassSession {
  emargement?: {
    id: string;
    status: "PENDING" | "PRESENT" | "ABSENT" | "SUPERVISOR_CONFIRMED" | "CLASS_HEADER_CONFIRMED";
    updatedAt: string;
    comments?: string;
  };
  description?: string;
}

interface SessionsListProps {
  sessions: ClassSessionWithEmargement[];
  isLoading: boolean;
  totalItems: number;
  onRefresh: () => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export function SessionsList({
  sessions,
  isLoading,
  totalItems,
  onRefresh,
  currentPage,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: SessionsListProps) {
  const [selectedSession, setSelectedSession] = useState<ClassSessionWithEmargement | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { mutate: deleteClassSession } = useDeleteClassSessionMutation();
  const { mutate: createEmargement, isPending } = useCreateEmargementMutation();

  const handleDeleteSession = (sessionId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette session de cours ?")) {
      deleteClassSession(sessionId, {
        onSuccess: () => {
          toast.success("Session de cours supprimée avec succès");
          onRefresh();
        },
        onError: (error) => {
          toast.error("Erreur lors de la suppression de la session de cours");
          console.error("Erreur suppression session:", error);
        },
      });
    }
  };

  const openDetailsDialog = (session: ClassSessionWithEmargement) => {
    setSelectedSession(session);
    setDialogOpen(true);
  };

  const getStatusBadgeClass = (hasEmargement: boolean) => {
    return hasEmargement ? "bg-green-500/20 text-green-600" : "bg-yellow-500/20 text-yellow-600";
  };

  // Helper function to safely format dates
  const safeFormatDate = (dateString: string | undefined, formatPattern: string) => {
    if (!dateString) return "N/A";

    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "Date invalide";
      return format(date, formatPattern, { locale: fr });
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
      return "Erreur de date";
    }
  };

  const handleCreateEmargement = (session: ClassSessionWithEmargement) => {
    if (session.professor?.id) {
      const input = {
        status: "PRESENT" as "PENDING" | "PRESENT" | "ABSENT" | "SUPERVISOR_CONFIRMED" | "CLASS_HEADER_CONFIRMED",
        classSessionId: session.id,
        professorId: session.professor.id,
      };

      createEmargement(input, {
        onSuccess: () => {
          toast.success("Émargement manuel effectué avec succès");
          setDialogOpen(false);
          onRefresh();
        },
        onError: (error) => {
          toast.error("Erreur lors de l'émargement manuel");
          console.error("Erreur émargement manuel:", error);
        },
      });
    } else {
      toast.error("Impossible d'émarger: données du professeur manquantes");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement des sessions de cours...</p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cours</TableHead>
              <TableHead>Professeur</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Horaire</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Aucune session de cours trouvée
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.course?.title || "N/A"}</TableCell>
                  <TableCell>{session.professor?.name || `${session.professor?.name || ""}`.trim() || "N/A"}</TableCell>
                  <TableCell>{safeFormatDate(session.date, "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    {safeFormatDate(session.heureDebut, "HH:mm")} - {safeFormatDate(session.heureFin, "HH:mm")}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(!!session.emargement)}`}>
                      {session.emargement ? "Émargée" : "En attente"}
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
                        <DropdownMenuItem onClick={() => openDetailsDialog(session)}>Voir les détails</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteSession(session.id)}>Supprimer la session</DropdownMenuItem>
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
            {totalItems > 0
              ? `${Math.min((currentPage - 1) * pageSize + 1, totalItems)}-${Math.min(
                  currentPage * pageSize,
                  totalItems
                )} sur ${totalItems}`
              : `0 sur 0`}
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
              let pageNumber;

              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

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
            <DialogTitle>Détails de la session de cours</DialogTitle>
            <DialogDescription>Informations complètes sur la session de cours</DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Cours</h3>
                  <p>{selectedSession.course?.title || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Professeur</h3>
                  <p>{selectedSession.professor?.name || ""}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Date</h3>
                  <p>{safeFormatDate(selectedSession.date, "EEEE d MMMM yyyy")}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Horaire</h3>
                  <p>
                    {safeFormatDate(selectedSession.heureDebut, "HH:mm")} - {safeFormatDate(selectedSession.heureFin, "HH:mm")}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Status d&apos;émargement</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(!!selectedSession.emargement)}`}>
                      {selectedSession.emargement ? "Émargée" : "En attente"}
                    </span>
                    {selectedSession.emargement && (
                      <p className="text-xs">Le {safeFormatDate(selectedSession.emargement.updatedAt, "dd/MM/yyyy à HH:mm")}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Lieu</h3>
                  <p>{selectedSession.course?.location || "Non spécifié"}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Informations supplémentaires</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedSession.description || "Aucune information supplémentaire disponible."}
                </p>
              </div>

              {selectedSession.emargement && (
                <div>
                  <h3 className="font-semibold mb-1">Commentaires d&apos;émargement</h3>
                  <p className="text-sm">{selectedSession.emargement.comments || "Aucun commentaire"}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedSession && !selectedSession.emargement && selectedSession.professor && (
              <Button
                variant="default"
                className="me-auto"
                onClick={() => handleCreateEmargement(selectedSession)}
                disabled={isPending}
              >
                <RiCalendarCheckLine className="mr-2" />
                Émarger manuellement
              </Button>
            )}
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
