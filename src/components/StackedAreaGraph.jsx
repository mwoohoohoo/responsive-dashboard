import * as d3 from "d3"; // we will need d3.js
import { AxisBottom } from "./AxisBottom";
import { AxisLeft } from "./AxisLeft";
import { LegendBottom } from "./LegendBottom";
import { useRef } from "react";
import { useDimensions } from "../use-dimensions";
import { useState } from "react";
import { energyPalette } from "../lib/colours";

export const StackedAreaGraph = ({
  width,
  height,
  data,
  grouping,
  colorScale,
  xVariable,
  hoveredGroup,
  setHoveredGroup,
  setExpandedGroup,
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

  const relatedGroups = {
    renewValue: [
      "renewValue",
      "hydro",
      "solar",
      "wind",
      "biofuel",
      "other_renewable",
    ],

    nonRenewValue: ["nonRenewValue", "coal", "oil", "gas"],

    nuclear: ["nuclear"],
  };

  const parentLookup = {
    coal: "nonRenewValue",
    oil: "nonRenewValue",
    gas: "nonRenewValue",

    hydro: "renewValue",
    solar: "renewValue",
    wind: "renewValue",
    biofuel: "renewValue",
    other_renewable: "renewValue",
  };

  const normalizedHover = parentLookup[hoveredGroup] || hoveredGroup;

  const activeGroups = normalizedHover ? relatedGroups[normalizedHover] : null;

  const allPath = series.map((serie, i) => {
    const path = areaBuilder(serie);
    return (
      <path
        key={i}
        d={path}
        stroke="none"
        fill={colorScale(serie.key)}
        opacity={
          activeGroups === null || activeGroups.includes(serie.key) ? 1 : 0.2
        }
        onMouseEnter={() => {
          const normalized = parentLookup[serie.key] || serie.key;

          setHoveredGroup(normalized);
          setExpandedGroup(normalized);
        }}
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
          <AxisBottom xScale={xScale} pixelsPerTick={80} isMobile={isMobile} />
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

export const ResponsiveStackedAreaGraph = ({ data, ...props }) => {
  const chartRef = useRef(null);
  const chartSize = useDimensions(chartRef);
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState(null);

  let grouping = ["nonRenewValue", "renewValue", "nuclear"];

  let legendGrouping = grouping;

  if (expandedGroup === "nonRenewValue") {
    grouping = ["coal", "oil", "gas", "renewValue", "nuclear"];

    legendGrouping = ["coal", "oil", "gas"];
  }

  if (expandedGroup === "renewValue") {
    grouping = [
      "nonRenewValue",
      "hydro",
      "solar",
      "wind",
      "biofuel",
      "other_renewable",
      "nuclear",
    ];

    legendGrouping = ["hydro", "solar", "wind", "biofuel", "other_renewable"];
  }

  if (expandedGroup === "nuclear") {
    legendGrouping = ["nuclear"];
  }

  const legendHoveredGroupMap = {
    nonRenewValue: ["coal", "oil", "gas"],
    renewValue: ["hydro", "solar", "wind", "biofuel", "other_renewable"],
  };

  const legendHoveredGroups =
    hoveredGroup === null
      ? null
      : expandedGroup === hoveredGroup
        ? legendHoveredGroupMap[hoveredGroup] || [hoveredGroup]
        : [hoveredGroup];

  const colorScale = d3
    .scaleOrdinal()
    .domain(grouping)
    .range(grouping.map((g) => energyPalette[g]));

  return (
    <div className="w-full">
      <div
        ref={chartRef}
        className="w-full h-[260px] sm:h-[360px]"
        onMouseLeave={() => {
          setHoveredGroup(null);
          setExpandedGroup(null);
        }}
      >
        <StackedAreaGraph
          width={chartSize.width}
          height={chartSize.height}
          data={data}
          grouping={grouping}
          colorScale={colorScale}
          hoveredGroup={hoveredGroup}
          setHoveredGroup={setHoveredGroup}
          setExpandedGroup={setExpandedGroup}
          {...props}
        />
      </div>
      <LegendBottom
        grouping={legendGrouping}
        colorScale={colorScale}
        hoveredGroup={legendHoveredGroups}
        setHoveredGroup={setHoveredGroup}
      />
    </div>
  );
};
