'use client';
import * as React from 'react';
import Navbar from "../components/navbar";
import { CustomTextField, CustomDropdown, CustomLinearProgress } from "../components/customComponents"
import styles from './register.module.css'; 
import { styled, TextField, InputAdornment, IconButton, LinearProgress, linearProgressClasses, Select, MenuItem } from '@mui/material';
import { Visibility, VisibilityOff, AddCircleOutlineRounded } from '@mui/icons-material';
import Link from "next/link"; 
import { useState } from 'react';

const Units = [
  {value: "g", label: "Gram(s)"},  
  {value: "oz", label: "Ounce(s)"},
  {value: "lb", label: "Pound(s)"},  
  {value: "C", label: "Cup(s)"},
  {value: "pt", label: "Pint(s)"},
  {value: "qt", label: "Quart(s)"},
  {value: "gal", label: "Gallon(s)"},
  {value: "mL", label: "Milliliter(s)"},
  {value: "L", label: "Liter(s)"},
  {value: "tsp", label: "Teaspoon(s)"},
  {value: "tbsp", label: "Tablespoon(s)"},
]

const Register = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [unit, setUnit] = React.useState('');
  const [pantry, setPantry] = useState([]);
  const [quantity, setQuantity] = useState(0);
  const [ingredient, setIngredient] = useState('');

  const handleUnitSelection = (event) => {
    setUnit(event.target.value);
  };

  const handleNextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };

  const handleAddIngredient = () => {
    if (quantity > 0 && unit && ingredient) {
      setPantry((prev) => [
        ...prev, 
        { quantity, unit, ingredient }
      ]);
      setQuantity(0);
      setUnit('');
      setIngredient('');
    }
  };

    return (
      <div>
        <Navbar/>
        <div className={styles.regPageWrapper}>
          <div className={styles.regWrapper}>
              <img src="../assets/logoTitle.png" className={styles.regImage}/>
              {currentStep === 1 && (
                <div className={styles.step1}>
                  <div className={styles.regTitle}>Register for a Pantry<span className={styles.titleOrange}>Pal</span> account</div>
                  <CustomLinearProgress 
                    variant="determinate" 
                    value={(currentStep/4) * 100} 
                    className={styles.progressBar}
                  />
                  <div className={styles.regInput}>
                    <div className={styles.regName}>
                      <CustomTextField 
                        required label="First Name" 
                        variant="outlined" 
                        className={styles.regNameField} 
                      />
                      <CustomTextField 
                        required label="Last Name" 
                        variant="outlined" 
                        className={styles.regNameField} 
                      />
                    </div>
                    <CustomTextField 
                      required label="Email" 
                      variant="outlined" 
                      className={styles.regTextField} 
                    />
                    <CustomTextField 
                      required label="Phone Number" 
                      variant="outlined" 
                      className={styles.regTextField} 
                    />
                    <CustomTextField 
                      required label="Password" 
                      variant="outlined" 
                      type={showPassword ? 'text' : 'password'}
                      className={styles.regTextField} 
                      slotProps={{
                        input: {
                          endAdornment:   
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                onMouseUp={handleMouseUpPassword}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          },
                      }}
                    />
                    <CustomTextField 
                      required label="Re-enter Password" 
                      variant="outlined" 
                      type={showPassword ? 'text' : 'password'}
                      className={styles.regTextField} 
                      slotProps={{
                        input: {
                          endAdornment:   
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                onMouseUp={handleMouseUpPassword}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          },
                      }}
                    />
                  </div>
                  <div className={styles.regButton} onClick={handleNextStep}>Register</div>
                  <div className={styles.regHaveAcc}>Have an account? <Link className={styles.regLogin} href="/login">Login</Link></div>
                </div>
              )}
              {currentStep === 2 && (
                <div className={styles.step1}>
                  <div className={styles.regTitle}>Add any ingredients that you own</div>
                  <CustomLinearProgress 
                    variant="determinate" 
                    value={(currentStep/4) * 100} 
                    className={styles.progressBar}
                  />
                  <div className={styles.addIngredient}>
                    <div className={styles.quantity}>
                      Quantity
                      <CustomTextField
                        type="number"
                        onChange={(event) => {
                          const value = event.target.value < 0 ? 0 : event.target.value;
                          setQuantity(value);
                        }}
                      />
                    </div>
                    <div className={styles.unit}>
                      Unit
                      <CustomDropdown
                        value={unit}
                        onChange={handleUnitSelection}
                      >
                        {Units.map((unit) => (
                          <MenuItem 
                            key={unit.value} 
                            value={unit.value}
                            sx={{'&.MuiMenuItem-root': { fontFamily: 'Inter'}}}
                          >
                            {unit.label}
                          </MenuItem>
                        ))}
                      </CustomDropdown>
                    </div>
                    <div className={styles.ingredient}>
                      Ingredients
                      <CustomTextField
                        onChange={(event) => setIngredient(event.target.value)}
                      />
                    </div>
                    <AddCircleOutlineRounded onClick={handleAddIngredient}/>
                  </div>
                  <div className={styles.ingredientList}>
                  {pantry.length > 0 && (
                    <ul>
                      {pantry.map((item, index) => (
                        <li key={index}>
                          {item.quantity} {item.unit} of {item.ingredient}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                  <div className={styles.regButton} onClick={handleNextStep}>Register</div>
                  <div className={styles.regHaveAcc}>Have an account? <Link className={styles.regLogin} href="/login">Login</Link></div>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  };
  
  export default Register;