'use client';
import * as React from 'react';
import { CustomTextField, CustomLinearProgress } from "../components/customComponents"
import styles from './register.module.css'; 
import { InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Link from "next/link"; 

const RegistrationStep1 = ({ currentStep, handleNextStep }) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
      event.preventDefault();
    };
  
    const handleMouseUpPassword = (event) => {
      event.preventDefault();
    };

    return (
        <div className={styles.step1}>
            <div className={styles.regTitle}>Register for a Pantry<span className={styles.titleOrange}>Pal</span> account</div>
            <CustomLinearProgress
                variant="determinate"
                value={(currentStep / 4) * 100}
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
    );
};

export default RegistrationStep1;