"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmargementsQuery } from "@/hooks/queries/use-attendance.query";
import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import { RiAdminLine, RiCalendarLine, RiFileListLine, RiUserSearchLine } from "@remixicon/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { AdvancedFilter } from "./components/advanced-filter";
import { AttendanceAnalytics } from "./components/attendance-analytics";
import { AttendanceList } from "./components/attendance-list";
import { AttendanceStats } from "./components/attendance-stats";
import { BatchOperations } from "./components/batch-operations";
import { DepartmentAttendance } from "./components/department-attendance";
import { ProfessorAttendanceReport } from "./components/professor-attendance-report";
import { SupervisorValidation } from "./components/supervisor-validation";
import { useBreadcrumb } from "@/contexts/breadcrumb.context";
import { PageHeader } from "@/components/shared/page-header";

export default function AttendanceAdminPage() {
  const { data: user } = useCurrentUser();
  const isAdmin = user?.user?.role === "ADMIN";
  const { setPageTitle } = useBreadcrumb();
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

  // Rafraîchir les données selon l'onglet actif
  const refetchCurrentTab = (activeTab: string) => {
    if (activeTab === "emargements") {
      refetchEmargements();
    }
  };

  useEffect(() => {
    setPageTitle("Emargements");
  }, [setPageTitle]);

  return (
    <div>
      <PageHeader
        icon={<RiAdminLine className="text-primary" />}
        title={"Gestion des émargements"}
        subtitle={"Suivez et gérez les présences des professeurs aux cours."}
      />
      <div className="container mx-auto py-10">
        {isAdmin ? (
          <Tabs defaultValue="emargements" className="w-full" onValueChange={(value) => refetchCurrentTab(value)}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="emargements" className="flex items-center gap-2">
                  <RiFileListLine size={18} />
                  <span>Émargements</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <RiUserSearchLine size={18} />
                  <span>Statistiques</span>
                </TabsTrigger>
                <TabsTrigger value="export" className="flex items-center gap-2">
                  <RiCalendarLine size={18} />
                  <span>Exporter</span>
                </TabsTrigger>
              </TabsList>
              <Button
                variant="outline"
                onClick={() =>
                  refetchCurrentTab(document.querySelector('[aria-selected="true"]')?.getAttribute("value") ?? "emargements")
                }
              >
                Actualiser
              </Button>
            </div>{" "}
            <TabsContent value="emargements" className="mt-0">
              {/* <NotificationSystem
                emargements={emargementsData?.emargements || []}
                onRefresh={() => refetchEmargements()}
                refreshInterval={60000}
                filters={filters}
              /> */}
              
              <AdvancedFilter
                onFilterChange={(newFilters) => {
                  setFilters(newFilters);
                  setCurrentPage(1); // Réinitialiser la page lors d'un nouveau filtrage
                }}
                onRefresh={() => refetchEmargements()}
              />{" "}
              <AttendanceList
                emargements={emargementsData?.emargements || []}
                isLoading={isEmargementsLoading}
                onRefresh={() => refetchEmargements()}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                totalItems={emargementsData?.total ?? 0}
              />
              
            </TabsContent>
            <TabsContent value="stats" className="mt-0">
              {/* Ajout du composant de statistiques */}{" "}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Récapitulatif de présence</h3>
                <AttendanceStats emargements={emargementsData?.emargements || []} isLoading={isEmargementsLoading} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Composant d'analyse des tendances */}
                <AttendanceAnalytics emargements={emargementsData?.emargements || []} isLoading={isEmargementsLoading} />

                {/* Composant d'analyse par département */}
                <DepartmentAttendance emargements={emargementsData?.emargements || []} isLoading={isEmargementsLoading} />
              </div>
              {/* Nouveaux composants pour la gestion des émargements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Validation par les superviseurs */}
                <SupervisorValidation
                  emargements={emargementsData?.emargements || []}
                  isLoading={isEmargementsLoading}
                  onRefresh={() => refetchEmargements()}
                />

                {/* Opérations par lot */}
                <BatchOperations
                  emargements={emargementsData?.emargements || []}
                  isLoading={isEmargementsLoading}
                  onRefresh={() => refetchEmargements()}
                />
              </div>
            </TabsContent>
            <TabsContent value="export" className="mt-0">
              {/* Rapport de présence par professeur */}
              <div className="mt-8">
                <ProfessorAttendanceReport emargements={emargementsData?.emargements || []} isLoading={isEmargementsLoading} />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        )}
      </div>
    </div>
  );
}
