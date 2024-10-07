'use client';
import * as React from 'react';
import { CustomTextField, CustomLinearProgress } from "../components/customComponents"
import styles from './register.module.css';
import { AddCircleOutlineRounded, RemoveCircleOutlineRounded } from '@mui/icons-material';
import { useState } from 'react';

const RegistrationStep3 = ({ currentStep, handleNextStep, handlePrevStep }) => {
    const [allergies, setAllergies] = useState([]);
    const [allergy, setAllergy] = useState('');

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleAddAllergy();
        }
    };

    const handleAddAllergy = () => {
        if (allergy) {
            setAllergies((prev) => [
                ...prev,
                { allergy }
            ]);
            setAllergy('');
        }
    };

    const handleRemoveAllergy = (indexToRemove) => {
        setAllergies((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className={styles.step1}>
            <div className={styles.regTitle}>Add any food allergies</div>
            <CustomLinearProgress
                variant="determinate"
                value={(currentStep / 4) * 100}
                className={styles.progressBar}
            />
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
            <div className={styles.navButtons}>
                <div className={styles.navButton} onClick={handlePrevStep}>Back</div>
                <div className={styles.navButton} onClick={handleNextStep}>Next</div>
            </div>
        </div>
    );
};

export default RegistrationStep3;