import { useRef, useEffect, useState } from "react";
import { projects } from "../mocks/projects";
import { runForecastEngine } from "../engine/forecastEngine";

const DAYS = 30;

function DependencyLines({
  tasks,
  positions,
  containerRef,
}: {
  tasks: any[];
  positions: Record<string, DOMRect>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const containerRect = containerRef.current?.getBoundingClientRect();

  if (!containerRect) return null;

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
      style={{ overflow: "visible" }}
    >
      {tasks.map((task) =>
        (task.dependsOn || []).map((depId: string) => {
          const from = positions[depId];
          const to = positions[task.id];

          if (!from || !to) return null;

          const x1 = from.right - containerRect.left;
          const y1 = from.top - containerRect.top + from.height / 2;
          const x2 = to.left - containerRect.left;
          const y2 = to.top - containerRect.top + to.height / 2;

          return (
            <line
              key={`${depId}-${task.id}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="gray"
              strokeWidth="2"
            />
          );
        }),
      )}
    </svg>
  );
}

export default function Schedule() {
  const project = projects[0];
  const [delay, setDelay] = useState(0);
  const result = runForecastEngine(project, delay);
  const tasks = result.tasks;
  const [positions, setPositions] = useState<Record<string, DOMRect>>({});
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const newPositions: Record<string, DOMRect> = {};

    Object.entries(rowRefs.current).forEach(([id, el]) => {
      if (el) {
        newPositions[id] = el.getBoundingClientRect();
      }
    });

    setPositions(newPositions);
  }, [tasks, delay]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-4">Schedule View</h2>
        <p className="text-gray-500">Interactive Project Schedule Simulation</p>
      </div>

      <div className="bg-white border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Simulated Delay</p>
          <p className="text-lg font-bold">{delay} days</p>
        </div>

        <input
          type="range"
          min={0}
          max={10}
          value={delay}
          onChange={(e) => setDelay(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div
        ref={containerRef}
        className="relative overflow-x-auto border rounded-lg bg-white"
      >
        <DependencyLines
          tasks={tasks}
          positions={positions}
          containerRef={containerRef}
        />

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

        {tasks.map((task) => {
          const adjustedStart = task.startDay + delay;

          return (
            <div
              key={task.id}
              ref={(el) => {
                rowRefs.current[task.id] = el;
              }}
              className="relative z-20 grid border-b items-center"
              style={{
                gridTemplateColumns: `200px repeat(${DAYS}, minmax(40px, 1fr))`,
              }}
            >
              <div className="p-3 border-r font-medium">
                <div>{task.name}</div>
                <div className="text-xs text-gray-500">
                  Duration: {task.duration}d
                </div>
              </div>

              {Array.from({ length: DAYS }).map((_, day) => {
                const active =
                  day >= adjustedStart && day < adjustedStart + task.duration;

                return (
                  <div
                    key={day}
                    className="h-14 border-r border-gray-200 relative"
                  >
                    {active && (
                      <div
                        className={`
                        absolute inset-1 rounded transition-all duration-300
                        ${task.risk === "high" ? "bg-red-400" : "bg-blue-400"}
                        `}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
