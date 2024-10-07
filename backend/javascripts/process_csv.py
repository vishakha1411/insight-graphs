import pandas as pd
import sys
import os
import json

# Print to verify the arguments are correctly passed from the Node.js backend
print(sys.argv[1])
car_details_json= sys.argv[1]

# Replace &quot; with actual double quotes
car_details_json = car_details_json.replace('&quot;', '"')

# Now try to load the JSON string
try:
    car_details = json.loads(car_details_json)
except json.JSONDecodeError as e:
    print(f"Failed to decode JSON: {e}")
    sys.exit(1)

# Extract the details from the dictionary
make = car_details['make']
model = car_details['model']
variant = car_details['variant']
fuel = car_details['fuelType']
transmission = car_details['transmissionType']
# Print or process further as needed
print(f"Make: {make}, Model: {model}, Variant: {variant}, Transmission: {transmission}, Fuel: {fuel}")
csv_file_path = os.path.join(os.path.dirname(__file__), 'cleaned_data.csv')

# Check if the CSV file exists
if not os.path.exists(csv_file_path):
    print(f"CSV file not found: {csv_file_path}")
    sys.exit(1)

# Read the CSV data
df = pd.read_csv(csv_file_path)

# Function to remove outliers using IQR
def remove_outliers_iqr(df, column):
    Q1 = df[column].quantile(0.25)
    Q3 = df[column].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - IQR
    upper_bound = Q3 + IQR
    return df[(df[column] >= lower_bound) & (df[column] <= upper_bound)]

# Remove outliers year-wise for both Price_numeric and Distance_numeric
def remove_outliers_yearwise(df):
    cleaned_data = pd.DataFrame()

    # Iterate over each year and apply outlier removal for price and distance
    for year in df['Year'].unique():
        year_data = df[df['Year'] == year]
        year_data_cleaned = remove_outliers_iqr(year_data, 'Price_numeric')
        year_data_cleaned = remove_outliers_iqr(year_data_cleaned, 'Distance_numeric')
        cleaned_data = pd.concat([cleaned_data, year_data_cleaned], ignore_index=True)

    return cleaned_data

# Filter the dataframe based on the given car details
df_filtered = df[
    (df['Make'] == make) & 
    (df['Model'] == model) & 
    (df['Variant'] == variant) & 
    (df['Transmission'] == transmission) & 
    (df['Engine Type'] == fuel)
]

# If no data is found, print a message and exit
if df_filtered.empty:
    print(f"No data found for {make} {model} {variant} {transmission} {fuel}")
    sys.exit(1)

# Apply the outlier removal process
df_cleaned_yearwise = remove_outliers_yearwise(df_filtered)

# Save the cleaned data to a new CSV file
output_file_path = os.path.join(os.path.dirname(__file__), 'cleaned_car_data.csv')
df_cleaned_yearwise.to_csv(output_file_path, index=False)

print(f"Cleaned data saved to {output_file_path}")
