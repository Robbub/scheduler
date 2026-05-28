import type { Task, Result, TaskMetrics } from "./types";
import { buildGraph } from "./buildGraph";
import { topoSort } from "./topoSort";
import { computeForward } from "./forwardPass";
import { computeBackward } from "./backwardPass";

export function computeCriticalPath(tasks: Task[]): Result {
  const { taskMap, inDegree, adj } = buildGraph(tasks);

  const order = topoSort(tasks, new Map(inDegree), adj);

  const { es, ef } = computeForward(order, taskMap);
  const { ls, lf, projectDuration } = computeBackward(order, taskMap, adj, ef);

  const metrics: TaskMetrics[] = tasks.map((t) => {
    const ES = es.get(t.id)!;
    const EF = ef.get(t.id)!;
    const LS = ls.get(t.id)!;
    const LF = lf.get(t.id)!;

    return {
      id: t.id,
      es: ES,
      ef: EF,
      ls: LS,
      lf: LF,
      slack: LS - ES,
    };
  });

  const criticalPath = metrics.filter((m) => m.slack === 0).map((m) => m.id);

  return {
    projectDuration,
    tasks: metrics,
    criticalPath,
  };
}
