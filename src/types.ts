export type IssueCategory = 'Pothole' | 'Streetlight' | 'Water Leakage' | 'Trash/Sanitation' | 'Traffic Sign' | 'Other';

export type IssueStatus = 'Reported' | 'Investigating' | 'In Progress' | 'Resolved';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface TimelineEvent {
  status: IssueStatus;
  updatedAt: string;
  comment: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  severity: SeverityLevel;
  upvotes: number;
  upvotedBy: string[]; // List of user identifiers/IPs/emails who upvoted
  reporterName: string;
  reporterEmail: string;
  createdAt: string;
  updatedAt: string;
  x: number; // custom map position (0 to 100 percentage)
  y: number; // custom map position (0 to 100 percentage)
  neighborhood: string;
  suggestedDepartment: string;
  tags: string[];
  statusTimeline: TimelineEvent[];
  aiAnalysis?: {
    confidence: number;
    explanation: string;
    actionPlan: string[];
  };
}

export interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  reportsCount: number;
  resolvedCount: number;
  badge: string;
  badgeIcon: string;
  level: number;
}

export interface SystemStats {
  totalIssues: number;
  resolvedIssues: number;
  inProgressIssues: number;
  investigatingIssues: number;
  reportedIssues: number;
  averageResolutionDays: number;
  categoryDistribution: Record<IssueCategory, number>;
  neighborhoodDistribution: Record<string, number>;
  weeklyTrend: { date: string; reported: number; resolved: number }[];
}
