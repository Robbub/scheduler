import { useMemo, useState } from "react";
import type { TaskMetrics, LayoutTask } from "../../engine/graph/types";
import { buildLayout } from "../../layout/buildLayout";
import { isWorkingDay } from "../../engine/dateEngine";

const TOTAL_COLUMNS = 45;
const ROW_HEIGHT = 56;
const TEST_PROJECT_START_DATE = "2026-06-01";

function DependencyLines({
  metrics,
  layoutMap,
  criticalPath,
}: {
  metrics: TaskMetrics[];
  layoutMap: Record<string, LayoutTask>;
  criticalPath: string[];
}) {
  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
      {metrics.flatMap((metricItem) =>
        (metricItem.dependsOn || []).map((depId) => {
          const from = layoutMap[depId];
          const to = layoutMap[metricItem.id];

          if (!from || !to) return null;

          const midx = from.endX + 20;

          const d = `
            M ${from.endX} ${from.centerY}
            L ${midx} ${from.centerY}
            L ${midx} ${to.centerY}
            L ${to.x} ${to.centerY}
          `;

          const isThreadCritical =
            criticalPath.includes(from.id) && criticalPath.includes(to.id);

          return (
            <path
              key={`${depId}-${metricItem.id}`}
              d={d}
              fill="none"
              stroke={isThreadCritical ? "#f87171" : "#9ca3af"}
              strokeWidth={isThreadCritical ? "3" : "2"}
              className="transition-all duration-200 ease-in-out"
            />
          );
        }),
      )}
    </svg>
  );
}

type GanttChartProps = {
  metrics: TaskMetrics[];
  criticalPath: string[];
  taskDelays: Record<string, number>;
  onRowClick: (id: string) => void;
  projectStartDate?: string;
  viewMode: "day" | "week" | "month";
  holidayList: string[];
  onTaskDateChange: (
    id: string,
    newStartDate: string,
    newDuration: number,
  ) => void;
};

