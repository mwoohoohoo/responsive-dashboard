import { AxisBottom } from "./AxisBottom";
import { AxisLeft } from "./AxisLeft";
import { LegendBottom } from "./LegendBottom";
import * as d3 from "d3";
import { useRef } from "react";
import { useDimensions } from "../use-dimensions";
import { useState } from "react";
import { countriesPalette } from "../lib/colours";

export const LineGraph = ({
  width,
  height,
  data,
  xVariable,
  yVariable,
  xLabel,
  groupBy,
  hoveredGroup,
  setHoveredGroup,
  colorScale,
}) => {
  if (width === 0 || height === 0) {
    return null;
  }

  const isMobile = width < 640;

  const MARGIN = {
    top: 16,
    bottom: isMobile ? 24 : 32,
    left: isMobile ? 40 : 80,
    right: isMobile ? 8 : 16,
  };

  const boundsWidth = width - MARGIN.left - MARGIN.right;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // array of categories
  const grouping = [...new Set(data.map((d) => d[groupBy]))];

  // min and max values from xVariable
  const [xMin, xMax] = d3.extent(data, (d) => d[xVariable]);

  // max value from all of the yVariable values in dataset
  const globalMax = d3.max(data, (d) => d[yVariable]);

  const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, boundsWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([0, globalMax])
    .range([boundsHeight, 0]);

  const lineGenerator = d3
    .line()
    .x((d) => xScale(d[xVariable]))
    .y((d) => yScale(d[yVariable]));

  const allPaths = grouping.map((g, i) => {
    const pathData = lineGenerator(data.filter((d) => d[groupBy] === g));
    return (
      <path
        key={i}
        d={pathData}
        fill="none"
        stroke={colorScale(g)}
        strokeWidth={2}
        opacity={hoveredGroup === null || hoveredGroup === g ? 1 : 0.2}
        onMouseEnter={() => setHoveredGroup(g)}
        onMouseLeave={() => setHoveredGroup(null)}
        style={{ transition: "opacity 200ms" }}
        className="cursor-pointer"
      />
    );
  });

  return (
    <div className="w-full">
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${MARGIN.left}, ${MARGIN.top})`}
        >
          <AxisLeft
            yScale={yScale}
            pixelsPerTick={isMobile ? 80 : 40}
            label={isMobile ? "TWh" : "TWh (terawatt-hours)"}
            boundsWidth={boundsWidth}
            isMobile={isMobile}
          />
          <g transform={`translate(0, ${boundsHeight})`}>
            <AxisBottom
              xScale={xScale}
              pixelsPerTick={80}
              label={xLabel}
              isMobile={isMobile}
            />
          </g>
          {allPaths}
        </g>
      </svg>
    </div>
  );
};

export const ResponsiveLineGraph = (props) => {
  const chartRef = useRef(null);
  const chartSize = useDimensions(chartRef);
  const [hoveredGroup, setHoveredGroup] = useState(null);

  const grouping = [...new Set(props.data.map((d) => d[props.groupBy]))];

  const colorScale = d3
    .scaleOrdinal()
    .domain(grouping)
    .range(grouping.map((g) => countriesPalette[g]));

  return (
    <div className="w-full">
      <div ref={chartRef} className="w-full h-[280px] sm:h-[400px]">
        <LineGraph
          width={chartSize.width}
          height={chartSize.height}
          hoveredGroup={hoveredGroup}
          setHoveredGroup={setHoveredGroup}
          colorScale={colorScale}
          {...props}
        />
      </div>
      <LegendBottom
        grouping={grouping}
        colorScale={colorScale}
        hoveredGroup={hoveredGroup}
        setHoveredGroup={setHoveredGroup}
      />
    </div>
  );
};
