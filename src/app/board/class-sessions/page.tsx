"use client";

import { CalendarProvider } from "@/components/calendar-context";
import CourseCalendar from "@/components/calendar/course-calendar";
import { useClassSessionsQuery } from "@/hooks/queries/use-class-session.query";
import { RiCalendarLine } from "@remixicon/react";
import { useEffect, useState } from "react";
import { AddClassSessionDialog } from "./components/add-class-session.dialog";
import { useBreadcrumb } from "@/contexts/breadcrumb.context";
import { PageHeader } from "@/components/shared/page-header";

export default function ClassSessionsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { setPageTitle } = useBreadcrumb();
  // Récupération des sessions de cours
  const { data, isLoading, refetch } = useClassSessionsQuery();

  // Rafraîchir les données
  const refetchCurrentTab = () => {
    refetch();
  };

  // Calculer les données paginées
  const classSessions = Array.isArray(data) ? data : [];

  useEffect(() => {
    setPageTitle("Sessions de cours");
  }, [setPageTitle]);


  return (
    <div>
      <PageHeader
        icon={<RiCalendarLine className="text-primary" />}
        title={"Gestion des sessions de cours"}
        subtitle={"Visualisez et gérez les sessions de cours."}
        action={{
          label: "Nouvelle session",
          onClick: () => setIsAddDialogOpen(true),
        }}
      />
      <div className="container mx-auto py-10">
        {/* Replace Tabs and custom calendar with BigCalendar */}
        <div className="w-full">
          <CalendarProvider>
            <CourseCalendar classSessions={classSessions} isLoading={isLoading} />
          </CalendarProvider>
        </div>
        {/* Dialog d'ajout de session de cours */}
        <AddClassSessionDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={refetchCurrentTab} />
      </div>
    </div>
  );
}
