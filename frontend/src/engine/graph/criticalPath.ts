import type { Task, Result, TaskMetrics, UiTask } from "./types";
import { buildGraph } from "./buildGraph";
import { topoSort } from "./topoSort";
import { getCalendarGridDistance } from "../dateEngine";
import { computeForward } from "./forwardPass";
import { computeBackward } from "./backwardPass";

export function computeCriticalPath(
  tasks: UiTask[],
  projectStartDateStr: string,
): Result {
  const { taskMap, inDegree, adj } = buildGraph(tasks);
  const order = topoSort(tasks, new Map(inDegree), adj);

  const es = new Map<string, number>();
  const ef = new Map<string, number>();

  for (const taskId of order) {
    const currentTask = taskMap.get(taskId)! as UiTask;
    const projectStart = new Date(projectStartDateStr + "T00:00:00");

    const safeStartDateStr =
      currentTask.start && currentTask.start !== "undefined"
        ? currentTask.start
        : projectStartDateStr;

    const manualTaskStart = new Date(currentTask.start + "T00:00:00");

    let manualOffsetDays = getCalendarGridDistance(
      projectStart,
      manualTaskStart,
      "day",
    );

    if (isNaN(manualOffsetDays)) {
      manualOffsetDays = 0;
    }

    let earliestStart = Math.max(0, manualOffsetDays);

    for (const depId of currentTask.dependsOn || []) {
      const depFinish = ef.get(depId) || 0;
      if (depFinish > earliestStart) {
        earliestStart = depFinish;
      }
    }

    es.set(taskId, earliestStart);
    ef.set(taskId, earliestStart + currentTask.duration);
  }

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
