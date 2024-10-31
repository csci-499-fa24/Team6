// EditableField.js
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
    });

    const validatePassword = (password) => {
        setValidationStatus({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    };

    const handleSave = () => {
        if (isPassword && newValue !== confirmValue) {
            alert('Passwords do not match');
            return;
        }
        if (label === "Phone Number" && !/^\d{3}-\d{3}-\d{4}$/.test(newValue)) {
            alert('Invalid phone number format. Use XXX-XXX-XXXX');
            return;
        }
        onSave(newValue);
        setIsEditing(false);
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
                                        {validationStatus.specialChar ? '✓' : '✗'} At least one special character
                                    </li>
                                </ul>
                            </>
                        )}
                        <button onClick={handleSave} className={styles.bubbleButton}>Save</button>
                    </div>
                ) : (
                    <div className={styles.displayContainer}>
                        <span className={styles.exampleText}>{value}</span>
                        <button onClick={() => setIsEditing(true)} className={styles.bubbleButton}>Edit</button>
                    </div>
                )}
            </div>
            {separator && <div className={styles.separator}></div>}
        </>
    );
};

export default EditableField;
