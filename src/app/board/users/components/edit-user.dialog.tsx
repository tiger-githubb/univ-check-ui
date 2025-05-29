"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateUserMutation } from "@/hooks/queries/use-user.query";
import { User } from "@/types/user.types"; // Changé à User pour être cohérent
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const userSchema = z.object({
  id: z.string().nonempty("ID requis"),
  name: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional().nullable(),
  role: z.enum(["USER", "ADMIN", "TEACHER", "SUPERVISOR", "DELEGATE"] as const, {
    errorMap: () => ({ message: "Rôle requis" }),
  }),
});
type UserFormInput = z.infer<typeof userSchema>;

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const form = useForm<UserFormInput>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      id: "",
      name: "",
      email: "",
      phone: "",
      role: "USER",
    },
  });
  const { mutate: updateUser, isPending } = useUpdateUserMutation();

  // Mise à jour des valeurs du formulaire lorsque l'utilisateur change
  useEffect(() => {
    if (user && user.id) {
      form.reset({
        id: user.id,
        name: user.name || "",
        email: user.email,
        phone: user.phone || "",
        role: user.role || "USER",
      });
    }
  }, [user, form]);
  function onSubmit(values: UserFormInput) {
    // Vérification supplémentaire
    if (!values.id) {
      toast.error("ID utilisateur manquant");
      return;
    }

    // Convertir les valeurs pour être compatibles avec UserUpdateInput
    // Garantir que phone est undefined et pas null
    const userData = {
      ...values,
      phone: values.phone || undefined,
    };

    updateUser(userData, {
      onSuccess: () => {
        toast.success("Utilisateur mis à jour avec succès");
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        toast.error("Erreur lors de la mise à jour de l'utilisateur");
        console.error("Mise à jour d'utilisateur échouée:", error);
      },
    });
  }

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
          <DialogDescription>Modifiez les informations de l&apos;utilisateur</DialogDescription>
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
                    <Input {...field} placeholder="Nom complet" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="exemple@email.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder="Numéro de téléphone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USER">Utilisateur</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="TEACHER">Enseignant</SelectItem>
                      <SelectItem value="SUPERVISOR">Surveillant</SelectItem>
                      <SelectItem value="DELEGATE">Délégué</SelectItem>
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
