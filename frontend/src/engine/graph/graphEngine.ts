import { topoSort } from "./topoSort";
import { buildGraph } from "./buildGraph";
import { computeForward } from "./forwardPass";
import { computeBackward } from "./backwardPass";
import type { Task } from "./types";

export function computeSchedule(tasks: Task[]) {
  const { taskMap, inDegree, adj } = buildGraph(tasks);
  const order = topoSort(tasks, new Map(inDegree), adj);
  const { es, ef } = computeForward(order, taskMap);
  const { ls, lf, projectDuration } = computeBackward(order, taskMap, adj, ef);

  return {
    es,
    ef,
    ls,
    lf,
    projectDuration,
  };
}
