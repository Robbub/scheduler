import { useState, useMemo } from "react";
import { computeCriticalPath } from "../engine/graph/criticalPath";
import { testTasks } from "../mocks/testSchedule";
import { injectDelay } from "../engine/simulation/delayPropagation";
import GanttChart from "../components/gantt/ganttChart";

const DEFAULT_START_DATE = "2026-06-01";
const MIN_DATE = "2026-01-01";
const MAX_DATE = "2026-12-31";

const criticalPathResults = computeCriticalPath(testTasks);
console.log(criticalPathResults);
const injectResults = injectDelay(testTasks, "B", 3);
console.log(injectResults);

export default function Schedule() {
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [projectStartDate, setProjectStartDate] = useState(DEFAULT_START_DATE);
  const [globalDelay, setGlobalDelay] = useState(0);
  const [taskDelays, setTaskDelays] = useState<Record<string, number>>(() =>
    Object.fromEntries(testTasks.map((t) => [t.id, 0])),
  );
  const [activeEditingTaskId, setActiveEditingTaskId] = useState<string | null>(
    null,
  );
  const [holidays, setHolidays] = useState<string[]>([
    "2026-01-01",
    "2026-12-25",
  ]);
  const [newHolidayInput, setNewHolidayInput] = useState("");

  const addHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayInput) return;
    if (!holidays.includes(newHolidayInput)) {
      setHolidays((prev) => [...prev, newHolidayInput].sort());
    }
    setNewHolidayInput("");
  };

  const removeHoliday = (dateStr: string) => {
    setHolidays((prev) => prev.filter((d) => d !== dateStr));
  };

  const graphResults = useMemo(() => {
    const processedTasks = testTasks.map((task) => {
      const addedTaskDelay = taskDelays[task.id] ?? 0;

      return {
        ...task,
        duration: task.duration + addedTaskDelay,
        dependsOn: task.dependsOn ?? [],
      };
    });
    const results = computeCriticalPath(processedTasks as any);
    // Apply global delay to all task timings
    return {
      ...results,
      tasks: results.tasks.map((task) => ({
        ...task,
        es: task.es + globalDelay,
        ef: task.ef + globalDelay,
        ls: task.ls + globalDelay,
        lf: task.lf + globalDelay,
      })),
      projectDuration: results.projectDuration + globalDelay,
    };
  }, [globalDelay, taskDelays]);

  const baselineResults = useMemo(() => {
    const normalized = testTasks.map((t) => ({
      ...t,
      dependsOn: t.dependsOn ?? [],
    }));
    return computeCriticalPath(normalized);
  }, []);

  const metrics = graphResults.tasks;
  const criticalPath = graphResults.criticalPath;

  const netSlippage =
    graphResults.projectDuration - baselineResults?.projectDuration;

  const currentEditingTask = testTasks.find(
    (t) => t.id === activeEditingTaskId,
  );

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-grey-900 tracking-tight">
            Schedule Dashboard
          </h2>
          <p className="text-gray-500 text-sm">
            Click any task row on the chart to inject targeted delays.
          </p>
        </div>
        <button
          onClick={() => {
            setGlobalDelay(0);
            setTaskDelays(Object.fromEntries(testTasks.map((t) => [t.id, 0])));
          }}
          className="px-3 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition shadow-sm"
        >
          Reset Simulation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4 shadow-sm space-y-2 md:col-span-2">
          <div className="flex justify-between text-xs font-semibold text-gray-600">
            <span className="font-bold">
              Project-Wide Starting Offset (Global Lag):
            </span>
            <span className="text-indigo-600 font-extrabold text-sm">
              {globalDelay} Days
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={15}
            value={globalDelay}
            onChange={(e) => setGlobalDelay(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded cursor-pointer accent-indigo-600"
          />

          <div className="bg-slate-900 border rounded-lg p-4 text-white flex flex-col justify-between shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Total Duration:</span>
              <span className="text-xl font-black text-emerald-400">
                {graphResults.projectDuration} Days
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800 mt-2">
              <span className="text-slate-400">Net Slippage</span>
              <span
                className={`font-bold ${netSlippage > 0 ? "text-amber-400 animate-pulse" : "text-slate-500"}`}
              >
                {netSlippage > 0
                  ? `+${netSlippage} Days Behind`
                  : "On Schedule"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm flex flex-col justify-between space-y-3 h-full">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700 border-b pb-1.5">
              Holiday Exception Registry
            </h3>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-2">
              {holidays.length === 0 ? (
                <p className="text-[11px] text-gray-400 italic">
                  No non-working exceptions declared.
                </p>
              ) : (
                holidays.map((date) => (
                  <span
                    key={date}
                    className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                  >
                    {date.substring(5)}
                    <button
                      onClick={() => removeHoliday(date)}
                      className="text-red-400 hover:text-red-600 font-sans font-bold text-[9px] ml-0.5"
                    >
                      X
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <form onSubmit={addHoliday} className="flex gap-1 pt-1 border-t">
            <input
              type="date"
              value={newHolidayInput}
              min={MIN_DATE}
              max={MAX_DATE}
              onChange={(e) => setNewHolidayInput(e.target.value)}
              className="border rounded px-1.5 py-1 text-xs font-medium bg-gray-50 focus:outline-indigo-600 w-full cursor-pointer"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-2.5 rounded transition shadow-sm"
            >
              +
            </button>
          </form>
        </div>
      </div>

      <div className="w-full">
        <GanttChart
          metrics={metrics}
          criticalPath={criticalPath}
          taskDelays={taskDelays}
          viewMode={viewMode}
          projectStartDate={projectStartDate}
          holidayList={holidays}
          onRowClick={(id) => setActiveEditingTaskId(id)}
        />
      </div>

      {activeEditingTaskId && currentEditingTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border p-6 shadow-2xl max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start border-b pb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Configure Task {currentEditingTask.id}
                </h3>
                <p className="text-xs text-gray-400">
                  Adjust parameters for this specific network node.
                </p>
              </div>
              <button
                onClick={() => setActiveEditingTaskId(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold bg-gray-100 px-2 py-0.5 rounded"
              >
                X
              </button>
            </div>

            <div className="space-y-3 py-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-600">Injected Buffer Delay:</span>
                <span className="text-amber-600 font-black text-sm">
                  +{taskDelays[currentEditingTask.id] ?? 0} Days
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                value={taskDelays[currentEditingTask.id] ?? 0}
                onChange={(e) =>
                  setTaskDelays((prev) => ({
                    ...prev,
                    [currentEditingTask.id]: Number(e.target.value),
                  }))
                }
                className="w-full h-2 bg-gray-200 rounded accent-amber-500 cursor-pointer"
              />
              <div className="bg-gray-50 rounded p-2.5 border text-[11px] text-gray-500 space-y-1">
                <div>
                  Base Task Work Duration:{" "}
                  <span className="font-bold text-gray-700">
                    {currentEditingTask.duration} Days
                  </span>
                </div>
                <div>
                  Total Combined Duration:{" "}
                  <span>
                    {currentEditingTask.duration +
                      (taskDelays[currentEditingTask.id] ?? 0)}{" "}
                    Days
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setActiveEditingTaskId(null)}
                className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg text-xs hover:bg-indigo-700 transition"
              >
                Apply Constraints & Recalculate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
