import type { TaskMetrics, LayoutTask } from "../engine/graph/types";

const LABEL_WIDTH = 200;
const DAY_WIDTH = 40;
const ROW_HEIGHT = 56;

export function buildLayout(
  metrics: TaskMetrics[],
  criticalPath: string[],
): LayoutTask[] {
  return metrics.map((task, index) => {
    const start = task.es;
    const widthInDays = task.ef - task.es;

    const y = index * ROW_HEIGHT;
    const x = LABEL_WIDTH + start * DAY_WIDTH;
    const width = widthInDays * DAY_WIDTH;

    return {
      id: task.id,
      name: task.id,
      dependsOn: [],
      x,
      y,
      width,
      height: ROW_HEIGHT,
      startX: x,
      endX: x + width,
      centerY: y + ROW_HEIGHT / 2,
      isCritical: criticalPath.includes(task.id),
    };
  });
}
