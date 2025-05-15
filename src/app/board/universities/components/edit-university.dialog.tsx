import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrganizationsQuery } from "@/hooks/queries/use-organizations.query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { University } from "@/types/university.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUpdateUniversityMutation } from "@/hooks/queries/use-universities.query";
import { useUsersQuery } from "@/hooks/queries/use-user.query";

const formSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  organization: z.string().min(1, "Veuillez sélectionner une organisation"),
  responsable: z.string().min(1, "Veuillez sélectionner un responsable"),
});

interface EditUniversityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  university: University | null;
}

export function EditUniversityDialog({ isOpen, onOpenChange, university }: EditUniversityDialogProps) {
  const { data: organizations } = useOrganizationsQuery();
  const { data: users } = useUsersQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      name: "",
      organization: "",
      responsable: "",
    },
  });

  const { mutate: updateUniversity, isPending } = useUpdateUniversityMutation();

  useEffect(() => {
    if (university) {
      form.reset({
        id: university.id,
        name: university.name,
        organization: typeof university.organization === "string" ? university.organization : university.organization?.id || "",
        responsable: typeof university.responsable === "string" ? university.responsable : university.responsable?.email || "",
      });
    }
  }, [form, university]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateUniversity(values, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;université</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l&apos;université. Cliquez sur enregistrer une fois terminé.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de l'université" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organisation</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une organisation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizations?.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
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
              name="responsable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsable</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un responsable" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users?.users?.map((user) => (
                        <SelectItem key={user.id} value={user.id || ""}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
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
