"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdateOrganisationMutation } from "@/hooks/queries/use-organizations.query";
import { Organization } from "@/types/organization.types";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const organizationSchema = z.object({
  name: z.string().min(2, "La période doit contenir au moins 2 caractères"),
});

type FormValues = z.infer<typeof organizationSchema>;

interface EditOrganizationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organization | null;
}

export function EditOrganizationDialog({ isOpen, onOpenChange, organization }: EditOrganizationDialogProps) {
  const { mutate: updateOrganization, isSuccess, isPending } = useUpdateOrganisationMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
    },
  });

  // Reset form with academic year data when dialog opens or academic year changes
  useEffect(() => {
    if (organization && isOpen) {
      form.reset({
        name: organization.name,
      });
    }
  }, [organization, form, isOpen]);

  const onSubmit = (data: FormValues) => {
    if (!organization) return;

    updateOrganization({
      id: organization.id,
      name: data.name,
    });
  };

  useEffect(() => {
    if (isSuccess) {
      onOpenChange(false);
    }
  }, [isSuccess, onOpenChange]);

  if (!organization) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;Organization</DialogTitle>
          <DialogDescription>Modifiez les informations de l&apos;Organization {organization.name}.</DialogDescription>
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
                {isPending ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
