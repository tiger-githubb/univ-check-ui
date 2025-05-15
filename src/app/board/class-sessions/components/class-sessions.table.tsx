import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDeleteClassSessionMutation } from "@/hooks/queries/use-class-session.query";
import { ClassSession } from "@/types/attendance.types";
import { RiDeleteBin5Line, RiEditLine, RiMoreFill } from "@remixicon/react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import React from "react";
import { toast } from "sonner";

interface ClassSessionsTableProps {
  classSessions: ClassSession[];
  isLoading: boolean;
  canEdit: boolean;
  onEdit: (classSession: ClassSession) => void;
  onDelete: () => void;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
}

export const ClassSessionsTable: React.FC<ClassSessionsTableProps> = ({
  classSessions,
  isLoading,
  canEdit,
  onEdit,
  onDelete,
  pagination,
}) => {
  const deleteSessionMutation = useDeleteClassSessionMutation();

  const totalPages = Math.ceil(pagination.totalItems / pagination.pageSize);

  const handleDelete = async (id: string) => {
    try {
      await deleteSessionMutation.mutateAsync(id);
      toast.success("Session de cours supprimée avec succès.");
      onDelete();
    } catch (error) {
      toast.error("Impossible de supprimer la session de cours. Veuillez réessayer.");
      console.error("Erreur lors de la suppression de la session de cours:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Cours</TableHead>
                <TableHead>Heure</TableHead>
                <TableHead>Professeur</TableHead>
                <TableHead>Délégué</TableHead>
                <TableHead>Année académique</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (classSessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">Aucune session de cours trouvée.</p>
        <p className="text-xs text-muted-foreground mt-1">Commencez par programmer une nouvelle session de cours.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Cours</TableHead>
              <TableHead>Heure</TableHead>
              <TableHead>Professeur</TableHead>
              <TableHead>Délégué</TableHead>
              <TableHead>Année académique</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classSessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>{format(new Date(session.date), "dd MMM yyyy", { locale: fr })}</TableCell>
                <TableCell className="font-medium">{session.course?.title || "N/A"}</TableCell>
                <TableCell>
                  {session.heureDebut} - {session.heureFin}
                </TableCell>
                <TableCell>{session.professor?.name || "N/A"}</TableCell>
                <TableCell>{session.classRepresentative?.name || "N/A"}</TableCell>
                <TableCell>{session.academicYear?.periode || "N/A"}</TableCell>
                <TableCell>
                  {canEdit && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <RiMoreFill size={16} />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(session)}>
                          <RiEditLine className="mr-2" size={16} />
                          Modifier
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                              <RiDeleteBin5Line className="mr-2" size={16} />
                              Supprimer
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action ne peut pas être annulée. Cette session de cours sera définitivement supprimée.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(session.id)}>Confirmer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => pagination.currentPage > 1 && pagination.onPageChange(pagination.currentPage - 1)}
                className={pagination.currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              // Show first page, current page, last page, and one page before and after current page
              if (page === 1 || page === totalPages || (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink isActive={page === pagination.currentPage} onClick={() => pagination.onPageChange(page)}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              // Show ellipsis for skipped pages, but only once
              else if (
                (page === 2 && pagination.currentPage > 3) ||
                (page === totalPages - 1 && pagination.currentPage < totalPages - 2)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => pagination.currentPage < totalPages && pagination.onPageChange(pagination.currentPage + 1)}
                className={pagination.currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
