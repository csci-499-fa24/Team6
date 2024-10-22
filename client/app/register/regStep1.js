'use client';
import * as React from 'react';
import { CustomTextField, CustomLinearProgress } from "../components/customComponents.js";
import styles from './register.module.css';
import { InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Link from "next/link";

const RegistrationStep1 = ({ currentStep, handleNextStep, formData, setFormData }) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    // Real-time password validation
    React.useEffect(() => {
        if (formData.password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
        } else {
            setErrorMessage("");  // Clear error when passwords match
        }
    }, [formData.password, confirmPassword]);

    // Validate fields and passwords before moving to the next step
    const validateForm = () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber || !formData.password || !confirmPassword) {
            setErrorMessage("All fields are required.");
            return false;
        }
        if (formData.password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return false;
        }
        return true;
    };

    const handleRegister = () => {
        if (!validateForm()) {
            return;
        }

        // Update formData with user inputs
        setFormData({
            ...formData,
        });

        // Proceed to the next step if validation passes
        handleNextStep();
    };

    return (
        <div className={styles.step1}>
            <div className={styles.regTitle}>Register for a Pantry<span className={styles.titleOrange}>Pal</span> account</div>
            <CustomLinearProgress
                variant="determinate"
                value={(currentStep / 4) * 100}
                className={styles.progressBar}
            />
            {errorMessage && <div className={styles.error}>{errorMessage}</div>}
            <div className={styles.regInput}>
                <div className={styles.regName}>
                    <CustomTextField
                        required label="First Name"
                        variant="outlined"
                        className={styles.regNameField}
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        style={{ marginTop: '7%' }}
                    />
                    <CustomTextField
                        required label="Last Name"
                        variant="outlined"
                        className={styles.regNameField}
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        style={{ marginTop: '7%' }}
                    />
                </div>
                <CustomTextField
                    required label="Email"
                    variant="outlined"
                    className={styles.regTextField}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ marginTop: '7%' }}
                />
                <CustomTextField
                    required label="Phone Number"
                    variant="outlined"
                    className={styles.regTextField}
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    style={{ marginTop: '7%' }}
                />
                <CustomTextField
                    required label="Password"
                    variant="outlined"
                    type={showPassword ? 'text' : 'password'}
                    className={styles.regTextField}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{ marginTop: '7%' }}
                    slotProps={{
                        input: {
                            endAdornment:
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
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
                    style={{ marginTop: '7%' }}
                    slotProps={{
                        input: {
                            endAdornment:
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                        },
                    }}
                />
            </div>
            <div className={styles.regButton} onClick={handleRegister}>Register</div>
            <div className={styles.regHaveAcc}>Have an account? <Link className={styles.regLogin} href="/login">Login</Link></div>
        </div>
    );
};

export default RegistrationStep1;
