'use client';
import { useRouter  } from 'next/navigation';
import Navbar from "../components/navbar";
import IngredientInput from './IngredientInput';
import IngredientList from './IngredientList'
import NutritionInput from "./NutritionInput";
import AllergenInput from "./AllergenInput";
import RecipeHistory from './RecipeHistory';

import React from "react";
import styles from './account.module.css';
import { useState, useEffect } from 'react';

const Pantry = () => {

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('Pantry');

  const handleSectionClick = (section) => {
    setActiveSection(section);
    router.push(`/account?section=${section.toLowerCase()}`);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        router.push('/login');
        return;
      } else {
        try {
          //updated api route
          const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/protected`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Protected data:', data);
            setAuthenticated(true);
          } else {
            router.push('/login');
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          router.push('/login');
        } finally {
          setLoading(false);
        }
      }
    };

    verifyToken();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div>
      <Navbar />
      <div className={styles.pageWrapper}>
        <div className={styles.title}>Welcome to your pantry</div>
        <div className={styles.pantryContent}>
          <div className={styles.sidebar}>
            <div
              onClick={() => handleSectionClick('Pantry')}
              className={activeSection === 'Pantry' ? styles.active : styles.notActive}
            >
              Pantry
            </div>
            <div
              onClick={() => handleSectionClick('Allergens')}
              className={activeSection === 'Allergens' ? styles.active : styles.notActive}
            >
              Allergens
            </div>
            <div
              onClick={() => handleSectionClick('Nutrition')}
              className={activeSection === 'Nutrition' ? styles.active : styles.notActive}
            >
              Nutrition
            </div>
            <div
              onClick={() => handleSectionClick('History')}
              className={activeSection === 'History' ? styles.active : styles.notActive}
            >
              Recipe History
            </div>
          </div>
          <div className={styles.seperator}></div>
          <div className={styles.pantrySection}>
            {activeSection === 'Pantry' && (
              <>
                <IngredientInput />
                <IngredientList />
              </>
            )}
            {activeSection === 'Allergens' && <AllergenInput />}
            {activeSection === 'Nutrition' && <NutritionInput />}
            {activeSection === 'History' && <RecipeHistory />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pantry;