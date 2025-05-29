"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateDepartmentMutation } from "@/hooks/queries/use-departments.query";
import { DepartmentCreateInput } from "@/types/departments.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { RiBuildingLine } from "@remixicon/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const departmentSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  universityId: z.string().min(1, "Université requise"),
});

type DepartmentFormInput = z.infer<typeof departmentSchema>;

export default function AddDepartmentDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);

  const form = useForm<DepartmentFormInput>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      universityId: "",
    },
  });

  const { mutate: createDepartment, isPending } = useCreateDepartmentMutation();

  const onSubmit = (values: DepartmentFormInput) => {
    // Convertir les valeurs du formulaire au format attendu par DepartmentCreateInput
    const departmentInput: DepartmentCreateInput = {
      name: values.name,
      universityId: values.universityId,
    };

    createDepartment(departmentInput, {
      onSuccess: () => {
        toast.success("Département créé avec succès");
        setOpen(false);
        form.reset();
        onSuccess?.();
      },
      onError: (error) => {
        toast.error("Erreur lors de la création du département");
        console.error("Création de département échouée:", error);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <RiBuildingLine aria-hidden="true" />
          Ajouter un département
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader className="space-y-3">
          <DialogTitle>Ajouter un département</DialogTitle>
          <DialogDescription>Créez un nouveau département dans le système.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-2">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du département" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="universityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Université</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une université" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* Remplacez ces éléments par les données réelles des universités */}
                        <SelectItem value="university-1">Université 1</SelectItem>
                        <SelectItem value="university-2">Université 2</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      Sélectionnez l&apos;université à laquelle appartient ce département.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Création en cours..." : "Créer le département"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
