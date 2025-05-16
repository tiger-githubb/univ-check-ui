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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import { useUniversitiesQuery } from "@/hooks/queries/use-universities.query";
import { University } from "@/types/university.types";
import { RiBuilding2Line, RiScanLine } from "@remixicon/react";
import { useState } from "react";
import { AddUniversityDialog } from "./components/add-university.dialog";
import { EditUniversityDialog } from "./components/edit-university.dialog";
import { UniversitiesTable } from "./components/universities.table";

export default function UniversitiesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);

  const { data: user } = useCurrentUser();
  const { data: universities, isLoading, refetch } = useUniversitiesQuery();

  const isAdmin = user?.user?.role === "ADMIN";

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
                    <RiScanLine size={22} aria-hidden="true" />
                    <span className="sr-only">Dashboard</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Universités</BreadcrumbPage>
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
                <RiBuilding2Line className="text-primary" />
                Universités
              </h1>
              <p className="text-sm text-muted-foreground">Gérez les universités de votre institution.</p>
            </div>
            {isAdmin && <Button onClick={() => setIsAddDialogOpen(true)}>Ajouter</Button>}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <UniversitiesTable
              universities={universities || []}
              isLoading={isLoading}
              isAdmin={isAdmin}
              onEdit={(university) => setEditingUniversity(university)}
              onDelete={() => refetch()}
            />
          </div>
        </div>
      </SidebarInset>

      {/* Add University Dialog */}
      <AddUniversityDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={() => refetch()} />

      {/* Edit University Dialog */}
      <EditUniversityDialog
        isOpen={!!editingUniversity}
        onOpenChange={(open) => !open && setEditingUniversity(null)}
        university={editingUniversity}
      />
    </SidebarProvider>
  );
}
