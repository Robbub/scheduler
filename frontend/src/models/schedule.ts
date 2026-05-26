export type TaskRisk = "low" | "medium" | "high";

export interface Task {
  id: string;
  name: string;
  startDay: number;
  duration: number;
  risk: TaskRisk;
  dependsOn?: string[];
  predictedDelayDays?: number;
  confidence?: number;
}

export interface Project {
  id: string;
  name: string;
  tasks: Task[];
}
