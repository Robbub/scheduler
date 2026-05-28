import { useState } from "react";
import { projects } from "../mocks/projects";
import { runForecastEngine } from "../engine/forecastEngine";
import { computeCriticalPath } from "../engine/graph/criticalPath";
import { testTasks } from "../mocks/testSchedule";
import { injectDelay } from "../engine/simulation/delayPropagation";
import GanttChart from "../components/gantt/ganttChart";

const criticalPathResults = computeCriticalPath(testTasks);
console.log(criticalPathResults);
const injectResults = injectDelay(testTasks, "B", 3);
console.log(injectResults);

export default function Schedule() {
  const mockProject = {
    id: "test-project",
    name: "Graph Simulation Project",
    tasks: testTasks.map((t) => ({
      ...t,
      name: `Task ${t.id}`, // Fallback label for layout
      startDay: 0,
      risk: (t.id === "B" ? "high" : "low") as "low" | "medium" | "high", // Optional styling
    })),
  };
  const [delay, setDelay] = useState(0);
  const simulation = runForecastEngine(mockProject, delay);
  const simulatedTasks = simulation.tasks;
  const graphResults = computeCriticalPath(
    simulatedTasks.map((task) => ({
      ...task,
      dependsOn: task.dependsOn ?? [],
    })),
  );
  const metrics = graphResults.tasks;
  const criticalPath = graphResults.criticalPath;

  return (
    <div className="space-y-6 p-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900 text-white p-4 rounded-lg text-xs font-mono shadow-md">
        <div>
          Total Projected Duration:{" "}
          <span className="text-emerald-400 font-bold text-sm">
            {graphResults.projectDuration} Days
          </span>
        </div>
        <div className="sm:text-right text-slate-400">
          Net Simulation Shift:{" "}
          <span
            className={
              simulation.projectDelay > 0 ? "text-amber-400 font-semibold" : ""
            }
          >
            +{simulation.projectDelay}d
          </span>
        </div>
      </div>

      <GanttChart metrics={metrics} criticalPath={criticalPath} />
    </div>
  );
}
