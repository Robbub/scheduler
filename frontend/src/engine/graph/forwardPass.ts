import type { Task } from "./types";

export function computeForward(order: string[], taskMap: Map<string, Task>) {
  const es = new Map<string, number>();
  const ef = new Map<string, number>();

  for (const id of order) {
    const task = taskMap.get(id)!;

    let start = 0;

    for (const dep of task.dependsOn) {
      start = Math.max(start, ef.get(dep) ?? 0);
    }

    es.set(id, start);
    ef.set(id, start + task.duration);
  }

  return { es, ef };
}
