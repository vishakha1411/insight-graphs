import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import * as d3 from 'd3';
import Popup from './Popup';

const PriceYearScatterPlot = ({ data, chosenCar }) => {
    const [plotData, setPlotData] = useState([]);
    const [layout, setLayout] = useState({});
    const [selectedPoint, setSelectedPoint] = useState(null);

    const calculateJitter = (year, distance, minDistance, maxDistance) => {
        if (isNaN(distance) || minDistance === maxDistance) return year;
        const scaleFactor = 0.55;
        const normalizedDistance = (distance - minDistance) / (maxDistance - minDistance);
        const jitteredYear = year + ((normalizedDistance - 0.5) * scaleFactor);
        return jitteredYear;
    };

    useEffect(() => {
        const processData = () => {
            if (!data || data.length === 0) return;

            const validDistances = data
                .map(car => parseInt(car.Distance_numeric, 10))
                .filter(distance => !isNaN(distance));

            const colorScale = d3.scaleSequential(d3.interpolateRainbow).domain([0, data.length]);
            const minDistance = Math.min(...validDistances);
            const maxDistance = Math.max(...validDistances);
            const uniqueYears = [...new Set(data.map(car => parseInt(car.Year, 10)))].sort((a, b) => a - b);

            const carsWithJitteredYear = data.map(car => {
                const year = parseInt(car.Year, 10);
                const distance = parseInt(car.Distance_numeric, 10);
                return {
                    ...car,
                    Year_jittered: calculateJitter(year, distance, minDistance, maxDistance),
                };
            });

            const groupedData = uniqueYears.map(year => {
                const yearData = carsWithJitteredYear.filter(car => parseInt(car.Year) === year);
                const x = yearData.map(car => parseFloat(car.Year_jittered));
                const y = yearData.map(car => parseInt(car.Price_numeric, 10));
                
                return {
                    x,
                    y,
                    mode: 'markers',
                    type: 'scatter',
                    name: year.toString(),
                    marker: {
                        size: 11,
                        color: colorScale(uniqueYears.indexOf(year)),
                        opacity: 0.9,
                        line: { width: 2, color: 'black' }
                    },
                    hovertext: yearData.map(car =>
                        `Year: ${car.Year}<br>Price: ₹${car.Price_numeric}<br>Distance: ${car.Distance_numeric} km<br>City: ${car.City}<br>Transmission: ${car.Transmission}<br>Variant: ${car.Variant}`
                    ),
                    hoverinfo: 'text',
                    customdata: yearData.map(car => [car.City, car.Distance_numeric])
                };
            });

            // Ensure chosenCar is valid before creating the point
            if (chosenCar && chosenCar.Year && chosenCar.Price_numeric && chosenCar.Distance_numeric) {
                const chosenCarPoint = {
                    x: [calculateJitter(parseInt(chosenCar.Year, 10), parseInt(chosenCar.Distance_numeric, 10), minDistance, maxDistance)],
                    y: [parseInt(chosenCar.Price_numeric, 10)],
                    mode: 'markers',
                    type: 'scatter',
                    name: 'Chosen Car',
                    marker: {
                        size: 13,
                        color: 'red',
                        opacity: 1.0,
                        line: { width: 3, color: 'black' }
                    },
                    hovertext: `Year: ${chosenCar.Year}<br>Price: ₹${chosenCar.Price_numeric}<br>Distance: ${chosenCar.Distance_numeric} km<br>City: ${chosenCar.City}<br>Transmission: ${chosenCar.Transmission}<br>Variant: ${chosenCar.Variant}`,
                    hoverinfo: 'text'
                };

                // Add chosenCarPoint to the plot data
                setPlotData([...groupedData, chosenCarPoint]);
            } else {
                // Fallback if chosenCar is not valid
                setPlotData(groupedData);
            }

            const yearBands = uniqueYears.map(year => {
                const colorRgb = d3.color(colorScale(uniqueYears.indexOf(year))).rgb();
                return {
                    type: 'rect',
                    xref: 'x',
                    yref: 'paper',
                    x0: year - 0.3,
                    x1: year + 0.3,
                    y0: 0,
                    y1: 1,
                    fillcolor: `rgba(${colorRgb.r}, ${colorRgb.g}, ${colorRgb.b}, 0.15)`,
                    layer: 'below',
                    line: { width: 0 }
                };
            });

            setLayout({
                title: {
                    text: 'Price vs Year with Distance Spread',
                    y: 0.95,
                    x: 0.5,
                    xanchor: 'center',
                    yanchor: 'top',
                    font: { size: 24, family: 'Arial', color: 'darkblue' }
                },
                xaxis: {
                    title: { text: 'Year (with distance spread)', font: { size: 18, family: 'Arial', color: 'darkblue' } },
                    tickvals: uniqueYears,
                    ticktext: uniqueYears.map(String),
                    tickangle: 0,
                    showgrid: false,
                    zeroline: false
                },
                yaxis: {
                    title: { text: 'Price (in ₹)', font: { size: 18, family: 'Arial', color: 'darkblue' } },
                    showgrid: true,
                    gridwidth: 0.5,
                    gridcolor: 'lightgray'
                },
                plot_bgcolor: 'white',
                shapes: yearBands,
                font: { size: 16, family: 'Arial', color: 'black' },
                legend: {
                    title: { text: 'Year', font: { size: 16, color: 'black' } },
                    bgcolor: 'rgba(255, 255, 255, 0.6)',
                    bordercolor: 'black',
                    borderwidth: 1
                },
                margin: { l: 60, r: 40, t: 80, b: 60 }
            });
        };

        if (data) {
            processData();
        }
    }, [data, chosenCar]); // Added chosenCar to the dependency array

    const handlePlotClick = (data) => {
        if (data.points && data.points.length > 0) {
            const point = data.points[0];
            if (point.customdata) {
                setSelectedPoint({
                    year: Math.round(point.x),
                    price: point.y,
                    city: point.customdata[0],
                    distance: point.customdata[1],
                    source: 'CarWale',
                    transmission: [chosenCar.Transmission],
                    fuel: chosenCar['Engine Type']
                });
            } else {
                setSelectedPoint({
                    year: point.x,
                    price: point.y,
                    city: 'Dummy City',
                    distance: 'Unknown',
                    source: 'Dummy Source',
                    transmission: 'Unknown',
                    fuel: 'Unknown',
                });
            }
        }
    };

    const closePopup = () => {
        setSelectedPoint(null);
    };

    return (
        <>
            <Plot
                data={plotData}
                layout={layout}
                onClick={handlePlotClick}
                style={{ width: '100%', height: '100%' }}
            />
            {selectedPoint && (
                <Popup
                    point={selectedPoint}
                    onClose={closePopup}
                />
            )}
        </>
    );
};

export default PriceYearScatterPlot;
