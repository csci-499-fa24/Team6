'use client';
import * as React from 'react';
import Navbar from "../components/navbar";
import styles from './register.module.css'; 
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Link from "next/link"; 
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { useState } from 'react';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';

const CustomTextField = styled(TextField)({
  '& label': {
    color: '#8C8A8A',
    fontFamily: "Inter",
  },
  '& label.Mui-focused': {
    color: '#EC4A27',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      border: '2px solid #E0E0E0',
      borderRadius: '10px',
    },    
    '&:hover fieldset': {
      borderColor: '#C4CCCF',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#EC4A27',
    },
    '& input': {
      fontFamily: 'Inter', 
    },
  },
});

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 5,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: '#909192',
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: '#EC4A27',
  },
}));

const Register = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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

    return (
      <div>
        <Navbar/>
        <div className={styles.regPageWrapper}>
          <div className={styles.regWrapper}>
              <img src="../assets/logoTitle.png" className={styles.regImage}/>
              {currentStep === 1 && (
                <div className={styles.step1}>
                  <div className={styles.regTitle}>Register for a Pantry<span className={styles.titleOrange}>Pal</span> account</div>
                  <BorderLinearProgress 
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
                  <BorderLinearProgress 
                    variant="determinate" 
                    value={(currentStep/4) * 100} 
                    className={styles.progressBar}
                  />
                  <div className={styles.addIngredient}>
                    <div className={styles.Quantity}>
                      Quantity
                      <CustomTextField
                        type="number"
                        onChange={(event) =>
                          event.target.value < 0
                              ? (event.target.value = 0)
                              : event.target.value
                        }
                      />
                    </div>
                    <div className={styles.Quantity}>
                      Unit
                      <CustomTextField
                        type="number"
                        onChange={(event) =>
                          event.target.value < 0
                              ? (event.target.value = 0)
                              : event.target.value
                        }
                      />
                    </div>
                    <div className={styles.Quantity}>
                      Ingredients
                      <CustomTextField
                        type="number"
                        onChange={(event) =>
                          event.target.value < 0
                              ? (event.target.value = 0)
                              : event.target.value
                        }
                      />
                    </div>
                    <AddCircleOutlineRoundedIcon/>
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