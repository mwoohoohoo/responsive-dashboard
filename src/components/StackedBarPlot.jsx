import { CategoricalAxisBottom } from "./AxisBottom";
import { AxisLeft } from "./AxisLeft";
import { LegendBottom } from "./LegendBottom";
import * as d3 from "d3";
import { useRef } from "react";
import { useDimensions } from "../use-dimensions";
import { useState } from "react";
import { sourcePalette } from "../lib/colours";
import { Tooltip } from "./ui/Tooltip";

export const StackedBarPlot = ({
  width,
  height,
  data,
  grouping,
  colorScale,
  hoveredGroup,
  setHoveredGroup,
  setInteractionData,
}) => {
  if (width === 0 || height === 0) {
    return null;
  }

  const isMobile = width < 640;

  const MARGIN = {
    top: 16,
    bottom: isMobile ? 16 : 32,
    left: isMobile ? 32 : 60,
    right: isMobile ? 4 : 8,
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
              onMouseEnter={() => {
                setHoveredGroup(subgroup.key);
                setInteractionData({
                  xPos:
                    MARGIN.left +
                    xScale(group.data.country) +
                    xScale.bandwidth() / 2,
                  yPos:
                    MARGIN.top -
                    14 +
                    yScale(group[1]) +
                    (yScale(group[0]) - yScale(group[1])) / 2,
                  tickLength: xScale.bandwidth() / 2 + 4,
                  placement:
                    xScale(group.data.country) < boundsWidth / 2
                      ? "left"
                      : "right",

                  value: group.data[subgroup.key],
                  color: colorScale(subgroup.key),
                });
              }}
              onMouseLeave={() => {
                setHoveredGroup(null);
                setInteractionData(null);
              }}
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
          <CategoricalAxisBottom xScale={xScale} isMobile={isMobile} />
        </g>
        <AxisLeft
          yScale={yScale}
          pixelsPerTick={isMobile ? 80 : 40}
          label={"TWh"}
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
  const [interactionData, setInteractionData] = useState(null);

  const allSubgroups = Object.keys(data[0]).filter((key) => key !== "country");

  const colorScale = d3
    .scaleOrdinal()
    .domain(allSubgroups)
    .range(allSubgroups.map((g) => sourcePalette[g]));

  return (
    <div className="w-full">
      <div ref={chartRef} className="relative w-full h-[260px] sm:h-[360px]">
        <StackedBarPlot
          width={chartSize.width}
          height={chartSize.height}
          data={data}
          grouping={allSubgroups}
          colorScale={colorScale}
          hoveredGroup={hoveredGroup}
          setHoveredGroup={setHoveredGroup}
          setInteractionData={setInteractionData}
          {...props}
        />
        {/* tooltip layer */}
        <div className="absolute inset-0 pointer-events-none">
          <Tooltip interactionData={interactionData} />
        </div>
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
