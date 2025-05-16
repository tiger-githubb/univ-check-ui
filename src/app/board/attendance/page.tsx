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
import { useProfessorTodaysCoursesQuery, useProfessorWeekCoursesQuery } from "@/hooks/queries/use-attendance.query";
import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import { RiCalendar2Line, RiCheckboxLine, RiScanLine } from "@remixicon/react";
import { format, startOfWeek } from "date-fns";
import { useState } from "react";
import { TodaysCoursesList } from "./components/todays-courses-list";
import { WeeklyCoursesCalendar } from "./components/weekly-courses-calendar";

export default function AttendancePage() {
  const { data: user } = useCurrentUser();
  const userId = user?.user?.id;
  const isProfessor = user?.user?.role === "TEACHER";

  // État pour la semaine sélectionnée
  const [selectedWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Formater la date pour la requête API
  const weekStartDateString = format(selectedWeekStart, "yyyy-MM-dd");

  // Requête pour les cours du jour
  const {
    data: todaysCourses,
    isLoading: isTodayLoading,
    refetch: refetchTodaysCourses,
  } = useProfessorTodaysCoursesQuery(userId || "");

  // Requête pour les cours de la semaine
  const {
    data: weekCourses,
    isLoading: isWeekLoading,
    refetch: refetchWeekCourses,
  } = useProfessorWeekCoursesQuery(userId || "", weekStartDateString);

  // Rafraîchir les données selon l'onglet actif
  const refetchCurrentTab = (activeTab: string) => {
    if (activeTab === "today") {
      refetchTodaysCourses();
    } else {
      refetchWeekCourses();
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
                  <BreadcrumbPage>Émargement</BreadcrumbPage>
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
                <RiCheckboxLine className="text-primary" />
                Émargement des cours
              </h1>
              <p className="text-sm text-muted-foreground">Émargez vos cours pour confirmer votre présence.</p>
            </div>
          </div>

          {isProfessor ? (
            <Tabs defaultValue="today" className="w-full" onValueChange={(value) => refetchCurrentTab(value)}>
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="today" className="flex items-center gap-2">
                    <RiCheckboxLine size={18} />
                    <span>Aujourd&apos;hui</span>
                  </TabsTrigger>
                  <TabsTrigger value="week" className="flex items-center gap-2">
                    <RiCalendar2Line size={18} />
                    <span>Calendrier</span>
                  </TabsTrigger>
                </TabsList>
                <Button
                  variant="outline"
                  onClick={() => refetchCurrentTab(document.querySelector('[aria-selected="true"]')?.getAttribute("value") || "today")}
                >
                  Actualiser
                </Button>
              </div>

              <TabsContent value="today" className="mt-0">
                <TodaysCoursesList
                  courses={todaysCourses || []}
                  isLoading={isTodayLoading}
                  onAttendanceSubmitted={() => refetchTodaysCourses()}
                />
              </TabsContent>

              <TabsContent value="week" className="mt-0">
                <WeeklyCoursesCalendar
                  courses={weekCourses || []}
                  isLoading={isWeekLoading}
                  onAttendanceSubmitted={() => refetchWeekCourses()}
                  weekStartDate={selectedWeekStart}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">
                Vous n&apos;êtes pas autorisé à accéder à cette page. Seuls les professeurs peuvent émarger.
              </p>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
