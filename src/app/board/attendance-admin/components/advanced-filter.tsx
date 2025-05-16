"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { RiCalendarLine, RiFilterLine, RiSearch2Line, RiUserLine } from "@remixicon/react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";

export interface FilterValues {
  professorName?: string;
  courseTitle?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
}

interface AdvancedFilterProps {
  onFilterChange: (filters: FilterValues) => void;
  onRefresh: () => void;
}

export function AdvancedFilter({ onFilterChange, onRefresh }: AdvancedFilterProps) {
  const form = useForm<FilterValues>({
    defaultValues: {
      professorName: "",
      courseTitle: "",
      status: "ALL",
    },
  });

  const handleSubmit = (values: FilterValues) => {
    // If status is "ALL", remove it from the filter values to not filter by status
    const filterValues = { ...values };
    if (filterValues.status === "ALL") {
      delete filterValues.status;
    }
    onFilterChange(filterValues);
  };
  const handleReset = () => {
    form.reset({
      professorName: "",
      courseTitle: "",
      dateFrom: undefined,
      dateTo: undefined,
      status: "ALL",
    });
    onFilterChange({});
    onRefresh();
  };

  return (
    <div className="rounded-lg border p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center gap-2">
          <RiFilterLine className="text-primary" />
          Filtres avancés
        </h3>
        <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 px-2">
          <X className="h-4 w-4 mr-1" />
          Réinitialiser
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="professorName"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs flex items-center gap-1 mb-1">
                  <RiUserLine className="text-muted-foreground" size={14} />
                  Professeur
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <RiSearch2Line className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Nom du professeur" className="pl-8" {...field} />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courseTitle"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs flex items-center gap-1 mb-1">Cours</FormLabel>
                <FormControl>
                  <div className="relative">
                    <RiSearch2Line className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Titre du cours" className="pl-8" {...field} />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateFrom"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs flex items-center gap-1 mb-1">
                  <RiCalendarLine className="text-muted-foreground" size={14} />
                  Date début
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "dd/MM/yyyy", { locale: fr }) : <span>Sélectionner une date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={fr} initialFocus />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateTo"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs flex items-center gap-1 mb-1">
                  <RiCalendarLine className="text-muted-foreground" size={14} />
                  Date fin
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "dd/MM/yyyy", { locale: fr }) : <span>Sélectionner une date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={fr} initialFocus />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs flex items-center gap-1 mb-1">Statut</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                  </FormControl>{" "}
                  <SelectContent>
                    <SelectItem value="ALL">Tous les statuts</SelectItem>
                    <SelectItem value="PRESENT">Présent</SelectItem>
                    <SelectItem value="ABSENT">Absent</SelectItem>
                    <SelectItem value="PENDING">En attente</SelectItem>
                    <SelectItem value="SUPERVISOR_CONFIRMED">Confirmé (supervision)</SelectItem>
                    <SelectItem value="CLASS_HEADER_CONFIRMED">Confirmé (responsable)</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <div className="flex gap-2 mt-2 col-span-full">
            <Button type="submit" className="ml-auto">
              <RiFilterLine className="mr-2" />
              Appliquer les filtres
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
