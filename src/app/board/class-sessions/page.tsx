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
import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import { useClassSessionsQuery } from "@/hooks/queries/use-class-session.query";
import { ClassSession } from "@/types/attendance.types";
import { RiCalendarCheckLine, RiCalendarLine, RiScanLine } from "@remixicon/react";
import { useState } from "react";
import { AddClassSessionDialog } from "./components/add-class-session.dialog";
import { ClassSessionsCalendar } from "./components/class-sessions-calendar";
import { ClassSessionsTable } from "./components/class-sessions.table";

export default function ClassSessionsPage() {
  const { data: user } = useCurrentUser();
  const [activeTab, setActiveTab] = useState("calendar");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // État de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Récupération des sessions de cours
  const { data, isLoading, refetch } = useClassSessionsQuery();

  // Vérification des droits d'administration
  const isAdmin = user?.user?.role === "ADMIN";

  // Rafraîchir les données selon l'onglet actif
  const refetchCurrentTab = () => {
    refetch();
  };

  // Gérer l'édition d'une session
  const handleEditSession = (session: ClassSession) => {
    // À implémenter selon les besoins
    console.log("Éditer la session:", session);
  };

  // Calculer les données paginées
  const classSessions = (data as any)?.classSessions || [];
  const totalItems = classSessions.length;

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
                  <BreadcrumbPage>Sessions de cours</BreadcrumbPage>
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
            <div className="items-center gap-2">
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                <RiCalendarLine className="text-primary" />
                Sessions de cours
              </h1>
              <p className="text-sm text-muted-foreground">Visualisez et gérez les sessions de cours.</p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>Ajouter une session</Button>
          </div>

          <Tabs
            defaultValue="calendar"
            className="w-full"
            onValueChange={(value) => {
              setActiveTab(value);
              refetchCurrentTab();
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <RiCalendarLine size={18} />
                  <span>Calendrier</span>
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <RiCalendarCheckLine size={18} />
                  <span>Liste</span>
                </TabsTrigger>
              </TabsList>
              <Button variant="outline" onClick={refetchCurrentTab}>
                Actualiser
              </Button>
            </div>

            <TabsContent value="calendar" className="mt-0">
              <ClassSessionsCalendar
                classSessions={classSessions}
                isLoading={isLoading}
                canEdit={isAdmin || user?.user?.role === "TEACHER"}
                onRefresh={refetchCurrentTab}
              />
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              <ClassSessionsTable
                classSessions={classSessions}
                isLoading={isLoading}
                canEdit={isAdmin || user?.user?.role === "TEACHER"}
                onEdit={handleEditSession}
                onDelete={refetchCurrentTab}
                pagination={{
                  currentPage,
                  pageSize,
                  totalItems,
                  onPageChange: setCurrentPage,
                }}
              />
            </TabsContent>
          </Tabs>

          {/* Dialog d'ajout de session de cours */}
          <AddClassSessionDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={refetchCurrentTab} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
