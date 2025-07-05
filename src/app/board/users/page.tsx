"use client";

import { useUsersQuery } from "@/hooks/queries/use-user.query";
import { User } from "@/types/user.types";
import { RiUserLine } from "@remixicon/react";
import { useEffect, useState } from "react";
import { EditUserDialog } from "./components/edit-user.dialog";
import UsersTable from "./components/users.table";
import { useBreadcrumb } from "@/contexts/breadcrumb.context";
import { PageHeader } from "@/components/shared/page-header";
import AddUserDialog from "./components/add-user.dialog";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { setPageTitle } = useBreadcrumb();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { data, isLoading, refetch } = useUsersQuery(page, 10);
  const users = data?.users || [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 10;

  useEffect(() => {
    setPageTitle("Utilisateurs");
  }, [setPageTitle]);

  return (
    <div>
      <PageHeader
        icon={<RiUserLine className="text-primary" />}
        title={"Gestion des utilisateurs"}
        subtitle={"Gérez les utilisateurs de votre institution."}
        action={{
          label: "Nouvel utilisateur",
          onClick: () => setIsAddDialogOpen(true),
        }}
      />
      <div className="container mx-auto py-10">
        <UsersTable
          users={users}
          isLoading={isLoading}
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onEdit={(user) => setEditingUser(user)}
          onDelete={() => refetch()}
        />
      </div>

      <AddUserDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={refetch} />

      <EditUserDialog
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        onSuccess={() => {
          setEditingUser(null);
          refetch();
        }}
      />
    </div>
  );
}
