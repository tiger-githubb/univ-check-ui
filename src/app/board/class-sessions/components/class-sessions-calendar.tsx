"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCoursesQuery } from "@/hooks/queries/use-course.query";
import { useUsersQuery } from "@/hooks/queries/use-user.query";
import { ClassSession } from "@/types/attendance.types";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiBookOpenLine,
  RiCalendarCheckLine,
  RiFilterLine,
  RiMapPinLine,
  RiTimeLine,
  RiUserLine,
} from "@remixicon/react";
import { addDays, addWeeks, format, isSameDay, parseISO, startOfWeek, subWeeks } from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo, useState } from "react";

interface ClassSessionsCalendarProps {
  classSessions: ClassSession[];
  isLoading: boolean;
  canEdit?: boolean;
  onRefresh?: () => void;
}

export function ClassSessionsCalendar({ classSessions, isLoading, canEdit = false, onRefresh }: ClassSessionsCalendarProps) {
  // État pour la date courante et le dialogue
  const [currentDate, setCurrentDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // États pour les filtres
  const [selectedProfessorId, setSelectedProfessorId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  // Récupération des utilisateurs et des cours pour les filtres
  const { data: usersData } = useUsersQuery();
  const { data: coursesData } = useCoursesQuery();

  // Filtrer les utilisateurs pour n'avoir que les professeurs
  const professors = useMemo(() => {
    if (!usersData?.users) return [];
    return usersData.users.filter((user) => user.role === "TEACHER");
  }, [usersData]);

  // Tous les cours disponibles
  const courses = useMemo(() => {
    return coursesData || [];
  }, [coursesData]);

  // Générer les jours de la semaine
  const weekDays = useMemo(() => {
    const days = [];
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });

    for (let i = 0; i < 7; i++) {
      days.push(addDays(start, i));
    }

    return days;
  }, [currentDate]);

  // Navigation entre les semaines
  const goToPreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const goToNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentDate(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  // Ouvrir le dialogue de détails pour une session spécifique
  const openSessionDialog = (session: ClassSession) => {
    setSelectedSession(session);
    setDialogOpen(true);
  };

  // Obtenir le statut de l'émargement (simulation)
  const hasEmargement = () => {
    // Cette fonction est à adapter en fonction de la logique métier
    // Pour l'instant, on retourne toujours false car la structure n'a pas d'émargement
    return false;
  };

  // Obtenir la classe CSS en fonction du statut d'émargement
  const getStatusBadgeClass = (hasEmarge: boolean) => {
    return hasEmarge ? "bg-green-500/20 text-green-600" : "bg-yellow-500/20 text-yellow-600";
  };

  // Récupérer les sessions pour un jour spécifique
  const getSessionsByDay = (day: Date) => {
    if (!classSessions) return [];

    return classSessions.filter((session) => {
      try {
        // Filtrage par date
        const sessionDate = parseISO(session.date);
        const isSameDate = isSameDay(sessionDate, day);

        // Filtrage par professeur si un professeur est sélectionné
        const matchesProfessor = selectedProfessorId ? session.professor?.id === selectedProfessorId : true;

        // Filtrage par cours si un cours est sélectionné
        const matchesCourse = selectedCourseId ? session.course?.id === selectedCourseId : true;

        // Retourner uniquement les sessions qui correspondent à tous les critères
        return isSameDate && matchesProfessor && matchesCourse;
      } catch {
        return false;
      }
    });
  };

  // Formatter l'heure de façon lisible
  const formatTime = (timeString: string) => {
    if (!timeString) return "--:--";

    try {
      // Si c'est déjà au format HH:MM, on le retourne tel quel
      if (/^\d{2}:\d{2}$/.test(timeString)) {
        return timeString;
      }

      return format(parseISO(timeString), "HH:mm", { locale: fr });
    } catch {
      return timeString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Chargement du calendrier...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Navigation et filtres */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={goToPreviousWeek}>
            <RiArrowLeftSLine className="mr-1" /> Semaine précédente
          </Button>
          <Button size="sm" variant="outline" onClick={goToCurrentWeek}>
            Semaine actuelle
          </Button>
          <Button size="sm" variant="outline" onClick={goToNextWeek}>
            Semaine suivante <RiArrowRightSLine className="ml-1" />
          </Button>
        </div>

        <div className="text-sm font-semibold hidden md:block">
          {format(startOfWeek(currentDate, { weekStartsOn: 1 }), "dd/MM/yyyy", { locale: fr })} au{" "}
          {format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6), "dd/MM/yyyy", { locale: fr })}
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <RiFilterLine size={20} className="text-primary" />
          <span className="font-medium">Filtres</span>
        </div>
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="flex-1">
            <Select value={selectedProfessorId} onValueChange={setSelectedProfessorId}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <RiUserLine />
                  <SelectValue placeholder="Tous les professeurs" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Tous les professeurs</SelectItem>
                {professors.map((professor) => (
                  <SelectItem key={professor.id || `prof-${Math.random()}`} value={professor.id || `prof-${Math.random()}`}>
                    {professor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <RiBookOpenLine />
                  <SelectValue placeholder="Tous les cours" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Tous les cours</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id || `course-${Math.random()}`} value={course.id || `course-${Math.random()}`}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedProfessorId("");
              setSelectedCourseId("");
            }}
          >
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Calendrier hebdomadaire */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="min-h-[150px]">
            <div
              className={`text-center py-2 mb-2 font-medium rounded-lg ${
                isSameDay(day, new Date()) ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              <div>{format(day, "EEEE", { locale: fr })}</div>
              <div>{format(day, "dd/MM", { locale: fr })}</div>
            </div>

            <div className="space-y-2">
              {getSessionsByDay(day).length === 0 ? (
                <div className="text-center text-xs text-muted-foreground p-2">Aucune session</div>
              ) : (
                getSessionsByDay(day).map((session) => {
                  const emargementStatus = hasEmargement();
                  return (
                    <Card key={session.id} className={emargementStatus ? "border-green-500/20" : "border-yellow-500/20"}>
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-sm flex justify-between items-center">
                          <span className="truncate">{session.course?.title || "Sans titre"}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(emargementStatus)}`}>
                            {emargementStatus ? "Émargée" : "En attente"}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-1 px-3">
                        <div className="text-xs flex items-center">
                          <RiTimeLine className="mr-1" size={12} />
                          {formatTime(session.heureDebut)} - {formatTime(session.heureFin)}
                        </div>
                        <div className="text-xs flex items-center">
                          <RiUserLine className="mr-1" size={12} />
                          {session.professor?.name || "Non assigné"}
                        </div>
                        <div className="text-xs flex items-center">
                          <RiMapPinLine className="mr-1" size={12} />
                          {session.course?.location || "Non spécifié"}
                        </div>
                      </CardContent>
                      <CardFooter className="py-1 px-3">
                        <Button size="sm" className="w-full" onClick={() => openSessionDialog(session)}>
                          <RiCalendarCheckLine className="mr-1" size={14} />
                          Détails
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dialogue de détails de la session */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de la session de cours</DialogTitle>
            <DialogDescription>Informations complètes sur la session</DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Cours</h3>
                  <p>{selectedSession.course?.title}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Professeur</h3>
                  <p>{selectedSession.professor?.name || "Non assigné"}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Date</h3>
                  <p>{format(parseISO(selectedSession.date), "EEEE d MMMM yyyy", { locale: fr })}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Horaire</h3>
                  <p>
                    {formatTime(selectedSession.heureDebut)} - {formatTime(selectedSession.heureFin)}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Status d&apos;émargement</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(hasEmargement())}`}>
                      {hasEmargement() ? "Émargée" : "En attente"}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Lieu</h3>
                  <p>{selectedSession.course?.location || "Non spécifié"}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Année académique</h3>
                <p className="text-sm">{selectedSession.academicYear?.periode || "Non spécifié"}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Délégué de classe</h3>
                <p className="text-sm">{selectedSession.classRepresentative?.name || "Non spécifié"}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            {canEdit && selectedSession && (
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  if (onRefresh) onRefresh();
                  // Ici vous pourriez ajouter une logique pour ouvrir un dialogue de modification
                  alert("Fonctionnalité de modification à implémenter");
                }}
              >
                Modifier
              </Button>
            )}
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
