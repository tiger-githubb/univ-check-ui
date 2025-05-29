import { ClassSessionService } from "@/server/services/class-session.service";
import {
  ClassSession,
  ClassSessionResponse,
  Course,
  CreateClassSessionInput,
  UpdateClassSessionInput,
} from "@/types/attendance.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const classSessionsQueryKeys = {
  classSessions: ["class-sessions"],
  classSession: (id: string) => ["class-session", id],
  professorClassSessions: (professorId: string) => ["class-sessions", "professor", professorId],
  professorTodayCourses: (professorId: string) => ["class-sessions", "professor", professorId, "today"],
  professorWeekCourses: (professorId: string, startDate: string) => ["class-sessions", "professor", professorId, "week", startDate],
};

export function useClassSessionsQuery() {
  return useQuery<ClassSessionResponse>({
    queryKey: [...classSessionsQueryKeys.classSessions],
    queryFn: () => ClassSessionService.getClassSessions(),
  });
}

export function useClassSessionQuery(id: string) {
  return useQuery<ClassSession>({
    queryKey: classSessionsQueryKeys.classSession(id),
    queryFn: () => ClassSessionService.getClassSessionById(id),
    enabled: !!id,
  });
}

export function useProfessorClassSessionsQuery(professorId: string, startDate?: string, endDate?: string) {
  return useQuery<ClassSession[]>({
    queryKey: [...classSessionsQueryKeys.professorClassSessions(professorId), startDate, endDate],
    queryFn: () => ClassSessionService.getProfessorClassSessions(professorId, startDate, endDate),
    enabled: !!professorId,
  });
}

export function useProfessorTodayCoursesQuery(professorId: string) {
  return useQuery<Course[]>({
    queryKey: classSessionsQueryKeys.professorTodayCourses(professorId),
    queryFn: () => ClassSessionService.getProfessorTodaysCourses(professorId),
    enabled: !!professorId,
  });
}

export function useProfessorWeekCoursesQuery(professorId: string, startDate: string) {
  return useQuery<Course[]>({
    queryKey: classSessionsQueryKeys.professorWeekCourses(professorId, startDate),
    queryFn: () => ClassSessionService.getProfessorWeekCourses(professorId, startDate),
    enabled: !!(professorId && startDate),
  });
}

export function useCreateClassSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateClassSessionInput) => ClassSessionService.createClassSession(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classSessionsQueryKeys.classSessions });
    },
  });
}

export function useUpdateClassSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateClassSessionInput) => ClassSessionService.updateClassSession(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: classSessionsQueryKeys.classSession(data.id) });
      queryClient.invalidateQueries({ queryKey: classSessionsQueryKeys.classSessions });

      // Si la session appartient à un professeur, invalider aussi ses listes spécifiques
      if (data.professor && data.professor.id) {
        queryClient.invalidateQueries({ queryKey: classSessionsQueryKeys.professorClassSessions(data.professor.id) });
        queryClient.invalidateQueries({ queryKey: classSessionsQueryKeys.professorTodayCourses(data.professor.id) });
      }
    },
  });
}

export function useDeleteClassSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ClassSessionService.deleteClassSession(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: classSessionsQueryKeys.classSession(id) });
      queryClient.invalidateQueries({ queryKey: classSessionsQueryKeys.classSessions });

      // On ne peut pas savoir quel professeur était concerné ici, donc on ne peut pas invalider
      // les requêtes spécifiques au professeur. Celles-ci seront invalidées lors de leur prochaine utilisation.
    },
  });
}
