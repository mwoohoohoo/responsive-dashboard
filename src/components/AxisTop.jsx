const TICK_LENGTH = 6;

export const AxisTop = ({ xScale, pixelsPerTick, label }) => {
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
        stroke="black"
        fill="none"
      />

      {/* Ticks and labels */}
      {xScale.ticks(numberOfTicksTarget).map((value) => (
        <g key={value} transform={`translate(${xScale(value)}, 0)`}>
          <line y2={-TICK_LENGTH} stroke="black" />
          <text
            key={value}
            style={{
              fontSize: "10px",
              textAnchor: "middle",
              transform: "translateY(-8px)",
            }}
          >
            {value}
          </text>
        </g>
      ))}

      {/* Axis label */}
      {label && (
        <text x={width / 2} y={-40} fontSize={12} textAnchor="middle">
          {label}
        </text>
      )}
    </>
  );
};
