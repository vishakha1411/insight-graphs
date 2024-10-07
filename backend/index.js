const express = require('express');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs')
const csv = require('csv-parser')
const app = express();
const port = 3000;

app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}));

app.use(bodyParser.json());
const carData = [];
const loadCarData = () => {
    return new Promise((resolve, reject) => {
        // Initialize carData array to store all rows
        fs.createReadStream('javascripts/cleaned_data.csv') // Adjust the file path if necessary
            .pipe(csv())
            .on('data', (row) => {
                // Each row is converted to an object, then pushed to carData array
                carData.push(row);
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
                resolve(carData); // Resolve the promise and return the carData array
            })
            .on('error', (err) => {
                console.error('Error reading CSV file:', err);
                reject(err); // Reject the promise in case of error
            });
    });
};

// Example usage
loadCarData().then((carData) => {
    console.log('okay'); // Use the loaded carData array after the Promise resolves
}).catch((err) => {
    console.error('Error loading car data:', err);
});
app.get('/getMakes', (req, res) => {
    const makes = [...new Set(carData.map(car => car.Make))]; // Extract unique makes
    res.json(makes);
});

// New endpoint to get models based on selected make
app.get('/getModels', (req, res) => {
    const { make } = req.query;
    const models = [...new Set(carData.filter(car => car.Make === make).map(car => car.Model))];
    res.json(models);
});

// New endpoint to get variants based on selected make and model
app.get('/getVariants', (req, res) => {
    const { make, model } = req.query;
    const variants = [...new Set(carData
        .filter(car => car.Make === make && car.Model === model)
        .map(car => car.Variant))];
    res.json(variants);
});

// New endpoint to get fuel types based on selected make, model, and variant
app.get('/getFuelTypes', (req, res) => {
    const { make, model, variant } = req.query;
    const fuelTypes = [...new Set(carData
        .filter(car => car.Make === make && car.Model === model && car.Variant === variant)
        .map(car => car['Engine Type']))];
    res.json(fuelTypes);
});

// New endpoint to get transmission types based on selected make, model, variant, and fuel type
app.get('/getTransmissionTypes', (req, res) => {
    const { make, model, variant, fuelType } = req.query;
    const transmissionTypes = [...new Set(carData
        .filter(car => car.Make === make && car.Model === model && car.Variant === variant && car['Engine Type'] === fuelType)
        .map(car => car.Transmission))];
    res.json(transmissionTypes);
});

app.post('/processCarData', (req, res) => {
    const { make, model, variant, fuelType, transmissionType } = req.body;
    console.log(make, model, variant, fuelType, transmissionType);
    
    const cardet = { make, model, variant, fuelType, transmissionType };
    const cardetStr = JSON.stringify(cardet);

    // Use `spawn` to execute the Python script
    const pythonProcess = spawn('python', ['javascripts/process_csv.py', cardetStr]);

    // Capture the output from the Python script
    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python Output: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python script exited with code ${code}`);
            return res.status(500).send('Error processing data');
        }

        // After the Python script completes, run the CSV to JSON conversion script
        const csvToJsonProcess = spawn('node', ['javascripts/csvtojson.js']);

        csvToJsonProcess.stdout.on('data', (data) => {
            console.log(`CSV to JSON Output: ${data}`);
        });

        csvToJsonProcess.stderr.on('data', (data) => {
            console.error(`CSV to JSON Error: ${data}`);
        });

        csvToJsonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`CSV to JSON script exited with code ${code}`);
                return res.status(500).send('Error converting CSV to JSON');
            }
            
            console.log("CSV to JSON script finished successfully. Now starting script.js");
            
            // Check if `script.js` exists before trying to run it
            
            // if (!fs.existsSync('javascripts/script.js')) {
            //     console.error("script.js file not found");
            //     return res.status(500).send('script.js not found');
            // }
        
            // Finally, run the final processing script
            const finalScriptProcess = spawn('node', ['javascripts/script.js']);
        
            finalScriptProcess.stdout.on('data', (data) => {
                console.log(`Final Script Output: ${data}`);
            });
        
            finalScriptProcess.stderr.on('data', (data) => {
                console.error(`Final Script Error: ${data}`);
            });
        
            finalScriptProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error(`Final script exited with code ${code}`);
                    return res.status(500).send('Error processing script.js');
                }
        
                console.log("script.js completed successfully. Now starting insights.py");
                
                // Run `insights.py` after `script.js`
                const insightsProcess = spawn('python', ['javascripts/insights.py']);
                
                insightsProcess.stdout.on('data', (data) => {
                    console.log(`Insights Script Output: ${data}`);
                });
                
                insightsProcess.stderr.on('data', (data) => {
                    console.error(`Insights Script Error: ${data}`);
                });
                
                insightsProcess.on('close', (code) => {
                    if (code !== 0) {
                        console.error(`insights.py script exited with code ${code}`);
                        return res.status(500).send('Error running insights.py');
                    }
                    
                    console.log("insights.py completed successfully");
                    res.send('Processing complete');
                })
            });
        });
        
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
