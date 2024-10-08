import Navbar from "../components/navbar";
import IngredientInput from './IngredientInput';
import IngredientList from './IngredientList'
import React from "react";

const Pantry = () => {
    return (
      <div>
        <Navbar/>
        <h1>Pantry</h1>
        <IngredientInput />
        <IngredientList />
      </div>
    );
  };
  
  export default Pantry;