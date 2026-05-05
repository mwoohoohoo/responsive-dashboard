export const LegendBottom = ({
  grouping,
  colorScale,
  hoveredGroup,
  setHoveredGroup,
}) => {
  const formatLegendLabel = (name) => {
    const replacements = {
      hydro: "Hydro",
      solar: "Solar",
      wind: "Wind",
      biofuel: "Biofuel",
      other_renewable: "Other",
      nuclear: "Nuclear",
      nonRenewValue: "Fossil fuels",
      renewValue: "Renewables",
      coal: "Coal",
      oil: "Oil",
      gas: "Gas",
      "United States": "U.S.",
    };

    return replacements[name] || name;
  };

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-items-start sm:justify-center gap-x-4 sm:gap-x-6 gap-y-0 sm:gap-y-2 py-2">
      {grouping.map((g, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-3 py-2 rounded-2xl hover:bg-gray-100 cursor-pointer"
          style={{
            backgroundColor: hoveredGroup === g ? "#f3f4f6" : "transparent",
            opacity: hoveredGroup === null || hoveredGroup === g ? 1 : 0.2,
            transition: "opacity 200ms",
          }}
          onMouseEnter={() => setHoveredGroup(g)}
          onMouseLeave={() => setHoveredGroup(null)}
          onClick={() => setHoveredGroup(g)}
        >
          <span
            className="inline-block w-2 sm:w-4 h-1 rounded-sm"
            style={{ backgroundColor: colorScale(g), textAlign: "left" }}
          />

          <span className="text-xs">{formatLegendLabel(g)}</span>
        </div>
      ))}
    </div>
  );
};
