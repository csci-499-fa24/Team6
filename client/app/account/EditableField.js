import { useState } from 'react';
import styles from './Settings.module.css';

const EditableField = ({ label, value, onSave, isPassword = false, separator = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newValue, setNewValue] = useState(value);
    const [confirmValue, setConfirmValue] = useState('');
    const [validationStatus, setValidationStatus] = useState({
        length: false,
        uppercase: false,
        specialChar: false,
        number: false,
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleCancel = () => {
        setNewValue(value); 
        setIsEditing(false);
        setErrorMessage(''); 
    };

    const validatePassword = (password) => {
        const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;
        const numberPattern = /[0-9]/;

        setValidationStatus({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            specialChar: specialCharPattern.test(password),
            number: numberPattern.test(password),
        });
    };

    const formatPhoneNumber = (phone) => {
        const cleaned = phone.replace(/\D/g, ''); // Remove non-numeric characters
        if (cleaned.length === 10) {
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return null; // Invalid if not exactly 10 digits
    };

    const handleSave = async () => {
        setErrorMessage(''); // Clear any previous error messages

        if (isPassword) {
            if (newValue !== confirmValue) {
                setErrorMessage('Passwords do not match');
                return;
            }

            validatePassword(newValue);

            if (!Object.values(validationStatus).every((status) => status)) {
                setErrorMessage('Password does not meet all requirements.');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/update-password`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ password: newValue })
                });

                const responseData = await response.json();

                if (!response.ok) {
                    setErrorMessage(responseData.message || 'Failed to update password');
                    return;
                }

                setSuccessMessage('Saved Successfully ✓');
                onSave('********'); // Reset display to asterisks
                setIsEditing(false);

                setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after a delay
            } catch (error) {
                console.error('Error updating password:', error);
                setErrorMessage('An error occurred while updating password');
            }
        } else if (label === "Phone Number") {
            const formattedPhone = formatPhoneNumber(newValue);
            if (!formattedPhone) {
                setErrorMessage('Invalid phone number. Please enter a 10-digit number.');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/update-phone`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ phone: formattedPhone })
                });

                const responseData = await response.json();

                if (!response.ok) {
                    setErrorMessage(responseData.message || 'Failed to update phone number');
                    return;
                }

                setSuccessMessage('Saved Successfully ✓');
                onSave(formattedPhone); // Display formatted phone number
                setIsEditing(false);

                setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after a delay
            } catch (error) {
                console.error('Error updating phone number:', error);
                setErrorMessage('An error occurred while updating phone number');
            }
        } else {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/update-email`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ email: newValue })
                });

                const responseData = await response.json();

                if (!response.ok) {
                    setErrorMessage(responseData.message || 'Failed to update email');
                    return;
                }

                setSuccessMessage('Saved Successfully ✓');
                onSave(newValue);
                setIsEditing(false);

                setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after a delay
            } catch (error) {
                console.error('Error updating email:', error);
                setErrorMessage('An error occurred while updating email');
            }
        }
    };

    return (
        <>
            <div className={styles.editableField}>
                <label className={styles.label}>{label}</label>
                {isEditing ? (
                    <div className={styles.editContainer}>
                        <input
                            type={isPassword ? 'password' : 'text'}
                            value={newValue}
                            onChange={(e) => {
                                setNewValue(e.target.value);
                                if (isPassword) validatePassword(e.target.value);
                            }}
                            className={styles.input}
                            placeholder={label}
                        />
                        {isPassword && (
                            <>
                                <input
                                    type="password"
                                    value={confirmValue}
                                    onChange={(e) => setConfirmValue(e.target.value)}
                                    className={styles.input}
                                    placeholder="Confirm Password"
                                />
                                <ul className={styles.passwordRules}>
                                    <li style={{ color: validationStatus.length ? 'green' : 'red' }}>
                                        {validationStatus.length ? '✓' : '✗'} At least 8 characters
                                    </li>
                                    <li style={{ color: validationStatus.uppercase ? 'green' : 'red' }}>
                                        {validationStatus.uppercase ? '✓' : '✗'} At least one uppercase letter
                                    </li>
                                    <li style={{ color: validationStatus.specialChar ? 'green' : 'red' }}>
                                        {validationStatus.specialChar ? '✓' : '✗'} At least one special character (e.g., !@#$%^&)
                                    </li>
                                    <li style={{ color: validationStatus.number ? 'green' : 'red' }}>
                                        {validationStatus.number ? '✓' : '✗'} At least one number
                                    </li>
                                </ul>
                            </>
                        )}
                        <div className={styles.buttonContainer}>
                            <button onClick={handleSave} className={styles.bubbleButton}>Save</button>
                            <button onClick={handleCancel} className={styles.cancelButton}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.displayContainer}>
                        <span className={styles.exampleText}>{value}</span>
                        {successMessage ? (
                            <span className={styles.successMessage}>{successMessage}</span>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className={styles.bubbleButton}>Edit</button>
                        )}
                    </div>
                )}
                {errorMessage && (
                    <div className={styles.errorMessage}>
                        <span className={styles.icon}>⚠️</span> {errorMessage}
                    </div>
                )}
            </div>
            {separator && <div className={styles.separator}></div>}
        </>
    );
};

export default EditableField;
