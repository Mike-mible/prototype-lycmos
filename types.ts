
export enum SegmentState {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  HANDOVER_PENDING = 'HANDOVER_PENDING',
  CLOSED = 'CLOSED',
  REPORTED = 'REPORTED'
}

export type AllowedAction = 'START' | 'END' | 'CONFIRM_HANDOVER' | 'DECLARE_REVENUE' | 'REPORT_INCIDENT' | 'APPROVE';

export interface Branch {
  id: string;
  name: string;
  location: string;
  manager: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  branchId: string;
  status: 'ACTIVE' | 'IDLE' | 'MAINTENANCE';
  trustScore: number;
  revenueGenerated: number;
}

export interface Crew {
  id: string;
  name: string;
  role: 'DRIVER' | 'CONDUCTOR';
  branchId: string;
  status: 'ASSIGNED' | 'AVAILABLE' | 'OFF-DUTY';
  trustScore: number;
  incidentsCount: number;
}

export interface Segment {
  id: string;
  tripId: string;
  branchId: string;
  vehicleId: string;
  crewIds: string[];
  state: SegmentState;
  revenue: number;
  trustScore: number;
  allowedActions: AllowedAction[];
  startTime?: string;
  endTime?: string;
}

export interface Trip {
  id: string;
  route: string;
  segments: Segment[];
  overallStatus: string;
}

export interface SMSTicket {
  id: string;
  passengerPhone: string;
  tripId: string;
  segmentId: string;
  branchId: string;
  vehicleId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  amount: number;
  timestamp: string;
}

export interface Incident {
  id: string;
  tripId: string;
  segmentId: string;
  branchId: string;
  crewId: string;
  vehicleId: string;
  type: 'MECHANICAL' | 'ACCIDENT' | 'SECURITY' | 'REVENUE_DISCREPANCY';
  description: string;
  status: 'PENDING' | 'RESOLVED' | 'ESCALATED';
  timestamp: string;
}

export interface DashboardMetrics {
  totalTripsToday: number;
  activeSegments: number;
  revenueSummary: number;
  avgTrustScore: number;
  upcomingHandovers: number;
}
