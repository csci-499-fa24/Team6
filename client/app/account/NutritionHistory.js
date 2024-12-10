import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Bar, Line } from 'react-chartjs-2';
import 'react-datepicker/dist/react-datepicker.css';
import { Chart as ChartJS } from 'chart.js/auto';
import styles from './NutritionHistory.module.css';

const NutritionHistory = () => {
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
    const [historyPeriod, setHistoryPeriod] = useState('weekly'); // weekly, monthly, yearly
    const [historyData, setHistoryData] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1); // month is 1-based
    const [selectedWeekDate, setSelectedWeekDate] = useState(new Date());
    const [selectedNutrients, setSelectedNutrients] = useState({
        protein: true,
        carbohydrates: true,
        total_fat: true,
        saturated_fat: true,
        fiber: true,
        sodium: true,
        sugar: true,
        calories: true,
    });

    const fetchNutritionData = async (date) => {
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

    const fetchHistoryData = async () => {
        let data = [];
        if (historyPeriod === 'weekly') {
            // Weekly data for each day of the week
            data = [
                { label: 'Mon', protein: 45, carbohydrates: 120, total_fat: 50, saturated_fat: 20, fiber: 10, sodium: 1500, sugar: 40, calories: 2000 },
                { label: 'Tue', protein: 50, carbohydrates: 150, total_fat: 60, saturated_fat: 25, fiber: 12, sodium: 1600, sugar: 45, calories: 2100 },
                { label: 'Wed', protein: 60, carbohydrates: 140, total_fat: 70, saturated_fat: 30, fiber: 15, sodium: 1700, sugar: 50, calories: 2200 },
                { label: 'Thu', protein: 55, carbohydrates: 130, total_fat: 65, saturated_fat: 28, fiber: 11, sodium: 1800, sugar: 42, calories: 2050 },
                { label: 'Fri', protein: 65, carbohydrates: 160, total_fat: 75, saturated_fat: 35, fiber: 16, sodium: 1900, sugar: 55, calories: 2300 },
                { label: 'Sat', protein: 70, carbohydrates: 170, total_fat: 80, saturated_fat: 40, fiber: 20, sodium: 2000, sugar: 60, calories: 2400 },
                { label: 'Sun', protein: 50, carbohydrates: 150, total_fat: 60, saturated_fat: 22, fiber: 13, sodium: 1600, sugar: 48, calories: 2100 },
            ];
        } else if (historyPeriod === 'monthly') {
            // Monthly data for each day of the month
            data = Array.from({ length: 30 }, (_, i) => ({
                label: `Day ${i + 1}`,
                protein: Math.random() * 80 + 40, // Protein between 40 and 120
                carbohydrates: Math.random() * 200 + 100, // Carbs between 100 and 300
                total_fat: Math.random() * 100 + 40, // Fat between 40 and 140
                saturated_fat: Math.random() * 50 + 10, // Saturated Fat between 10 and 60
                fiber: Math.random() * 30 + 5, // Fiber between 5 and 35
                sodium: Math.random() * 2500 + 1000, // Sodium between 1000 and 3500
                sugar: Math.random() * 100 + 30, // Sugar between 30 and 130
                calories: Math.random() * 2500 + 1500, // Calories between 1500 and 4000
            }));
        } else if (historyPeriod === 'yearly') {
            // Yearly data for each month of the year
            data = Array.from({ length: 12 }, (_, i) => ({
                label: `Month ${i + 1}`,
                protein: Math.random() * 2000 + 500, // Protein between 500 and 2500
                carbohydrates: Math.random() * 5000 + 2000, // Carbs between 2000 and 7000
                total_fat: Math.random() * 3000 + 1000, // Fat between 1000 and 4000
                saturated_fat: Math.random() * 1500 + 500, // Saturated Fat between 500 and 2000
                fiber: Math.random() * 300 + 50, // Fiber between 50 and 350
                sodium: Math.random() * 30000 + 10000, // Sodium between 10000 and 40000
                sugar: Math.random() * 1200 + 400, // Sugar between 400 and 1600
                calories: Math.random() * 30000 + 10000, // Calories between 10000 and 40000
            }));
        }
        setHistoryData(data);
    };


    useEffect(() => {
        fetchNutritionData(selectedDate);
        fetchHistoryData();
    }, [selectedDate, historyPeriod, year, month]);

    const barChartData = {
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
                    '#B6D9FC',
                    '#FFCF96',
                    '#F5AD9D',
                    '#F5C5CE',
                    '#C1CBB9',
                    '#CBA6DD',
                    '#C9C8FF',
                    '#C3F5C2',
                ],
                borderColor: [
                    '#B6D9FC',
                    '#FFCF96',
                    '#F5AD9D',
                    '#F5C5CE',
                    '#C1CBB9',
                    '#CBA6DD',
                    '#C9C8FF',
                    '#C3F5C2',
                ],
                borderWidth: 1,
            },
        ],
    };
    const handleNutrientToggle = (nutrient) => {
        setSelectedNutrients((prev) => ({
            ...prev,
            [nutrient]: !prev[nutrient],
        }));
    };
    const getColorForNutrient = (nutrient, alpha = 1) => {
        const colors = {
            protein: '#B6D9FC',
            carbohydrates: '#FFCF96',
            total_fat: '#F5AD9D',
            saturated_fat: '#F5C5CE',
            fiber: '#C1CBB9',
            sodium: '#CBA6DD',
            sugar: '#C9C8FF',
            calories: '#C3F5C2',
        };
        return colors[nutrient] || 'rgba(0, 0, 0, ' + alpha + ')';
    };
    const lineChartData = {
        labels: historyData.map((data) => data.label),
        datasets: Object.keys(selectedNutrients)
            .filter((nutrient) => selectedNutrients[nutrient])
            .map((nutrient) => ({
                label: nutrient
                    .replace(/_/g, ' ') 
                    .charAt(0).toUpperCase() + nutrient.slice(1),
                data: historyData.map((data) => data[nutrient]),
                borderColor: getColorForNutrient(nutrient),
                backgroundColor: getColorForNutrient(nutrient, 0.2),
                tension: 0.3,
            })),
    };



    return (
        <div className={styles.nutritionHistory}>
            {/* Single Day Bar Chart */}
            <div className={styles.chartSection}>
                <div className={styles.chartHeader}>
                    <div className={styles.nutritionHistoryTitle}>Nutrition Data for {selectedDate.toLocaleDateString()}</div>
                    <div className={styles.datePickerSection}>
                        <div className={styles.datePickerLabel}>Select a date:</div>
                        <DatePicker
                            selected={selectedDate}
                            onChange={setSelectedDate}
                            dateFormat="MMMM d, yyyy"
                        />
                    </div>
                </div>
                <Bar data={barChartData} />
            </div>
            <div className={styles.lineGraphContainer}>
                <div className={styles.lineGraphHeader}>
                    <div className={styles.nutritionHistoryTitle}>Nutrition History Data</div>
                    <div className={styles.filterOptions}>
                        <button
                            className={historyPeriod === 'weekly' ? styles.activeButton : ''}
                            onClick={() => setHistoryPeriod('weekly')}
                        >
                            Weekly
                        </button>
                        <button
                            className={historyPeriod === 'monthly' ? styles.activeButton : ''}
                            onClick={() => setHistoryPeriod('monthly')}
                        >
                            Monthly
                        </button>
                        <button
                            className={historyPeriod === 'yearly' ? styles.activeButton : ''}
                            onClick={() => setHistoryPeriod('yearly')}
                        >
                            Yearly
                        </button>
                    </div>
                </div>
                <div className={styles.lineGraphFilter}>
                    <div className={styles.nutrientFilter}>
                        <div className={styles.nutrientSubheader}>Select Nutrients to Display</div>
                        <div className={styles.nutritionPicker}>
                            {Object.keys(selectedNutrients).map((nutrient) => (
                                <div key={nutrient}>
                                    <label className={styles.nutrientLabel}>
                                        <input
                                            type="checkbox"
                                            checked={selectedNutrients[nutrient]}
                                            onChange={() => handleNutrientToggle(nutrient)}
                                        />
                                        {nutrient.replace(/_/g, ' ').charAt(0).toUpperCase() + nutrient.replace(/_/g, ' ').slice(1)}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {historyPeriod === 'monthly' && (
                        <div className={styles.periodFilterSection}>
                            <div className={styles.monthFilterSection}>

                                <div>
                                    <div className={styles.nutrientSubheader}>Year:</div>
                                    <select
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        classname={styles.selectStyling}
                                    >
                                        {[...Array(10)].map((_, i) => (
                                            <option key={i} value={new Date().getFullYear() - i}>
                                                {new Date().getFullYear() - i}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <div className={styles.nutrientSubheader}>Month:</div>
                                    <select
                                        value={month}
                                        onChange={(e) => setMonth(e.target.value)}
                                        classname={styles.selectStyling}
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i} value={i + 1}>
                                                {new Date(0, i).toLocaleString('en-US', {
                                                    month: 'long',
                                                })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                        </div>
                    )}

                    {historyPeriod === 'yearly' && (
                        <div className={styles.periodFilterSection}>
                            <div className={styles.nutrientSubheader}>Year:</div>
                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                            >
                                {[...Array(10)].map((_, i) => (
                                    <option key={i} value={new Date().getFullYear() - i}>
                                        {new Date().getFullYear() - i}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {historyPeriod === 'weekly' && (
                        <div className={styles.periodFilterSection}>
                            <div className={styles.nutrientSubheader}>Select a date for the week:</div>
                            <DatePicker
                                selected={selectedWeekDate}
                                onChange={setSelectedWeekDate}
                                dateFormat="MMMM d, yyyy"
                            />
                        </div>
                    )}
                </div>


                <div className={styles.historySection}>
                    <Line data={lineChartData} />
                </div>
            </div>
        </div>
    );
};

export default NutritionHistory;
