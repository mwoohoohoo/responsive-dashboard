import "./App.css";
import { useState, useEffect } from "react";
import * as d3 from "d3";
import { ResponsiveLineGraph } from "./components/LineGraph";
import { ResponsiveStackedAreaGraph } from "./components/StackedAreaGraph";
import { ResponsiveStackedBarPlot } from "./components/StackedBarPlot";
import { ResponsiveDonutChart } from "./components/DonutChart";
import Card from "./components/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useEmblaCarousel from "embla-carousel-react";
import { data } from "./data";

function App() {
  // carousel-related stuff
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "keepSnaps",
  });

  // selected-dot state on carousel
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    onSelect();
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // filter data for stacked area graph
  const stackedData = data
    .filter((d) => d.country === "World")
    .map((d) => ({
      year: d.year,
      coal: d.coal,
      oil: d.oil,
      gas: d.gas,
      nuclear: d.nuclear,
      hydro: d.hydro,
      solar: d.solar,
      wind: d.wind,
      biofuel: d.biofuel,
      other_renewable: d.other_renewable,
    }));

  // filter data for countries only
  const countryData = data.filter((d) => d.country !== "World");

  // biggest consumers of total energy in 2024
  const topCountries2024 = countryData
    .filter((d) => d.year === 2024)
    .sort((a, b) => b.primary_energy - a.primary_energy)
    .slice(0, 5)
    .map((d) => d.country);

  // line chart only shows data for the biggest consumers in 2024
  const lineChartData = countryData.filter((d) =>
    topCountries2024.includes(d.country),
  );

  // define fossil fuel sum accessor functon
  const fossilSum = (d) => d.coal + d.oil + d.gas;

  // define renewable sum accessor functon
  const renewableSum = (d) =>
    d.hydro + d.solar + d.wind + d.biofuel + d.other_renewable;

  // biggest renewables consumers in 2-24
  const topRenewableCountries = countryData
    .filter((d) => d.year === 2024)
    .sort((a, b) => renewableSum(b) - renewableSum(a))
    .slice(0, 5)
    .map((d) => d.country);

  // convert filtered data into plottable rows (line graph)
  const renewableChartData = data
    .filter((d) => topRenewableCountries.includes(d.country))
    .map((d) => ({
      year: d.year,
      country: d.country,
      value: renewableSum(d),
    }));

  // convert filtered data into plottable rows (bar chart)
  const stackedChartData = lineChartData
    .filter((d) => d.year === 2024)
    .map((d) => ({
      country: d.country,
      nonRenewValue: fossilSum(d),
      renewValue: renewableSum(d),
      nuclear: d.nuclear,
    }));

  // country selector state
  const [selectedCountry, setSelectedCountry] = useState("Brazil");

  // alphabetical countries list
  const countries = [
    ...new Set(
      data
        .filter((d) => topRenewableCountries.includes(d.country))
        .map((d) => d.country),
    ),
  ].sort();

  // filter data to selected country
  const countryRows = data.filter((d) => d.country === selectedCountry);

  // convert data to long rows
  const renewableKeys = [
    "hydro",
    "solar",
    "wind",
    "biofuel",
    "other_renewable",
  ];

  const renewableData = countryRows.flatMap((row) =>
    renewableKeys.map((source) => ({
      year: row.year,
      source,
      value: row[source],
    })),
  );

  /* Card data */
  const topCountry = topCountries2024[0];
  const topValue = countryData.find(
    (d) => d.year === 2024 && d.country === topCountries2024[0],
  )?.primary_energy;

  const topRenewableCountry = topRenewableCountries[0];
  const topRenewableValue = renewableChartData.find(
    (d) => d.year === 2024 && d.country === topRenewableCountries[0],
  )?.value;

  const totalValue = data.find(
    (d) => d.year === 2024 && d.country === "World",
  )?.primary_energy;

  const totalRenewableValue = renewableSum(
    data.find((d) => d.year === 2024 && d.country === "World"),
  );

  return (
    <>
      <div className="min-h-screen flex flex-col gap-4">
        <div className="header">
          <h1 className="font-bold text-left">Energy dashboard</h1>

          <p className="text-body text-left">
            Energy consumption data from 1965 - 2024, from{" "}
            <a
              className="font-semibold hover:text-brand-teal"
              href="https://ourworldindata.org/energy"
            >
              Our World in Data.
            </a>
          </p>
          <p className="text-body text-left">
            Showcasing responsive design and hover effects with d3.js and React.
          </p>
        </div>

        <div className="container container--transparent ">
          <div className="embla" ref={emblaRef}>
            <div className="embla__container">
              <div
                className={`embla__slide ${selectedIndex === 0 ? "embla__slide--active" : ""}`}
              >
                <Card bg="bg-brand-aqua">
                  <h3 className="text-lg">Total consumption 2024</h3>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-2xl md:text-3xl text-primary-black font-semibold">
                      {d3.format(",.0f")(totalValue)}
                      <span className="text-base  text-gray-700 font-normal">
                        TWh
                      </span>
                    </h4>
                    <p className="text-xs xl:text-sm text-gray-700">
                      of which{" "}
                      {d3.format(".0f")(
                        (totalRenewableValue / totalValue) * 100,
                      )}
                      % renewable
                    </p>
                  </div>
                </Card>
              </div>
              <div
                className={`embla__slide ${selectedIndex === 1 ? "embla__slide--active" : ""}`}
              >
                <Card>
                  <h3 className="text-lg">Highest 2024: overall</h3>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-2xl md:text-3xl text-primary-black font-semibold">
                      {topCountry}
                    </h4>
                    <p className="text-xs xl:text-sm text-gray-700">
                      {d3.format(".0f")((topValue / totalValue) * 100)}% of
                      global consumption
                    </p>
                  </div>
                </Card>
              </div>
              <div
                className={`embla__slide ${selectedIndex === 2 ? "embla__slide--active" : ""}`}
              >
                <Card>
                  <h3 className="text-lg">Highest 2024: renewables</h3>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-2xl md:text-3xl text-primary-black font-semibold">
                      {topRenewableCountry}
                    </h4>
                    <p className="text-xs xl:text-sm text-gray-700">
                      {d3.format(".0f")(
                        (topRenewableValue / totalRenewableValue) * 100,
                      )}
                      % of global total
                    </p>
                  </div>
                </Card>
              </div>
            </div>
            <div className="embla__dots">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  className={`embla__dot ${
                    selectedIndex === index ? "embla__dot--active" : ""
                  }`}
                  onClick={() => emblaApi?.scrollTo(index)}
                />
              ))}
            </div>
          </div>
        </div>

        <section className="main">
          <div className="panel">
            <div className="container">
              <h2 className="!text-2xl">World consumption mix</h2>
              <ResponsiveStackedAreaGraph data={stackedData} xVariable="year" />
            </div>
            <div className="container">
              <h2 className="!text-2xl">Five biggest consumers: 2024</h2>
              <ResponsiveStackedBarPlot data={stackedChartData} />
            </div>
          </div>

          <div className="panel panel--thirds">
            <div className="container">
              <h2 className="!text-2xl">Five biggest consumers: renewables</h2>

              <ResponsiveLineGraph
                data={renewableChartData}
                xVariable="year"
                yVariable="value"
                groupBy="country"
              />
            </div>
            <div className="container">
              <h2 className="!text-2xl">
                Five biggest renewables consumers: 2024
              </h2>
              <Select
                value={selectedCountry}
                onValueChange={(value) => setSelectedCountry(value)}
              >
                <SelectTrigger className="w-full text-sm bg-white border border-gray-300 rounded-md px-3 py-4">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem
                      key={country}
                      value={country}
                      className="text-sm hover:bg-gray-100"
                    >
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <ResponsiveDonutChart data={renewableData} year={2024} />
            </div>
          </div>
        </section>
      </div>

      <div className="h-20 flex flex-col mt-10 gap-2 justify-center items-center">
        <p className="text-sm text-brand-black-500">
          A portfolio project by Merri Hookway
        </p>
        <p className="text-sm text-brand-black-500">© 2026</p>
      </div>
    </>
  );
}

export default App;
