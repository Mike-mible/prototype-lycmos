
export interface SACCO {
  id: string;
  name: string;
  registrationNumber: string;
  createdAt: string;
}

export interface Operator {
  id: string;
  name: string;
  licenseNumber: string;
  saccoId: string;
}

export interface Trip {
  id: string;
  route: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  operatorId: string;
  saccoId: string;
  startTime?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  fallback?: boolean;
}
