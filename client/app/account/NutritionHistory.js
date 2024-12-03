import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Bar } from 'react-chartjs-2'; // Import Bar instead of Line
import 'react-datepicker/dist/react-datepicker.css';
import { Chart as ChartJS } from 'chart.js/auto';

const NutritionHistory = () => {
    // State to manage selected date and nutrition data
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [nutritionData, setNutritionData] = useState({
        protein: '',
        carbohydrates: '',
        total_fat: '',
        saturated_fat: '',
        fiber: '',
        sodium: '',
        sugar: '',
        calories: '',
    });

    // Dummy data for graph (this will be fetched based on the selected date)
    const fetchNutritionData = async (date) => {
        // Simulate an API call to fetch nutrition data for the selected date
        // Replace with actual API logic
        const data = {
            protein: 50,
            carbohydrates: 150,
            total_fat: 60,
            saturated_fat: 25,
            fiber: 30,
            sodium: 2000,
            sugar: 45,
            calories: 2000,
        };

        setNutritionData(data);
    };

    // Handle the date change
    const handleDateChange = (date) => {
        setSelectedDate(date);
        fetchNutritionData(date);
    };

    // Data for the graph
    const chartData = {
        labels: ['Protein', 'Carbs', 'Fat', 'Saturated Fat', 'Fiber', 'Sodium', 'Sugar', 'Calories'],
        datasets: [
            {
                label: 'Nutrition Data',
                data: [
                    nutritionData.protein,
                    nutritionData.carbohydrates,
                    nutritionData.total_fat,
                    nutritionData.saturated_fat,
                    nutritionData.fiber,
                    nutritionData.sodium,
                    nutritionData.sugar,
                    nutritionData.calories,
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(100, 181, 246, 0.2)',
                    'rgba(220, 120, 220, 0.2)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(100, 181, 246, 1)',
                    'rgba(220, 120, 220, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Options for bar chart
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
        },
    };

    return (
        <div className="nutrition-history">
            <h2>Nutrition History</h2>

            {/* Date Picker */}
            <div className="date-picker">
                <label>Select a date: </label>
                <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    dateFormat="MMMM d, yyyy"
                />
            </div>

            {/* Graph displaying nutritional data */}
            <div className="nutrition-graph">
                <h3>Nutrition Data for {selectedDate.toLocaleDateString()}</h3>
                <Bar data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default NutritionHistory;
