export interface University {
  id: string;
  name: string;
  organisation?: {
    id: string;
    name: string;
  };
  responsable?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateUniversityInput {
  name: string;
  organisation: string;
  responsable: string;
}

export interface UpdateUniversityInput {
  id: string;
  name?: string;
  organisation?: string;
  responsable?: string;
}
