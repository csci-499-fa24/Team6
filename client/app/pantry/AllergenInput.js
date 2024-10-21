"use client";

import React, { useState, useEffect } from 'react';
import styles from './pantry.module.css';
import { CustomTextField } from "../components/customComponents.js";
import { AddCircleOutlineRounded, RemoveCircleOutlineRounded } from '@mui/icons-material';

const AllergenInput = () => {
    const [allergies, setAllergies] = useState([]);
    const [allergy, setAllergy] = useState('');
    const [error, setError] = useState(null);

    // Fetch all allergens on component mount
    useEffect(() => {
        fetchAllergies();
    }, []);

    // Fetch allergens from the backend
    const fetchAllergies = async () => {
        try {
            const token = localStorage.getItem('token'); // Retrieve token from local storage
            const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/allergies', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setAllergies(data.allergies); // Update allergies state with server data
                setError(null);
            } else {
                setError('Error fetching allergies');
            }
        } catch (err) {
            setError('Error communicating with server');
        }
    };

    // Add allergy to backend
    const handleAddAllergy = async () => {
        if (allergy) {
            try {
                const token = localStorage.getItem('token'); // Retrieve token from local storage
                const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + `/api/allergies/add`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ allergy })
                });
                if (response.ok) {
                    setError(null);
                    setAllergy(''); // Clear input field
                    fetchAllergies(); // Refresh allergies after adding
                } else {
                    setError('Error adding allergen');
                }
            } catch (err) {
                setError('Error communicating with server');
            }
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleAddAllergy();
        }
    };

    // Remove allergy from backend
    const handleRemoveAllergy = async (allergyToRemove) => {
        try {
            const token = localStorage.getItem('token'); // Retrieve token from local storage
            const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + `/api/allergies/remove`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ allergy: allergyToRemove }), // Send the allergy to be removed
            });
            if (response.ok) {
                setError(null);
                fetchAllergies(); // Refresh allergies after removing
            } else {
                setError('Error removing allergen');
            }
        } catch (err) {
            setError('Error communicating with server');
        }
    };

    return (
        <div className={styles.allergiesWrapper}>
            <div className={styles.header}>Add an allergen</div>
            <div className={styles.addAllergy}>
                <div className={styles.allergyInput}>
                    <div className={styles.textfieldLabel}>Allergy</div>
                    <CustomTextField
                        value={allergy}
                        onChange={(event) => setAllergy(event.target.value)}
                        onKeyDown={handleKeyDown}
                        size="small"
                    />
                </div>
                <AddCircleOutlineRounded onClick={handleAddAllergy} className={styles.addButton} />
            </div>

            <div className={styles.allergies}>
                <div className={styles.header}>Your Food Allergies</div>
                {error && <div className={styles.error}>{error}</div>}
                {allergies && allergies.length > 0 && (
                    <div className={styles.scrollableContainer}>
                        {allergies.map((item, index) => (
                            <div key={index} className={styles.allergy}>
                                {item}
                                <RemoveCircleOutlineRounded
                                    fontSize="small"
                                    onClick={() => handleRemoveAllergy(item)}
                                    className={styles.removeButton}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllergenInput;
