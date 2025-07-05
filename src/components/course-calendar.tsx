"use client";

import { useCalendarContext } from "@/components/calendar-context";
import { EventCalendar } from "@/components/event-calendar";
import { CalendarEvent, EventColor } from "@/components/types";
import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import { ClassSession } from "@/types/attendance.types";
import { useMemo, useState } from "react";

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

  const attendanceInfo = isPast ? " (Completed)" : " (Upcoming)";

  return {
    id: classSession.id,
    title: `${classSession.course?.title || "Course Session"}${attendanceInfo}`,
    description: `Professor: ${classSession.professor?.name || "TBD"}\nClass Rep: ${
      classSession.classRepresentative?.name || "TBD"
    }\nAcademic Year: ${classSession.academicYear?.periode || "TBD"}\nTime: ${classSession.heureDebut} - ${classSession.heureFin}`,
    start,
    end,
    color,
    location: classSession.course?.location || "TBD",
    label: classSession.course?.title || "Course Session",
  };
};

export default function CourseCalendar({ classSessions = [], isLoading = false }: CourseCalendarProps) {
  const { isColorVisible } = useCalendarContext();
  const { data: user } = useCurrentUser();

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

  // Transform class sessions to calendar events
  const classSessionEvents = useMemo(() => {
    return filteredClassSessions.map(transformClassSessionToEvent);
  }, [filteredClassSessions]);

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

  const handleEventAdd = (event: CalendarEvent) => {
    setAdditionalEvents((prev) => [...prev, event]);
  };
  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    // Only allow updating additional events, not class sessions
    const isClassSession = filteredClassSessions.some((cs) => cs.id === updatedEvent.id);
    if (!isClassSession) {
      setAdditionalEvents((prev) => prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)));
    } else {
      // For class sessions, you might want to handle attendance marking here
      console.log("Class session update requested:", updatedEvent.id);
      // Could trigger attendance modal or API call
    }
  };

  const handleEventDelete = (eventId: string) => {
    // Only allow deleting additional events, not class sessions
    const isClassSession = filteredClassSessions.some((cs) => cs.id === eventId);
    if (!isClassSession) {
      setAdditionalEvents((prev) => prev.filter((event) => event.id !== eventId));
    } else {
      // For class sessions, you might want to handle cancellation here
      console.log("Class session deletion requested:", eventId);
      // Could trigger confirmation modal
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading calendar...</p>
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
