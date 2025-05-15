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
import { useState } from "react";
import AddDepartmentDialog from "./components/add-departments.dialog";
import { EditDepartmentDialog } from "./components/edit-departments.dialog";
import DepartmentsTable from "./components/departments.table";

export default function DepartmentsPage() {
  const [page, setPage] = useState(1);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const { data, isLoading, refetch } = useDepartmentsQuery(page, 10);
  const departments = data?.departments || [];
  const total = data?.total || 0;
  const limit = data?.limit || 10;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden px-4 md:px-6 lg:px-8">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger className="-ms-4" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/board">
                    <RiBuildingLine size={22} aria-hidden="true" />
                    <span className="sr-only">Dashboard</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Départements</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex gap-3 ml-auto">
            <FeedbackDialog />
            <ModeToggle />
            <UserDropdown />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-4 lg:py-6">
          {/* Page intro */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                <RiBuildingLine className="text-primary" />
                Départements
              </h1>
              <p className="text-sm text-muted-foreground">Gérez les départements de votre institution.</p>
            </div>
            <AddDepartmentDialog onSuccess={refetch} />
          </div>
          <DepartmentsTable
            departments={departments}
            isLoading={isLoading}
            page={page}
            limit={limit}
            total={total}
            onPageChange={setPage}
            onEdit={(department) => setEditingDepartment(department)}
            onDelete={() => refetch()}
          />
        </div>
      </SidebarInset>
      <EditDepartmentDialog
        department={editingDepartment}
        open={!!editingDepartment}
        onOpenChange={(open) => !open && setEditingDepartment(null)}
        onSuccess={() => {
          setEditingDepartment(null);
          refetch();
        }}
      />
    </SidebarProvider>
  );
}
