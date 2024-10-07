import pandas as pd
import json 
df=pd.read_csv('./polo (1).csv')
first_row=df.iloc[0]
# Assuming df is already loaded with the dataset and first_row is the chosen car's details

# Extract relevant information from the chosen car
chosen_price = first_row['Price_numeric']
chosen_distance = first_row['Distance_numeric']
chosen_year = first_row['Year']
chosen_transmission = first_row['Transmission']
chosen_engine_type = first_row['Engine Type']
chosen_city = first_row['City']

# Define year, distance, and price ranges
year_range = (chosen_year - 1, chosen_year + 1)
distance_range = (chosen_distance - 5000, chosen_distance + 5000)
price_range = (chosen_price * 0.8, chosen_price * 1.2)

# Total number of cars
total_cars = len(df)

# 1. Cars in the Same Year Range (+/- 1 year)
same_year_range = df[(df['Year'] >= year_range[0]) & (df['Year'] <= year_range[1])]
same_year_cheaper = same_year_range[same_year_range['Price_numeric'] < chosen_price]
same_year_less_distance = same_year_range[same_year_range['Distance_numeric'] < chosen_distance]
same_year_better_combination = same_year_range[
    (same_year_range['Price_numeric'] < chosen_price) &
    (same_year_range['Distance_numeric'] < chosen_distance)
]

# 2. Cars with the Same Engine Type and Year Range (+/- 1 year)
same_engine_year_range = same_year_range[same_year_range['Engine Type'] == chosen_engine_type]
same_engine_year_cheaper = same_engine_year_range[same_engine_year_range['Price_numeric'] < chosen_price]
same_engine_year_less_distance = same_engine_year_range[same_engine_year_range['Distance_numeric'] < chosen_distance]
same_engine_year_better_combination = same_engine_year_range[
    (same_engine_year_range['Price_numeric'] < chosen_price) &
    (same_engine_year_range['Distance_numeric'] < chosen_distance)
]

# 3. Cars in the Same City
same_city = df[df['City'] == chosen_city]
same_city_cheaper = same_city[same_city['Price_numeric'] < chosen_price]
same_city_less_distance = same_city[same_city['Distance_numeric'] < chosen_distance]
same_city_better_combination = same_city[
    (same_city['Price_numeric'] < chosen_price) &
    (same_city['Distance_numeric'] < chosen_distance)
]

# 4. Cars with the Same Transmission and Year Range (+/- 1 year)
same_transmission_year_range = same_year_range[same_year_range['Transmission'] == chosen_transmission]
same_transmission_year_cheaper = same_transmission_year_range[same_transmission_year_range['Price_numeric'] < chosen_price]
same_transmission_year_less_distance = same_transmission_year_range[same_transmission_year_range['Distance_numeric'] < chosen_distance]
same_transmission_year_better_combination = same_transmission_year_range[
    (same_transmission_year_range['Price_numeric'] < chosen_price) &
    (same_transmission_year_range['Distance_numeric'] < chosen_distance)
]

# 5. Cars with the Same Engine Type and Transmission
same_engine_transmission = df[
    (df['Engine Type'] == chosen_engine_type) &
    (df['Transmission'] == chosen_transmission)
]
same_engine_transmission_cheaper = same_engine_transmission[same_engine_transmission['Price_numeric'] < chosen_price]
same_engine_transmission_less_distance = same_engine_transmission[same_engine_transmission['Distance_numeric'] < chosen_distance]
same_engine_transmission_better_combination = same_engine_transmission[
    (same_engine_transmission['Price_numeric'] < chosen_price) &
    (same_engine_transmission['Distance_numeric'] < chosen_distance)
]

# 6. Cars in the Same Price Range (+/- 20%)
same_price_range = df[(df['Price_numeric'] >= price_range[0]) & (df['Price_numeric'] <= price_range[1])]
same_price_range_better_combination = same_price_range[
    (same_price_range['Price_numeric'] < chosen_price) &
    (same_price_range['Distance_numeric'] < chosen_distance)
]
same_price_range_engine_transmission = same_price_range[
    (same_price_range['Engine Type'] == chosen_engine_type) &
    (same_price_range['Transmission'] == chosen_transmission)
]

