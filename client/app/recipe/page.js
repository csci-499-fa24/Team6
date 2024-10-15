"use client";

import React from 'react';
import RecipePage from './recipe'; // Import the RecipePage component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from "../components/navbar";

const Page = () => {

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');  

        const verifyToken = async () => {
            if (!token) {
                router.push('/login');
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
            <RecipePage /> {/* Render the RecipePage component */}
        </div>
    );
};

export default Page;
