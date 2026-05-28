import type { Task } from "../graph/types";
import { computeCriticalPath } from "../graph/criticalPath";

export function injectDelay(tasks: Task[], taskId: string, delay: number) {
  const updatedTasks = tasks.map((task) => {
    if (task.id !== taskId) return task;

    return {
      ...task,
      duration: task.duration + delay,
    };
  });

  return computeCriticalPath(updatedTasks);
}
