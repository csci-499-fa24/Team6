"use client";


import React, { useState, useEffect } from 'react';
import styles from './favoriteinfo.module.css';


const FavoriteInfo = ({ recipe, userId, onClose }) => {
   const [userIngredients, setUserIngredients] = useState([]);
   useEffect(() => {
       const fetchUserIngredients = async () => {
           try {
               const token = localStorage.getItem('token');
               const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/user-ingredients', {
                   method: 'POST',
                   headers: {
                       'Content-Type': 'application/json',
                       Authorization: `Bearer ${token}`
                   }
               });


               const data = await response.json();
               setUserIngredients(data);
           } catch (error) {
               console.error("Error fetching user ingredients:", error);
           }
       };


       fetchUserIngredients();
   }, [recipe, userId]);


   const handleUseRecipe = async () => {
       console.log("Using recipe...");
       try {
           const token = localStorage.getItem('token');
           console.log(recipe);
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
               body: JSON.stringify({ ingredients: recipe.extendedIngredients })
           });


       } catch (error) {
           console.error('Error adding recipe:', error);
       }
   };


   const isIngredientInUserIngredients = (ingredient) => {
       if (!userIngredients || userIngredients.length === 0 || !ingredient?.name) return false;


       const userIngredient = userIngredients.find(
           userIng => userIng?.name.toLowerCase() === ingredient.name.toLowerCase()
       );


       if (!userIngredient) return false;


       const userAmount = parseFloat(userIngredient.amount);
       const recipeAmount = parseFloat(ingredient.amount);


       console.log(`Comparing ${ingredient.name}: user has ${userAmount}, recipe needs ${recipeAmount}`);


       return userAmount >= recipeAmount;
   };


   if (!recipe) return null;


   return (
       <div className={styles.overlay}>
           <div className={styles.popup}>
               <button className={styles.closeButton} onClick={onClose}>
                   &times;
               </button>
               <h2>{recipe.title}</h2>


               <img src={recipe.image} alt={recipe.title} className={styles.recipeImage} />


               <div className={styles.dietaryLabels}>
                   <p><strong>Dietary Labels:</strong> {recipe.diets.join(', ') || 'N/A'}</p>
               </div>


               <div>
                   <strong>Ingredients:</strong>
                   <ul>
                       {recipe.extendedIngredients?.map((ingredient) => (
                           <li
                               key={ingredient.id}
                               style={{
                                   color: isIngredientInUserIngredients(ingredient) ? 'black' : 'red'
                               }}
                               >
                               {`${ingredient.amount} ${ingredient.unit} ${ingredient.name}`}
                           </li>
                       ))}
                   </ul>
               </div>


               <p><strong>Cooking Time:</strong> {recipe.readyInMinutes} minutes</p>


               <div className={styles.instructions}>
                   <strong>Instructions:</strong>
                   <ol>
                       {recipe.instructions
                           ? recipe.instructions.split('. ').map((step, index) => (
                                 <li key={index}>{step.trim()}.</li>
                             ))
                           : 'No instructions available.'}
                   </ol>
               </div>


               <div className={styles.buttonContainer}>
                   <button className={styles.useRecipeButton} onClick={handleUseRecipe}>
                       Use Recipe
                   </button>
               </div>
           </div>
       </div>
   );
};


export default FavoriteInfo;
