import json
import pandas as pd

# Load the data
df = pd.read_csv('javascripts/cleaned_car_data.csv')

# Function to calculate percentage ranks
def calculate_percentage_rank(chosen_car_value, values_list):
    return sum(value < chosen_car_value for value in values_list) / len(values_list) * 100

# Function to get all possible insights, including city-specific insights, same year, and distance range
def get_insights(df, chosen_car):
    insights = {}
    
    # Parameters to compare
    params = ['Price_numeric', 'Price_Drop_%', 'Distance_numeric', 'Year', 'City']
    
    for param in params:
        if param in chosen_car:
            if param != 'City':
                # For numeric insights, calculate percentage rank globally
                percentage_rank = calculate_percentage_rank(chosen_car[param], df[param].tolist())
                insights[param] = {
                    'value': chosen_car[param],
                    'percent_better_than': percentage_rank
                }
            else:
                # City-specific comparison
                df_city = df[df['City'] == chosen_car['City']]
                if not df_city.empty:
                    for city_param in ['Price_numeric', 'Distance_numeric', 'Price_Drop_%']:
                        if city_param in df_city.columns:
                            percentage_rank_city = calculate_percentage_rank(chosen_car[city_param], df_city[city_param].tolist())
                            insights[f"{city_param}_city"] = {
                                'value': chosen_car[city_param],
                                'city_specific': True,
                                'percent_better_than': percentage_rank_city
                            }
                else:
                    insights['City'] = {
                        'value': chosen_car['City'],
                        'city_specific': False,
                        'message': "No other cars found in this city for comparison."
                    }

    # Additional Insights
    # 1. Same Year Price Comparison
    same_year_cars = df[df['Year'] == chosen_car['Year']]
    if not same_year_cars.empty:
        price_rank_same_year = calculate_percentage_rank(chosen_car['Price_numeric'], same_year_cars['Price_numeric'].tolist())
        insights['Same Year Price'] = {
            'value': chosen_car['Price_numeric'],
            'same_year': True,
            'percent_better_than': price_rank_same_year
        }

    # 2. Same Distance Range Price Comparison (±10,000 km)
    lower_bound = chosen_car['Distance_numeric'] - 10000
    upper_bound = chosen_car['Distance_numeric'] + 10000
    same_distance_range_cars = df[(df['Distance_numeric'] >= lower_bound) & (df['Distance_numeric'] <= upper_bound)]
    if not same_distance_range_cars.empty:
        price_rank_same_distance = calculate_percentage_rank(chosen_car['Price_numeric'], same_distance_range_cars['Price_numeric'].tolist())
        insights['Same Distance Range Price'] = {
            'value': chosen_car['Price_numeric'],
            'distance_range': f"{lower_bound}-{upper_bound}",
            'percent_better_than': price_rank_same_distance
        }

    return insights
import numpy as np
# Function to save top insights as JSON
# Function to save top insights as JSON
def save_top_insights(insights, threshold=60, output_file='car_insights.json'):
    top_insights = {}
    for param, insight in insights.items():
        if insight.get('percent_better_than', 0) >= threshold:
            top_insights[param] = {
                'value': float(insight['value']) if isinstance(insight['value'], (int, float)) else insight['value'],
                'percent_better_than': float(insight['percent_better_than']) if isinstance(insight.get('percent_better_than'), (int, float)) else insight.get('percent_better_than'),
                'city_specific': insight.get('city_specific', False),
                'same_year': insight.get('same_year', False),
                'distance_range': insight.get('distance_range', None),
            }

    # Ensure all numerical values are converted to standard Python types before saving
    for key in top_insights:
        top_insights[key]['value'] = float(top_insights[key]['value']) if isinstance(top_insights[key]['value'], (int, float)) else top_insights[key]['value']
        top_insights[key]['percent_better_than'] = float(top_insights[key]['percent_better_than']) if isinstance(top_insights[key]['percent_better_than'], (int, float)) else top_insights[key]['percent_better_than']
        
        # Convert numpy types to standard Python types
        for field in ['value', 'percent_better_than']:
            if isinstance(top_insights[key][field], (np.int64, np.float64)):
                top_insights[key][field] = float(top_insights[key][field])  # Convert to float
            elif isinstance(top_insights[key][field], int):
                top_insights[key][field] = int(top_insights[key][field])  # Ensure int is standard Python int

    with open(output_file, 'w') as f:
        json.dump(top_insights, f, indent=4)


# Example chosen car details
chosen_car = df.iloc[0]

# Get insights
insights = get_insights(df, chosen_car)

# Save insights where the car performs better than 60% of other cars
save_top_insights(insights, threshold=60, output_file='car_insights.json')
