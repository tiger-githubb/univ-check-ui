"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDepartmentsQuery } from "@/hooks/queries/use-departments.query";
import { useUpdateProgramMutation } from "@/hooks/queries/use-program.query";
import { Program } from "@/types/program.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const programSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  departementId: z.string().min(1, "Vous devez sélectionner un département"),
});

type FormValues = z.infer<typeof programSchema>;

interface EditProgramDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  program: Program | null;
  onSuccess?: () => void;
}

export function EditProgramDialog({ isOpen, onOpenChange, program, onSuccess }: Readonly<EditProgramDialogProps>) {
  const { data: departements } = useDepartmentsQuery();
  const { mutate: updateProgram, isPending } = useUpdateProgramMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: "",
      departementId: "",
    },
  });

  // Reset form with program data when dialog opens or program changes
  useEffect(() => {
    if (program && isOpen) {
      console.log("Resetting form with program data:", program);
      form.reset({
        name: program.name,
        departementId: program.departement ? program.departement.id : "",
      });
    }
  }, [program, form, isOpen]);

  const onSubmit = (data: FormValues) => {
    if (!program) return;

    updateProgram(
      {
        id: program.id,
        name: data.name,
        departementId: data.departementId,
      },
      {
        onSuccess: () => {
          toast.success("Programme mis à jour avec succès");
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error) => {
          console.error("Erreur:", error);
          toast.error("Erreur lors de la mise à jour du programme");
        },
      }
    );
  };

  if (!program) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le programme</DialogTitle>
          <DialogDescription>Modifiez les informations du programme {program.name}.</DialogDescription>
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
                    <Input placeholder="Licence Informatique..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departementId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Département</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un département" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departements?.departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
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