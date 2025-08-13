"use client";

import { useCalendarContext } from "@/components/calendar-context";
import { EventCalendar } from "@/components/event-calendar";
import { CalendarEvent, EventColor } from "@/components/types";
import { useEmargementMutation } from "@/hooks/queries/use-attendance.query";
import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import { ClassSession } from "@/types/attendance.types";
import { useMemo, useState } from "react";
import { PiSpinnerGap } from "react-icons/pi";
import { toast } from "sonner";

interface AttendanceCalendarProps {
  classSessions?: ClassSession[];
  isLoading?: boolean;
  onAttendanceSubmitted?: () => void;
}

// Transform class session to calendar event with attendance capabilities
const transformToAttendanceEvent = (session: ClassSession): CalendarEvent => {
  const sessionDate = new Date(session.date);
  const [startHour, startMinute] = session.heureDebut.split(":").map(Number);
  const [endHour, endMinute] = session.heureFin.split(":").map(Number);

  const start = new Date(sessionDate);
  start.setHours(startHour, startMinute, 0, 0);

  const end = new Date(sessionDate);
  end.setHours(endHour, endMinute, 0, 0);

  const id = session.id;
  const title = session.course?.title || "Session de cours";
  const description = `Professeur: ${session.professor?.name || "TBD"}\nDélégué: ${
    session.classRepresentative?.name || "TBD"
  }\nAnnée académique: ${session.academicYear?.periode || "TBD"}`;
  const location = session.course?.location || "TBD";

  // Color coding based on attendance status and time
  let color: EventColor = "blue";

  const now = new Date();
  const isPast = end < now;
  const isCurrent = start <= now && end >= now;

  if (isCurrent) {
    color = "orange"; // Session active actuellement
  } else if (isPast) {
    color = "emerald"; // Session passée - supposé présent
  } else {
    color = "blue"; // Session future
  }

  // Marquer les sessions nécessitant émargement
  if (session.course?.hasAttendance) {
    color = isPast ? "violet" : "rose";
  }

  const timeStatus = isCurrent ? " (Actif)" : isPast ? " (Terminé)" : " (À venir)";

  return {
    id,
    title: `${title}${timeStatus}`,
    description,
    start,
    end,
    color,
    location,
    label: title,
  };
};

export default function AttendanceCalendar({ classSessions = [], isLoading = false, onAttendanceSubmitted }: AttendanceCalendarProps) {
  const { isColorVisible } = useCalendarContext();
  const { data: user } = useCurrentUser();
  const { mutate: submitEmargement, isPending } = useEmargementMutation();

  // Combine class sessions and courses
  const allItems = useMemo(() => {
    return [...classSessions];
  }, [classSessions]);

  // Filter items based on user role
  const filteredItems = useMemo(() => {
    if (!user?.user) return allItems;

    const userRole = user.user.role;
    const userId = user.user.id;

    // Admins see all items
    if (userRole === "ADMIN") {
      return allItems;
    }

    // Teachers see only their own sessions
    if (userRole === "TEACHER") {
      return allItems.filter((session) => session.professor?.id === userId);
    }

    // Students see sessions where they are class representative or all sessions
    return allItems;
  }, [allItems, user]);

  // Transform items to calendar events
  const attendanceEvents = useMemo(() => {
    return filteredItems.map(transformToAttendanceEvent);
  }, [filteredItems]);

  // Additional events that can be added by users
  const [additionalEvents, setAdditionalEvents] = useState<CalendarEvent[]>([]);

  // Combine attendance events with additional events
  const allEvents = useMemo(() => {
    return [...attendanceEvents, ...additionalEvents];
  }, [attendanceEvents, additionalEvents]);

  // Filter events based on visible colors
  const visibleEvents = useMemo(() => {
    return allEvents.filter((event) => isColorVisible(event.color));
  }, [allEvents, isColorVisible]);

  const handleEventAdd = (event: CalendarEvent) => {
    setAdditionalEvents((prev) => [...prev, event]);
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    // Check if this is an attendance event
    const isAttendanceEvent = filteredItems.some((session) => session.id === updatedEvent.id);

    if (isAttendanceEvent) {
      // Handle attendance marking
      const now = new Date();
      const eventStart = new Date(updatedEvent.start);
      const eventEnd = new Date(updatedEvent.end);

      // Check if session is currently active or recently ended (within 30 minutes)
      const isActive = eventStart <= now && eventEnd >= new Date(now.getTime() - 30 * 60 * 1000);

      if (isActive && user?.user?.role === "TEACHER") {
        // Submit attendance
        submitEmargement(
          {
            classSessionId: updatedEvent.id,
            professorId: user.user.id,
            status: "PRESENT",
            comments: "Émargé via calendrier",
          },
          {
            onSuccess: () => {
              toast.success("Émargement enregistré avec succès !");
              onAttendanceSubmitted?.();
            },
            onError: (error: Error) => {
              toast.error("Échec de l'émargement : " + error.message);
            },
          }
        );
      } else {
        toast.warning("L'émargement ne peut être effectué que pendant les sessions actives.");
      }
    } else {
      // Update additional events
      setAdditionalEvents((prev) => prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)));
    }
  };

  const handleEventDelete = (eventId: string) => {
    // Only allow deleting additional events, not attendance events
    const isAttendanceEvent = filteredItems.some((session) => session.id === eventId);
    if (!isAttendanceEvent) {
      setAdditionalEvents((prev) => prev.filter((event) => event.id !== eventId));
    } else {
      toast.warning("Impossible de supprimer les sessions de cours du calendrier.");
    }
  };

  if (isLoading || isPending) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <PiSpinnerGap className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">{isPending ? "Envoi de l'émargement..." : "Chargement du calendrier..."}</p>
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
    />
  );
}
