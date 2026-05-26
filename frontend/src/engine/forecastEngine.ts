import type { Project, Task } from "../models/schedule";

export interface SimulationResult {
  tasks: Task[];
  projectDelay: number;
}

export function runForecastEngine(
  project: Project,
  injectedDelay: number = 0,
): SimulationResult {
  const taskMap = new Map<string, Task>();

  project.tasks.forEach((t) => {
    taskMap.set(t.id, { ...t });
  });

  for (const task of taskMap.values()) {
    task.startDay += injectedDelay;
  }

  let changed = true;

  while (changed) {
    changed = false;

    for (const task of taskMap.values()) {
      if (!task.dependsOn || task.dependsOn.length === 0) continue;

      let maxDependencyEnd = 0;

      for (const depId of task.dependsOn) {
        const dep = taskMap.get(depId);
        if (!dep) continue;
        const depEnd = dep.startDay + dep.duration;
        maxDependencyEnd = Math.max(maxDependencyEnd, depEnd);
      }

      const requiredStart = maxDependencyEnd;

      if (task.startDay < requiredStart) {
        task.startDay = requiredStart;
        changed = true;
      }
    }
  }

  const originalEnd = Math.max(
    ...project.tasks.map((t) => t.startDay + t.duration),
  );

  const newEnd = Math.max(
    ...Array.from(taskMap.values()).map((t) => t.startDay + t.duration),
  );

  return {
    tasks: Array.from(taskMap.values()),
    projectDelay: newEnd - originalEnd,
  };
}
