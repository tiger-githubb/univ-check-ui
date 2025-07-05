"use client";

import { useCalendarContext } from "@/components/calendar-context";
import { EventCalendar } from "@/components/event-calendar";
import { CalendarEvent, EventColor } from "@/components/types";
import { useEmargementMutation } from "@/hooks/queries/use-attendance.query";
import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import { ClassSession, Course } from "@/types/attendance.types";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface AttendanceCalendarProps {
  classSessions?: ClassSession[];
  courses?: Course[];
  isLoading?: boolean;
  onAttendanceSubmitted?: () => void;
}

// Transform class session to calendar event with attendance capabilities
const transformToAttendanceEvent = (item: ClassSession | Course): CalendarEvent => {
  let sessionDate: Date;
  let start: Date;
  let end: Date;
  let id: string;
  let title: string;
  let description: string;
  let location: string;

  // Handle both ClassSession and Course types
  if ("date" in item) {
    // ClassSession
    sessionDate = new Date(item.date);
    const [startHour, startMinute] = item.heureDebut.split(":").map(Number);
    const [endHour, endMinute] = item.heureFin.split(":").map(Number);

    start = new Date(sessionDate);
    start.setHours(startHour, startMinute, 0, 0);

    end = new Date(sessionDate);
    end.setHours(endHour, endMinute, 0, 0);

    id = item.id;
    title = item.course?.title || "Course Session";
    description = `Professor: ${item.professor?.name || "TBD"}\nClass Rep: ${
      item.classRepresentative?.name || "TBD"
    }\nAcademic Year: ${item.academicYear?.periode || "TBD"}`;
    location = item.course?.location || "TBD";
  } else {
    // Course
    sessionDate = new Date(); // Current date for courses without specific date
    const [startHour, startMinute] = item.startTime.split(":").map(Number);
    const [endHour, endMinute] = item.endTime.split(":").map(Number);

    start = new Date(sessionDate);
    start.setHours(startHour, startMinute, 0, 0);

    end = new Date(sessionDate);
    end.setHours(endHour, endMinute, 0, 0);

    id = item.id;
    title = item.title;
    description = `Location: ${item.location}\nAttendance Required: ${item.hasAttendance ? "Yes" : "No"}`;
    location = item.location;
  }

  // Color coding based on attendance status and time
  let color: EventColor = "blue";

  const now = new Date();
  const isPast = end < now;
  const isCurrent = start <= now && end >= now;

  if (isCurrent) {
    color = "orange"; // Currently active session
  } else if (isPast) {
    color = "emerald"; // Past session - assume attended
  } else {
    color = "blue"; // Future session
  }

  // Mark sessions requiring attendance
  if ("hasAttendance" in item && item.hasAttendance) {
    color = isPast ? "violet" : "rose";
  }

  const timeStatus = isCurrent ? " (Active)" : isPast ? " (Completed)" : " (Upcoming)";

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

export default function AttendanceCalendar({
  classSessions = [],
  courses = [],
  isLoading = false,
  onAttendanceSubmitted,
}: AttendanceCalendarProps) {
  const { isColorVisible } = useCalendarContext();
  const { data: user } = useCurrentUser();
  const { mutate: submitEmargement, isPending } = useEmargementMutation();

  // Combine class sessions and courses
  const allItems = useMemo(() => {
    return [...classSessions, ...courses];
  }, [classSessions, courses]);

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
      return allItems.filter((item) => {
        if ("professor" in item) {
          return item.professor?.id === userId;
        }
        return true; // Show all courses for now
      });
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
    const isAttendanceEvent = filteredItems.some((item) => item.id === updatedEvent.id);

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
            comments: "Marked via calendar",
          },
          {
            onSuccess: () => {
              toast.success("Attendance marked successfully!");
              onAttendanceSubmitted?.();
            },
            onError: (error: Error) => {
              toast.error("Failed to mark attendance: " + error.message);
            },
          }
        );
      } else {
        toast.warning("Attendance can only be marked during active sessions.");
      }
    } else {
      // Update additional events
      setAdditionalEvents((prev) => prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)));
    }
  };

  const handleEventDelete = (eventId: string) => {
    // Only allow deleting additional events, not attendance events
    const isAttendanceEvent = filteredItems.some((item) => item.id === eventId);
    if (!isAttendanceEvent) {
      setAdditionalEvents((prev) => prev.filter((event) => event.id !== eventId));
    } else {
      toast.warning("Cannot delete course sessions from calendar.");
    }
  };

  if (isLoading || isPending) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">{isPending ? "Submitting attendance..." : "Loading calendar..."}</p>
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
