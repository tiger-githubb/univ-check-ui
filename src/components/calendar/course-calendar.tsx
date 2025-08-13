"use client";

import { useCalendarContext } from "@/components/calendar-context";
import { ClassSessionDialog } from "@/components/class-session-dialog";
import { EventCalendar } from "@/components/event-calendar";
import { CalendarEvent, EventColor } from "@/components/types";
import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import { useCreateClassSessionMutation, useUpdateClassSessionMutation } from "@/hooks/queries/use-class-session.query";
import { ClassSession } from "@/types/attendance.types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo, useOptimistic, useState } from "react";
import { PiSpinnerGap } from "react-icons/pi";
import { toast } from "sonner";

interface CourseCalendarProps {
  classSessions?: ClassSession[];
  isLoading?: boolean;
}

// Transform class session to calendar event with attendance info
const transformClassSessionToEvent = (classSession: ClassSession): CalendarEvent => {
  const sessionDate = new Date(classSession.date);
  const [startHour, startMinute] = classSession.heureDebut.split(":").map(Number);
  const [endHour, endMinute] = classSession.heureFin.split(":").map(Number);

  const start = new Date(sessionDate);
  start.setHours(startHour, startMinute, 0, 0);

  const end = new Date(sessionDate);
  end.setHours(endHour, endMinute, 0, 0);

  // Color coding based on session type and status
  let color: EventColor = "blue";

  // Check if session is in the past
  const now = new Date();
  const isPast = end < now;

  if (isPast) {
    // Past sessions - use different colors to indicate attendance status
    color = "emerald"; // Assume attended if in past
  } else {
    // Future sessions
    color = "blue";
  }

  // Special color for current user's sessions
  if (classSession.professor?.role === "TEACHER") {
    color = isPast ? "violet" : "orange";
  }

  return {
    id: classSession.id,
    title:
      (classSession.course && (classSession.course as { title?: string }).title) ||
      (classSession.course && (classSession.course as { name?: string }).name) ||
      "Session de cours",
    description: `Professeur: ${classSession.professor?.name || "À définir"}\nDélégué: ${
      classSession.classRepresentative?.name || "À définir"
    }\nAnnée académique: ${classSession.academicYear?.periode || "À définir"}\nHoraire: ${classSession.heureDebut} - ${
      classSession.heureFin
    }`,
    start,
    end,
    color,
    location: (classSession.course as { location?: string })?.location || "À définir",
    label:
      (classSession.course && (classSession.course as { title?: string }).title) ||
      (classSession.course && (classSession.course as { name?: string }).name) ||
      "Session de cours",
    meta: {
      courseId: classSession.course?.id,
      professorId: classSession.professor?.id,
      classRepresentativeId: classSession.classRepresentative?.id,
      academicYearId: classSession.academicYear?.id,
    },
  };
};

