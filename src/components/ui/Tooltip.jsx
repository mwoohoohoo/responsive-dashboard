import * as d3 from "d3";

export const Tooltip = ({ interactionData }) => {
  // Return early when nothing is hovered
  if (!interactionData) {
    return null;
  }

  const { xPos, yPos, tickLength, placement, verticalPlacement, value, color } =
    interactionData;

  const formatLegendLabel = (name) => {
    const replacements = {
      hydro: "Hydro",
      solar: "Solar",
      wind: "Wind",
      biofuel: "Biofuel",
      other_renewable: "Other",
      nuclear: "Nuclear",
      nonRenewValue: "Fossil",
      renewValue: "Renewables",
      coal: "Coal",
      oil: "Oil",
      gas: "Gas",
      "United States": "U.S.",
    };

    return replacements[name] || name;
  };

  return (
    <div
      className="flex items-center"
      style={{
        position: "absolute",
        left: xPos,
        top: yPos,
        transform: `
  ${placement === "right" ? "translateX(-100%)" : ""}
  ${verticalPlacement === "top" ? " translateY(-100%)" : ""}
`,
      }}
    >
      <span
        className="inline-block"
        style={{
          width: tickLength,
          height: 1,
          backgroundColor: color,
          display: placement === "right" ? "none" : null,
        }}
      />
      <div className="tooltip" style={{ borderColor: color }}>
        <p className="text-xs font-bold">{d3.format(",.0f")(value)}</p>
        <span className="text-xs text-gray-700 ">TWh</span>
      </div>
      <span
        className="inline-block"
        style={{
          width: tickLength,
          height: 1,
          backgroundColor: color,
          display: placement === "left" ? "none" : null,
        }}
      />
    </div>
  );
};
