"use client";

import React from "react";
import Plot from "react-plotly.js";

interface LineplotTrace {
  mode: "lines" | "lines+markers" | "markers";
  name: string;
  x: number[];
  y: number[];
}

interface LineplotParams {
  traces: LineplotTrace[];
  layout: Partial<Plotly.Layout>;
  config?: Partial<Plotly.Config>;
}

function Lineplot({
  traces,
  layout,
  config,
}: LineplotParams): React.JSX.Element {
  return (
    <div className="flex w-fit flex-col items-start gap-2">
      <Plot data={traces} layout={layout} config={config} />
    </div>
  );
}

export default Lineplot;
