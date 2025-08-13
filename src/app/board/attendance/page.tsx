"use client";

import { CalendarProvider } from "@/components/calendar-context";
import AttendanceCalendar from "@/components/calendar/attendance-calendar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBreadcrumb } from "@/contexts/breadcrumb.context";
import { useClassSessionsQuery } from "@/hooks/queries/use-class-session.query";
import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import { RiCalendar2Line, RiCheckboxLine } from "@remixicon/react";
import { endOfWeek, startOfWeek } from "date-fns";
import { useEffect } from "react";
import { TodaysCoursesList } from "./components/todays-courses-list";

export default function AttendancePage() {
  const { data: user } = useCurrentUser();
  const { setPageTitle } = useBreadcrumb();
  const userId = user?.user?.id;
  const isProfessor = user?.user?.role === "TEACHER";

  // État pour la semaine sélectionnée
  const selectedWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const selectedWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  // Utiliser le même hook que la page Sessions de cours qui fonctionne
  const {
    data: classSessionsData,
    isLoading: isSessionsLoading,
    refetch: refetchClassSessions,
  } = useClassSessionsQuery();

  // Récupération normalisée des sessions
  const allClassSessions = classSessionsData?.classSessions || [];

  // Sessions du professeur pour le calendrier de la semaine
  const professorWeekSessions = allClassSessions.filter((session) => {
    if (!isProfessor || !userId) return false;
    const sessionDate = new Date(session.date);
    const isInWeek = sessionDate >= selectedWeekStart && sessionDate <= selectedWeekEnd;
    const isProfessorSession = session.professor?.id === userId;
    return isInWeek && isProfessorSession;
  });

  // Cours du jour pour la liste (transformer les sessions en cours)
  const today = new Date().toISOString().split("T")[0];
  const todaysCourses = allClassSessions
    .filter((session) => {
      if (!isProfessor || !userId) return false;
      return session.date === today && session.professor?.id === userId;
    })
    .map((session) => ({
      id: session.id,
      title:
        (session.course && (session.course as { title?: string }).title) ||
        (session.course && (session.course as { name?: string }).name) ||
        "Sans titre",
      startTime: session.heureDebut,
      endTime: session.heureFin,
      location: ((session.course as { location?: string })?.location) || "Non spécifié",
      hasAttendance: false,
    }));

  useEffect(() => {
    setPageTitle("Émargement des cours");
  }, [setPageTitle]);

  return (
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
        <Tabs defaultValue="today" className="w-full">
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
            <Button variant="outline" onClick={() => refetchClassSessions()}>
              Actualiser
            </Button>
          </div>
          <TabsContent value="today" className="mt-0">
            <TodaysCoursesList
              courses={todaysCourses || []}
              isLoading={isSessionsLoading}
              onAttendanceSubmitted={() => refetchClassSessions()}
            />
          </TabsContent>
          <TabsContent value="week" className="mt-0">
            <CalendarProvider>
              <AttendanceCalendar
                classSessions={professorWeekSessions || []}
                isLoading={isSessionsLoading}
                onAttendanceSubmitted={() => refetchClassSessions()}
              />
            </CalendarProvider>
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
  );
}
