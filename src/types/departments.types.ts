export interface Department {
  id: string;
  name: string;
  university: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentCreateInput {
  name: string;
  universityId: string;
}

export interface Department {
  id: string;
  name: string;
  university: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentCreateInput {
  name: string;
  universityId: string;
}

export interface DepartmentUpdateInput {
  id: string;
  name?: string;
  universityId?: string;
}