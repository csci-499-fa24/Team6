'use client';
import * as React from 'react';
import { CustomTextField, CustomLinearProgress } from "../components/customComponents"
import styles from './register.module.css'; 
import { InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Link from "next/link"; 

const RegistrationStep1 = ({ currentStep, handleNextStep, formData, setFormData, email, setEmail, password, setPassword }) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
      event.preventDefault();
    };
  
    const handleMouseUpPassword = (event) => {
      event.preventDefault();
    };

    const handleRegister = () => {
        // Validate password match
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        // Update formData with user inputs
        setFormData({
            ...formData,
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
        });

        // Proceed to the next step if validation passes
        handleNextStep();
    }

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
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <CustomTextField
                        required label="Last Name"
                        variant="outlined"
                        className={styles.regNameField}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
                <CustomTextField
                    required label="Email"
                    variant="outlined"
                    className={styles.regTextField}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <CustomTextField
                    required label="Phone Number"
                    variant="outlined"
                    className={styles.regTextField}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <CustomTextField
                    required label="Password"
                    variant="outlined"
                    type={showPassword ? 'text' : 'password'}
                    className={styles.regTextField}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
            {errorMessage && <div className={styles.error}>{errorMessage}</div>}
            <div className={styles.regButton} onClick={handleRegister}>Register</div>
            <div className={styles.regHaveAcc}>Have an account? <Link className={styles.regLogin} href="/login">Login</Link></div>
        </div>
    );
};

export default RegistrationStep1;
