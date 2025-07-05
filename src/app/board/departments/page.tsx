"use client";

import { AppSidebar } from "@/components/shared/navigation/app.sidebar";
import UserDropdown from "@/components/shared/navigation/user.dropdown";
import FeedbackDialog from "@/components/shared/others/feedback.dialog";
import { ModeToggle } from "@/components/shared/theme/mode-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useDepartmentsQuery } from "@/hooks/queries/use-departments.query";
import { Department } from "@/types/departments.types";
import { RiBuildingLine } from "@remixicon/react";
import { useEffect, useState } from "react";
import AddDepartmentDialog from "./components/add-departments.dialog";
import { EditDepartmentDialog } from "./components/edit-departments.dialog";
import { useBreadcrumb } from "@/contexts/breadcrumb.context";
import { PageHeader } from "@/components/shared/page-header";
import { DepartmentsTable } from "./components/departments.table";

export default function DepartmentsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
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
