import { useState } from "react";

export default function Scenario() {
  const [delay, setDelay] = useState(0);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Scenario Lab</h2>

      <div className="p-4 bg-white border rounded space-y-3">
        <p>Simluate Delay Impact</p>

        <input
          type="range"
          min="0"
          max="10"
          value={delay}
          onChange={(e) => setDelay(Number(e.target.value))}
        />

        <p className="text-lg font-semibold">Delay: {delay} days</p>
      </div>
    </div>
  );
}
