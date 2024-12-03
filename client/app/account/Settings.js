'use client';
import { useState, useEffect } from 'react';
import styles from './Settings.module.css';
import EditableField from './EditableField';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('Account Info');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('********'); // This can remain a placeholder
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isEmailSubscribed, setIsEmailSubscribed] = useState(false); 
    const [isSmsSubscribed, setIsSmsSubscribed] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [showNotification, setShowNotification] = useState(false);


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
                    setIsEmailSubscribed(data.is_email_subscribed);
                    setIsSmsSubscribed(data.is_sms_subscribed);
                    setIs2FAEnabled(data.is_2fa_enabled);
                } else {
                    console.error('Failed to fetch user data');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    //Function to handle updating email subscription
    const handleEmailSubscriptionChange = async () => {
        const newSubscriptionStatus = !isEmailSubscribed;
        setIsEmailSubscribed(newSubscriptionStatus);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/update-email-subscription`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_email_subscribed: newSubscriptionStatus })
            });

            if (response.ok) {
                // Show confirmation message if unsubscribed
                setNotificationMessage(
                    newSubscriptionStatus
                        ? 'You have subscribed to email notifications.'
                        : 'You have unsubscribed from email notifications.'
                );
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 4500); // Hide after 4.5 seconds
            } else {
                console.error('Failed to update email subscription');
                setIsEmailSubscribed(!newSubscriptionStatus);
            }
        } catch (error) {
            console.error('Error updating email subscription:', error);
            // Revert the checkbox state if there is an error
            setIsEmailSubscribed(!newSubscriptionStatus);
        }
    };

    const handle2FAChange = async () => {
        const new2FAStatus = !is2FAEnabled;
        setIs2FAEnabled(new2FAStatus);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/update-2fa`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_2fa_enabled: new2FAStatus })
            });

            if (response.ok) {
                setNotificationMessage(new2FAStatus ? 'Two-Factor Authentication enabled.' : 'Two-Factor Authentication disabled.');
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 4500); // Hide after 4.5 seconds
            } else {
                console.error('Failed to update 2FA status');
                setIs2FAEnabled(!new2FAStatus); // Revert state on failure
            }
        } catch (error) {
            console.error('Error updating 2FA status:', error);
            setIs2FAEnabled(!new2FAStatus);
        }
    };

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
                            <input
                                type="checkbox"
                                className={styles.checkbox}
                                checked={is2FAEnabled}
                                onChange={handle2FAChange}
                            />
                        </div>
                    </div>
                );
            case 'Notifications':
                return (
                    <div className={styles.tabContent}>
                        <div className={styles.notificationRow}>
                            <label className={styles.label}>Email Notifications</label>
                            <input
                                type="checkbox"
                                className={styles.checkbox}
                                checked={isEmailSubscribed}
                                onChange={handleEmailSubscriptionChange} // Updated to use new function
                            />
                        </div>
                        <div className={styles.notificationRow}>
                            <label className={styles.label}>SMS Notifications</label>
                            <input
                                type="checkbox"
                                className={styles.checkbox}
                                checked={isSmsSubscribed}
                                onChange={() => setIsSmsSubscribed(!isSmsSubscribed)}
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.settingsWrapper}>
            <div className={styles.settingsCard} style={{ position: 'relative' }}> {/* Make settingsCard relative to position the notification */}
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
    
                {/* Notification Message */}
                {showNotification && (
                    <div className={`${styles.notificationPopup} ${!showNotification ? styles.fadeOut : ''}`}>
                        <span className={styles.notificationIcon}>ⓘ</span> {/* Updated icon to "info" style */}
                        <span>{notificationMessage}</span>
                    </div>
                )}
            </div>
        </div>
    );        
};

export default Settings;