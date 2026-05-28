import { useMemo } from "react";
import type { TaskMetrics, LayoutTask, Task } from "../../engine/graph/types";
import { buildLayout } from "../../layout/buildLayout";

const DAYS = 30;
const ROW_HEIGHT = 56;

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
      {metrics.flatMap((metrics) =>
        (metrics.dependsOn || []).map((depId) => {
          const from = layoutMap[depId];
          const to = layoutMap[metrics.id];

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
              key={`${depId}-${metrics.id}`}
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
};

export default function GanttChart({ metrics, criticalPath }: GanttChartProps) {
  const layout = useMemo(() => {
    return buildLayout(metrics, criticalPath);
  }, [metrics, criticalPath]);

  const layoutMap = useMemo(() => {
    return Object.fromEntries(layout.map((t) => [t.id, t]));
  }, [layout]);

  return (
    <div className="relative overflow-x-auto border rounded-lg bg-white">
      <div
        className="grid border-b bg-gray-100 text-sm font-medium"
        style={{
          gridTemplateColumns: `200px repeat(${DAYS}, minmax(40px, 1fr))`,
        }}
      >
        <div className="p-2 border-r">Task</div>
        {Array.from({ length: DAYS }).map((_, i) => (
          <div key={i} className="p-2 border-r text-center text-xs">
            {i + 1}
          </div>
        ))}
      </div>

      <div className="relative">
        <DependencyLines
          metrics={metrics}
          layoutMap={layoutMap}
          criticalPath={criticalPath}
        />
        {metrics.map((metric) => {
          const isCritical = criticalPath.includes(metric.id);

          return (
            <div
              key={metric.id}
              className={`relative z-20 grid border-b items-center ${isCritical ? "bg-red-50/30" : ""}`}
              style={{
                gridTemplateColumns: `200px repeat(${DAYS}, minmax(40px, 1fr))`,
                height: `${ROW_HEIGHT}px`,
              }}
            >
              <div className="p-3 border-r font-medium bg-white stickly left-0 z-30">
                <div className="truncate flex items-center gap-1">
                  Task ${metric.id}
                  {isCritical && (
                    <span className="bg-red-100 text-red-700 text-[9px] px-1 rounded uppercase tracking-wider font-extrabold">
                      CP
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  ES: {metric.es}d | Slack: {metric.slack}d
                </div>
              </div>

              {Array.from({ length: DAYS }).map((_, day) => (
                <div key={day} className="h-14 border-r border-gray-100" />
              ))}
            </div>
          );
        })}

        {layout.map((layoutTask) => {
          const metric = metrics.find((m) => m.id === layoutTask.id);
          if (!metric) return null;

          const isCritical = criticalPath.includes(layoutTask.id);

          return (
            <div
              key={layoutTask.id}
              className={`
                  absolute h-6 rounded z-20 shadow-sm flex items-center justify-center text-[10px] text-white font-bold transition-all duration-200 ease-in-out px-2
                  ${isCritical ? "bg-red-500" : "bg-indigo-500"}  
                `}
              style={{
                left: layoutTask.x,
                width: layoutTask.width,
                top: layoutTask.y + (ROW_HEIGHT - 24) / 2,
              }}
            >
              <span className="truncate">{layoutTask.name}</span>

              {metric.slack > 0 && (
                <span className="bg-white/20 px-1 rounded text-[8px] front-normal">
                  +{metric.slack}s
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
    //   <div>
    //     <pre>{JSON.stringify(criticalPathResults, null, 2)}</pre>
    //     <pre>{JSON.stringify(injectResults, null, 2)}</pre>
    //   </div>
  );
}
