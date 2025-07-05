"use client";

import { createContext, ReactNode, useContext, useState } from "react";

// Default etiquettes for calendar filtering
export const etiquettes = [
  { id: "emerald", name: "Course Sessions", color: "emerald", isActive: true },
  { id: "blue", name: "Administrative", color: "blue", isActive: true },
  { id: "orange", name: "Events", color: "orange", isActive: true },
  { id: "violet", name: "Meetings", color: "violet", isActive: true },
  { id: "rose", name: "Holidays", color: "rose", isActive: true },
];

interface CalendarContextType {
  // Date management
  currentDate: Date;
  setCurrentDate: (date: Date) => void;

  // Etiquette visibility management
  visibleColors: string[];
  toggleColorVisibility: (color: string) => void;
  isColorVisible: (color: string | undefined) => boolean;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function useCalendarContext() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error("useCalendarContext must be used within a CalendarProvider");
  }
  return context;
}

interface CalendarProviderProps {
  children: ReactNode;
}

export function CalendarProvider({ children }: CalendarProviderProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Initialize visibleColors based on the isActive property in etiquettes
  const [visibleColors, setVisibleColors] = useState<string[]>(() => {
    // Filter etiquettes to get only those that are active
    return etiquettes.filter((etiquette) => etiquette.isActive).map((etiquette) => etiquette.color);
  });

  // Toggle visibility of a color
  const toggleColorVisibility = (color: string) => {
    setVisibleColors((prev) => {
      if (prev.includes(color)) {
        return prev.filter((c) => c !== color);
      } else {
        return [...prev, color];
      }
    });
  };

  // Check if a color is visible
  const isColorVisible = (color: string | undefined) => {
    if (!color) return true; // Events without a color are always visible
    return visibleColors.includes(color);
  };

  const value = {
    currentDate,
    setCurrentDate,
    visibleColors,
    toggleColorVisibility,
    isColorVisible,
  };

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}
