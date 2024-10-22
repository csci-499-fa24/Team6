"use client";

import React, { useState } from 'react';
import styles from './pantry.module.css';
import { CustomTextField, CustomCircularProgress } from "../components/customComponents.js"

const NutritionInput = () => {
    const NutritionList = [
        "Protein",
        "Carbohydrates",
        "Total Fat",
        "Saturated Fat",
        "Fiber",
        "Sodium",
        "Sugar",
        "Calories",
    ];

    return (
        <div className={styles.nutritionalGoals}>
            <div className={styles.nutritionSection}>
                <div className={styles.header}>Modify your nutritional goals</div>
                <div className={styles.nutritionInputs}>
                    {NutritionList.map((nutrition) => (
                        <div key={nutrition} className={styles.nutritionalItem}>
                            <div className={styles.nutritionName}>{nutrition}</div>
                            <CustomTextField
                                type="number"
                                name={nutrition.toLowerCase().replace(" ", "_")}
                                className={styles.nutritionInput}
                                size="small"
                            />
                            <div style={{ marginLeft: '1.5em' }}>grams</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.trackerSection}>
                <div className={styles.header}>Daily nutrition tracker</div>
                <div className={styles.trackerWrapper}>
                    <div className={styles.trackerItem}>
                        <div className={styles.trackerVisual}>
                            <div className={styles.trackerItemTitle}>Calories</div>
                            <CustomCircularProgress
                                value={75}
                                progressColor="#74DE72"
                                backgroundColor="#C3F5C2"
                            />
                        </div>
                        <div className={styles.data}> 270 / 700 g <span style={{ color: '#74DE72' }}>(30%)</span></div>
                    </div>
                    <div className={styles.trackerItem}>
                        <div className={styles.trackerVisual}>
                            <div className={styles.trackerItemTitle}>Total Fat</div>
                            <CustomCircularProgress
                                value={75}
                                progressColor="#EC4A27"
                                backgroundColor="#F5AD9D"
                            />
                        </div>
                        <div className={styles.data}> 270 / 700 g <span style={{ color: '#EC4A27' }}>(30%)</span></div>
                    </div>
                    <div className={styles.trackerItem}>
                        <div className={styles.trackerVisual}>
                            <div className={styles.trackerItemTitle}>Protein</div>
                            <CustomCircularProgress
                                value={75}
                                progressColor="#72B1F1"
                                backgroundColor="#B6D9FC"
                            />
                        </div>
                        <div className={styles.data}> 270 / 700 g <span style={{ color: '#72B1F1' }}>(30%)</span></div>
                    </div>
                    <div className={styles.trackerItem}>
                        <div className={styles.trackerVisual}>
                            <div className={styles.trackerItemTitle}>Saturated Fat</div>
                            <CustomCircularProgress
                                value={75}
                                progressColor="#FF6D99"
                                backgroundColor="#F5C5CE"
                            />
                        </div>
                        <div className={styles.data}> 270 / 700 g <span style={{ color: '#FF6D99' }}>(30%)</span></div>
                    </div>
                    <div className={styles.trackerItem}>
                        <div className={styles.trackerVisual}>
                            <div className={styles.trackerItemTitle}>Carbs</div>
                            <CustomCircularProgress
                                value={75}
                                progressColor="#EBB06C"
                                backgroundColor="#FFCF96"
                            />
                        </div>
                        <div className={styles.data}> 270 / 700 g <span style={{ color: '#EBB06C' }}>(30%)</span></div>
                    </div>
                    <div className={styles.trackerItem}>
                        <div className={styles.trackerVisual}>
                            <div className={styles.trackerItemTitle}>Fiber</div>
                            <CustomCircularProgress
                                value={75}
                                progressColor="#7D975C"
                                backgroundColor="#C1CBB9"
                            />
                        </div>
                        <div className={styles.data}> 270 / 700 g <span style={{ color: '#7D975C' }}>(30%)</span></div>
                    </div>
                    <div className={styles.trackerItem}>
                        <div className={styles.trackerVisual}>
                            <div className={styles.trackerItemTitle}>Sugar</div>
                            <CustomCircularProgress
                                value={75}
                                progressColor="#8893F2"
                                backgroundColor="#C9C8FF"
                            />
                        </div>
                        <div className={styles.data}> 270 / 700 g <span style={{ color: '#8893F2' }}>(30%)</span></div>
                    </div>
                    <div className={styles.trackerItem}>
                        <div className={styles.trackerVisual}>
                            <div className={styles.trackerItemTitle}>Sodium</div>
                            <CustomCircularProgress
                                value={75}
                                progressColor="#9474A3"
                                backgroundColor="#CBA6DD"
                            />
                        </div>
                        <div className={styles.data}> 270 / 700 g <span style={{ color: '#9474A3' }}>(30%)</span></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NutritionInput;