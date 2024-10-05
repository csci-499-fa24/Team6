'use client';
import * as React from 'react';
import Navbar from "../components/navbar";
import styles from './login.module.css'; 
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Link from "next/link"; 
import { styled } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const CustomTextField = styled(TextField)({
  '& label': {
    color: '#506264',
  },
  '& label.Mui-focused': {
    color: '#EC4A27',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      border: '2px solid #A9B0B2',
      borderRadius: '10px',
    },    
    '&:hover fieldset': {
      borderColor: '#C4CCCF',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#EC4A27',
    },
  },
});

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