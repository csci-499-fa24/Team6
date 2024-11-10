import React, { useEffect, useState } from "react";
import styles from "./ingredientPopUp.module.css";

const IngredientPopUp = ({ isVisible, onClose, recipe}) => {
    if (!isVisible) return null;
    const [isLoading, setIsLoading] = useState(false);
    const [userIngredients, setUserIngredients] = useState([])

    const fetchUserIngredients = async () => {
        try {
            const token = localStorage.getItem('token'); // Retrieve the token
            const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/user-ingredients', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}` // Pass the token in the Authorization header
                }
            });
            if (!response.ok) {
                console.log(response);
                throw new Error('Failed to fetch ingredients');
            }
            const data = await response.json();
            console.log(data);
            setUserIngredients(data);
        } catch (error) {
            console.error('Error fetching user ingredients:', error);
        }
    };

    const getIngredientsLeft = (ingredientUsed) => {
        for (let i = 0; i < userIngredients.length; i++) {
            const ingredient = userIngredients[i];
            if (ingredientUsed.name === ingredient.name) {
                console.log(ingredient.amount - ingredientUsed.amount);
                if (ingredient.amount - ingredientUsed.amount < 0){
                    return `0 ${ingredient.unit}`
                }
                return `${ingredient.amount - ingredientUsed.amount} ${ingredient.unit}`;
            }
        }
        return `0 ${ingredientUsed.unit}`;
    };
    

    console.log(recipe);

    useEffect(() => {
        fetchUserIngredients();
    }, []);

    const handleAdd = async() => {
        console.log("called");
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        setIsLoading(true);

        try {
            await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/plan/add-recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ recipeId: recipe.id })
            });

            await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/discover/auto-remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ ingredients: recipe.usedIngredients })
            });

            onClose();
        } catch (error) {
            console.error('Error adding recipe:', error);
        }finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>Confirm Ingredients</h3>
                </div>
                <div className={styles.modalBody}>
                    <table className={styles.ingredientTable}>
                        <thead>
                            <tr>
                                <th>Ingredient Name</th>
                                <th>Ingredients Used</th>
                                <th>Ingredients Left</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recipe.usedIngredients.map((ingredient, index) => (
                                <tr key={index}>
                                    <td>{ingredient.name}</td>
                                    <td>{ingredient.amount} {ingredient.unit}</td>
                                    <td>{getIngredientsLeft(ingredient)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className={styles.modalFooter}>
                    <button className={styles.secondaryButton} onClick={onClose}>Close</button>
                    <button className={styles.primaryButton} onClick={handleAdd} disabled={isLoading}>
                        {isLoading ? 'Loading...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IngredientPopUp;