export type Task = {
  id: string;
  duration: number;
  dependsOn: string[];
};

export type TaskMetrics = {
  id: string;
  name?: string;
  risk?: "low" | "medium" | "high";
  es: number;
  ef: number;
  ls: number;
  lf: number;
  slack: number;
  dependsOn?: string[];
};

export type Result = {
  projectDuration: number;
  tasks: TaskMetrics[];
  criticalPath: string[];
};

export type LayoutTask = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  startX: number;
  endX: number;
  centerY: number;
  dependsOn: string[];
  isCritical: boolean;
};
