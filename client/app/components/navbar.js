"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./navbar.module.css";
import { usePathname, useRouter } from "next/navigation";
import { Box, Button, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import FoodBankIcon from '@mui/icons-material/FoodBank';
import { Login } from "@mui/icons-material";
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";

  const [authenticated, setAuthenticated] = useState(false);
  const [open, setOpen] = React.useState(false);

  const isActiveLink = (linkPath) => pathname === linkPath;

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthenticated(false);
    router.push("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthenticated(true);
    }
  }, []);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const iconMapping = {
    Home: <HomeIcon className={styles.mobileIconStyles} />,
    Pantry: <FoodBankIcon className={styles.mobileIconStyles} />,
    Discover: <LightbulbIcon className={styles.mobileIconStyles} />,
    Recipes: <RestaurantMenuIcon className={styles.mobileIconStyles} />,
    'Log in': <Login className={styles.mobileIconStyles} />,
    'Get Started': <PersonIcon className={styles.mobileIconStyles} />,
    Logout: <PersonIcon className={styles.mobileIconStyles} />
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {[
          { text: 'Home', href: '/' },
          { text: 'Pantry', href: '/pantry' },
          { text: 'Discover', href: '/discover' },
          { text: 'Recipes', href: '/recipe' }
        ].map(({ text, href }) => (
          <ListItem key={text} disablePadding>
            <ListItemButton className={styles.mobileDrawerItem} href={href}>
              <ListItemIcon sx={{ minWidth: '20%' }}>{iconMapping[text]}</ListItemIcon>
              <ListItemText
                className={styles.mobileDrawerText}
                primary={text}
                primaryTypographyProps={{
                  fontSize: '.8em',
                  fontWeight: 'medium',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {authenticated ? (
          <ListItem key="Logout" disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon sx={{ minWidth: '20%' }}>{iconMapping['Logout']}</ListItemIcon>
              <ListItemText primary="Logout"
                primaryTypographyProps={{
                  fontSize: '.8em',
                  fontWeight: 'medium',
                  fontFamily: 'Inter, sans-serif',
                }} />
            </ListItemButton>
          </ListItem>
        ) : (
          [
            { text: 'Log in', href: '/login' },
            { text: 'Get Started', href: '/register' }
          ].map(({ text, href }) => (
            <ListItem key={text} disablePadding>
              <ListItemButton href={href}>
                <ListItemIcon sx={{ minWidth: '20%' }}>{iconMapping[text]}</ListItemIcon>
                <ListItemText
                  primary={text}
                  primaryTypographyProps={{
                    fontSize: '.8em',
                    fontWeight: 'medium',
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );



  return (
    <div className={styles.navWrapper}>
      <Link className={styles.navTitle} href="/">
        <img className={styles.navLogo} src="/assets/logo.png" />
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
            <Link href="/recipe" className={isActiveLink("/recipe") ? styles.activeLink : ""}>
              Recipes
            </Link>
            <Link href="/plan" className={isActiveLink("/plan") ? styles.activeLink : ""}>
              Plan
            </Link>
          </div>
          <div className={styles.mobileDrawer}>
            <Button onClick={toggleDrawer(true)} disableRipple={true}><MenuIcon className={styles.mobileIconStyles} /></Button>
            <Drawer
              open={open}
              onClose={toggleDrawer(false)}
              sx={{ '& .MuiDrawer-paper': { width: '200px' } }
              }>
              {DrawerList}
            </Drawer>
          </div>
          <div className={styles.navLinksWrapper}>
            {authenticated ? (
              <div onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </div>
            ) : (
              <>
                <Link href="/login">Log in</Link>
                <Link className={styles.navGetStarted} href="/register">
                  <div className={styles.navGetStartedText}>Get Started</div>
                </Link>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;
