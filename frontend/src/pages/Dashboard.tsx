import { testTasks } from "../mocks/testSchedule";

export default function Dashboard() {
  const project = testTasks[0];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white border rounded">
          <p className="text-sm text-gray-500">Delay Risk</p>
          {/* <p className="text-xl font-bold">{project.forecast.delayDays} days</p> */}
        </div>

        <div className="p-4 bg-white border rounded">
          <p className="text-sm text-gray-500">Confidence</p>
          {/* <p className="text-xl font-bold">
            {project.forecast.confidence * 100}%
          </p> */}
        </div>

        <div className="p-4 bg-white border rounded">
          <p className="text-sm text-gray-500">Active Projects</p>
          {/* <p className="text-xl font-bold">{projects.length}</p> */}
        </div>
      </div>

      <div className="p-6 bg-white border rounded h-64">
        <p className="text-gray-500">Gantt Preview (coming next)</p>
      </div>
    </div>
  );
}
