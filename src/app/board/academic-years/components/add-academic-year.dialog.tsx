"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateAcademicYearMutation } from "@/hooks/queries/use-academic-year.query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const academicYearSchema = z.object({
  periode: z.string().min(2, "La période doit contenir au moins 2 caractères"),
});

type FormValues = z.infer<typeof academicYearSchema>;

interface AddAcademicYearDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddAcademicYearDialog({ isOpen, onOpenChange, onSuccess }: Readonly<AddAcademicYearDialogProps>) {
  const { mutate: createAcademicYear, isPending } = useCreateAcademicYearMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      periode: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    createAcademicYear(values, {
      onSuccess: () => {
        toast.success("Année académique créée avec succès");
        form.reset();
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Erreur:", error);
        toast.error("Erreur lors de la création de l'année académique");
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter une année académique</DialogTitle>
          <DialogDescription>Créez une nouvelle année académique pour votre institution.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="periode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Période académique</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 2025-2026" {...field} />
                  </FormControl>
                  <FormDescription>Saisissez la période académique (par exemple: 2025-2026).</FormDescription>
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
