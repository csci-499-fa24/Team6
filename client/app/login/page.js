import Navbar from "../components/navbar";
import styles from './login.module.css'; 
import TextField from '@mui/material/TextField';
import Link from "next/link"; 

const Login = () => {
    return (
      <div>
        <Navbar/>
        <div className={styles.loginPageWrapper}>
          <div className={styles.loginWrapper}>
            <img src="../assets/logoTitle.png" className={styles.loginImage}/>
            <div className={styles.loginTitle}>Login to your Pantry<span className={styles.titleOrange}>Pal</span> account</div>
            <TextField required label="Email" variant="outlined" className={styles.loginEmail}/>
            <TextField required label="Password" variant="outlined" type="password" className={styles.loginPassword}/>
            <div className={styles.loginButton}>Log in</div>
            <div className={styles.loginNoAcc}>Not registered? <Link className={styles.loginRegister} href="/register">Create an account</Link></div>
          </div>
        </div>
      </div>
    );
  };
  
  export default Login;