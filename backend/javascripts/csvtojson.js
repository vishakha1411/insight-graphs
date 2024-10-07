const fs = require('fs')
const csv = fs.readFileSync("./javascripts/cleaned_car_data.csv")
function csvToJson(csvString) {
    const rows = csvString.toString().split("\n");

    const headers = rows[0].split(",");

    const jsonData = [];
    for (let i = 1; i < rows.length; i++) {

        const values = rows[i].split(",");

        const obj = {};

        for (let j = 0; j < headers.length; j++) {

            const key = headers[j].trim();
            const value = values[j] ? values[j].trim() : '';

            obj[key] = value;
        }

        jsonData.push(obj);
    }
    return JSON.stringify(jsonData);
}
// Convert the resultant array to json and
// generate the JSON output file.


const jsondata=csvToJson(csv)

fs.writeFileSync('output.json', jsondata); 
console.log('done')