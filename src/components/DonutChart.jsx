import * as d3 from "d3";
import { LegendBottom } from "./LegendBottom";
import { useRef } from "react";
import { useDimensions } from "../use-dimensions";
import { useState } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { energyPalette } from "../lib/colours";

export const DonutChart = ({
  width,
  height,
  data,
  year,
  colorScale,
  hoveredGroup,
  setHoveredGroup,
}) => {
  if (width === 0 || height === 0) {
    return null;
  }

  const MARGIN = 16;

  const boundsWidth = width - MARGIN * 2;
  const boundsHeight = height - MARGIN * 2;

  const radius = Math.min(boundsWidth, boundsHeight) / 2 - MARGIN;

  // Include only selected year and country
  const filteredData = data.filter((d) => d.year === year);

  // Compute a pie generator = a function that transforms a dataset in a list of arcs
  const pieGenerator = d3.pie().value((d) => d.value);

  // Use this pie generator on our initial dataset
  const pie = pieGenerator(filteredData);

  // Compute an arc generator = a function that transforms arc coordinates in a svg path
  const arcPathGenerator = d3.arc();

  // For each arc, use the path generator
  const arcs = pie.map((grp, i) => {
    // The donut arcs
    const sliceInfo = {
      innerRadius: radius * 0.4,
      outerRadius: radius,
      startAngle: grp.startAngle,
      endAngle: grp.endAngle,
    };

    const slicePath = arcPathGenerator(sliceInfo);

    return (
      <g key={i}>
        <path
          d={slicePath}
          fill={colorScale(grp.data.source)}
          opacity={
            hoveredGroup === null || hoveredGroup === grp.data.source ? 1 : 0.2
          }
          onMouseEnter={() => setHoveredGroup(grp.data.source)}
          onMouseLeave={() => setHoveredGroup(null)}
          style={{ transition: "opacity 200ms" }}
          className="cursor-pointer"
        />
      </g>
    );
  });

  return (
    <div>
      <svg width={width} height={height}>
        <rect width={width} height={height} fill="white" />
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${width / 2}, ${height / 2})`}
        >
          {arcs}
        </g>
      </svg>
    </div>
  );
};

export const ResponsiveDonutChart = (props) => {
  const chartRef = useRef(null);
  const chartSize = useDimensions(chartRef);
  const [hoveredGroup, setHoveredGroup] = useState(null);

  const grouping = [
    ...new Set(
      props.data.filter((d) => d.year === props.year).map((d) => d.source),
    ),
  ];

  const filteredData = props.data.filter((d) => d.year === props.year);

  const hoveredData = filteredData.find((d) => d.source === hoveredGroup);

  const totalRenewable = d3.sum(filteredData, (d) => d.value);

  const colorScale = d3
    .scaleOrdinal()
    .domain(grouping)
    .range(grouping.map((g) => energyPalette[g]));

  return (
    <div className="w-full">
      <div ref={chartRef} className="relative w-full h-[280px] sm:h-[360px]">
        <DonutChart
          width={chartSize.width}
          height={chartSize.height}
          colorScale={colorScale}
          hoveredGroup={hoveredGroup}
          setHoveredGroup={setHoveredGroup}
          {...props}
        />
        {/* tooltip layer */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-center gap-0 md:gap-0">
          <p className="text-xs md:text-base">
            {hoveredData
              ? `${d3.format(".0f")(hoveredData.value)}`
              : `${d3.format(".0f")(totalRenewable)}`}
          </p>
          <p className="text-xs md:text-sm  text-gray-700">TWh</p>
        </div>
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
