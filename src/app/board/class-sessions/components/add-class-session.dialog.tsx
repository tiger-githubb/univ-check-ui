"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAcademicYearsQuery } from "@/hooks/queries/use-academic-year.query";
import { useCreateClassSessionMutation } from "@/hooks/queries/use-class-session.query";
import { useCoursesQuery } from "@/hooks/queries/use-course.query";
import { useUsersQuery } from "@/hooks/queries/use-user.query";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { RiCalendarLine } from "react-icons/ri";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  date: z.date({
    required_error: "La date est requise",
  }),
  heureDebut: z.string().min(1, "L'heure de début est requise"),
  heureFin: z.string().min(1, "L'heure de fin est requise"),
  courseId: z.string().min(1, "Le cours est requis"),
  professorId: z.string().min(1, "Le professeur est requis"),
  classRepresentativeId: z.string().min(1, "Le délégué de classe est requis"),
  academicYearId: z.string().min(1, "L'année académique est requise"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddClassSessionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddClassSessionDialog: React.FC<AddClassSessionDialogProps> = ({ isOpen, onOpenChange, onSuccess }) => {
  const [isPending, setIsPending] = useState(false);

  const { data: academicYears = [] } = useAcademicYearsQuery();
  const { data: courses = [] } = useCoursesQuery();
  const { data: usersData } = useUsersQuery();
  const createClassSessionMutation = useCreateClassSessionMutation();

  // Extraire le tableau d'utilisateurs de la réponse paginée
  const users = usersData?.users || [];
  const professors = users.filter((user) => user.role === "TEACHER");
  const students = users.filter((user) => user.role === "USER" || user.role === "DELEGATE");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      heureDebut: "",
      heureFin: "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsPending(true);
    try {
      await createClassSessionMutation.mutateAsync({
        ...values,
        date: values.date.toISOString(),
      });

      toast.success("La session de cours programmée avec succès.");
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error("Impossible de créer la session de cours. Veuillez réessayer.");
      console.error("Création de session de cours échouée:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Programmer une session de cours</DialogTitle>
          <DialogDescription>Complétez les informations ci-dessous pour programmer une nouvelle session de cours.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Sélectionnez une date</span>}
                          <RiCalendarLine className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={fr} />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="heureDebut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de début</FormLabel>
                    <FormControl>
                      <Input type="time" placeholder="08:00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="heureFin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de fin</FormLabel>
                    <FormControl>
                      <Input type="time" placeholder="10:00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cours</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un cours" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="professorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professeur</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un professeur" />
                      </SelectTrigger>
                    </FormControl>{" "}
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classRepresentativeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Délégué de classe</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un délégué" />
                      </SelectTrigger>
                    </FormControl>{" "}
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="academicYearId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Année académique</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une année académique" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {academicYears.map((academicYear) => (
                        <SelectItem key={academicYear.id} value={academicYear.id}>
                          {academicYear.periode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Création en cours..." : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
