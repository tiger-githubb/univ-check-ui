import { fr } from "date-fns/locale";

export const dateLocale = fr;

export const formatters = {
  weekday: (date: Date) => {
    return date.toLocaleDateString("fr-FR", { weekday: "short" });
  },
  month: (date: Date) => {
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  },
  day: (date: Date) => {
    return date.toLocaleDateString("fr-FR", { day: "numeric" });
  },
  time: (date: Date) => {
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  },
};

export const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
export const monthNames = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];
