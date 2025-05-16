import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Department } from "@/types/departments.types";
import { RiDeleteBinLine, RiEdit2Line } from "@remixicon/react";
import React from "react";

interface DepartmentsTableProps {
  departments: Department[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onEdit: (department: Department) => void;
  onDelete: (departmentId: string) => void;
}

const DepartmentsTable: React.FC<DepartmentsTableProps> = ({
  departments,
  isLoading,
  page,
  limit,
  total,
  onPageChange,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return <div>Chargement des départements...</div>;
  }

  if (departments.length === 0) {
    return <div>Aucun département trouvé.</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Université</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((department) => (
            <TableRow key={department.id}>
              <TableCell>{department.name}</TableCell>
              <TableCell>{department.university.name}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(department)} className="flex items-center gap-1">
                    <RiEdit2Line size={16} />
                    Modifier
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(department.id)} className="flex items-center gap-1">
                    <RiDeleteBinLine size={16} />
                    Supprimer
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>{" "}
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => page > 1 && onPageChange(page - 1)}
              className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {[...Array(Math.ceil(total / limit))].map((_, i) => {
            const pageNumber = i + 1;
            // Afficher la première page, la page courante, la dernière page, et une page avant et après la page courante
            if (pageNumber === 1 || pageNumber === Math.ceil(total / limit) || (pageNumber >= page - 1 && pageNumber <= page + 1)) {
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink isActive={pageNumber === page} onClick={() => onPageChange(pageNumber)}>
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            }
            return null;
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => page < Math.ceil(total / limit) && onPageChange(page + 1)}
              className={page >= Math.ceil(total / limit) ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default DepartmentsTable;
