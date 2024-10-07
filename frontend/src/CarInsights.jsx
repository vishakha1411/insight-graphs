import React from 'react'
import data from "../../backend/car_insights.json"
import { useState,useEffect } from 'react';

// Import JSON data
const CarInsights = () => {
  const [insights, setInsights] = useState(data);

  useEffect(() => {
    setInsights(data)
  }, [data]);

  if (!insights) {
    return <div>Loading insights...</div>;
  }

  return (
    <div className="insights-container border border-black rounded-xl p-3 m-2 mt-4 bg-pink-100">
      <h2 className='font-bold text-2xl flex mx-2'>Car Insights</h2>
      {Object.keys(insights).length > 0 ? (
        <ul>
          {Object.keys(insights)
            .filter((key) => key !== 'Year')  // Filter out 'Year'
            .map((key) => (
              <li key={key} className='py-2 m-2'>
                <strong>{key.replace('_', ' ')}:</strong> {insights[key].value.toFixed(2)} <br />
                <p className='font-semibold'>Better than {insights[key].percent_better_than.toFixed(2)}% of cars.</p>
                {insights[key].city_specific && (
                  <p>City-specific comparison: Better than {insights[key].percent_better_than.toFixed(2)}% of cars in the same city.</p>
                )}
                {insights[key].same_year && (
                  <p>Same year comparison: Better than {insights[key].percent_better_than.toFixed(2)}% of cars from the same year.</p>
                )}
                {insights[key].distance_range && (
                  <p>Price in Distance range comparison: Better than {insights[key].percent_better_than.toFixed(2)}% of cars within the same distance range.</p>
                )}
              </li>
            ))}
        </ul>
      ) : (
        <p>No insights available for this car.</p>
      )}
    </div>
  );
};

export default CarInsights;

