"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useEmargementMutation } from "@/hooks/queries/use-attendance.query";
import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import { Course } from "@/types/attendance.types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";

interface TodaysCoursesListProps {
  courses: Course[];
  isLoading: boolean;
  onAttendanceSubmitted: () => void;
}

export function TodaysCoursesList({ courses, isLoading, onAttendanceSubmitted }: TodaysCoursesListProps) {
  const [comments, setComments] = useState<Record<string, string>>({});

  const { mutate: createAttendance, isPending } = useEmargementMutation();
  const { data: user } = useCurrentUser();
  const userId = user?.user?.id;

  const handleSubmitAttendance = (courseId: string) => {
    if (!userId) {
      toast.error("Vous devez être connecté pour émarger");
      return;
    }

    createAttendance(
      {
        classSessionId: courseId,
        professorId: userId,
        status: "PRESENT",
        comments: comments[courseId] || "",
      },
      {
        onSuccess: () => {
          toast.success("Émargement enregistré avec succès");
          // Réinitialiser le commentaire pour ce cours
          setComments((prev) => ({ ...prev, [courseId]: "" }));
          onAttendanceSubmitted();
        },
        onError: (error) => {
          toast.error("Erreur lors de l'enregistrement de l'émargement");
          console.error("Erreur émargement:", error);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement des cours...</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground mb-4">Vous n&apos;avez pas de cours aujourd&apos;hui.</p>
      </div>
    );
  }

  // Formatter l'heure de façon lisible
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return format(date, "HH:mm", { locale: fr });
    } catch (error) {
      console.error("Erreur de formatage de l'heure:", error);
      return timeString;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <Card key={course.id} className={course.hasAttendance ? "border-green-500/20" : ""}>
          <CardHeader>
            <CardTitle className="flex justify-between">
              {course.title}
              {course.hasAttendance && <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded-full">Émargé</span>}
            </CardTitle>
            <CardDescription>
              {formatTime(course.startTime)} - {formatTime(course.endTime)}
              <br />
              {course.location}
            </CardDescription>
          </CardHeader>
          {!course.hasAttendance && (
            <>
              <CardContent>
                <Textarea
                  placeholder="Commentaires (optionnel)"
                  value={comments[course.id] || ""}
                  onChange={(e) => setComments((prev) => ({ ...prev, [course.id]: e.target.value }))}
                />
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleSubmitAttendance(course.id)} disabled={isPending}>
                  {isPending ? "Enregistrement..." : "Émarger"}
                </Button>
              </CardFooter>
            </>
          )}
          {course.hasAttendance && (
            <CardFooter>
              <p className="text-sm text-muted-foreground">Vous avez déjà émargé pour ce cours.</p>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
