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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClassSessionsQuery, useEmargementsQuery } from "@/hooks/queries/use-attendance.query";
import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import { ClassSessionResponse } from "@/types/attendance.types";
import { RiAdminLine, RiFileListLine, RiScanLine, RiUserSearchLine } from "@remixicon/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { AdvancedFilter } from "./components/advanced-filter";
import { AttendanceList } from "./components/attendance-list";
import { NotificationSystem } from "./components/notification-system";
import { SessionsList } from "./components/sessions-list";

export default function AttendanceAdminPage() {
  const { data: user } = useCurrentUser();
  const isAdmin = user?.user?.role === "ADMIN";
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({});

  // Si l'utilisateur n'est pas administrateur, rediriger vers le tableau de bord
  if (user && !isAdmin) {
    redirect("/board");
  } // Requêtes pour les émargements et les sessions de cours
  const {
    data: emargementsData,
    isLoading: isEmargementsLoading,
    refetch: refetchEmargements,
  } = useEmargementsQuery(currentPage, pageSize, filters);

  const { data: sessionsData, isLoading: isSessionsLoading, refetch: refetchSessions } = useClassSessionsQuery();

  // Rafraîchir les données selon l'onglet actif
  const refetchCurrentTab = (activeTab: string) => {
    if (activeTab === "emargements") {
      refetchEmargements();
    } else {
      refetchSessions();
    }
  };

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
                  <BreadcrumbPage>Administration des émargements</BreadcrumbPage>
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
                <RiAdminLine className="text-primary" />
                Gestion des émargements
              </h1>
              <p className="text-sm text-muted-foreground">Suivez et gérez les présences des professeurs aux cours.</p>
            </div>
          </div>

          {isAdmin ? (
            <Tabs defaultValue="emargements" className="w-full" onValueChange={(value) => refetchCurrentTab(value)}>
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="emargements" className="flex items-center gap-2">
                    <RiFileListLine size={18} />
                    <span>Émargements</span>
                  </TabsTrigger>
                  <TabsTrigger value="sessions" className="flex items-center gap-2">
                    <RiUserSearchLine size={18} />
                    <span>Sessions de cours</span>
                  </TabsTrigger>
                </TabsList>
                <Button
                  variant="outline"
                  onClick={() =>
                    refetchCurrentTab(document.querySelector('[aria-selected="true"]')?.getAttribute("value") || "emargements")
                  }
                >
                  Actualiser
                </Button>
              </div>{" "}
              <TabsContent value="emargements" className="mt-0">
                <NotificationSystem
                  emargements={emargementsData?.emargements || []}
                  onRefresh={() => refetchEmargements()}
                  refreshInterval={60000}
                  filters={filters}
                />

                <AdvancedFilter
                  onFilterChange={(newFilters) => {
                    setFilters(newFilters);
                    setCurrentPage(1); // Réinitialiser la page lors d'un nouveau filtrage
                  }}
                  onRefresh={() => refetchEmargements()}
                />

                <AttendanceList
                  emargements={emargementsData?.emargements || []}
                  isLoading={isEmargementsLoading}
                  onRefresh={() => refetchEmargements()}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                  totalItems={emargementsData?.total || 0}
                />
              </TabsContent>{" "}
              <TabsContent value="sessions" className="mt-0">
                <SessionsList
                  sessions={(sessionsData as ClassSessionResponse)?.classSessions || []}
                  isLoading={isSessionsLoading}
                  totalItems={(sessionsData as ClassSessionResponse)?.total || 0}
                  onRefresh={() => refetchSessions()}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
