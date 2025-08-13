"use client";

import { PageHeader } from "@/components/shared/page-header";
import { useBreadcrumb } from "@/contexts/breadcrumb.context";
import { useDepartmentsQuery } from "@/hooks/queries/use-departments.query";
import { Department } from "@/types/departments.types";
import { RiBuildingLine } from "@remixicon/react";
import { useEffect, useState } from "react";
import AddDepartmentDialog from "./components/add-departments.dialog";
import { DepartmentsTable } from "./components/departments.table";
import { EditDepartmentDialog } from "./components/edit-departments.dialog";

export default function DepartmentsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [page] = useState(1);
  const { setPageTitle } = useBreadcrumb();
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const { data, isLoading, refetch } = useDepartmentsQuery(page, 10);
  const departments = data?.departments || [];
  const isAdmin = true;

  useEffect(() => {
    setPageTitle("Organisations");
  }, [setPageTitle]);

  return (
    <div>
      <PageHeader
        icon={<RiBuildingLine className="text-primary" />}
        title={"Gestion des départements"}
        subtitle={"Gérez les départements de votre institution."}
        action={{
          label: "Nouveau département",
          onClick: () => setIsAddDialogOpen(true),
        }}
      />
      <div className="container mx-auto py-10">
        <DepartmentsTable
          departments={departments || []}
          isLoading={isLoading}
          isAdmin={isAdmin}
          onEdit={(department) => setEditingDepartment(department)}
          onDelete={() => refetch()}
        />
      </div>

      {/* Add Program Dialog */}
      <AddDepartmentDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={refetch} />

      {/* Edit Program Dialog */}
      <EditDepartmentDialog
        department={editingDepartment}
        open={!!editingDepartment}
        onOpenChange={(open) => !open && setEditingDepartment(null)}
        onSuccess={() => {
          setEditingDepartment(null);
          refetch();
        }}
      />
    </div>
  );
}
