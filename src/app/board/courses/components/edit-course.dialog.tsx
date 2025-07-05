"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateCourseMutation } from "@/hooks/queries/use-course.query";
import { useProgramsQuery } from "@/hooks/queries/use-program.query";
import { Course } from "@/types/course.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const courseSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  volumeHoraire: z.coerce.number().int().min(1, "Le volume horaire doit être supérieur à 0"),
  programmeId: z.string().min(1, "Vous devez sélectionner un programme"),
});

type FormValues = z.infer<typeof courseSchema>;

interface EditCourseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  onSuccess?: () => void;
}

export function EditCourseDialog({ isOpen, onOpenChange, course, onSuccess }: Readonly<EditCourseDialogProps>) {
  const { mutate: updateCourse, isPending } = useUpdateCourseMutation();
  const { data: programs } = useProgramsQuery();

  const form = useForm<FormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: "",
      volumeHoraire: 0,
      programmeId: "",
    },
  });

  // Reset form with course data when dialog opens or course changes
  useEffect(() => {
    if (course && isOpen) {
      form.reset({
        name: course.name,
        volumeHoraire: course.volumeHoraire,
        programmeId: course.programme.id,
      });
    }
  }, [course, form, isOpen]);

  const onSubmit = (data: FormValues) => {
    if (!course) return;

    updateCourse(
      {
        id: course.id,
        name: data.name,
        volumeHoraire: data.volumeHoraire,
        programmeId: data.programmeId,
      },
      {
        onSuccess: () => {
          toast.success("Cours mis à jour avec succès");
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error) => {
          console.error("Erreur:", error);
          toast.error("Erreur lors de la mise à jour du cours");
        },
      }
    );
  };

  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le cours</DialogTitle>
          <DialogDescription>Modifiez les informations du cours {course.name}.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Mathématiques avancées..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="volumeHoraire"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Volume Horaire</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} placeholder="40" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="programmeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Programme</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un programme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {programs?.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}