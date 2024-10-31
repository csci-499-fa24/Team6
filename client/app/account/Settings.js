// Settings.js
'use client';
import { useState } from 'react';
import styles from './Settings.module.css';
import EditableField from './EditableField';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('Account Info');
    const [email, setEmail] = useState('user@example.com');
    const [password, setPassword] = useState('********');
    const [phoneNumber, setPhoneNumber] = useState('123-456-7890');

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
