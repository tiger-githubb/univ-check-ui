"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdateAcademicYearMutation } from "@/hooks/queries/use-academic-year.query";
import { AcademicYear } from "@/types/academic-year.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const academicYearSchema = z.object({
  periode: z.string().min(2, "La période doit contenir au moins 2 caractères"),
});

type FormValues = z.infer<typeof academicYearSchema>;

interface EditAcademicYearDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  academicYear: AcademicYear | null;
}

export function EditAcademicYearDialog({ isOpen, onOpenChange, academicYear }: Readonly<EditAcademicYearDialogProps>) {
  const { mutate: updateAcademicYear, isSuccess, isPending } = useUpdateAcademicYearMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      periode: "",
    },
  });

  // Reset form with academic year data when dialog opens or academic year changes
  useEffect(() => {
    if (academicYear && isOpen) {
      form.reset({
        periode: academicYear.periode,
      });
    }
  }, [academicYear, form, isOpen]);

  const onSubmit = (data: FormValues) => {
    if (!academicYear) return;

    updateAcademicYear({
      id: academicYear.id,
      periode: data.periode,
    });
  };

  useEffect(() => {
    if (isSuccess) {
      onOpenChange(false);
    }
  }, [isSuccess, onOpenChange]);

  if (!academicYear) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;année académique</DialogTitle>
          <DialogDescription>Modifiez les informations de l&apos;année académique {academicYear.periode}.</DialogDescription>
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
                {isPending ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
