'use client';
import * as React from 'react';
import { CustomTextField, CustomDropdown, CustomLinearProgress } from "../components/customComponents";
import styles from './register.module.css';
import { MenuItem } from '@mui/material';
import { AddCircleOutlineRounded, RemoveCircleOutlineRounded } from '@mui/icons-material';

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
    const [unit, setUnit] = React.useState('');
    const [ingredients, setIngredients] = React.useState(formData.ingredients);
    const [quantity, setQuantity] = React.useState('');
    const [ingredient, setIngredient] = React.useState('');

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleAddIngredient();
        }
    };

    const handleAddIngredient = () => {
        if (quantity > 0 && unit && ingredient) {
            const newIngredient = { ingredient, quantity, unit }; // Use 'unit' instead of 'units'
            setIngredients((prev) => [...prev, newIngredient]);
            setQuantity('');
            setUnit('');
            setIngredient('');
        }
    };

    const handleRemoveIngredient = (index) => {
        setIngredients((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSaveAndNext = () => {
        // Transform pantry items to match formData.ingredients structure
        const formattedIngredients = ingredients.map(item => ({
            ingredient: item.ingredient,
            quantity: item.quantity,
            units: item.unit // Use 'unit' instead of 'units'
        }));

        // Update formData with the current formatted ingredients
        setFormData((prev) => ({
            ...prev,
            ingredients: formattedIngredients // Update the ingredients in formData
        }));

        // Proceed to the next step
        handleNextStep();
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
                        onChange={(event) => {
                            const value = event.target.value < 0 ? 0 : event.target.value;
                            setQuantity(value);
                        }}
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
                </div>
                <AddCircleOutlineRounded onClick={handleAddIngredient} className={styles.addButton} />
            </div>
            <div className={styles.ingredientList}>
                {ingredients.length > 0 && (
                    <div className={styles.scrollableContainer}>
                        {ingredients.map((item, index) => (
                            <div key={index} className={styles.ingredientItem}>
                                {item.quantity} {item.unit} {item.ingredient} {/* Simplified display */}
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