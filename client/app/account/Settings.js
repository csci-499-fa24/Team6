'use client';
import { useState, useEffect } from 'react';
import styles from './Settings.module.css';
import EditableField from './EditableField';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('Account Info');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('********'); // This can remain a placeholder
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        // Fetch user profile information on component load
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/profile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setEmail(data.email); // Set the actual email from the backend
                    setPhoneNumber(data.phone); // Set the actual phone number from the backend
                } else {
                    console.error('Failed to fetch user data');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Account Info':
                return (
                    <div className={styles.accountInfo}>
                        <EditableField
                            label="Email"
                            value={email}
                            onSave={setEmail}
                            separator
                        />
                        <EditableField
                            label="Password"
                            value={password}
                            onSave={setPassword}
                            isPassword
                            separator
                        />
                        <EditableField
                            label="Phone Number"
                            value={phoneNumber}
                            onSave={setPhoneNumber}
                        />
                    </div>
                );
            case 'Privacy & Security':
                return (
                    <div className={styles.tabContent}>
                        <div className={styles.privacyRow}>
                            <label className={styles.label}>Two-Factor Authentication</label>
                            <input type="checkbox" className={styles.checkbox} />
                        </div>
                    </div>
                );
            case 'Notifications':
                return (
                    <div className={styles.tabContent}>
                        <div className={styles.notificationRow}>
                            <label className={styles.label}>Email Notifications</label>
                            <input type="checkbox" className={styles.checkbox} />
                        </div>
                        <div className={styles.notificationRow}>
                            <label className={styles.label}>SMS Notifications</label>
                            <input type="checkbox" className={styles.checkbox} />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.settingsWrapper}>
            <div className={styles.settingsCard}>
                <div className={styles.profilePicture}>
                    <img src="/assets/profile-image.png" alt="Profile" />
                </div>
                
                <h2 className={styles.heading}>Account Settings</h2>

                {/* Tabs for Different Sections */}
                <div className={styles.tabs}>
                    {['Account Info', 'Privacy & Security', 'Notifications'].map(tab => (
                        <button
                            key={tab}
                            className={`${styles.tabButton} ${activeTab === tab ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {renderTabContent()}

                {/* Save All Changes Button */}
                {activeTab === 'Account Info' && (
                    <button className={styles.saveButton}>Save All Changes</button>
                )}
            </div>
        </div>
    );
};

export default Settings;