import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { University } from "@/types/university.types";
import { formatDate } from "@/lib/utils";
import { useDeleteUniversityMutation } from "@/hooks/queries/use-universities.query";
import { RiDeleteBinLine, RiEdit2Line } from "@remixicon/react";
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

interface UniversitiesTableProps {
  universities: University[];
  isLoading: boolean;
  isAdmin: boolean;
  onEdit: (university: University) => void;
  onDelete: () => void;
}

export function UniversitiesTable({ universities, isLoading, isAdmin, onEdit, onDelete }: Readonly<UniversitiesTableProps>) {
  const { mutate: deleteUniversity } = useDeleteUniversityMutation();

  const handleDelete = async (id: string) => {
    deleteUniversity(id, {
      onSuccess: () => {
        onDelete();
      },
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Organisation</TableHead>
          <TableHead>Responsable</TableHead>
          <TableHead>Créé le</TableHead>
          <TableHead>Mise à jour</TableHead>
          {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {!isLoading &&
          universities.map((university) => (
            <TableRow key={university.id}>
              <TableCell className="font-medium">{university.name}</TableCell>
              <TableCell>{university.organisation?.name ?? "-"}</TableCell>
              <TableCell>{university.responsable?.name ?? "-"}</TableCell>
              <TableCell>{formatDate(university.createdAt)}</TableCell>
              <TableCell>{formatDate(university.updatedAt)}</TableCell>
              {isAdmin && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(university)}
                    >
                      <RiEdit2Line className="h-4 w-4" />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-destructive">
                          <RiDeleteBinLine className="h-4 w-4" />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Cette université sera définitivement supprimée.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(university.id)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
