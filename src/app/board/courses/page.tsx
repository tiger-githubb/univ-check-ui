"use client";

import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import { RiBookOpenLine } from "@remixicon/react";
import { useEffect, useState } from "react";
import { EditCourseDialog } from "./components/edit-course.dialog";
import { useCoursesQuery } from "@/hooks/queries/use-course.query";
import { Course } from "@/types/course.types";
import { CoursesTable } from "./components/courses.table";
import { AddCourseDialog } from "./components/add-course.dialog";
import { useBreadcrumb } from "@/contexts/breadcrumb.context";
import { PageHeader } from "@/components/shared/page-header";

export default function CoursesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { setPageTitle } = useBreadcrumb();
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useCurrentUser();
  const { data: courses, isLoading, refetch } = useCoursesQuery();
  const isAdmin = true;

  useEffect(() => {
    setPageTitle("Cours");
  }, [setPageTitle]);

  return (
    <div>
      <PageHeader
        icon={<RiBookOpenLine className="text-primary" />}
        title={"Gestion des cours"}
        subtitle={"Gérez les cours de votre institution."}
        action={{
          label: "Nouveeau cours",
          onClick: () => setIsAddDialogOpen(true),
        }}
      />
      <div className="container mx-auto py-10">


        {/* Table */}
        <div className="flex-1 overflow-auto">
          <CoursesTable
            courses={courses || []}
            isLoading={isLoading}
            isAdmin={isAdmin}
            onEdit={(course) => setEditingCourse(course)}
            onDelete={() => refetch()}
          />
        </div>
      </div>

      {/* Add Course Dialog */}
      <AddCourseDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={() => refetch()} />

      {/* Edit Course Dialog */}
      <EditCourseDialog
        course={editingCourse}
        isOpen={!!editingCourse}
        onOpenChange={(open) => !open && setEditingCourse(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}