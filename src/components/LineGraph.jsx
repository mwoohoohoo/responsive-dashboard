import { AxisBottom } from "./AxisBottom";
import { AxisLeft } from "./AxisLeft";
import { LegendBottom } from "./LegendBottom";
import * as d3 from "d3";
import { bisector } from "d3";
import { useRef } from "react";
import { useDimensions } from "../use-dimensions";
import { useState } from "react";
import { countriesPalette } from "../lib/colours";
import { Tooltip } from "./ui/Tooltip";

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
  onPointHover,
  onPointLeave,
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

  const interactiveCountries = ["China", "United States"];

  const bisect = bisector((d) => d[xVariable]).left;

  const handleMouseMove = (event) => {
    const cursorX = event.nativeEvent.offsetX - MARGIN.left;
    const cursorY = event.nativeEvent.offsetY - MARGIN.top;
    const xValue = xScale.invert(cursorX);

    const candidateData = data.filter((d) =>
      interactiveCountries.includes(d[groupBy]),
    );

    const interpolatedPoints = interactiveCountries
      .map((country) => {
        const countryData = data
          .filter((d) => d[groupBy] === country)
          .sort((a, b) => a[xVariable] - b[xVariable]);

        const index = bisect(countryData, xValue);

        const d0 = countryData[index - 1];
        const d1 = countryData[index];

        if (!d0 || !d1) {
          return null;
        }

        const t = (xValue - d0[xVariable]) / (d1[xVariable] - d0[xVariable]);

        const interpolatedY =
          d0[yVariable] + t * (d1[yVariable] - d0[yVariable]);

        return {
          [groupBy]: country,

          [xVariable]: xValue,

          [yVariable]: interpolatedY,
        };
      })
      .filter(Boolean);

    const nearest = interpolatedPoints.reduce((closest, point) => {
      const pointY = yScale(point[yVariable]);

      const currentDistance = Math.abs(pointY - cursorY);

      if (!closest) {
        return {
          point,
          distance: currentDistance,
        };
      }

      return currentDistance < closest.distance
        ? {
            point,
            distance: currentDistance,
          }
        : closest;
    }, null).point;

    onPointHover({
      xPos: MARGIN.left + xScale(nearest[xVariable]),

      yPos: MARGIN.top + yScale(nearest[yVariable]),

      tickLength: 0,

      placement:
        xScale(nearest[xVariable]) < boundsWidth / 2 ? "left" : "right",

      verticalPlacement: yScale(nearest[yVariable]) < 40 ? "bottom" : "top",

      value: nearest[yVariable],

      color: colorScale(nearest[groupBy]),
    });

    setHoveredGroup(nearest[groupBy]);
  };

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
            label="TWh"
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
        {/* Invisible catcher, on top of everything */}
        <rect
          width={width}
          height={height}
          fill="transparent"
          onMouseMove={handleMouseMove}
          onMouseLeave={onPointLeave}
        />
      </svg>
    </div>
  );
};

export const ResponsiveLineGraph = (props) => {
  const chartRef = useRef(null);
  const chartSize = useDimensions(chartRef);
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const [interactionData, setInteractionData] = useState(null);

  const grouping = [...new Set(props.data.map((d) => d[props.groupBy]))];

  const colorScale = d3
    .scaleOrdinal()
    .domain(grouping)
    .range(grouping.map((g) => countriesPalette[g]));

  return (
    <div className="w-full">
      <div ref={chartRef} className="relative w-full h-[260px] sm:h-[360px]">
        <LineGraph
          width={chartSize.width}
          height={chartSize.height}
          hoveredGroup={hoveredGroup}
          setHoveredGroup={setHoveredGroup}
          colorScale={colorScale}
          onPointHover={setInteractionData}
          onPointLeave={() => {
            setInteractionData(null);
            setHoveredGroup(null);
          }}
          {...props}
        />
        {/* tooltip layer */}
        <div className="absolute inset-0 pointer-events-none">
          <Tooltip interactionData={interactionData} />
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
