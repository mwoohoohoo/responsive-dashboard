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
    <div className="flex flex-wrap justify-center gap-x-1 md:gap-x-3 gap-y-0 sm:gap-y-2 pt-2">
      {grouping.map((g, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-3 py-2 rounded-2xl hover:bg-gray-100 cursor-pointer"
          style={{
            opacity:
              hoveredGroup === null ||
              (Array.isArray(hoveredGroup)
                ? hoveredGroup.includes(g)
                : hoveredGroup === g)
                ? 1
                : 0.2,
          }}
          onMouseEnter={() => setHoveredGroup(g)}
          onMouseLeave={() => setHoveredGroup(null)}
          onClick={() => setHoveredGroup(g)}
        >
          <span
            className="inline-block w-2 h-2 rounded-sm"
            style={{ backgroundColor: colorScale(g) }}
          />

          <span className="text-xs">{formatLegendLabel(g)}</span>
        </div>
      ))}
    </div>
  );
};
