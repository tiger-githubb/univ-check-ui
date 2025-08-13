"use client";

import { RiCalendarLine, RiDeleteBinLine } from "@remixicon/react";
import { format, isBefore } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect, useState } from "react";

import { DefaultEndHour, DefaultStartHour } from "@/components/constants";
import type { CalendarEvent } from "@/components/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAcademicYearsQuery } from "@/hooks/queries/use-academic-year.query";
import { useCoursesQuery } from "@/hooks/queries/use-course.query";
import { useUsersQuery } from "@/hooks/queries/use-user.query";
import { cn } from "@/lib/utils";

interface ClassSessionDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}

export function ClassSessionDialog({ event, isOpen, onClose, onSave, onDelete }: ClassSessionDialogProps) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState(`${DefaultStartHour}:00`);
  const [endTime, setEndTime] = useState(`${DefaultEndHour}:00`);
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [courseId, setCourseId] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [classRepresentativeId, setClassRepresentativeId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Récupération des données
  const { data: academicYears = [] } = useAcademicYearsQuery();
  const { data: courses = [] } = useCoursesQuery();
  const { data: usersData } = useUsersQuery();

  // Extraire le tableau d'utilisateurs de la réponse paginée
  const users = usersData?.users || [];
  const professors = users.filter((user) => user.role === "TEACHER");
  const students = users.filter((user) => user.role === "USER" || user.role === "DELEGATE");

  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setLocation(event.location || "");

      const startDateTime = new Date(event.start);
      const endDateTime = new Date(event.end);

      setStartDate(startDateTime);
      setEndDate(endDateTime);
      setStartTime(format(startDateTime, "HH:mm"));
      setEndTime(format(endDateTime, "HH:mm"));
      setAllDay(event.allDay || false);

      // Pré-remplir les identifiants si disponibles dans meta
      if (event.meta) {
        setCourseId(event.meta.courseId || "");
        setProfessorId(event.meta.professorId || "");
        setClassRepresentativeId(event.meta.classRepresentativeId || "");
        setAcademicYearId(event.meta.academicYearId || "");
      }
    } else {
      // Reset form for new event
      setTitle("");
      setLocation("");
      setCourseId("");
      setProfessorId("");
      setClassRepresentativeId("");
      setAcademicYearId("");
      setStartDate(new Date());
      setEndDate(new Date());
      setStartTime(`${DefaultStartHour}:00`);
      setEndTime(`${DefaultEndHour}:00`);
      setAllDay(false);
    }
    setError(null);
  }, [event]);

  const handleSave = () => {
    setError(null);

    if (!courseId) {
      setError("Le cours est requis");
      return;
    }

    if (!academicYearId) {
      setError("L'année académique est requise");
      return;
    }

    if (!professorId) {
      setError("Le professeur est requis");
      return;
    }

    if (!classRepresentativeId) {
      setError("Le délégué de classe est requis");
      return;
    }

    if (!allDay && startTime >= endTime) {
      setError("L'heure de fin doit être après l'heure de début");
      return;
    }

    if (!allDay && isBefore(endDate, startDate)) {
      setError("La date de fin doit être après la date de début");
      return;
    }

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    if (!allDay) {
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      startDateTime.setHours(startHour, startMinute, 0, 0);
      endDateTime.setHours(endHour, endMinute, 0, 0);
    } else {
      startDateTime.setHours(0, 0, 0, 0);
      endDateTime.setHours(23, 59, 59, 999);
    }

    // Trouver le cours sélectionné pour obtenir le titre
    const selectedCourse = courses.find((course) => course.id === courseId);
    const courseTitle = selectedCourse?.name || title;

    const savedEvent: CalendarEvent = {
      id: event?.id || "",
      title: courseTitle,
      start: startDateTime,
      end: endDateTime,
      allDay,
      location: location.trim(),
      color: event?.color || "blue",
      meta: {
        courseId,
        professorId,
        classRepresentativeId,
        academicYearId,
      },
    };

    onSave(savedEvent);
  };

  const handleDelete = () => {
    if (event?.id) {
      onDelete(event.id);
    }
  };

  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    return time;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RiCalendarLine className="h-5 w-5" />
            {event?.id ? "Modifier la session" : "Nouvelle session de cours"}
          </DialogTitle>
          <DialogDescription>
            {event?.id ? "Modifiez les détails de cette session de cours" : "Créez une nouvelle session de cours"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="course-select">Cours *</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un cours" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="professor-select">Professeur *</Label>
            <Select value={professorId} onValueChange={setProfessorId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un professeur" />
              </SelectTrigger>
              <SelectContent>
                {professors
                  .filter((professor) => professor.id)
                  .map((professor) => (
                    <SelectItem key={professor.id} value={professor.id!}>
                      {professor.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class-rep-select">Délégué de classe *</Label>
            <Select value={classRepresentativeId} onValueChange={setClassRepresentativeId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un délégué" />
              </SelectTrigger>
              <SelectContent>
                {students
                  .filter((student) => student.id)
                  .map((student) => (
                    <SelectItem key={student.id} value={student.id!}>
                      {student.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="academic-year-select">Année académique *</Label>
            <Select value={academicYearId} onValueChange={setAcademicYearId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une année académique" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((academicYear) => (
                  <SelectItem key={academicYear.id} value={academicYear.id}>
                    {academicYear.periode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="all-day" checked={allDay} onCheckedChange={(checked) => setAllDay(checked as boolean)} />
            <Label htmlFor="all-day">Toute la journée</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de début *</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <RiCalendarLine className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "d MMM yyyy", { locale: fr }) : "Choisir une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date);
                        setStartDateOpen(false);
                      }
                    }}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Date de fin *</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                  >
                    <RiCalendarLine className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "d MMM yyyy", { locale: fr }) : "Choisir une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(date);
                        setEndDateOpen(false);
                      }
                    }}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {!allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Heure de début</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-time">Heure de fin</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {event?.id && (
            <Button variant="destructive" onClick={handleDelete} className="w-full sm:w-auto">
              <RiDeleteBinLine className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          )}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
              Annuler
            </Button>
            <Button onClick={handleSave} className="flex-1 sm:flex-none">
              {event?.id ? "Modifier" : "Créer"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
