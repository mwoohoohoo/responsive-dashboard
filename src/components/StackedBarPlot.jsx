import { CategoricalAxisBottom } from "./AxisBottom";
import { AxisLeft } from "./AxisLeft";
import { LegendBottom } from "./LegendBottom";
import * as d3 from "d3";
import { useRef } from "react";
import { useDimensions } from "../use-dimensions";
import { useState } from "react";

export const StackedBarPlot = ({
  width,
  height,
  data,
  grouping,
  colorScale,
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

  const boundsWidth = width - MARGIN.left - MARGIN.right;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // List of countries
  const allGroups = data.map((d) => String(d.country));
  // The subgroups for the stacks
  const allSubgroups = grouping;

  // Data Wrangling: stack the data
  const stackSeries = d3.stack().keys(allSubgroups).order(d3.stackOrderNone);
  //.offset(d3.stackOffsetNone);
  const series = stackSeries(data);

  // max value from total of energy values in filtered dataset
  const maxValue = d3.max(
    data,
    (d) => d.nonRenewValue + d.renewValue + d.nuclear,
  );

  const xScale = d3
    .scaleBand()
    .domain(allGroups)
    .range([0, boundsWidth])
    .padding(0.1);

  const yScale = d3
    .scaleLinear()
    .domain([0, maxValue])
    .range([boundsHeight, 0]);

  const rectangles = series.map((subgroup, i) => {
    return (
      <g key={i}>
        {subgroup.map((group, j) => {
          return (
            <rect
              key={j}
              x={xScale(group.data.country)}
              y={yScale(group[1])}
              height={yScale(group[0]) - yScale(group[1])}
              width={xScale.bandwidth()}
              fill={colorScale(subgroup.key)}
              opacity={
                hoveredGroup === null || hoveredGroup === subgroup.key ? 1 : 0.2
              }
              onMouseEnter={() => setHoveredGroup(subgroup.key)}
              onMouseLeave={() => setHoveredGroup(null)}
              style={{ transition: "opacity 200ms" }}
              className="cursor-pointer"
            ></rect>
          );
        })}
      </g>
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
        {rectangles}
        <g transform={`translate(0, ${boundsHeight})`}>
          <CategoricalAxisBottom xScale={xScale} />
        </g>
        <AxisLeft
          yScale={yScale}
          pixelsPerTick={40}
          label={isMobile ? "TWh" : "TWh (terawatt-hours)"}
          isMobile={isMobile}
        />
      </g>
    </svg>
  );
};

export const ResponsiveStackedBarPlot = ({ data, ...props }) => {
  const chartRef = useRef(null);
  const chartSize = useDimensions(chartRef);
  const [hoveredGroup, setHoveredGroup] = useState(null);

  const allSubgroups = Object.keys(data[0]).filter((key) => key !== "country");

  const colorScale = d3
    .scaleOrdinal()
    .domain(allSubgroups)
    .range(d3.schemeObservable10);

  return (
    <div className="w-full">
      <div ref={chartRef} className="w-full h-[280px] sm:h-[500px]">
        <StackedBarPlot
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
