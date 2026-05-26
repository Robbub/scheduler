import type { Project } from "../models/schedule";

export const projects: Project[] = [
  {
    id: "p1",
    name: "Bridge Construction",
    tasks: [
      {
        id: "t1",
        name: "Design",
        startDay: 0,
        duration: 5,
        risk: "low",
      },
      {
        id: "t2",
        name: "Foundation",
        startDay: 6,
        duration: 10,
        risk: "high",
        dependsOn: ["t1"],
      },
      {
        id: "t3",
        name: "Inspection",
        startDay: 18,
        duration: 4,
        risk: "low",
        dependsOn: ["t2"],
      },
    ],
  },
];
