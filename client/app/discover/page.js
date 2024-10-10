'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from "../components/navbar";

const Discover = () => {
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
                    const response = await fetch('http://localhost:8080/api/protected', {
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
            <h1>Discover</h1>
            <h1>You are an authenticated user</h1>
        </div>
    );
};

export default Discover;
