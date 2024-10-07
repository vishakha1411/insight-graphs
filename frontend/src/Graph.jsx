// import React, { useEffect, useState } from 'react';
// import Plot from 'react-plotly.js';

// const CarPriceComparisonGraph = ({ data, chosenCar }) => {
//   const [plotData, setPlotData] = useState([]);
//   const [layout, setLayout] = useState({});

//   // Function to add jittering based on distance
//   const addJittering = (year, distance, minDistance, maxDistance) => {
//     const scaleFactor = 0.6; // Spread factor for year jittering
//     if (minDistance === maxDistance) {
//       return year; // No jitter if distances are the same
//     }
//     return year + ((distance - minDistance) / (maxDistance - minDistance) - 0.5) * scaleFactor;
//   };

//   useEffect(() => {
//     const processData = () => {
//       if (!data || data.length === 0) return;

//       const carsByYear = data.reduce((acc, car) => {
//         if (!acc[car.Year]) {
//           acc[car.Year] = {
//             cars: [],
//             total: 0,
//             count: 0,
//             minDistance: Number.MAX_VALUE, // Initialize for each year
//             maxDistance: Number.MIN_VALUE, // Initialize for each year
//           };
//         }
//         acc[car.Year].cars.push(car);
//         acc[car.Year].total += parseInt(car.Price_numeric);
//         acc[car.Year].count++;
//         acc[car.Year].minDistance = Math.min(acc[car.Year].minDistance, car.Distance_numeric);
//         acc[car.Year].maxDistance = Math.max(acc[car.Year].maxDistance, car.Distance_numeric);
//         return acc;
//       }, {});

//       const carTraces = [];
//       const yearBands = [];

//       Object.entries(carsByYear).forEach(([year, { cars, minDistance, maxDistance }]) => {
//         // Add jittering to x-axis (year) based on distance
//         const jitteredYears = cars.map(car =>
//           addJittering(parseInt(car.Year), car.Distance_numeric, minDistance, maxDistance)
//         );

//         carTraces.push({
//           x: jitteredYears,
//           y: cars.map(car => car.Price_numeric),
//           type: 'scatter',
//           mode: 'markers',
//           marker: {
//             size: 10,
//             color: cars.map(car => parseInt(car.Year)), // Color points based on year
//             colorscale: 'Viridis',
//             colorbar: {
//               title: 'Year',
//               titleside: 'right',
//             },
//           },
//           text: cars.map(car => `${car.Distance_numeric} km`),
//           customdata: cars.map(car => [car.City, car.Distance_numeric]),
//           hovertemplate:
//             'Year: %{x}<br>' +
//             'Price: ₹%{y}<br>' +
//             'Distance: %{text} km<br>' +
//             'City: %{customdata[0]}<br>',
//           showlegend: false,
//         });

//         // Create background shapes (year bands)
//         yearBands.push({
//           type: 'rect',
//           xref: 'x',
//           yref: 'paper',
//           x0: year - 0.3,
//           x1: year + 0.3,
//           y0: 0,
//           y1: 1,
//           fillcolor: 'rgba(135, 206, 250, 0.15)', 
//           line: {
//             width: 0,
//           },
//           layer: 'below',
//         });
//       });

//       // Add the chosen car trace if provided
//       if (chosenCar) {
//         const chosenYear = parseInt(chosenCar.Year);
//         const chosenMinDistance = carsByYear[chosenYear].minDistance;
//         const chosenMaxDistance = carsByYear[chosenYear].maxDistance;

//         carTraces.push({
//           x: [addJittering(chosenYear, chosenCar.Distance_numeric, chosenMinDistance, chosenMaxDistance)],
//           y: [chosenCar.Price_numeric],
//           type: 'scatter',
//           mode: 'markers',
//           marker: { color: 'red', size: 14, line: { color: 'black', width: 2 } },
//           name: 'Chosen Car',
//           text: [chosenCar.Distance_numeric.toString()],
//           customdata: [[chosenCar.City]],
//           hovertemplate:
//             'Year: %{x}<br>' +
//             'Price: ₹%{y}<br>' +
//             'Distance: %{text} km<br>' +
//             'City: %{customdata[0]}<br>',
//         });
//       }

//       setPlotData([...carTraces]);

//       // Set the layout
//       setLayout({
//         title: 'Price vs Year with Distance Spread and Color-Matched Backgrounds',
//         xaxis: { title: 'Year (with distance spread)', tickmode: 'linear' },
//         yaxis: { title: 'Price (in ₹)', tickprefix: '₹', ticksuffix: '', tickformat: ',.0f' },
//         shapes: yearBands, // Add year bands to the background
//         showlegend: true,
//         plot_bgcolor: 'white',
//         margin: { l: 40, r: 40, t: 100, b: 40 },
//       });
//     };

//     if (data && chosenCar) {
//       processData();
//     }
//   }, [data, chosenCar]);
 
