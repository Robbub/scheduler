import { Outlet, Link } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white border-r p-4 space-y-4">
        <h1 className="text-xl font-bold">Scheduler</h1>

        <nav className="flex flex-col gap-2">
          <Link to="/" className="hover:underline">
            Dashboard
          </Link>
          <Link to="/schedule" className="hover:underline">
            Schedule
          </Link>
          <Link to="/scenario" className="hover:underline">
            Scenario Lab
          </Link>
        </nav>
      </div>

      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
