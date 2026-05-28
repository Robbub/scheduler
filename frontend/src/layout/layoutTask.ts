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

export type Task = {
  id: string;
  name: string;
  duration: number;
  risk: "low" | "medium" | "high";
  dependsOn?: string[];
};
