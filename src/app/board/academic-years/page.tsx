"use client";

import { useAcademicYearsQuery } from "@/hooks/queries/use-academic-year.query";
import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import { AcademicYear } from "@/types/academic-year.types";
import { RiCalendarLine } from "@remixicon/react";
import { useEffect, useState } from "react";
import { AcademicYearsTable } from "./components/academic-years.table";
import { AddAcademicYearDialog } from "./components/add-academic-year.dialog";
import { EditAcademicYearDialog } from "./components/edit-academic-year.dialog";
import { useBreadcrumb } from "@/contexts/breadcrumb.context";
import { PageHeader } from "@/components/shared/page-header";

export default function AcademicYearsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { setPageTitle } = useBreadcrumb();
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

  const { data: user } = useCurrentUser();
  const { data: academicYears, isLoading, refetch } = useAcademicYearsQuery();

  const isAdmin = user?.user?.role === "ADMIN";

  useEffect(() => {
      setPageTitle("Années Académiques");
    }, [setPageTitle]);

     
  return (
    <div>
      <PageHeader
          icon={<RiCalendarLine className="text-primary" />}
            title={"Gestion des Années Académiques"}
            subtitle={"Gérez les années académiques de votre institution."}
            action={{
              label: "Nouvelle année",
              onClick: () => setIsAddDialogOpen(true),
            }}
          />
          
      <div className="container mx-auto py-10">

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <AcademicYearsTable
              academicYears={academicYears || []}
              isLoading={isLoading}
              isAdmin={isAdmin}
              onEdit={(year) => setEditingYear(year)}
              onDelete={() => refetch()}
            />
          </div>
        </div>

      {/* Add Academic Year Dialog */}
      <AddAcademicYearDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={() => refetch()} />

      {/* Edit Academic Year Dialog */}
      <EditAcademicYearDialog
        isOpen={!!editingYear}
        onOpenChange={(open) => !open && setEditingYear(null)}
        academicYear={editingYear}
      />
    </div>
  );
}
