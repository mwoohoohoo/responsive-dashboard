import * as d3 from "d3";
import { LegendBottom } from "./LegendBottom";
import { useRef } from "react";
import { useDimensions } from "../use-dimensions";
import { useState } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";

export const DonutChart = ({
  width,
  height,
  data,
  year,
  colorScale,
  hoveredGroup,
  setHoveredGroup,
  showSvgLabels,
}) => {
  if (width === 0 || height === 0) {
    return null;
  }

  const MARGIN = showSvgLabels ? 24 : 8;
  const INFLEXION_PADDING = 24; // space between donut and label inflexion point

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

    const centroid = arcPathGenerator.centroid(sliceInfo);
    const slicePath = arcPathGenerator(sliceInfo);

    // The legend inflexion point
    const inflexionInfo = {
      innerRadius: radius + INFLEXION_PADDING,
      outerRadius: radius + INFLEXION_PADDING,
      startAngle: grp.startAngle,
      endAngle: grp.endAngle,
    };
    const inflexionPoint = arcPathGenerator.centroid(inflexionInfo);

    const isRightLabel = inflexionPoint[0] > 0;
    const labelPosX = inflexionPoint[0] + 20 * (isRightLabel ? 1 : -1);
    const textAnchor = isRightLabel ? "start" : "end";
    const label = d3.format(".0f")(grp.value) + " TWh";

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
        <g opacity={showSvgLabels && hoveredGroup === grp.data.source ? 1 : 0}>
          <circle cx={centroid[0]} cy={centroid[1]} r={2} />
          <line
            x1={centroid[0]}
            y1={centroid[1]}
            x2={inflexionPoint[0]}
            y2={inflexionPoint[1]}
            stroke={"black"}
            fill={"black"}
          />
          <line
            x1={inflexionPoint[0]}
            y1={inflexionPoint[1]}
            x2={labelPosX}
            y2={inflexionPoint[1]}
            stroke={"black"}
            fill={"black"}
          />
          <text
            x={labelPosX + (isRightLabel ? 2 : -2)}
            y={inflexionPoint[1]}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            fontSize={14}
          >
            {label}
          </text>
        </g>
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

  const isSmall = useMediaQuery("(max-width: 749px)");
  const isMedium = useMediaQuery("(min-width: 750px) and (max-width: 1024px)");
  const isLarge = useMediaQuery("(min-width: 1025px) and (max-width: 1659px)");
  const isXL = useMediaQuery("(min-width: 1660px)");

  const showBottomLabel = isSmall || isLarge;
  const showSvgLabels = isMedium || isXL;

  const grouping = [
    ...new Set(
      props.data.filter((d) => d.year === props.year).map((d) => d.source),
    ),
  ];

  const filteredData = props.data.filter((d) => d.year === props.year);

  const hoveredData = filteredData.find((d) => d.source === hoveredGroup);

  const label = hoveredData ? `${hoveredData.value} TWh` : null;

  const colorScale = d3
    .scaleOrdinal()
    .domain(grouping)
    .range(d3.schemeObservable10);

  return (
    <div className="w-full">
      <div ref={chartRef} className="w-full h-[240px] sm:h-[500px]">
        <DonutChart
          width={chartSize.width}
          height={chartSize.height}
          colorScale={colorScale}
          hoveredGroup={hoveredGroup}
          setHoveredGroup={setHoveredGroup}
          showSvgLabels={showSvgLabels}
          {...props}
        />
      </div>
      <div className="mb-4 h-5 sm:h-0 flex items-center justify-center text-sm font-medium text-gray-800">
        {showBottomLabel && label ? label : ""}
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
