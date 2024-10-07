'use client';
import * as React from 'react';
import { CustomTextField, CustomDropdown, CustomLinearProgress } from "../components/customComponents"
import styles from './register.module.css';
import { MenuItem } from '@mui/material';
import { AddCircleOutlineRounded, RemoveCircleOutlineRounded } from '@mui/icons-material';
import Link from "next/link";
import { useState } from 'react';

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
]

const RegistrationStep2 = ({ currentStep, handleNextStep, handlePrevStep }) => {
    const [unit, setUnit] = React.useState('');
    const [pantry, setPantry] = useState([]);
    const [quantity, setQuantity] = useState('');
    const [ingredient, setIngredient] = useState('');

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleAddIngredient();
        }
    };

    const handleAddIngredient = () => {
        if (quantity > 0 && unit && ingredient) {
            setPantry((prev) => [
                ...prev,
                { quantity, unit, ingredient }
            ]);
            setQuantity('');
            setUnit('');
            setIngredient('');
        }
    };

    const handleRemoveIngredient = (indexToRemove) => {
        setPantry((prev) => prev.filter((_, index) => index !== indexToRemove));
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
                <AddCircleOutlineRounded onClick={handleAddIngredient} className={styles.addButton}/>
            </div>
            <div className={styles.ingredientList}>
                {pantry.length > 0 && (
                    <div className={styles.scrollableContainer}>
                        {pantry.map((item, index) => (
                            <div key={index} className={styles.ingredientItem}>
                                {item.quantity} {item.unit} of {item.ingredient}
                                <RemoveCircleOutlineRounded onClick={() => handleRemoveIngredient(index)} className={styles.removeButton} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className={styles.navButtons}>
                <div className={styles.navButton} onClick={handlePrevStep}>Back</div>
                <div className={styles.navButton} onClick={handleNextStep}>Next</div>
            </div>
        </div>
    );
};

export default RegistrationStep2;