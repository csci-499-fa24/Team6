"use client";
import React from "react";
import Link from "next/link"; 
import styles from "./navbar.module.css"; 
import { usePathname } from "next/navigation"; 

const Navbar = () => {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login"
    const isRegisterPage = pathname === "/register"

    const isActiveLink = (linkPath) => pathname === linkPath;

    return (
      <div className={styles.navWrapper}>
        <Link className={styles.navTitle} href="/">
            <img className={styles.navLogo} src="/assets/logo.png"/>
            <div>PANTRY<span className={styles.palText}>PAL</span></div>
        </Link>
        {!isLoginPage && !isRegisterPage && (
        <>
          <div className={styles.navLinksWrapper}>
            <Link href="/" className={isActiveLink("/") ? styles.activeLink : ""}>
              Home
            </Link>
            <Link href="/pantry" className={isActiveLink("/pantry") ? styles.activeLink : ""}>
              Pantry
            </Link>
            <Link href="/discover" className={isActiveLink("/discover") ? styles.activeLink : ""}>
              Discover
            </Link>
          </div>
          <div className={styles.navLinksWrapper}>
            <Link href="/login">Log in</Link>
            <Link className={styles.navGetStarted} href="/register">
              <div className={styles.navGetStartedText}>Get Started</div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};
  
  export default Navbar;