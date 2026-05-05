import * as d3 from "d3"; // we will need d3.js
import { AxisBottom } from "./AxisBottom";
import { AxisLeft } from "./AxisLeft";
import { LegendBottom } from "./LegendBottom";
import { useRef } from "react";
import { useDimensions } from "../use-dimensions";
import { useState } from "react";

export const StackedAreaGraph = ({
  width,
  height,
  data,
  grouping,
  colorScale,
  xVariable,
  hoveredGroup,
  setHoveredGroup,
}) => {
  if (width === 0 || height === 0) {
    return null;
  }

  const isMobile = width < 500;

  const MARGIN = {
    top: 16,
    bottom: isMobile ? 24 : 32,
    left: isMobile ? 40 : 80,
    right: isMobile ? 8 : 16,
  };

  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const stackSeries = d3
    .stack()
    .keys(grouping)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  const series = stackSeries(data);

  // max value from total of energy values in filtered dataset
  const maxY = d3.max(data, (d) => d3.sum(grouping, (key) => d[key]));

  const [xMin, xMax] = d3.extent(data, (d) => d[xVariable]);

  const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, boundsWidth]);

  const yScale = d3.scaleLinear().domain([0, maxY]).range([boundsHeight, 0]);

  // Build the line
  const areaBuilder = d3
    .area()
    .x((d) => xScale(d.data.year))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]));

  const allPath = series.map((serie, i) => {
    const path = areaBuilder(serie);
    return (
      <path
        key={i}
        d={path}
        stroke="none"
        fill={colorScale(serie.key)}
        opacity={hoveredGroup === null || hoveredGroup === serie.key ? 1 : 0.2}
        onMouseEnter={() => setHoveredGroup(serie.key)}
        onMouseLeave={() => setHoveredGroup(null)}
        style={{ transition: "opacity 200ms" }}
        className="cursor-pointer"
      />
    );
  });

  return (
    <svg width={width} height={height}>
      <rect width={width} height={height} fill="white" />
      <g
        width={boundsWidth}
        height={boundsHeight}
        transform={`translate(${MARGIN.left}, ${MARGIN.top})`}
      >
        {allPath}
        <g transform={`translate(0, ${boundsHeight})`}>
          <AxisBottom xScale={xScale} pixelsPerTick={60} />
        </g>
        <AxisLeft
          yScale={yScale}
          pixelsPerTick={isMobile ? 80 : 40}
          label={isMobile ? "TWh" : "TWh (terawatt-hours)"}
          isMobile={isMobile}
        />
      </g>
    </svg>
  );
};

export const ResponsiveStackedAreaGraph = ({ data, ...props }) => {
  const chartRef = useRef(null);
  const chartSize = useDimensions(chartRef);
  const [hoveredGroup, setHoveredGroup] = useState(null);

  const allSubgroups = Object.keys(data[0]).filter(
    (key) => key !== "year" && typeof data[0][key] === "number",
  );

  const colorScale = d3
    .scaleOrdinal()
    .domain(allSubgroups)
    .range(d3.schemeObservable10);

  return (
    <div className="w-full">
      <div ref={chartRef} className="w-full h-[280px] sm:h-[500px]">
        <StackedAreaGraph
          width={chartSize.width}
          height={chartSize.height}
          data={data}
          grouping={allSubgroups}
          colorScale={colorScale}
          hoveredGroup={hoveredGroup}
          setHoveredGroup={setHoveredGroup}
          {...props}
        />
      </div>
      <LegendBottom
        grouping={allSubgroups}
        colorScale={colorScale}
        hoveredGroup={hoveredGroup}
        setHoveredGroup={setHoveredGroup}
      />
    </div>
  );
};
