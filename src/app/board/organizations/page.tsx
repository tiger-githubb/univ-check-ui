"use client";

import { PiBuildingsDuotone } from "react-icons/pi";
import { EditOrganizationDialog } from "./components/edit-organizations.dialog";
import { useOrganizationsQuery } from "@/hooks/queries/use-organizations.query";
import { Organization } from "@/types/organization.types";
import { useEffect, useState } from "react";
import { AddOrganizationDialog } from "./components/add-organization.dialog";
import { OrganizationsTable } from "./components/organizations.table";
import { useBreadcrumb } from "@/contexts/breadcrumb.context";
import { PageHeader } from "@/components/shared/page-header";

export default function AcademicYearsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<Organization | null>(null);

  const { setPageTitle } = useBreadcrumb();
  const { data: organizations, isLoading, refetch } = useOrganizationsQuery();

  const isAdmin = true;

  useEffect(() => {
    setPageTitle("Organisations");
  }, [setPageTitle]);

  return (
    <div>
      <PageHeader
        icon={<PiBuildingsDuotone className="text-primary" />}
        title={"Gestion des organisations"}
        subtitle={"Gérez les organisations de votre institution."}
        action={{
          label: "Nouvelle organisation",
          onClick: () => setIsAddDialogOpen(true),
        }}
      />
      <div className="container mx-auto py-10">

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <OrganizationsTable
            organizations={organizations || []}
            isLoading={isLoading}
            isAdmin={isAdmin}
            onEdit={(org) => setEditingYear(org)}
            onDelete={() => refetch()}
          />
        </div>
      </div>

      {/* Add Organization Dialog */}
      <AddOrganizationDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={() => refetch()} />

      {/* Edit Organization Dialog */}
      <EditOrganizationDialog
        isOpen={!!editingYear}
        onOpenChange={(open) => !open && setEditingYear(null)}
        organization={editingYear}
      />
    </div>
  );
}
