'use client';
import * as React from 'react';
import { CustomTextField, CustomLinearProgress } from "../components/customComponents.js";
import styles from './register.module.css';
import { InputAdornment, IconButton, FormHelperText } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Link from "next/link";


const RegistrationStep1 = ({ currentStep, handleNextStep, formData, setFormData }) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [emailError, setEmailError] = React.useState('');
    const [phoneError, setPhoneError] = React.useState('');
    const [passwordError, setPasswordError] = React.useState('');
    const [confirmPasswordError, setConfirmPasswordError] = React.useState('');

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    // Real-time password match validation for confirm password
    React.useEffect(() => {
        if (formData.password !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match.");
        } else {
            setConfirmPasswordError("");  // Clear error when passwords match
        }
    }, [formData.password, confirmPassword]);

    // Email validation function
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Phone number formatting function
    const formatPhoneNumber = (value) => {
        if (!value) return value;

        const phoneNumber = value.replace(/[^\d]/g, "");
        const phoneNumberLength = phoneNumber.length;
        if (phoneNumberLength < 4) return phoneNumber;
        if (phoneNumberLength < 7) {
            return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        }
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    };

    // Password validation function
    const isValidPassword = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isValidLength = password.length >= 10;

        if (!isValidLength) return "Password must be at least 10 characters.";
        if (!hasUpperCase) return "Password must contain at least one uppercase letter.";
        if (!hasNumber) return "Password must contain at least one number.";
        if (!hasSpecialChar) return "Password must contain at least one special character.";

        return "";
    };

    const handleEmailChange = (e) => {
        const email = e.target.value;
        setFormData({ ...formData, email });
        if (!isValidEmail(email)) {
            setEmailError("Invalid email format.");
        } else {
            setEmailError("");
        }
    };

    const handlePhoneChange = (e) => {
        const formattedPhoneNumber = formatPhoneNumber(e.target.value);
        setFormData({ ...formData, phoneNumber: formattedPhoneNumber });
        if (formattedPhoneNumber.length < 14) {
            setPhoneError("Invalid phone number format.");
        } else {
            setPhoneError("");
        }
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setFormData({ ...formData, password });
        const validationMessage = isValidPassword(password);
        setPasswordError(validationMessage);
    };

    const handleConfirmPasswordChange = (e) => {
        const confirmPasswordValue = e.target.value;
        setConfirmPassword(confirmPasswordValue);
        setConfirmPasswordError(formData.password !== confirmPasswordValue ? "Passwords do not match." : "");
    };

    const validateForm = () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber || !formData.password || !confirmPassword) {
            setErrorMessage("All fields are required.");
            return false;
        }
        if (!isValidEmail(formData.email)) {
            setErrorMessage("Please enter a valid email address.");
            return false;
        }
        if (formData.phoneNumber.length < 14) {
            setErrorMessage("Please enter a valid phone number.");
            return false;
        }
        if (isValidPassword(formData.password)) {
            setErrorMessage(isValidPassword(formData.password));
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

        setFormData({
            ...formData,
        });

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
            <div className={styles.errorMessage}>{errorMessage ? errorMessage : ''}</div>
            <div className={styles.regInput}>
                <div className={styles.regName}>
                    <CustomTextField
                        required label="First Name"
                        variant="outlined"
                        className={styles.regNameField}
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        style={{ marginTop: '7%' }}
                        fullWidth
                    />
                    <CustomTextField
                        required label="Last Name"
                        variant="outlined"
                        className={styles.regNameField}
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        style={{ marginTop: '7%' }}
                        fullWidth
                    />
                </div>
                <CustomTextField
                    required label="Email"
                    variant="outlined"
                    className={styles.regTextField}
                    value={formData.email}
                    onChange={handleEmailChange}
                    style={{ marginTop: '7%' }}
                    fullWidth
                    error={!!emailError}
                    helperText={<span className={styles.helperText}>{emailError || ' '}</span>}
                />
                <CustomTextField
                    required label="Phone Number"
                    variant="outlined"
                    className={styles.regTextField}
                    value={formData.phoneNumber}
                    onChange={handlePhoneChange}
                    fullWidth
                    error={!!phoneError}
                    helperText={<span className={styles.helperText}>{phoneError || ""}</span>}
                />
                <CustomTextField
                    required label="Password"
                    variant="outlined"
                    type={showPassword ? 'text' : 'password'}
                    className={styles.regTextField}
                    value={formData.password}
                    onChange={handlePasswordChange}
                    fullWidth
                    error={!!passwordError}
                    helperText={<span className={styles.helperText}>{passwordError || ""}</span>}
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
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={styles.regTextField}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    fullWidth
                    error={!!confirmPasswordError}
                    helperText={<span className={styles.helperText}>{confirmPasswordError || ""}</span>}
                    slotProps={{
                        input: {
                            endAdornment:
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowConfirmPassword}
                                        onMouseDown={handleMouseDownPassword}
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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