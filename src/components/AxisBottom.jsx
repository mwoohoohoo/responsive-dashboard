const TICK_LENGTH = 6;
const AXIS_COLOR = "#8C8C8C";

export const AxisBottom = ({ xScale, pixelsPerTick, label, isMobile }) => {
  const range = xScale.range();

  const width = range[1] - range[0];
  const numberOfTicksTarget = Math.floor(width / pixelsPerTick);

  return (
    <>
      {/* Main horizontal line */}
      <line
        x1={range[0]}
        y1={0}
        x2={range[1]}
        y2={0}
        stroke={AXIS_COLOR}
        fill="none"
      />

      {/* Ticks and labels */}
      {xScale.ticks(numberOfTicksTarget).map((value) => (
        <g key={value} transform={`translate(${xScale(value)}, 0)`}>
          <line y2={TICK_LENGTH} stroke={AXIS_COLOR} />
          <text
            key={value}
            style={{
              fontSize: isMobile ? "10px" : "12px",
              textAnchor: "middle",
              transform: isMobile ? "translateY(16px)" : "translateY(20px)",
            }}
          >
            {value}
          </text>
        </g>
      ))}

      {/* Axis label */}
      {label && (
        <text x={width / 2} y={40} fontSize={12} textAnchor="middle">
          {label}
        </text>
      )}
    </>
  );
};

export const CategoricalAxisBottom = ({ xScale, label, isMobile }) => {
  const range = xScale.range();
  const tickLabels = xScale.domain();

  const width = range[1] - range[0];
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
      {/* Main horizontal line */}
      <line
        x1={range[0]}
        y1={0}
        x2={range[1]}
        y2={0}
        stroke={AXIS_COLOR}
        fill="none"
      />

      {/* Ticks and labels */}
      {tickLabels.map((value, i) => (
        <g
          key={i}
          transform={`translate(${xScale(value) + xScale.bandwidth() / 2}, 0)`}
        >
          <line y2={TICK_LENGTH} stroke={AXIS_COLOR} />
          <text
            key={i}
            style={{
              fontSize: isMobile ? "10px" : "12px",
              textAnchor: "middle",
              transform: isMobile ? "translateY(16px)" : "translateY(20px)",
            }}
          >
            {formatCountryLabel(value)}
          </text>
        </g>
      ))}

      {/* Axis label */}
      {label && (
        <text x={width / 2} y={44} fontSize={12} textAnchor="middle">
          {label}
        </text>
      )}
    </>
  );
};
