"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCourseMutation } from "@/hooks/queries/use-course.query";
import { useProgramsQuery } from "@/hooks/queries/use-program.query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const courseSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  volumeHoraire: z.coerce.number().int().min(1, "Le volume horaire doit être supérieur à 0"),
  programmeId: z.string().min(1, "Vous devez sélectionner un programme"),
});

type FormValues = z.infer<typeof courseSchema>;

interface AddCourseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddCourseDialog({ isOpen, onOpenChange, onSuccess }: Readonly<AddCourseDialogProps>) {
  const { mutate: createCourse, isPending } = useCreateCourseMutation();
  const { data: programs = [] } = useProgramsQuery();

  const form = useForm<FormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: "",
      volumeHoraire: 0,
      programmeId: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    createCourse(values, {
      onSuccess: () => {
        toast.success("Cours créé avec succès");
        form.reset();
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error: unknown) => {
        console.error("Erreur:", error);
        toast.error("Erreur lors de la création du cours");
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un cours</DialogTitle>
          <DialogDescription>Créez un nouveau cours pour votre institution.</DialogDescription>
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
                      {programs.map((program) => (
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
                {isPending ? "Création en cours..." : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}