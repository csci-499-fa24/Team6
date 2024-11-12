"use client";
import React, { } from "react";
import styles from './loading.module.css';

const LoadingScreen = ({ title = "" }) => {
    return (
        <div className={styles.loadingWrapper}>
            <img src="/assets/loading1.gif" alt="Loading" className={styles.loadingAnimation} />
            <div>Loading {title}...</div>
        </div>
    );
};

export default LoadingScreen;
