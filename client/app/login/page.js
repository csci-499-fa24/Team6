'use client';
import * as React from 'react';
import Navbar from "../components/navbar";
import { CustomTextField } from "../components/customComponents"
import styles from './login.module.css'; 
import Link from "next/link"; 
import { IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };

    return (
      <div>
        <Navbar/>
        <div className={styles.loginPageWrapper}>
          <div className={styles.loginWrapper}>
            <img src="../assets/logoTitle.png" className={styles.loginImage}/>
            <div className={styles.loginTitle}>Login to your Pantry<span className={styles.titleOrange}>Pal</span> account</div>
            <CustomTextField 
              required label="Email" 
              variant="outlined" 
              className={styles.loginEmail} 
            />
            <CustomTextField 
              required label="Password" 
              variant="outlined" 
              type={showPassword ? 'text' : 'password'}
              className={styles.loginPassword}
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
            <div className={styles.loginButton}>Log in</div>
            <div className={styles.loginNoAcc}>Not registered? <Link className={styles.loginRegister} href="/register">Create an account</Link></div>
          </div>
        </div>
      </div>
    );
  };
  
  export default Login;