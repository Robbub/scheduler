import type { Task } from "./types";

export function topoSort(
  tasks: Task[],
  inDegree: Map<string, number>,
  adj: Map<string, string[]>,
) {
  const queue: string[] = [];
  const order: string[] = [];

  for (const t of tasks) {
    if (inDegree.get(t.id) === 0) queue.push(t.id);
  }

  while (queue.length) {
    const node = queue.shift()!;
    order.push(node);

    for (const next of adj.get(node) ?? []) {
      inDegree.set(next, inDegree.get(next)! - 1);
      if (inDegree.get(next) === 0) queue.push(next);
    }
  }

  return order;
}
