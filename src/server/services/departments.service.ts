import { Department, DepartmentCreateInput, DepartmentUpdateInput } from "@/types/departments.types";
import { getAuthToken } from "@/utils/auth-utils";
import api from "@/utils/axios";

export class DepartmentService {
  static async getDepartments(): Promise<Department[]> {
    const token = getAuthToken();
    if (!token) throw new Error("Non authentifié");

    const { data } = await api.get(`/api/v1/departmens`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  }

  static async getDepartmentById(id: string): Promise<Department> {
    const token = getAuthToken();
    if (!token) throw new Error("Non authentifié");

    const { data } = await api.get(`/api/v1/departmens/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  }

  static async createDepartment(input: DepartmentCreateInput): Promise<Department> {
    const token = getAuthToken();
    if (!token) throw new Error("Non authentifié");

    const { data } = await api.post(`/api/v1/departmens`, input, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  }

  static async updateDepartment(department: DepartmentUpdateInput): Promise<Department> {
    const token = getAuthToken();
    if (!token) throw new Error("Non authentifié");

    const { id, ...updateData } = department;
    const { data } = await api.put(`/api/v1/departmens/${id}`, updateData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  }

  static async deleteDepartment(id: string): Promise<void> {
    const token = getAuthToken();
    if (!token) throw new Error("Non authentifié");

    await api.delete(`/api/v1/departments/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
