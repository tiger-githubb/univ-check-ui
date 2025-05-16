"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RiArrowRightLine,
  RiCalendarLine,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiFileChartLine,
  RiInformationLine,
  RiTimeLine,
  RiTimerLine,
} from "@remixicon/react";

// Type pour les données d'émargement
interface AttendanceData {
  id: string;
  professor: {
    name: string;
    avatar?: string;
    initials: string;
  };
  courseTitle: string;
  status: "PRESENT" | "ABSENT" | "PENDING";
  date: string;
  time: string;
  department: string;
}

const recentAttendances: AttendanceData[] = [
  {
    id: "1",
    professor: {
      name: "Prof. Alexandre Dubois",
      initials: "AD",
    },
    courseTitle: "Introduction aux Algorithmes",
    status: "PRESENT",
    date: "16 mai 2025",
    time: "08:30 - 10:30",
    department: "Informatique",
  },
  {
    id: "2",
    professor: {
      name: "Prof. Marie Laurent",
      initials: "ML",
    },
    courseTitle: "Mathématiques Discrètes",
    status: "PRESENT",
    date: "16 mai 2025",
    time: "10:45 - 12:45",
    department: "Mathématiques",
  },
  {
    id: "3",
    professor: {
      name: "Prof. Thomas Moreau",
      initials: "TM",
    },
    courseTitle: "Intelligence Artificielle",
    status: "PENDING",
    date: "16 mai 2025",
    time: "14:00 - 16:00",
    department: "Informatique",
  },
  {
    id: "4",
    professor: {
      name: "Prof. Caroline Bernard",
      initials: "CB",
    },
    courseTitle: "Physique Quantique",
    status: "ABSENT",
    date: "15 mai 2025",
    time: "14:00 - 16:00",
    department: "Physique",
  },
  {
    id: "5",
    professor: {
      name: "Prof. Paul Lefevre",
      initials: "PL",
    },
    courseTitle: "Introduction au Big Data",
    status: "PRESENT",
    date: "15 mai 2025",
    time: "08:30 - 11:30",
    department: "Data Science",
  },
];

// Statistiques sur les départements
const departmentStats = [
  { name: "Informatique", attendanceRate: 92, coursesCount: 42 },
  { name: "Mathématiques", attendanceRate: 88, coursesCount: 36 },
  { name: "Physique", attendanceRate: 85, coursesCount: 28 },
  { name: "Chimie", attendanceRate: 90, coursesCount: 24 },
  { name: "Data Science", attendanceRate: 94, coursesCount: 18 },
];

// Agenda des prochains cours
const upcomingCourses = [
  {
    id: "up1",
    title: "Conception de Bases de Données",
    professor: "Prof. Michel Tremblay",
    time: "Aujourd'hui, 16:15 - 18:15",
    room: "Salle A304",
  },
  {
    id: "up2",
    title: "Programmation Avancée",
    professor: "Prof. Alexandre Dubois",
    time: "Demain, 08:30 - 10:30",
    room: "Salle B102",
  },
  {
    id: "up3",
    title: "Statistiques Appliquées",
    professor: "Prof. Sophie Martin",
    time: "Demain, 14:00 - 16:00",
    room: "Salle C201",
  },
];

// Composant pour afficher le badge de statut
function StatusBadge({ status }: { status: AttendanceData["status"] }) {
  if (status === "PRESENT") {
    return (
      <Badge className="bg-emerald-500 text-white flex items-center gap-1">
        <RiCheckboxCircleFill size={14} />
        Présent
      </Badge>
    );
  } else if (status === "ABSENT") {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <RiCloseCircleFill size={14} />
        Absent
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="bg-amber-100 text-amber-700 flex items-center gap-1 border-amber-200">
        <RiTimeLine size={14} />
        En attente
      </Badge>
    );
  }
}

export function RecentAttendances() {
  return (
    <Tabs defaultValue="recent" className="w-full">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="recent" className="flex items-center gap-1">
            <RiTimerLine size={16} />
            Émargements récents
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-1">
            <RiFileChartLine size={16} />
            Départements
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-1">
            <RiCalendarLine size={16} />
            Prochains cours
          </TabsTrigger>
        </TabsList>
        <Button variant="ghost" size="sm" className="gap-1">
          Voir tout <RiArrowRightLine size={16} />
        </Button>
      </div>

      <TabsContent value="recent">
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">Professeur</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Cours</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Date & Heure</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Statut</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {recentAttendances.map((attendance) => (
                  <tr key={attendance.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          {attendance.professor.avatar && <AvatarImage src={attendance.professor.avatar} />}
                          <AvatarFallback>{attendance.professor.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none">{attendance.professor.name}</p>
                          <p className="text-xs text-muted-foreground">{attendance.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="font-medium">{attendance.courseTitle}</div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-col">
                        <span className="text-sm">{attendance.date}</span>
                        <span className="text-xs text-muted-foreground">{attendance.time}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <StatusBadge status={attendance.status} />
                    </td>
                    <td className="p-4 align-middle">
                      <Button size="sm" variant="ghost">
                        Détails
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="departments">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentStats.map((dept) => (
            <Card key={dept.name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{dept.name}</CardTitle>
                <CardDescription>{dept.coursesCount} cours programmés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">{dept.attendanceRate}%</div>
                  <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                    Taux de présence
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="upcoming">
        <div className="space-y-4">
          {upcomingCourses.map((course) => (
            <Card key={course.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{course.title}</CardTitle>
                    <CardDescription>{course.professor}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    Confirmer
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <RiCalendarLine className="text-muted-foreground" />
                    {course.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <RiInformationLine className="text-muted-foreground" />
                    {course.room}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
