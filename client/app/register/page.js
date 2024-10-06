"use client";
import Navbar from "../components/navbar";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // for redirecting

const Register = () => {
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
  const [isModalVisible, setIsModalVisible] = useState(false); // To control modal visibility
  const router = useRouter(); // To redirect

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleIngredientChange = (index, e) => {
    const { name, value } = e.target;
    const newIngredients = [...formData.ingredients];
    newIngredients[index][name] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addRow = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { ingredient: '', quantity: '', units: '' }],
    });
  };

  const deleteRow = () => {
    if (formData.ingredients.length > 1) {
      const newIngredients = [...formData.ingredients];
      newIngredients.pop(); // Remove the last row
      setFormData({ ...formData, ingredients: newIngredients });
    }
  };

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
    axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/signup`, formData)
      .then(response => {
        // Signup successful, show the popup
        setIsModalVisible(true); // Show the success modal
      })
      .catch(error => {
        if (error.response) {
          console.error('Server error:', error.response.data);
        } else if (error.request) {
          console.error('Network error or no response:', error.request);
        } else {
          console.error('Error during signup:', error.message);
        }
      });
  };

  const redirectToHome = () => {
    router.push('/home'); // Redirect to the homepage
  };

  return (
    <div>
      <Navbar />
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <h2>Sign Up</h2>

        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
        </div>

        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
        </div>

        <div>
          <label>Password:</label>
          <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
        </div>

        <div>
          <label>Retype Password:</label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div>
          <label>Bio:</label>
          <textarea name="bio" value={formData.bio} onChange={handleInputChange} />
        </div>

        <div>
          <label>Phone Number:</label>
          <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
        </div>

        <h3>Ingredients</h3>
        {formData.ingredients.map((ingredientRow, index) => (
          <div key={index}>
            <label>Ingredient:</label>
            <input type="text" name="ingredient" value={ingredientRow.ingredient} onChange={(e) => handleIngredientChange(index, e)} />
            <label>Quantity:</label>
            <input type="text" name="quantity" value={ingredientRow.quantity} onChange={(e) => handleIngredientChange(index, e)} />
            <label>Units:</label>
            <input type="text" name="units" value={ingredientRow.units} onChange={(e) => handleIngredientChange(index, e)} />
          </div>
        ))}
        <button type="button" onClick={addRow}>Add Row</button>
        <button type="button" onClick={deleteRow}>Delete Row</button>

        <div>
          <button type="submit">Submit</button>
        </div>
      </form>

      {/* Modal Popup */}
      {isModalVisible && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <h2>Signup Successful!</h2>
            <p>You have successfully signed up.</p>
            <button onClick={redirectToHome}>Go to Home Page</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Styling for the popup modal
const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const modalContentStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '10px',
  textAlign: 'center',
};

export default Register;