export default function CourseCalendar({ classSessions = [], isLoading = false }: Readonly<CourseCalendarProps>) {
  const { isColorVisible } = useCalendarContext();
  const { data: user } = useCurrentUser();
  const updateClassSessionMutation = useUpdateClassSessionMutation();
  const createClassSessionMutation = useCreateClassSessionMutation();

  // Filter class sessions based on user role
  const filteredClassSessions = useMemo(() => {
    if (!user?.user) return classSessions;

    const userRole = user.user.role;
    const userId = user.user.id;

    // Admins see all sessions
    if (userRole === "ADMIN") {
      return classSessions;
    }

    // Teachers see only their own sessions
    if (userRole === "TEACHER") {
      return classSessions.filter((session) => session.professor?.id === userId);
    }

    // Students see sessions where they are class representative or all sessions
    return classSessions;
  }, [classSessions, user]);

  // Determine if user can create sessions
  const canCreateSession = useMemo(() => {
    if (!user?.user) return false;

    const userRole = user.user.role;
    // Admins and supervisors can create sessions
    return userRole === "ADMIN" || userRole === "SUPERVISOR";
  }, [user]);

  // Use optimistic updates for class sessions
  const [optimisticClassSessions, updateOptimisticClassSessions] = useOptimistic(
    filteredClassSessions,
    (state: ClassSession[], optimisticUpdate: { id: string; date: string; heureDebut: string; heureFin: string }) => {
      return state.map((session) =>
        session.id === optimisticUpdate.id
          ? {
              ...session,
              date: optimisticUpdate.date,
              heureDebut: optimisticUpdate.heureDebut,
              heureFin: optimisticUpdate.heureFin,
            }
          : session
      );
    }
  );

  // Transform class sessions to calendar events
  const classSessionEvents = useMemo(() => {
    return optimisticClassSessions.map(transformClassSessionToEvent);
  }, [optimisticClassSessions]);

  // Additional events that can be added by users
  const [additionalEvents, setAdditionalEvents] = useState<CalendarEvent[]>([]);

  // Combine class session events with additional events
  const allEvents = useMemo(() => {
    return [...classSessionEvents, ...additionalEvents];
  }, [classSessionEvents, additionalEvents]);

  // Filter events based on visible colors
  const visibleEvents = useMemo(() => {
    return allEvents.filter((event) => isColorVisible(event.color));
  }, [allEvents, isColorVisible]);

  const handleEventAdd = async (event: CalendarEvent) => {
    // Si l'événement provient du dialog de session avec meta rempli, on persiste via l'API
    const meta = event.meta;
    if (meta?.courseId && meta.academicYearId && meta.professorId && meta.classRepresentativeId) {
      try {
        const payload = {
          date: new Date(event.start).toISOString(),
          heureDebut: format(new Date(event.start), "HH:mm"),
          heureFin: format(new Date(event.end), "HH:mm"),
          academicYearId: meta.academicYearId,
          courseId: meta.courseId,
          professorId: meta.professorId,
          classRepresentativeId: meta.classRepresentativeId,
        } as const;

        await createClassSessionMutation.mutateAsync(payload);

        // Optionnel: affichage toast succès avec détails
        toast.success(`Session "${event.title}" créée`, {
          description: `Le ${format(new Date(event.start), "d MMM yyyy à HH:mm", { locale: fr })}`,
        });

        // Ne pas ajouter d'événement local ad hoc: les queries seront invalidées et le calendrier rechargé
        return;
      } catch (e) {
        console.error("Échec création session:", e);
        toast.error("Impossible d'enregistrer la session de cours");
        return;
      }
    }

    // Sinon, fallback: c'est un simple événement visuel (non lié à l'API)
    setAdditionalEvents((prev) => [...prev, event]);
  };

  const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
    // Check if it's a class session (not an additional event)
    const isClassSession = optimisticClassSessions.some((cs) => cs.id === updatedEvent.id);

    if (isClassSession) {
      // Find the original class session to get additional data
      const originalSession = optimisticClassSessions.find((cs) => cs.id === updatedEvent.id);

      if (!originalSession) {
        toast.error("Session de cours introuvable");
        return;
      }

      // Check if user has permission to update this session
      const canUpdate =
        user?.user?.role === "ADMIN" || (user?.user?.role === "TEACHER" && originalSession.professor?.id === user.user.id);

      if (!canUpdate) {
        toast.error("Vous n'avez pas l'autorisation de modifier cette session");
        return;
      }

      // Convert the updated event back to class session format
      const updateData = {
        id: updatedEvent.id,
        date: new Date(updatedEvent.start).toISOString(),
        heureDebut: format(new Date(updatedEvent.start), "HH:mm"),
        heureFin: format(new Date(updatedEvent.end), "HH:mm"),
      };

      // Apply optimistic update immediately for UI responsiveness
      updateOptimisticClassSessions(updateData);

      try {
        await updateClassSessionMutation.mutateAsync(updateData);

        toast.success(`Session "${updatedEvent.title}" mise à jour`, {
          description: `Nouvelle date : ${format(new Date(updatedEvent.start), "d MMM yyyy à HH:mm", { locale: fr })}`,
        });
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la session:", error);
        toast.error("Erreur lors de la mise à jour de la session");

        // The optimistic update will be reverted automatically when the query refetches
        // due to the mutation's onSuccess/onError callbacks
      }
    } else {
      // Handle additional events (non-class sessions)
      setAdditionalEvents((prev) => prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)));
    }
  };

  const handleEventDelete = (eventId: string) => {
    // Only allow deleting additional events, not class sessions
    const isClassSession = optimisticClassSessions.some((cs) => cs.id === eventId);
    if (!isClassSession) {
      setAdditionalEvents((prev) => prev.filter((event) => event.id !== eventId));
    } else {
      // For class sessions, you might want to handle cancellation here
      console.log("Class session deletion requested:", eventId);
      toast.info("La suppression des sessions de cours n'est pas autorisée via le calendrier");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <PiSpinnerGap className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Chargement du calendrier...</p>
        </div>
      </div>
    );
  }

  return (
    <EventCalendar
      events={visibleEvents}
      onEventAdd={handleEventAdd}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
      initialView="week"
      showCreateButton={canCreateSession}
      CustomEventDialog={ClassSessionDialog}
    />
  );
}
