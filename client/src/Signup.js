import React, { useState } from 'react';
import axios from 'axios';

function Signup() {
    /*
        Fields for: Name, Email, Password, Retype Password, Bio, Phone, Tables of ingredients where you can add rows with a plus button
    */


    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        bio: '',
        phoneNumber: '',
        ingredients: [{ ingredient: '', quantity: '', units: '' }],
    });

    const [error, setError] = useState('');

    // Handle input change for fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle table input change
    const handleIngredientChange = (index, e) => {
        const { name, value } = e.target;
        const newIngredients = [...formData.ingredients];
        newIngredients[index][name] = value;
        setFormData({ ...formData, ingredients: newIngredients });
    };

    // Add a new row to the table
    const addRow = () => {
        setFormData({
            ...formData,
            ingredients: [...formData.ingredients, { ingredient: '', quantity: '', units: '' }],
        });
    };

    const deleteRow= () => {
        if (formData.ingredients.length > 1) {
            const newIngredients = [...formData.ingredients];
            newIngredients.pop();  // Remove the last row
            setFormData({ ...formData, ingredients: newIngredients });
        }
    }

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        // Clear the error if everything is fine
        setError('');

        // Send formData to the backend
        axios.post('http://localhost:8080/api/signup', formData)
            .then(response => {
                console.log('Signup successful:', response.data);
                // Handle successful signup
            })
            .catch(error => {
                console.error('There was an error signing up:', error);
                // Handle error
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Sign Up</h2>

            <div>
                <label>Name:</label>
                <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    required 
                />
            </div>

            <div>
                <label>Email:</label>
                <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    required 
                />
            </div>

            <div>
                <label>Password:</label>
                <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    required 
                />
            </div>

            <div>
                <label>Retype Password:</label>
                <input 
                    type="password" 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleInputChange} 
                    required 
                />
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div>
                <label>Bio:</label>
                <textarea 
                    name="bio" 
                    value={formData.bio} 
                    onChange={handleInputChange} 
                />
            </div>

            <div>
                <label>Phone Number:</label>
                <input 
                    type="tel" 
                    name="phoneNumber" 
                    value={formData.phoneNumber} 
                    onChange={handleInputChange} 
                />
            </div>

            <h3>Ingredients</h3>
            {formData.ingredients.map((ingredientRow, index) => (
                <div key={index}>
                    <label>Ingredient:</label>
                    <input 
                        type="text" 
                        name="ingredient" 
                        value={ingredientRow.ingredient} 
                        onChange={(e) => handleIngredientChange(index, e)} 
                    />
                    <label>Quantity:</label>
                    <input 
                        type="text" 
                        name="quantity" 
                        value={ingredientRow.quantity} 
                        onChange={(e) => handleIngredientChange(index, e)} 
                    />
                    <label>Units:</label>
                    <input 
                        type="text" 
                        name="units" 
                        value={ingredientRow.units} 
                        onChange={(e) => handleIngredientChange(index, e)} 
                    />
                </div>
            ))}
            <button type="button" onClick={addRow}>Add Row</button>
            <button type="button" onClick={deleteRow}>Delete Row</button>

            <div>
                <button type="submit">Submit</button>
            </div>
        </form>
    );
}

export default Signup;
