"use client";

import React from "react";
import Plot from "react-plotly.js";

interface HeatmapViewerProps {
  z: number[];
  x: number[];
  y: number[];
  colorscale?: Plotly.ColorScale;
  layout: Partial<Plotly.Layout>;
}

function HeatmapViewer({
  z,
  x,
  y,
  colorscale = "Viridis",
  layout = {
    width: 600,
    height: 600,
  },
}: HeatmapViewerProps): React.JSX.Element {
  return (
    <div className="flex w-fit flex-col items-start gap-2">
      <Plot
        data={[
          {
            z,
            x,
            y,
            type: "heatmap",
            colorscale,
          },
        ]}
        layout={layout}
      />
    </div>
  );
}

export default HeatmapViewer;
