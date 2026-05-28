import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import Schedule from "../pages/Schedule";
import Scenario from "../pages/Scenario";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "schedule", element: <Schedule /> },
      { path: "scenario", element: <Scenario /> },
    ],
  },
]);
