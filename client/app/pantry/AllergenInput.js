"use client";

import React, { useState } from 'react';
import styles from './pantry.module.css';
import { CustomTextField } from "../components/customComponents"
import { AddCircleOutlineRounded, RemoveCircleOutlineRounded } from '@mui/icons-material';



const AllergenInput = () => {
    const [allergies, setAllergies] = useState([]);
    const [allergy, setAllergy] = useState('');

    const handleAddAllergy = () => {
        if (allergy) {
            setAllergies((prev) => [
                ...prev,
                { allergy }
            ]);
            setAllergy('');
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleAddAllergy();
        }
    };

    const handleRemoveAllergy = (indexToRemove) => {
        setAllergies((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div>
            <div className={styles.header}>Add an allergen</div>
            <div className={styles.addAllergy}>
                <div className={styles.allergyInput}>
                    Allergy
                    <CustomTextField
                        value={allergy}
                        onChange={(event) => setAllergy(event.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <AddCircleOutlineRounded onClick={handleAddAllergy} className={styles.addButton}/>
            </div>
            <div className={styles.ingredientList}>
                {allergies.length > 0 && (
                    <div className={styles.scrollableContainer}>
                        {allergies.map((item, index) => (
                            <div key={index} className={styles.ingredientItem}>
                                {item.allergy}
                                <RemoveCircleOutlineRounded onClick={() => handleRemoveAllergy(index)} className={styles.removeButton} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllergenInput;