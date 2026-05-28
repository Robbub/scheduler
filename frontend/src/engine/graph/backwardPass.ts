import type { Task } from "./types";

export function computeBackward(
  order: string[],
  taskMap: Map<string, Task>,
  adj: Map<string, string[]>,
  ef: Map<string, number>,
) {
  const ls = new Map<string, number>();
  const lf = new Map<string, number>();

  const projectDuration = Math.max(...ef.values());

  for (const id of order) {
    lf.set(id, projectDuration);
  }

  for (let i = order.length - 1; i >= 0; i--) {
    const id = order[i];
    const task = taskMap.get(id)!;

    const successors = adj.get(id) ?? [];

    if (successors.length === 0) {
      lf.set(id, projectDuration);
    } else {
      lf.set(id, Math.min(...successors.map((s) => ls.get(s)!)));
    }

    ls.set(id, lf.get(id)! - task.duration);
  }

  return { ls, lf, projectDuration };
}
