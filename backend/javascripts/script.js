const fs = require('fs')
console.log('hello')
// Read and parse the JSON file

const jsonData = JSON.parse(fs.readFileSync('output.json', 'utf8'));
console.log('Successfully read output.json');

let group = '';

const cityGroups = {
    "Delhi-NCR": {
        "Delhi": ["Delhi"],
        "NCR": ["Gurgaon", "Noida", "Ghaziabad", "Faridabad"]
    },
    "North India": [
        "Ludhiana", "Jalandhar", "Ambala", "Lucknow", "Meerut", "Chandigarh",
        "Mohali", "Panchkula", "Kharar", "Dehradun"
    ],
    "East India": ["Kolkata", "Kharagpur"],
    "West India": {
        "Maharashtra": ["Mumbai", "Pune", "Thane", "Navi", "Sangli", "Kalyan", "Badlapur", "Nashik"],
        "Gujarat": ["Ahmedabad", "Surat", "Vadodara"]
    },
    "South India": {
        "Karnataka": ["Bangalore", "Mysore", "Gulbarga"],
        "Telangana": ["Hyderabad", "Secunderabad", "Ranga"],
        "Tamil Nadu": ["Chennai", "Coimbatore"]
    }
};

// Function to get the group a city belongs to
function findGroupAndSubgroup(city) {
    for (let region in cityGroups) {
        for (let subgroup in cityGroups[region]) {
            let cities = cityGroups[region][subgroup];
            if (cities.includes(city)) {

                return { region, subgroup };
            }
        }
    }
    return null; // City not found
}

// Main function to get the desired data
function getEntriesForChosenCar(city) {
    // Step 1: Filter entries for the specific city
    let cityEntries = jsonData.filter(entry => entry.City === city);

    // If city has more than 20 entries, return them
    if (cityEntries.length >= 20) {
        group = 'city';
        return cityEntries;
    }

    // Step 2: Find the group and subgroup the city belongs to
    let groupInfo = findGroupAndSubgroup(city);

    if (groupInfo) {
        let { region, subgroup } = groupInfo;

        // Step 3: Check subgroup entries
        let subgroupCities = cityGroups[region][subgroup];
        let subgroupEntries = jsonData.filter(entry => subgroupCities.includes(entry.City));

        if (subgroupEntries.length >= 20) {
            group = subgroup;
            return subgroupEntries;
        }

        // Step 4: Check group entries
        let groupCities = Object.values(cityGroups[region]).flat();
        let groupEntries = jsonData.filter(entry => groupCities.includes(entry.City));

        if (groupEntries.length >= 20) {
            group = region;
            return groupEntries;
        }
    }

    // Step 5: If none of the above have 20 entries, return the entire dataset
    return jsonData;
}

// Example usage:
let chosenCarCity = "Ahmedabad";  // City for the chosen car
let result = getEntriesForChosenCar(chosenCarCity);
console.log(group)

// Write the result to a new JSON file
fs.writeFileSync('./output_city.json', JSON.stringify(result, null, 2));   // Output result as formatted JSON

