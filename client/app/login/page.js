'use client';
import * as React from 'react';
import { useState } from 'react';
import Navbar from "../components/navbar";
import { CustomTextField } from "../components/customComponents"
import styles from './login.module.css'; 
import Link from "next/link"; 
import { IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };

  //Login
  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = "/discover"; 
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

    return (
      <div>
        <Navbar/>
        <div className={styles.loginPageWrapper}>
          <div className={styles.loginWrapper}>
            <img src="../assets/logoTitle.png" className={styles.loginImage}/>
            <div className={styles.loginTitle}>Login to your Pantry<span className={styles.titleOrange}>Pal</span> account</div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <CustomTextField 
              required label="Email" 
              variant="outlined" 
              className={styles.loginEmail} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <CustomTextField 
              required label="Password" 
              variant="outlined" 
              type={showPassword ? 'text' : 'password'}
              className={styles.loginPassword}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                input: {
                  endAdornment:   
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        onMouseUp={handleMouseUpPassword}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                 },
              }}
            />
            <div className={styles.loginButton} onClick={handleLogin}>Log in</div>
            <div className={styles.loginNoAcc}>Not registered? <Link className={styles.loginRegister} href="/register">Create an account</Link></div>
          </div>
        </div>
      </div>
    );
  };
  
  export default Login;