# 7. Cars with the Same Engine Type and Distance Range (+/- 5000 km)
same_engine_distance_range = df[
    (df['Engine Type'] == chosen_engine_type) &
    (df['Distance_numeric'] >= distance_range[0]) &
    (df['Distance_numeric'] <= distance_range[1])
]
same_engine_distance_cheaper = same_engine_distance_range[same_engine_distance_range['Price_numeric'] < chosen_price]
same_engine_distance_better_combination = same_engine_distance_range[
    (same_engine_distance_range['Price_numeric'] < chosen_price) &
    (same_engine_distance_range['Distance_numeric'] < chosen_distance)
]

# 8. Cars with the Same Transmission and Distance Range (+/- 5000 km)
same_transmission_distance_range = df[
    (df['Transmission'] == chosen_transmission) &
    (df['Distance_numeric'] >= distance_range[0]) &
    (df['Distance_numeric'] <= distance_range[1])
]
same_transmission_distance_cheaper = same_transmission_distance_range[same_transmission_distance_range['Price_numeric'] < chosen_price]
same_transmission_distance_better_combination = same_transmission_distance_range[
    (same_transmission_distance_range['Price_numeric'] < chosen_price) &
    (same_transmission_distance_range['Distance_numeric'] < chosen_distance)
]

# 9. Cars with Higher Price Drop Percentage
higher_price_drop = df[df['Price_Drop_%'] > first_row['Price_Drop_%']]
higher_price_drop_better_combination = higher_price_drop[
    (higher_price_drop['Price_numeric'] < chosen_price) &
    (higher_price_drop['Distance_numeric'] < chosen_distance)
]

# 10. Cars with the Same City and Year Range (+/- 1 year)
same_city_year_range = same_year_range[same_year_range['City'] == chosen_city]
same_city_year_cheaper = same_city_year_range[same_city_year_range['Price_numeric'] < chosen_price]
same_city_year_better_combination = same_city_year_range[
    (same_city_year_range['Price_numeric'] < chosen_price) &
    (same_city_year_range['Distance_numeric'] < chosen_distance)
]
# Function to calculate percentage safely (avoid division by zero)
def calc_percentage(part, whole):
    return (part / whole * 100) if whole > 0 else 0
def output_insights(group_name, group, cheaper, less_distance, better_combination):
    return {
        "group_name": group_name,
        "total_cars": len(group),
        "total_percentage_of_total_cars": calc_percentage(len(group), total_cars),
        "cheaper_than_selected": calc_percentage(len(cheaper), len(group)),
       
        "with_less_distance": calc_percentage(len(less_distance), len(group)),

        "with_better_combination": calc_percentage(len(better_combination), len(group)),
    }

# Collect insights into a list of dictionaries
insights = [
    
    output_insights("Cars with the Same Engine Type and Year Range (+/- 1 year)", same_engine_year_range, same_engine_year_cheaper, same_engine_year_less_distance, same_engine_year_better_combination),
    output_insights("Cars in the Same City", same_city, same_city_cheaper, same_city_less_distance, same_city_better_combination),
    
    output_insights("Cars with the Same Engine Type and Transmission", same_engine_transmission, same_engine_transmission_cheaper, same_engine_transmission_less_distance, same_engine_transmission_better_combination),
    output_insights("Cars in the Same Price Range (+/- 20%)", same_price_range, same_price_range_better_combination, same_price_range_engine_transmission, same_price_range_engine_transmission),
    output_insights("Cars with the Same Engine Type and Distance Range (+/- 5000 km)", same_engine_distance_range, same_engine_distance_cheaper, same_engine_distance_better_combination, same_engine_distance_better_combination),
    output_insights("Cars with the Same Transmission and Distance Range (+/- 5000 km)", same_transmission_distance_range, same_transmission_distance_cheaper, same_transmission_distance_better_combination, same_transmission_distance_better_combination),
    output_insights("Cars with Higher Price Drop Percentage", higher_price_drop, higher_price_drop_better_combination, higher_price_drop_better_combination, higher_price_drop_better_combination),
    output_insights("Cars with the Same City and Year Range (+/- 1 year)", same_city_year_range, same_city_year_cheaper, same_city_year_better_combination, same_city_year_better_combination)
]

# Save the insights to a JSON file
with open('car_insights.json', 'w') as json_file:
    json.dump(insights, json_file, indent=4)

print("Insights saved to car_insights.json")