import React, { useState, useEffect } from 'react';
import CarInsights from './CarInsights'
import data from '../../backend/output.json'; // Adjust the import path as needed
import citydata from '../../backend/output_city.json';
import PriceYearScatterPlot from './New';
import axios from 'axios';

const ParentComponent = () => {
    const [carData, setCarData] = useState([]);
    const [chosenCar, setChosenCar] = useState([]);
    const [isCityData, setIsCityData] = useState(false);
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [variant, setVariant] = useState('');
    const [fuelType, setFuelType] = useState('');
    const [transmissionType, setTransmissionType] = useState('');
    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [variants, setVariants] = useState([]);
    const [fuelTypes, setFuelTypes] = useState([]);
    const [transmissionTypes, setTransmissionTypes] = useState([]);

    useEffect(() => {
        setCarData(data);
        setChosenCar(data[0])
    }, [data]);

    useEffect(() => {
        // Fetch all makes when component loads
        const fetchMakes = async () => {
            try {
                const response = await axios.get('/getMakes');
                setMakes(response.data);
            } catch (error) {
                console.error('Error fetching makes:', error);
            }
        };
        fetchMakes();
    }, [data]);

    // Fetch models when make is selected
    useEffect(() => {
        const fetchModels = async () => {
            if (make) {
                try {
                    const response = await axios.get(`/getModels?make=${make}`);
                    setModels(response.data);
                } catch (error) {
                    console.error('Error fetching models:', error);
                }
            }
        };
        fetchModels();
    }, [make]);

    // Fetch variants when model is selected
    useEffect(() => {
        const fetchVariants = async () => {
            if (model) {
                try {
                    const response = await axios.get(`/getVariants?make=${make}&model=${model}`);
                    setVariants(response.data);
                } catch (error) {
                    console.error('Error fetching variants:', error);
                }
            }
        };
        fetchVariants();
    }, [model]);

    // Fetch fuel types when variant is selected
    useEffect(() => {
        const fetchFuelTypes = async () => {
            if (variant) {
                console.log(variant)
                try {
                    const encodedvariant=encodeURIComponent(variant)
                    const response = await axios.get(`/getFuelTypes?make=${make}&model=${model}&variant=${encodedvariant}`);
                    setFuelTypes(response.data);
                } catch (error) {
                    console.error('Error fetching fuel types:', error);
                }
            }
        };
        fetchFuelTypes();
    }, [variant]);

    // Fetch transmission types when fuel type is selected
    useEffect(() => {
        const fetchTransmissionTypes = async () => {
            if (fuelType) {
                try {
                    const encodedvariant=encodeURIComponent(variant)                    
                    const response = await axios.get(`/getTransmissionTypes?make=${make}&model=${model}&variant=${encodedvariant}&fuelType=${fuelType}`);
                    setTransmissionTypes(response.data);
                } catch (error) {
                    console.error('Error fetching transmission types:', error);
                }
            }
        };
        fetchTransmissionTypes();
    }, [fuelType]);

    const handleCity = () => {
        setIsCityData(!isCityData);
        setCarData(isCityData ? data : citydata);
    };
    const toTitleCase = (str) => {
        if (!str) return ''; // Return an empty string for falsy inputs
        return str
            .split(' ') // Split the string into an array of words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
            .join(' '); // Join the words back into a single string
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const carDetails = {
            make: make,
            model: model,
            variant: variant,
            fuelType: fuelType,
            transmissionType: transmissionType,
        };

        // Send a POST request to your backend 
        try {
            const response = await axios.post('/processCarData', carDetails)

            if (response.ok) {
                console.log('Data sent to backend successfully');
                // Handle response or further logic here
            } else {
                console.error('Error sending data to backend');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className='bg-purple-50 mt-5 m-auto p-5 flex flex-col gap-2 items-center max-w-[40vw] rounded-xl'>
                <div className='flex gap-4'>
                    <label className='font-bold text-sm'>Make:</label>
                    <select className='border border-black rounded-lg py-1 px-2'
                        value={make}
                        onChange={(e) => setMake(e.target.value)}
                        required
                    >
                        <option value="">Select Make</option>
                        {makes.map((make, index) => (
                            <option key={index} value={make}>{make}</option>
                        ))}
                    </select>
                </div>

                <div className='flex gap-4'>
                    <label className='font-bold text-sm'>Model:</label>
                    <select className='border border-black rounded-lg py-1 px-2'
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        required
                        disabled={!make}  // Disable until a make is selected
                    >
                        <option value="">Select Model</option>
                        {models.map((model, index) => (
                            <option key={index} value={model}>{model}</option>
                        ))}
                    </select>
                </div>

                <div className='flex gap-4'>
                    <label className='font-bold text-sm'>Variant:</label>
                    <select className='border border-black rounded-lg py-1 px-2'
                        value={variant}
                        onChange={(e) => setVariant(e.target.value)}
                        required
                        disabled={!model}  // Disable until a model is selected
                    >
                        <option value="">Select Variant</option>
                        {variants.map((variant, index) => (
                            <option key={index} value={variant}>{variant}</option>
                        ))}
                    </select>
                </div>

                <div className='flex gap-4'>
                    <label className='font-bold text-sm'>Fuel Type:</label>
                    <select className='border border-black rounded-lg py-1 px-2'
                        value={fuelType}
                        onChange={(e) => setFuelType(e.target.value)}
                        required
                        disabled={!variant}  // Disable until a variant is selected
                    >
                        <option value="">Select Fuel Type</option>
                        {fuelTypes.map((fuel, index) => (
                            <option key={index} value={fuel}>{fuel}</option>
                        ))}
                    </select>
                </div>

                <div className='flex gap-4'>
                    <label className='font-bold text-sm'>Transmission Type:</label>
                    <select className='border border-black rounded-lg py-1 px-2'
                        value={transmissionType}
                        onChange={(e) => setTransmissionType(e.target.value)}
                        required
                        disabled={!fuelType}  // Disable until a fuel type is selected
                    >
                        <option value="">Select Transmission Type</option>
                        {transmissionTypes.map((transmission, index) => (
                            <option key={index} value={transmission}>{transmission}</option>
                        ))}
                    </select>
                </div>

                <button type="submit" className='bg-purple-700 rounded-xl py-2 text-white w-40 mt-4'>
                    Submit
                </button>
            </form>

            <button onClick={handleCity} className='bg-purple-700 rounded-lg py-2 text-white mx-4 p-5'>
                {isCityData ? 'View All Data' : 'View Region Specific'}
            </button>

            {carData.length > 0 && chosenCar ? (
                <PriceYearScatterPlot data={carData} chosenCar={chosenCar} />
            ) : (
                <p>Loading data...</p>
            )}
            <CarInsights/>
        </div>
        );
};

export default ParentComponent;
