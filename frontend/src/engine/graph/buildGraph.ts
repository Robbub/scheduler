import type { Task } from "./types";

export function buildGraph(tasks: Task[]) {
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const t of tasks) {
    inDegree.set(t.id, t.dependsOn.length);

    for (const dep of t.dependsOn) {
      if (!adj.has(dep)) adj.set(dep, []);
      adj.get(dep)!.push(t.id);
    }
  }

  return { taskMap, inDegree, adj };
}
