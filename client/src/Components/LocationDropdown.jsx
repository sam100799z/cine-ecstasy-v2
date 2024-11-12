import React, { useState } from 'react';
import { states, cities } from "../assets/stateCityData";

const LocationDropdown = ({ register, setValue }) => {
    const [selectedStateIndex, setSelectedStateIndex] = useState("");
    const [stateName, setStateName] = useState("");

    const handleStateChange = (e) => {
        setSelectedStateIndex(e.target.selectedOptions[0].getAttribute("data-index"))
        setStateName(e.target.value);
        setValue("state", stateName);
        setValue("city", "");
    };

    const handleCityChange = (e) => {
        setValue("city", e.target.value); // Update city in form data
    };

    return (
        <div>
            <select
                {...register("state", { required: true })}
                onChange={handleStateChange}
                value={stateName || ""}
                className="mb-4 w-full p-4 bg-gray-100 rounded-lg border border-gray-300"
            >
                <option value="">Select State</option>
                {states.map((state, index) => (
                    <option key={state} value={state} data-index={index}>
                        {state}
                    </option>
                ))}
            </select>

            <select
                {...register("city", { required: true })}
                onChange={handleCityChange}
                disabled={stateName === ""}
                className="mb-4 w-full p-4 bg-gray-100 rounded-lg border border-gray-300"
            >
                <option value="">Select City</option>
                {stateName !== "" &&
                    cities[selectedStateIndex].split(" | ").map((city, index) => (
                        <option key={city} value={city}>
                            {city}
                        </option>
                    ))}
            </select>
        </div>
    );
};

export default LocationDropdown;
