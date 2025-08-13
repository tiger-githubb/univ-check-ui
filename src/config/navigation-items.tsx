import { IconType } from "react-icons";
import {
  PiBookmarkDuotone,
  PiBookOpenDuotone,
  PiBuildingDuotone,
  PiBuildingsDuotone,
  PiCalendarCheckDuotone,
  PiCalendarDuotone,
  PiCheckSquareDuotone,
  PiGearDuotone,
  PiHouseDuotone,
  PiUserDuotone,
} from "react-icons/pi";
import { routes } from "./routes";

export interface TeamData {
  name: string;
  logo: string;
}

export interface NavMenuItem {
  title: string;
  url: string;
  icon?: IconType;
  isActive?: boolean;
  permission?: string[];
}

export interface NavMenuGroup {
  title: string;
  url: string;
  items: NavMenuItem[];
}

export const teamsData: TeamData[] = [
  {
    name: "Esgis Avedji",
    logo: "https://ui-avatars.com/api/?name=Esgis+Avedji&background=random",
  },
  {
    name: "Esgis Adjidogomé",
    logo: "https://ui-avatars.com/api/?name=Esgis+Adjidogome&background=random",
  },
  {
    name: "Esgis Kodjoviakopé",
    logo: "https://ui-avatars.com/api/?name=Esgis+Kodjoviakope&background=random",
  },
];

export const mainSections: NavMenuGroup[] = [
  {
    title: "Main",
    url: "#",
    items: [
      {
        title: "Board",
        url: routes.board.home,
        icon: PiHouseDuotone,
      },
      {
        title: "Années Académiques",
        url: routes.board.academicYears,
        icon: PiCalendarDuotone,
        permission: ["ADMIN", "SUPERVISOR"],
      },
      {
        title: "Organisations",
        url: routes.board.organizations,
        icon: PiBuildingsDuotone,
        permission: ["ADMIN"],
      },
      {
        title: "Universités",
        url: routes.board.universities,
        icon: PiBuildingDuotone,
        permission: ["ADMIN", "SUPERVISOR"],
      },
      {
        title: "Départements",
        url: routes.board.departments,
        icon: PiBuildingDuotone,
        permission: ["ADMIN", "SUPERVISOR"],
      },
      {
        title: "Programmes",
        url: routes.board.programs,
        icon: PiBookmarkDuotone,
        permission: ["ADMIN", "SUPERVISOR"],
      },
      {
        title: "Cours",
        url: routes.board.courses,
        icon: PiBookOpenDuotone,
        permission: ["ADMIN", "SUPERVISOR"],
      },
      {
        title: "Sessions de cours",
        url: routes.board.classSessions,
        icon: PiCalendarCheckDuotone,
        permission: ["ADMIN", "SUPERVISOR"],
      },
      {
        title: "Utilisateurs",
        url: routes.board.users,
        icon: PiUserDuotone,
        permission: ["ADMIN", "SUPERVISOR"],
      },
      {
        title: "Émargement",
        url: routes.board.attendance,
        icon: PiCheckSquareDuotone,
        permission: ["TEACHER"],
      },
      {
        title: "Gestion des émargements",
        url: routes.board.attendanceAdmin,
        icon: PiCheckSquareDuotone,
        permission: ["ADMIN", "SUPERVISOR"],
      },
    ],
  },
];

export const otherSections: NavMenuGroup[] = [
  {
    title: "Autres",
    url: "#",
    items: [
      {
        title: "Paramètres",
        url: routes.board.settings,
        icon: PiGearDuotone,
      },
      {
        title: "Profil",
        url: routes.board.profile,
        icon: PiUserDuotone,
      },
    ],
  },
];

export const navigationData = {
  teams: teamsData,
  navMain: [...mainSections, ...otherSections],
};
