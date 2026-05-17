const TICK_LENGTH = 6;
const AXIS_COLOR = "#8C8C8C";
const GUIDE_COLOR = "#BFBFBF";
import * as d3 from "d3";

export const AxisLeft = ({
  yScale,
  pixelsPerTick,
  label,
  boundsWidth,
  isMobile,
}) => {
  const range = yScale.range();
  const height = range[0] - range[1];
  const numberOfTicksTarget = Math.floor(height / pixelsPerTick);

  const format = d3.format(".2s"); // 150k instead of 150000

  return (
    <>
      {/* Main vertical line */}
      <path
        d={["M", 0, range[0], "L", 0, range[1]].join(" ")}
        fill="none"
        stroke={AXIS_COLOR}
      />

      {/* Ticks and labels */}
      {yScale.ticks(numberOfTicksTarget).map((value) => (
        <g key={value} transform={`translate(0, ${yScale(value)})`}>
          <line x2={boundsWidth} stroke={GUIDE_COLOR} strokeDasharray="4,8" />
          <line x2={-TICK_LENGTH} stroke={AXIS_COLOR} />
          <text
            style={{
              fontSize: isMobile ? "10px" : "12px",
              textAlign: "right",
              textAnchor: "end",
              dominantBaseline: "middle",
              transform: "translateX(-12px)",
            }}
          >
            {format(value)}
          </text>
        </g>
      ))}

      {/* Axis label */}
      {label && (
        <text
          x={isMobile ? -12 : -height / 2}
          y={isMobile ? -4 : -48}
          fontSize={isMobile ? 12 : 14}
          textAnchor={isMobile ? "end" : "middle"}
          transform={isMobile ? "rotate(0)" : "rotate(-90)"}
        >
          {label}
        </text>
      )}
    </>
  );
};

export const CategoricalAxisLeft = ({ yScale, label }) => {
  const range = yScale.range();
  const tickLabels = yScale.domain();

  const height = range[1] - range[0];
  const formatCountryLabel = (name) => {
    const replacements = {
      "United Arab Emirates": "UAE",
      "United Kingdom": "UK",
      "United States": "USA",
      "South Africa": "S. Africa",
      "South Korea": "S. Korea",
    };

    return replacements[name] || name;
  };

  return (
    <>
      {/* Main vertical line */}
      <path
        d={["M", 0, range[0], "L", 0, range[1]].join(" ")}
        fill="none"
        stroke={AXIS_COLOR}
      />

      {/* Ticks and labels */}
      {tickLabels.map((value, i) => (
        <g
          key={i}
          transform={`translate(0, ${yScale(value) + yScale.bandwidth() / 2})`}
        >
          <text
            style={{
              fontSize: "10px",
              textAlign: "right",
              textAnchor: "end",
              dominantBaseline: "middle",
              transform: "translateX(-8px)",
            }}
          >
            {formatCountryLabel(value)}
          </text>
        </g>
      ))}

      {/* Axis label 
      {label && (
        <text
          x={-height / 2}
          y={-40}
          fontSize={12}
          textAnchor="middle"
          transform="rotate(-90)"
        >
          {label}
        </text>
      )}*/}
    </>
  );
};
