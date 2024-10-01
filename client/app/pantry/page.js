import Navbar from "../components/navbar";
import IngredientInput from './IngredientInput';
import React from "react";

const Pantry = () => {
    return (
      <div>
        <Navbar/>
        <h1>Pantry</h1>
        <IngredientInput />
      </div>
    );
  };
  
  export default Pantry;