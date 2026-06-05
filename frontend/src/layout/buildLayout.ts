import type { TaskMetrics, LayoutTask } from "../engine/graph/types";
import { addWorkingDays, getCalendarGridDistance } from "../engine/dateEngine";

const LABEL_WIDTH = 200;
const ROW_HEIGHT = 56;
const DEFAULT_STARTING_DATE_ANCHOR = "2026-06-01";

export function buildLayout(
  metrics: TaskMetrics[],
  criticalPath: string[],
  projectAnchorDateStr: string = DEFAULT_STARTING_DATE_ANCHOR,
  viewMode: "day" | "week" | "month" = "day",
  holidayList: string[],
): LayoutTask[] {
  const projectStart = new Date(projectAnchorDateStr);
  const COLUMN_WIDTH = viewMode === "day" ? 40 : viewMode === "week" ? 80 : 120;

  return metrics.map((task, index) => {
    const realStartDate = addWorkingDays(projectStart, task.es, holidayList);
    const realEndDate = addWorkingDays(projectStart, task.ef, holidayList);

    const startColumnOffset = getCalendarGridDistance(
      projectStart,
      realStartDate,
      viewMode,
    );
    const durationColumns =
      getCalendarGridDistance(realStartDate, realEndDate, viewMode) || 1;

    const y = index * ROW_HEIGHT;
    const x = LABEL_WIDTH + startColumnOffset * COLUMN_WIDTH;
    const width = durationColumns * COLUMN_WIDTH;

    return {
      id: task.id,
      name: task.id,
      dependsOn: task.dependsOn ?? [],
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
