"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateDepartmentMutation } from "@/hooks/queries/use-departments.query";
import { Department } from "@/types/departments.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const departmentSchema = z.object({
  id: z.string().nonempty("ID requis"),
  name: z.string().min(1, "Nom requis"),
  universityId: z.string().min(1, "Université requise"),
});

type DepartmentFormInput = z.infer<typeof departmentSchema>;

export function EditDepartmentDialog({
  department,
  open,
  onOpenChange,
  onSuccess,
}: {
  department: Department | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const form = useForm<DepartmentFormInput>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      id: "",
      name: "",
      universityId: "",
    },
  });

  const { mutate: updateDepartment, isPending } = useUpdateDepartmentMutation();

  // Mise à jour des valeurs du formulaire lorsque le département change
  useEffect(() => {
    if (department && department.id) {
      form.reset({
        id: department.id,
        name: department.name || "",
        universityId: department.university.id || "",
      });
    }
  }, [department, form]);

  function onSubmit(values: DepartmentFormInput) {
    if (!values.id) {
      toast.error("ID du département manquant");
      return;
    }

    updateDepartment(values, {
      onSuccess: () => {
        toast.success("Département mis à jour avec succès");
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        toast.error("Erreur lors de la mise à jour du département");
        console.error("Mise à jour du département échouée:", error);
      },
    });
  }

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le département</DialogTitle>
          <DialogDescription>Modifiez les informations du département</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Champ ID caché */}
            <input type="hidden" {...form.register("id")} />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nom du département" />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}