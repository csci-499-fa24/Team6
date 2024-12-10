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

    // Fetch daily nutrition data for the selected date
    const fetchDailyNutritionData = async (date) => {
        const token = localStorage.getItem('token');
        const formattedDate = new Date(date).toISOString().split('T')[0];

        console.log('Formatted date:', formattedDate);  // Debugging the formatted date

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/nutrition-get/daily?date=${formattedDate}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setNutritionData(data || { protein: 0, carbohydrates: 0, total_fat: 0, saturated_fat: 0, fiber: 0, sodium: 0, sugar: 0, calories: 0 });
        } catch (error) {
            console.error("Error fetching daily nutrition data", error);
        }
    };

    // Fetch history data based on selected history period, year, and month
    const fetchHistoryData = async (date, historyPeriod, year, month) => {
        const token = localStorage.getItem('token');
        const formattedDate = new Date(date).toISOString().split('T')[0];
        try {
            const url = new URL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/nutrition-get/history`);
            url.searchParams.append('historyPeriod', historyPeriod);
            if (date) {
                url.searchParams.append('date', formattedDate);
            }
            if (year) {
                url.searchParams.append('year', year);
            }
            if (date) {
                url.searchParams.append('month', month);
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch history data: ${response.status}`);
            }

            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                setHistoryData(data);
            } else {
                setHistoryData([]); // Set empty data if no results are returned
            }
        } catch (error) {
            console.error("Error fetching historical nutrition data:", error);
        }
    };

    // Effect for daily nutrition data (for selected date)
    useEffect(() => {
        fetchDailyNutritionData(selectedDate);
    }, [selectedDate]);

    // Effect for historical nutrition data (for selected period, year, month, or week)
    useEffect(() => {
        fetchHistoryData(selectedWeekDate, historyPeriod, year, month);
    }, [historyPeriod, selectedWeekDate, year, month]);

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
                                        {[...Array(20)].map((_, i) => (
                                            <option key={i} value={new Date().getFullYear() - 10 + i}>
                                                {new Date().getFullYear() - 10 + i}
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
                                {[...Array(20)].map((_, i) => (
                                    <option key={i} value={new Date().getFullYear() - 10 + i}>
                                        {new Date().getFullYear() - 10 + i}
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
