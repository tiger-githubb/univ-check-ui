"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateOrganisationMutation } from "@/hooks/queries/use-organizations.query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const organizationSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
});

type FormValues = z.infer<typeof organizationSchema>;

interface AddOrganizationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddOrganizationDialog({ isOpen, onOpenChange, onSuccess }: AddOrganizationDialogProps) {
  const { mutate: createOrganization, isPending } = useCreateOrganisationMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    createOrganization(values, {
      onSuccess: () => {
        toast.success("Organisation créée avec succès");
        form.reset();
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Erreur:", error);
        toast.error("Erreur lors de la création de l'Organization");
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter une Organization</DialogTitle>
          <DialogDescription>Créez une nouvelle Organization pour votre institution.</DialogDescription>
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
                    <Input placeholder="..." {...field} />
                  </FormControl>
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

