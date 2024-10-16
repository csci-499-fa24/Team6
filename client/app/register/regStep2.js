'use client';
import * as React from 'react';
import { CustomTextField, CustomDropdown, CustomLinearProgress } from "../components/customComponents";
import styles from './register.module.css';
import { MenuItem } from '@mui/material';
import { AddCircleOutlineRounded, RemoveCircleOutlineRounded } from '@mui/icons-material';
import axios from 'axios';
import { useState, useEffect } from 'react';

const Units = [
    { value: "g", label: "Gram(s)" },
    { value: "oz", label: "Ounce(s)" },
    { value: "lb", label: "Pound(s)" },
    { value: "C", label: "Cup(s)" },
    { value: "pt", label: "Pint(s)" },
    { value: "qt", label: "Quart(s)" },
    { value: "gal", label: "Gallon(s)" },
    { value: "mL", label: "Milliliter(s)" },
    { value: "L", label: "Liter(s)" },
    { value: "tsp", label: "Teaspoon(s)" },
    { value: "tbsp", label: "Tablespoon(s)" },
];

const RegistrationStep2 = ({ currentStep, handleNextStep, handlePrevStep, formData, setFormData }) => {
    const [unit, setUnit] = useState('');
    const [quantity, setQuantity] = useState('');
    const [ingredient, setIngredient] = useState('');
    const [ingredients, setIngredients] = useState(formData.ingredients || []);
    const [ingredientList, setIngredientList] = useState([]);
    const [suggestions, setSuggestions] = useState([]);


    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/ingredients`);
                setIngredientList(response.data);
            } catch (error) {
                console.error('Error fetching ingredients:', error);
            }
        };
        fetchIngredients();
    }, []);


    useEffect(() => {
        if (ingredient) {
            const filteredSuggestions = ingredientList
                .filter(item => item.toLowerCase().startsWith(ingredient.toLowerCase()))
                .filter(item => item.toLowerCase() !== ingredient.toLowerCase());
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [ingredient, ingredientList]);

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleAddIngredient();
        }
    };

    const handleAddIngredient = () => {
        if (quantity > 0 && unit && ingredient) {
            const newIngredient = { ingredient, quantity, unit };
            setIngredients(prev => [...prev, newIngredient]);
            setQuantity('');
            setUnit('');
            setIngredient('');
            setSuggestions([]);
        }
    };

    const handleRemoveIngredient = (index) => {
        setIngredients(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveAndNext = () => {
        setFormData(prev => ({
            ...prev,
            ingredients
        }));
        handleNextStep();
    };

    const handleSuggestionClick = (suggestion) => {
        setIngredient(suggestion);
        setSuggestions([]);
    };

    return (
        <div className={styles.step1}>
            <div className={styles.regTitle}>Add any ingredients that you own</div>
            <CustomLinearProgress
                variant="determinate"
                value={(currentStep / 4) * 100}
                className={styles.progressBar}
            />
            <div className={styles.addIngredient}>
                <div className={styles.quantity}>
                    Quantity
                    <CustomTextField
                        type="number"
                        value={quantity}
                        onChange={(event) => setQuantity(event.target.value >= 0 ? event.target.value : '')}
                    />
                </div>
                <div className={styles.unit}>
                    Unit
                    <CustomDropdown
                        value={unit}
                        onChange={(event) => setUnit(event.target.value)}
                    >
                        {Units.map((unit) => (
                            <MenuItem
                                key={unit.value}
                                value={unit.value}
                                sx={{ '&.MuiMenuItem-root': { fontFamily: 'Inter' } }}
                            >
                                {unit.label}
                            </MenuItem>
                        ))}
                    </CustomDropdown>
                </div>
                <div className={styles.ingredient}>
                    Ingredients
                    <CustomTextField
                        value={ingredient}
                        onChange={(event) => setIngredient(event.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {suggestions.length > 0 && (
                        <div className={styles.suggestionList}>
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className={styles.suggestionItem}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <AddCircleOutlineRounded onClick={handleAddIngredient} className={styles.addButton} />
            </div>
            <div className={styles.ingredientList}>
                {ingredients.length > 0 && (
                    <div className={styles.scrollableContainer}>
                        {ingredients.map((item, index) => (
                            <div key={index} className={styles.ingredientItem}>
                                {item.quantity} {item.unit} {item.ingredient}
                                <RemoveCircleOutlineRounded onClick={() => handleRemoveIngredient(index)} className={styles.removeButton} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className={styles.navButtons}>
                <div className={styles.navButton} onClick={handlePrevStep}>Back</div>
                <div className={styles.navButton} onClick={handleSaveAndNext}>Next</div>
            </div>
        </div>
    );
};

export default RegistrationStep2;