//   return (
//     <div>
//       <Plot
//         data={plotData}
//         layout={layout}
//         style={{ width: '100%', height: '100%' }}
//       />
//     </div>
//   );
// };

// export default CarPriceComparisonGraph;

import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import Popup from './Popup';
import CarInsights from './CarInsights';

const CarPriceComparisonGraph = ({ data, chosenCar}) => {
  const [plotData, setPlotData] = useState([]);
  const [layout, setLayout] = useState({});
  const [selectedPoint, setSelectedPoint] = useState(null);
  

  useEffect(() => {
    const processData = () => {
      const carsByYear = data.reduce((acc, car) => {
        if (!acc[car.Year]) {
          acc[car.Year] = {
            cars: [],
            total: 0,
            count: 0
          };
        }
        acc[car.Year].cars.push(car);
        //console.log(car.Price_numeric)
        acc[car.Year].total += parseInt(car.Price_numeric);
        acc[car.Year].count++;
        return acc;
      }, {});

      const carTraces = [];
      const averagePriceTraces = [];

      Object.entries(carsByYear).forEach(([year, { cars, total, count }]) => {
        //console.log(`total=${total} and count=${count}`)
        const averagePrice = parseInt(total / count);

        carTraces.push({
          x: cars.map(car => car.Year),
          y: cars.map(car => car.Price_numeric),
          type: 'scatter',
          mode: 'lines+markers',
          marker: { size: 10 },
          name: 'same transmission and fuel',
          showlegend: false,
          text: cars.map(car => `${car.Distance_numeric} km`),
          customdata: cars.map(car => [car.City, car.Distance_numeric]),
          hovertemplate:
            'Year: %{x}<br>' +
            'Price: ₹%{y}<br>' +
            'Distance: %{text} km<br>' +
            'City: %{customdata[0]}<br>',
        });
        //console.log(averagePrice)

        averagePrice && averagePriceTraces.push({
          x: [year],
          y: [averagePrice],
          type: 'scatter',
          mode: 'markers',
          marker: { size: 10, symbol: 'diamond', color: 'blue' },
          name: `Average in ${year}`,
          hovertemplate:
            'Year: %{x}<br>' +
            'Average Price: ₹%{y}<br>',
          showlegend: false
        });
      });

      carTraces.push({
        x: [chosenCar.Year],
        y: [chosenCar.Price_numeric],
        type: 'scatter',
        mode: 'markers',
        marker: { color: 'red', size: 14, line: { color: 'black', width: 2 } },
        name: 'Chosen Car',
        hovertemplate:
          'Year: %{x}<br>' +
          'Price: ₹%{y}<br>' +
          'Distance: %{text} km<br>' +
          'City: %{customdata[0]}<br>',
        text: [chosenCar.Distance_numeric.toString()],
        customdata: [[chosenCar.City]]
      });

      setPlotData([...carTraces, ...averagePriceTraces]);
      setLayout({
        title: 'Average Price vs Year in Distance Range for i20 Active 1.2 S',
        xaxis: { title: 'Year', tickmode: 'linear' },
        yaxis: { title: 'Average Price (₹)', tickprefix: '₹', ticksuffix: '', tickformat: ',.0f' },
        legend_title_text: 'Comparison',

        showlegend: true
      });
    };

    if (data && chosenCar) {
      processData();
    }
  }, [data, chosenCar]);

  const handlePlotClick = (data) => {
    if (data.points && data.points.length > 0) {
      const point = data.points[0];
      
      // Check if the clicked point has customdata (i.e., it's a real data point)
      if (point.customdata) {
        // Actual data point is clicked
        setSelectedPoint({
          year: point.x,
          price: point.y,
          city: point.customdata[0], // City exists for real data points
          distance: point.customdata[1],
          source: 'CarWale',
          transmission: [chosenCar.Transmission],
          fuel: chosenCar['Engine Type']
        });
      } else {
        // Line segment is clicked (create dummy point)
        setSelectedPoint({
          year: point.x, // Year is the x-axis value
          price: point.y, // Price is the y-axis value
          city: 'Dummy City', // Dummy data for city
          distance: 'Unknown', // Dummy data for distance
          source: 'Dummy Source', // Dummy source
          transmission: 'Unknown', // Dummy transmission
          fuel: 'Unknown', // Dummy fuel type
        });
      }
    }
  };
  
  

  const closePopup = () => {
    setSelectedPoint(null);
  };

  return (
    <div>
        <Plot
          data={plotData}
          layout={layout}
          onClick={(e)=>handlePlotClick(e,data)}
          style={{ width: '100%', height: '100%' }}
        />
        {selectedPoint && (
          <Popup
            point={selectedPoint}
            onClose={closePopup}
          />
        )}
        <CarInsights />
    </div>
  );
};

export default CarPriceComparisonGraph;
