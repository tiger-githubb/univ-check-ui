import { DepartmentService } from "@/server/services/departments.service";
import { DepartmentCreateInput, DepartmentUpdateInput } from "@/types/departments.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const departmentQueryKeys = {
  departments: ["departments"],
  department: (id: string) => ["department", id],
};

export function useDepartmentsQuery(page = 1, limit = 10) {
  return useQuery({
    queryKey: [...departmentQueryKeys.departments, page, limit],
    queryFn: async () => {
      const allDepartments = await DepartmentService.getDepartments();
      const start = (page - 1) * limit;
      const end = start + limit;
      return {
        departments: allDepartments.slice(start, end),
        total: allDepartments.length,
        page,
        limit,
      };
    },
  });
}

export function useDepartmentQuery(id: string) {
  return useQuery({
    queryKey: departmentQueryKeys.department(id),
    queryFn: () => DepartmentService.getDepartmentById(id),
    enabled: !!id,
  });
}

export function useCreateDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DepartmentCreateInput) => DepartmentService.createDepartment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentQueryKeys.departments });
    },
  });
}

export function useUpdateDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (department: DepartmentUpdateInput) => DepartmentService.updateDepartment(department),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentQueryKeys.departments });
    },
  });
}

export function useDeleteDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DepartmentService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentQueryKeys.departments });
    },
  });
}