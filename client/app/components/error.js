"use client";
import React, { } from "react";
import styles from './error.module.css';

const ErrorScreen = ({ error = "" }) => {
    return (
        <div className={styles.errorWrapper}>
            <img src="/assets/error.png" alt="Error" className={styles.errorImage} />
            <div>{error}</div>
        </div>
    );
};

export default ErrorScreen;
