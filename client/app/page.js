import Link from 'next/link';
import styles from './landingPage.module.css'; 
import Navbar from './components/navbar'
import PlayArrowIcon from '@mui/icons-material/PlayArrow';


const LandingPage = () => {
  return (
    <div className={styles.landingPage}>
      <Navbar/>
      <div className={styles.landingPageWrapper}>
        <div className={styles.landingPageContent}>
          <img className={styles.landingLogo} src="/assets/logoTitle.png"/>
          <div className={styles.descriptionText}>
            <div className={styles.descriptionTitle}>Meal planning, simplified</div>
            <div className={styles.descriptionBullets}>
              <div className={styles.descriptionBullet}>
                <PlayArrowIcon className={styles.bulletArrow}/>
                Find recipes based on ingredients you already have
              </div>
              <div className={styles.descriptionBullet}>
                <PlayArrowIcon className={styles.bulletArrow}/>
                Stay on track with your nutrition goals
              </div>
              <div className={styles.descriptionBullet}>
                <PlayArrowIcon className={styles.bulletArrow}/>
                Cook confidently with allergy-friendly recipes
              </div>
            </div>
          </div>
        </div>
        <div className={styles.bottomContent}>
          <div className={styles.bottomDescription}>
            <div>1000+ Recipe Options</div>
            <div>Personalized Recipe Feed</div>
            <div>Nutritional Goal Tracker</div>
          </div>
          <Link className={styles.getStarted} href="/register">
              Get Started Today
          </Link>
          <div className={styles.login}>Already have an account? <Link className={styles.loginLink} href="/login">Log In</Link></div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;