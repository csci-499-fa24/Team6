"use client";

import { useState, useEffect } from 'react';
import styles from './2FA.module.css';

const TwoFactorAuth = () => {
    const [code, setCode] = useState(new Array(6).fill(''));
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(20); // 20-second timer for resend
    const [resendDisabled, setResendDisabled] = useState(true);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setResendDisabled(false);
        }
    }, [resendTimer]);

    const handleChange = (e, index) => {
        const value = e.target.value.toUpperCase();
        if (/^[A-Z0-9]$/.test(value) || value === '') {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);

            // Focus on the next input if filled
            if (value !== '' && index < 5) {
                document.getElementById(`code-input-${index + 1}`).focus();
            }
        }
    };

    const handleSubmit = async () => {
        // Combine the 6-digit code entered by the user
        const enteredCode = code.join('');
    
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/verify-2fa-code`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: enteredCode })
            });
    
            if (response.ok) {
                window.location.href = "/discover"; // Redirect to the account page
            } else {
                const data = await response.json();
                setError(data.message || 'Incorrect code. Please try again.');
                console.log('2FA verification failed:', data.message);
            }
        } catch (error) {
            console.error('An error occurred during 2FA verification:', error);
            setError('An error occurred. Please try again.');
        }
    };    

    const handleResend = async () => {
        setResendDisabled(true);
        setResendTimer(20); // Reset the timer

        try {
            const token = localStorage.getItem('token');
            await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/send-2fa-code`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error resending 2FA code:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Easy peasy</h2>
            <p className={styles.instructions}>Enter the 6-digit code sent to your email.</p>

            <div className={styles.codeContainer}>
                {code.map((digit, index) => (
                    <input
                        key={index}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(e, index)}
                        id={`code-input-${index}`}
                        className={styles.codeInput}
                    />
                ))}
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button onClick={handleSubmit} className={styles.submitButton}>
                Submit
            </button>

            <button
                onClick={handleResend}
                className={styles.resendButton}
                disabled={resendDisabled}
            >
                Resend Code {resendDisabled && `(${resendTimer}s)`}
            </button>
        </div>
    );
};

export default TwoFactorAuth;
