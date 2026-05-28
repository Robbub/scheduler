import type { Task } from "../engine/graph/types";

export const testTasks: Task[] = [
  {
    id: "A",
    duration: 4,
    dependsOn: [],
  },
  {
    id: "B",
    duration: 3,
    dependsOn: ["A"],
  },
  {
    id: "C",
    duration: 2,
    dependsOn: ["A"],
  },
  {
    id: "D",
    duration: 5,
    dependsOn: ["B", "C"],
  },
];
