import React from "react";
import { Department } from "@/types/departments.types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { RiEdit2Line, RiDeleteBinLine } from "@remixicon/react";

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
      </Table>
      <Pagination
        currentPage={page} // Remplacez `page` par `currentPage` pour correspondre à l'interface PaginationProps
        totalItems={total}
        itemsPerPage={limit}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default DepartmentsTable;
