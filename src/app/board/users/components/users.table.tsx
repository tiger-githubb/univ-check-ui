"use client";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDeleteUserMutation } from "@/hooks/queries/use-user.query";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/auth.types";
import { User } from "@/types/user.types";
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiCloseCircleLine,
  RiDeleteBinLine,
  RiErrorWarningLine,
  RiFilter3Line,
  RiMoreLine,
  RiSearch2Line,
} from "@remixicon/react";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useId, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const roleFilterFn: FilterFn<User> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true;
  const role = row.getValue(columnId) as string;
  return filterValue.includes(role);
};

export default function UsersTable({ users, isLoading, page, limit, total, onPageChange, onEdit }: UsersTableProps) {
  const id = useId();
  const { mutate: deleteUser } = useDeleteUserMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "name",
      desc: false,
    },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize: limit,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const totalPages = Math.ceil(total / limit);

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Sélectionner tout"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Sélectionner la ligne"
          />
        ),
        size: 28,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: "Nom",
        cell: ({ row }) => {
          const name = row.getValue("name") as string;
          // On s'assure que l'email existe dans les données de l'utilisateur
          const email = row.original.email || "";
          return (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-accent text-muted-foreground text-xs">{getInitials(name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="font-medium">{name}</div>
                <div className="text-xs text-muted-foreground">{email}</div>
              </div>
            </div>
          );
        },
        size: 220,
        enableHiding: false,
      },
      {
        accessorKey: "phone",
        header: "Téléphone",
        cell: (info) => <span className="text-muted-foreground">{(info.getValue() as string) || "—"}</span>,
        size: 150,
      },
      {
        accessorKey: "role",
        header: "Rôle",
        cell: ({ row }) => {
          const role = row.getValue("role") as UserRole;
          return (
            <div className="flex items-center h-full">
              <Badge
                variant={role === "ADMIN" ? "default" : "outline"}
                className={cn(
                  "gap-1.5 py-1 px-2.5 text-xs font-medium",
                  role === "ADMIN"
                    ? "bg-primary/80 hover:bg-primary text-primary-foreground"
                    : role === "TEACHER"
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                    : "bg-sky-500/10 text-sky-500 border-sky-500/20 hover:bg-sky-500/20"
                )}
              >
                {role === "ADMIN"}
                {role === "TEACHER"}
                {role}
              </Badge>
            </div>
          );
        },
        size: 110,
        filterFn: roleFilterFn,
      },
      {
        accessorKey: "createdAt",
        header: "Créé le",
        cell: (info) => (
          <span className="text-muted-foreground">
            {info.getValue() ? new Date(info.getValue() as string).toLocaleDateString() : ""}
          </span>
        ),
        size: 120,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <RowActions
            user={row.original}
            onEdit={onEdit}
            onDelete={(id) => handleDelete(id)}
            isDeleting={deletingId === row.original.id}
          />
        ),
        size: 60,
        enableHiding: false,
      },
    ],
    [deletingId, onEdit]
  );

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      pagination,
      columnFilters,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getRowId: (row, index) => row.id ?? `row-${index}`,
  });

  // Variables calculées
  const roleColumn = table.getColumn("role");
  const roleFacetedValues = roleColumn?.getFacetedUniqueValues();
  const roleFilterValue = roleColumn?.getFilterValue();

  const uniqueRoleValues = useMemo(() => {
    if (!roleColumn) return [];
    const values = Array.from(roleFacetedValues?.keys() ?? []);
    return values.sort();
  }, [roleColumn, roleFacetedValues]);

  const roleCounts = useMemo(() => {
    if (!roleColumn) return new Map();
    return roleFacetedValues ?? new Map();
  }, [roleColumn, roleFacetedValues]);

  const selectedRoles = useMemo(() => {
    return (roleFilterValue as string[]) ?? [];
  }, [roleFilterValue]);

  const handleRoleChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("role")?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table.getColumn("role")?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    // la suppression est gérée dans le composant RowActions
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Table className="table-fixed border-separate border-spacing-0">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column, i) => (
                <TableHead
                  key={i}
                  style={{ width: `${column.size}px` }}
                  className="relative h-9 select-none bg-sidebar border-y border-border first:border-l first:rounded-l-lg last:border-r last:rounded-r-lg"
                >
                  {typeof column.header === "string" ? column.header : column.id || ""}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <tbody aria-hidden="true" className="table-row h-1"></tbody>
          <TableBody>
            <TableRow className="hover:bg-transparent [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
              {" "}
              <TableCell colSpan={columns.length} className="h-24">
                <div className="flex justify-center items-center gap-2">
                  <div className="h-4 w-4 rounded-full animate-pulse bg-muted"></div>
                  <div className="text-center">Chargement des utilisateurs...</div>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Côté gauche */}
        <div className="flex items-center gap-3">
          {/* Filtre par nom */}
          <div className="relative">
            <Input
              id={`${id}-input`}
              ref={inputRef}
              className={cn(
                "peer min-w-60 ps-9 bg-background bg-gradient-to-br from-accent/60 to-accent",
                Boolean(table.getColumn("name")?.getFilterValue()) && "pe-9"
              )}
              value={(table.getColumn("name")?.getFilterValue() ?? "") as string}
              onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
              placeholder="Rechercher par nom"
              type="text"
              aria-label="Rechercher par nom"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-muted-foreground/60 peer-disabled:opacity-50">
              <RiSearch2Line size={20} aria-hidden="true" />
            </div>
            {Boolean(table.getColumn("name")?.getFilterValue()) && (
              <button
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/60 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Effacer le filtre"
                onClick={() => {
                  table.getColumn("name")?.setFilterValue("");
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
              >
                <RiCloseCircleLine size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        {/* Côté droit */}
        <div className="flex items-center gap-3">
          {/* Bouton de suppression */}
          {table.getSelectedRowModel().rows.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="ml-auto" variant="outline">
                  <RiDeleteBinLine className="-ms-1 opacity-60" size={16} aria-hidden="true" />
                  Supprimer
                  <span className="-me-1 ms-1 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                    {table.getSelectedRowModel().rows.length}
                  </span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
                    aria-hidden="true"
                  >
                    <RiErrorWarningLine className="opacity-80" size={16} />
                  </div>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous vraiment sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Cela va supprimer définitivement {table.getSelectedRowModel().rows.length}{" "}
                      utilisateur(s) sélectionné(s).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      const selectedRows = table.getSelectedRowModel().rows;
                      selectedRows.forEach((row) => {
                        const userId = row.original.id;
                        if (userId) deleteUser(userId);
                      });
                      table.resetRowSelection();
                    }}
                    className="bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {/* Filtre par rôle */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <RiFilter3Line className="size-5 -ms-1.5 text-muted-foreground/60" size={20} aria-hidden="true" />
                Filtre
                {selectedRoles.length > 0 && (
                  <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                    {selectedRoles.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto min-w-36 p-3" align="end">
              <div className="space-y-3">
                <div className="text-xs font-medium uppercase text-muted-foreground/60">Rôle</div>
                <div className="space-y-3">
                  {" "}
                  {uniqueRoleValues.map((value, i) => (
                    <div key={value} className="flex items-center gap-2">
                      <Checkbox
                        id={`${id}-${i}`}
                        checked={selectedRoles.includes(value)}
                        onCheckedChange={(checked: boolean) => handleRoleChange(checked, value)}
                      />
                      <Label htmlFor={`${id}-${i}`} className="flex grow justify-between gap-2 font-normal">
                        {" "}
                        <Badge
                          variant={value === "ADMIN" ? "default" : "outline"}
                          className={cn(
                            "gap-1 py-0.5 px-1.5 text-xs font-medium",
                            value === "ADMIN"
                              ? "bg-primary/80 hover:bg-primary text-primary-foreground"
                              : value === "TEACHER"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                              : "bg-sky-500/10 text-sky-500 border-sky-500/20 hover:bg-sky-500/20"
                          )}
                        >
                          {value === "ADMIN"}
                          {value === "TEACHER"}
                          {value}
                        </Badge>
                        <span className="ms-2 text-xs text-muted-foreground">{roleCounts.get(value)}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Table */}
      <Table className="table-fixed border-separate border-spacing-0 [&_tr:not(:last-child)_td]:border-b">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{ width: `${header.column.columnDef.size}px` }}
                  className="relative h-9 select-none bg-sidebar border-y border-border first:border-l first:rounded-l-lg last:border-r last:rounded-r-lg"
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <div
                      className={cn(header.column.getCanSort() && "flex h-full cursor-pointer select-none items-center gap-2")}
                      onClick={header.column.getToggleSortingHandler()}
                      onKeyDown={(e) => {
                        if (header.column.getCanSort() && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          header.column.getToggleSortingHandler()?.(e);
                        }
                      }}
                      tabIndex={header.column.getCanSort() ? 0 : undefined}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <RiArrowUpSLine className="shrink-0 opacity-60" size={16} aria-hidden="true" />,
                        desc: <RiArrowDownSLine className="shrink-0 opacity-60" size={16} aria-hidden="true" />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <tbody aria-hidden="true" className="table-row h-1"></tbody>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="border-0 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg h-px hover:bg-accent/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="last:py-0 h-[inherit]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Aucun utilisateur trouvé.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <tbody aria-hidden="true" className="table-row h-1"></tbody>
      </Table>

      {/* Pagination */}
      {table.getRowModel().rows.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="flex-1 whitespace-nowrap text-sm text-muted-foreground" aria-live="polite">
            Page <span className="text-foreground">{page}</span> sur <span className="text-foreground">{totalPages}</span>
          </p>
          <Pagination className="w-auto">
            <PaginationContent className="gap-3">
              <PaginationItem>
                <Button
                  variant="outline"
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  onClick={() => page > 1 && onPageChange(page - 1)}
                  disabled={page === 1}
                  aria-label="Page précédente"
                >
                  Précédent
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  onClick={() => page < totalPages && onPageChange(page + 1)}
                  disabled={page === totalPages}
                  aria-label="Page suivante"
                >
                  Suivant
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

function RowActions({
  user,
  onEdit,
  onDelete,
  isDeleting,
}: {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const { mutate: deleteUser } = useDeleteUserMutation();

  const handleDelete = () => {
    if (user.id) {
      startUpdateTransition(() => {
        deleteUser(user.id!, {
          onSuccess: () => {
            onDelete(user.id!);
            setShowDeleteDialog(false);
            toast.success("Utilisateur supprimé avec succès !");
          },
          onError: (error) => {
            toast.error("Erreur lors de la suppression de l'utilisateur");
            console.error("Suppression d'utilisateur échouée:", error);
          },
        });
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex justify-end">
            <Button size="icon" variant="ghost" className="shadow-none text-muted-foreground/60" aria-label="Modifier l'utilisateur">
              <RiMoreLine className="size-5" size={20} aria-hidden="true" />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onEdit(user)} disabled={isUpdatePending}>
              Modifier l&apos;utilisateur
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            variant="destructive"
            className="dark:data-[variant=destructive]:focus:bg-destructive/10"
          >
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela va supprimer définitivement cet utilisateur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting || isUpdatePending}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting || isUpdatePending}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
