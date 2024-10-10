'use client';
import * as React from 'react';
import { CustomTextField, CustomDropdown, CustomLinearProgress } from "../components/customComponents";
import styles from './register.module.css';
import { MenuItem } from '@mui/material';
import { AddCircleOutlineRounded, RemoveCircleOutlineRounded } from '@mui/icons-material';
import axios from 'axios';
import { useState, useEffect } from 'react';

// Unit options
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

const RegistrationStep2 = ({ currentStep, handleNextStep, handlePrevStep }) => {
   const [unit, setUnit] = useState('');
   const [pantry, setPantry] = useState([]); // To store added ingredients
   const [quantity, setQuantity] = useState('');
   const [temporaryIngredient, setTemporaryIngredient] = useState(''); // To store user input for ingredient
   const [ingredientsList, setIngredientsList] = useState([]); // Available ingredients from API
   const [suggestions, setSuggestions] = useState([]); // Filtered suggestions based on user input

   // Fetch ingredients from the server when component mounts
   useEffect(() => {
       const fetchIngredients = async () => {
           try {
               const response = await axios.get('http://localhost:8080/ingredients'); // Adjust API URL as needed
               console.log("Fetched Ingredients:", response.data);
               setIngredientsList(response.data); // Store the fetched ingredients
           } catch (error) {
               console.error('Error fetching ingredients:', error);
           }
       };
       fetchIngredients();
   }, []);

   // Update suggestions whenever the user types in the ingredient input
   useEffect(() => {
       if (temporaryIngredient) {
           const filteredSuggestions = ingredientsList.filter((item) =>
               item.toLowerCase().startsWith(temporaryIngredient.toLowerCase())
           );
           setSuggestions(filteredSuggestions);
       } else {
           setSuggestions([]);
       }
   }, [temporaryIngredient, ingredientsList]);

   // Add ingredient to pantry when user presses 'Enter'
   const handleKeyDown = (event) => {
       if (event.key === 'Enter') {
           handleAddIngredient();
       }
   };

   // Add ingredient to pantry (if valid)
   const handleAddIngredient = () => {
       if (quantity > 0 && unit && temporaryIngredient) {
           setPantry((prev) => [
               ...prev,
               { quantity, unit, ingredient: temporaryIngredient } // Add new ingredient to pantry
           ]);
           // Reset input fields
           setQuantity('');
           setUnit('');
           setTemporaryIngredient('');
           setSuggestions([]);
       }
   };

   // Remove an ingredient from the pantry
   const handleRemoveIngredient = (indexToRemove) => {
       setPantry((prev) => prev.filter((_, index) => index !== indexToRemove));
   };

   // Handle suggestion selection (user clicks on a suggestion)
   const handleSuggestionClick = (suggestion) => {
       setTemporaryIngredient(suggestion);
       setSuggestions([]); // Clear suggestions after selection
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
                           const value = event.target.value < 0 ? 0 : event.target.value; // Prevent negative values
                           setQuantity(value);
                       }}
                   />
               </div>
               <div className={styles.unit}>
                   Unit
                   <CustomDropdown
                       value={unit}
                       onChange={(event) => setUnit(event.target.value)} // Update selected unit
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
                       value={temporaryIngredient}
                       onChange={(event) => {
                           const value = event.target.value;
                           setTemporaryIngredient(value); // Update ingredient input
                       }}
                       onKeyDown={handleKeyDown} // Handle 'Enter' key
                   />
                   {suggestions.length > 0 && (
                       <div className={styles.suggestionList}>
                           {suggestions.map((suggestion, index) => (
                               <div
                                   key={index}
                                   className={styles.suggestionItem}
                                   onClick={() => handleSuggestionClick(suggestion)} // Handle suggestion click
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