export default function GanttChart({
  metrics,
  criticalPath,
  taskDelays,
  onRowClick,
  projectStartDate = TEST_PROJECT_START_DATE,
  viewMode,
  holidayList,
  onTaskDateChange,
}: GanttChartProps) {
  const COLUMN_WIDTH = viewMode === "day" ? 40 : viewMode === "week" ? 80 : 120;

  const layout = useMemo(() => {
    return buildLayout(
      metrics,
      criticalPath,
      projectStartDate,
      viewMode,
      holidayList,
    );
  }, [metrics, criticalPath, projectStartDate, viewMode, holidayList]);

  const layoutMap = useMemo(() => {
    return Object.fromEntries(layout.map((t) => [t.id, t]));
  }, [layout]);

  const timelineHeaders = useMemo(() => {
    const start = new Date(projectStartDate);
    return Array.from({ length: TOTAL_COLUMNS }).map((_, i) => {
      const current = new Date(start);

      if (viewMode === "day") {
        current.setDate(start.getDate() + i);
        const isWorking = isWorkingDay(current, holidayList);

        return {
          label: current.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          subLabel: current
            .toLocaleDateString("en-US", { weekday: "short" })
            .substring(0, 1),
          isNonWorking: !isWorking,
        };
      } else if (viewMode === "week") {
        current.setDate(start.getDate() + i * 7);
        return {
          label: `wk ${i + 1}`,
          subLabel: current.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          isNonWorking: false,
        };
      } else {
        current.setMonth(start.getMonth() + i);
        return {
          label: current.toLocaleDateString("en-US", { month: "long" }),
          subLabel: current.getFullYear().toString(),
          isNonWorking: false,
        };
      }
    });
  }, [projectStartDate, viewMode, holidayList]);

  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOffsetDays, setDragOffsetDays] = useState<number>(0);
  const isDraggingRef = useMemo(() => ({ current: false }), []);

  const handleStartDragTask = (e: React.MouseEvent, layoutTask: LayoutTask) => {
    e.stopPropagation();
    e.preventDefault();

    isDraggingRef.current = false;
    const startX = e.clientX;
    setDraggingTaskId(layoutTask.id);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (Math.abs(moveEvent.clientX - startX) > 3) {
        isDraggingRef.current = true;
      }
      const deltaX = moveEvent.clientX - startX;
      const shiftedColumns = Math.round(deltaX / COLUMN_WIDTH);
      setDragOffsetDays(shiftedColumns);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      const finalDeltaX = upEvent.clientX - startX;
      const finalShiftedColumns = Math.round(finalDeltaX / COLUMN_WIDTH);

      if (isDraggingRef.current && finalShiftedColumns !== 0) {
        const baseDate = new Date(projectStartDate + "T00:00:00");

        const currentTaskMetric = metrics.find((m) => m.id === layoutTask.id);
        const baseOffset = currentTaskMetric ? currentTaskMetric.es : 0;

        baseDate.setDate(baseDate.getDate() + baseOffset + finalShiftedColumns);

        const year = baseDate.getFullYear();
        const month = String(baseDate.getMonth() + 1).padStart(2, "0");
        const day = String(baseDate.getDate()).padStart(2, "0");
        const nextDateStr = `${year}-${month}-${day}`;

        const duration = layoutTask.endX - layoutTask.startX;
        const mappedDuration = Math.max(1, Math.round(duration / COLUMN_WIDTH));

        onTaskDateChange(layoutTask.id, nextDateStr, mappedDuration);
      }

      setTimeout(() => {
        setDraggingTaskId(null);
        setDragOffsetDays(0);
      }, 50);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="relative overflow-x-auto border rounded-lg bg-white shadow-inner w-full max-w-full">
      <div style={{ minWidth: `${200 + TOTAL_COLUMNS * COLUMN_WIDTH}px` }}>
        <div
          className="grid border-b bg-gray-100 text-sm font-medium sticky top-0 z-40"
          style={{
            gridTemplateColumns: `200px repeat(${TOTAL_COLUMNS}, minmax(${COLUMN_WIDTH}px, 1fr))`,
          }}
        >
          <div className="p-3 border-r bg-gray-100 sticky left-0 z-50 border-b font-bold text-gray-700 text-xs">
            Task Timeline
          </div>
          {timelineHeaders.map((hdr, i) => (
            <div
              key={i}
              className={`p-1.5 border-r text-center flex flex-col justify-center select-none ${hdr.isNonWorking ? "bg-gray-200/60" : ""}`}
            >
              <div className="text-[10px] font-bold text-gray-700 leading-tight">
                {hdr.label}
              </div>
              <div className="text-[9px] text-gray-400 font-medium">
                {hdr.subLabel}
              </div>
            </div>
          ))}
        </div>

        <div className="relative">
          <DependencyLines
            metrics={metrics}
            layoutMap={layoutMap}
            criticalPath={criticalPath}
          />
          <div>{/* Render svg here */}</div>

          {metrics.map((metric) => {
            const isCritical = criticalPath.includes(metric.id);
            const injectedDays = taskDelays[metric.id] ?? 0;

            return (
              <div
                key={metric.id}
                onClick={() => {
                  if (!isDraggingRef.current) {
                    onRowClick(metric.id);
                  }
                }}
                className={`
                  grid border-b items-center cursor-pointer transition-colors duration-150 group
                  ${isCritical ? "bg-red-50/20 hover:bg-red-100/30" : "hover:bg-slate-50"}
                `}
                style={{
                  gridTemplateColumns: `200px repeat(${TOTAL_COLUMNS}, minmax(${COLUMN_WIDTH}px, 1fr))`,
                  height: `${ROW_HEIGHT}px`,
                }}
              >
                <div className="p-3 border-r font-medium bg-white sticky left-0 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] group-hover:bg-indigo-50/50 transition-colors">
                  <div className="truncate flex items-center justify-between pr-1">
                    <span className="text-gray-800 font-bold text-xs">
                      Task {metric.id}
                    </span>
                    {isCritical && (
                      <span className="bg-red-100 text-red-700 text-[8px] px-1 font-black tracking-wide">
                        CP
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 font-normal flex items-center gap-1 mt-0.5">
                    <span>Slack: {metric.slack}d</span>
                    {injectedDays > 0 && (
                      <span className="text-amber-600 font-semibold">
                        (+{injectedDays}d Delay)
                      </span>
                    )}
                  </div>
                </div>

                {timelineHeaders.map((hdr, day) => (
                  <div
                    key={day}
                    className={`h-full border-r border-gray-100/70 pointer-events-none`}
                    style={{
                      backgroundColor: hdr.isNonWorking
                        ? "#f1f5f9"
                        : "transparent",
                      backgroundImage: hdr.isNonWorking
                        ? "linear-gradient(45deg, #e2e8f0 25%, transparent 25%, transparent 50%, #e2e8f0 50%, #e2e8f0 75%, transparent 75%, transparent)"
                        : "none",
                      backgroundSize: "12px 12px",
                    }}
                  />
                ))}
              </div>
            );
          })}

          {layout.map((layoutTask) => {
            const metric = metrics.find((m) => m.id === layoutTask.id);
            if (!metric) return null;

            const isCritical = criticalPath.includes(layoutTask.id);
            const isCurrentlyDragged = draggingTaskId === layoutTask.id;
            const horizontalVisualOffset = isCurrentlyDragged
              ? dragOffsetDays * COLUMN_WIDTH
              : 0;

            return (
              <div
                key={layoutTask.id}
                onMouseDown={(e) => handleStartDragTask(e, layoutTask)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDraggingRef.current) {
                    onRowClick(layoutTask.id);
                  }
                }}
                className={`
                  absolute h-6 rounded z-10 shadow-sm flex items-center justify-center text-[10px] text-white font-bold transition-all duration-200 ease-in-out px-2 cursor-pointer select-none group hover:scale-[1.01] hover:shadow-md
                  ${isCritical ? "bg-red-500 border border-red-600" : "bg-indigo-500 border border-indigo-600"}  
                `}
                style={{
                  left: layoutTask.x + horizontalVisualOffset,
                  width: layoutTask.width,
                  top: layoutTask.y + (ROW_HEIGHT - 24) / 2,
                  transition: isCurrentlyDragged
                    ? "none"
                    : "all 0.2s ease-in-out",
                }}
              >
                <span className="truncate pr-1">Task {layoutTask.name}</span>
                {metric.slack > 0 && (
                  <span className="bg-white/20 px-1 rounded text-[8px] font-normal shrink-0">
                    +{metric.slack} Slack
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
    //   <div>
    //     <pre>{JSON.stringify(criticalPathResults, null, 2)}</pre>
    //     <pre>{JSON.stringify(injectResults, null, 2)}</pre>
    //   </div>
  );
}
