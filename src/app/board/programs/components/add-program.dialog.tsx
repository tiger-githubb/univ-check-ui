"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDepartmentsQuery } from "@/hooks/queries/use-departments.query";
import { useCreateProgramMutation } from "@/hooks/queries/use-program.query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";


const programSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  departementId: z.string().min(1, "Vous devez sélectionner un département"),
});

type FormValues = z.infer<typeof programSchema>;

interface AddProgramDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddProgramDialog({ isOpen, onOpenChange, onSuccess }: Readonly<AddProgramDialogProps>) {
  const { data: departements } = useDepartmentsQuery();
  const { mutate: createProgram, isPending } = useCreateProgramMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: "",
      departementId: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    createProgram(values, {
      onSuccess: () => {
        toast.success("Programme créé avec succès");
        form.reset();
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error: unknown) => {
        console.error("Erreur:", error);
        toast.error("Erreur lors de la création du programme");
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un programme</DialogTitle>
          <DialogDescription>Créez un nouveau programme académique pour votre institution.</DialogDescription>
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
                {isPending ? "Création en cours..." : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}