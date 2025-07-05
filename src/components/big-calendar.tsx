"use client";

import { useState, useMemo } from "react";
import { useCalendarContext } from "@/components/calendar-context";
import { ClassSession } from "@/types/attendance.types";

import { EventCalendar } from "@/components/event-calendar";
import { type CalendarEvent, type EventColor } from "@/components/types";

// Etiquettes data for calendar filtering
export const etiquettes = [
  {
    id: "my-events",
    name: "My Events",
    color: "emerald" as EventColor,
    isActive: true,
  },
  {
    id: "marketing-team",
    name: "Marketing Team",
    color: "orange" as EventColor,
    isActive: true,
  },
  {
    id: "interviews",
    name: "Interviews",
    color: "violet" as EventColor,
    isActive: true,
  },
  {
    id: "events-planning",
    name: "Events Planning",
    color: "blue" as EventColor,
    isActive: true,
  },
  {
    id: "holidays",
    name: "Holidays",
    color: "rose" as EventColor,
    isActive: true,
  },
];

interface BigCalendarProps {
  classSessions?: ClassSession[];
  isLoading?: boolean;
}

// Transform class session to calendar event
const transformClassSessionToEvent = (classSession: ClassSession): CalendarEvent => {
  const sessionDate = new Date(classSession.date);
  const [startHour, startMinute] = classSession.heureDebut.split(":").map(Number);
  const [endHour, endMinute] = classSession.heureFin.split(":").map(Number);

  const start = new Date(sessionDate);
  start.setHours(startHour, startMinute, 0, 0);

  const end = new Date(sessionDate);
  end.setHours(endHour, endMinute, 0, 0);

  return {
    id: classSession.id,
    title: classSession.course?.title || "Course Session",
    description: `Professor: ${classSession.professor?.name || "TBD"}\nClass Rep: ${classSession.classRepresentative?.name || "TBD"}`,
    start,
    end,
    color: "blue" as EventColor,
    location: classSession.course?.location || "TBD",
    label: classSession.course?.title || "Course Session",
  };
};

export default function BigCalendar({ classSessions = [], isLoading = false }: BigCalendarProps) {
  const { isColorVisible } = useCalendarContext();

  // Transform class sessions to calendar events
  const classSessionEvents = useMemo(() => {
    return classSessions.map(transformClassSessionToEvent);
  }, [classSessions]);

  // Combine sample events with class session events
  const [additionalEvents, setAdditionalEvents] = useState<CalendarEvent[]>([]);
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
    const isClassSession = classSessions.some((cs) => cs.id === updatedEvent.id);
    if (!isClassSession) {
      setAdditionalEvents((prev) => prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)));
    }
  };

  const handleEventDelete = (eventId: string) => {
    // Only allow deleting additional events, not class sessions
    const isClassSession = classSessions.some((cs) => cs.id === eventId);
    if (!isClassSession) {
      setAdditionalEvents((prev) => prev.filter((event) => event.id !== eventId));
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
