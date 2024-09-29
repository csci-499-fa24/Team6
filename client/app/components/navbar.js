import React from "react";
import Link from "next/link"; 
import styles from "./navbar.module.css"; 

const Navbar = () => {
    return (
      <div className={styles.navWrapper}>
        <div className={styles.navTitle}>
            <img className={styles.navLogo} src="/assets/logo.png"/>
            <div>PANTRY<span class={styles.palText}>PAL</span></div>
        </div>
        <div className={styles.navLinksWrapper}>
            <Link href="/">Home</Link>
            <Link href="/pantry">Pantry</Link>
            <Link href="/discover">Discover</Link>
        </div>
        <div className={styles.navLinksWrapper}>
            <Link href="/login">Log in</Link>
            <Link href="/register">Get Started</Link>
        </div>
      </div>
    );
  };
  
  export default Navbar;