export type ReportRange = 'daily' | 'weekly' | 'sprint' | 'monthly';

export interface ReportEmployeeSummary {
  employeeId: string;
  employeeName: string;
  department: string;
  pod: string;
  submittedCount: number;
  completionRate: number;
  tasksCompleted: number;
  tasksWorking: number;
  blockers: number;
  lastUpdate: string | null;
  updates: any[];
}

export interface TeamAnalytics {
  activeEmployees: any[];
  rangeUpdates: any[];
  submittedCount: number;
  pendingCount: number;
  completionRate: number;
  blockerCount: number;
  employeeSummaries: ReportEmployeeSummary[];
}

export const getRangeStart: (range: ReportRange, now?: Date) => Date;
export const getPeriodLabel: (range: ReportRange) => string;
export const filterUpdatesByRange: (updates: any[], range: ReportRange, now?: Date) => any[];
export const buildTeamAnalytics: (args: { updates: any[]; users: any[]; range: ReportRange; now?: Date }) => TeamAnalytics;
export const exportAnalyticsToCsv: (filename: string, rows: any[]) => void;
