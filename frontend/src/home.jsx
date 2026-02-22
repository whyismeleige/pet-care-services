import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

export default function Home() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Logged out successfully");
    navigate("/login");
  }

  return (
    <div className={styles.homePage}>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.navBrand}>
            <span className={styles.navBrandIcon}>🐾</span>
            Pet Care+
          </div>
          <div className={styles.navLinks}>
            <Link to="/services" className={styles.navLink}>
              Services
            </Link>
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className={styles.navLink}>
                  Dashboard
                </Link>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.navLink}>
                  Login
                </Link>
                <Link to="/register">
                  <button className={styles.navButton}>Get Started</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroGrid}>
            <div className={styles.heroText}>
              <div className={styles.heroBadge}>
                <span>⭐</span> #1 Pet Care Service
              </div>
              <h1 className={styles.heroTitle}>Your Pet's Happy Place</h1>
              <p className={styles.heroSubtitle}>
                Connect with trusted, local pet sitters and walkers who'll
                treat your furry friends like family.
              </p>
              <div className={styles.heroButtons}>
                {isLoggedIn ? (
                  <>
                    <Link to="/dashboard" className={styles.heroPrimaryButton}>
                      Go to Dashboard
                    </Link>
                    <Link to="/services" className={styles.heroSecondaryButton}>
                      Browse Services
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/register" className={styles.heroPrimaryButton}>
                      Find a Sitter
                    </Link>
                    <Link to="/services" className={styles.heroSecondaryButton}>
                      How it Works
                    </Link>
                  </>
                )}
              </div>
              <div className={styles.trustBadges}>
                <span className={styles.trustBadge}>
                  <span>🛡️</span> Fully Insured
                </span>
                <span className={styles.trustBadge}>
                  <span>✓</span> Vetted Sitters
                </span>
              </div>
            </div>

            <div className={styles.heroImages}>
              <div className={styles.bentoGrid}>
                <img
                  src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&q=80"
                  className={styles.bentoImage}
                  alt="Happy Dog"
                />
                <div className={styles.bentoColumn}>
                  <div className={styles.notificationCard}>
                    <div className={styles.notificationHeader}>
                      <div className={styles.notificationAvatar}>👋</div>
                      <div>
                        <p className={styles.notificationName}>Sara joined</p>
                        <p className={styles.notificationTime}>2 mins ago</p>
                      </div>
                    </div>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80"
                    className={styles.bentoCatImage}
                    alt="Cute Cat"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.servicesSection}>
        <div className={styles.servicesContainer}>
          <div className={styles.servicesHeader}>
            <h2 className={styles.servicesTitle}>Our Services</h2>
            <p className={styles.servicesSubtitle}>
              Whether you're away for work or vacation, we have the perfect
              care plan for your furry friend.
            </p>
          </div>

          <div className={styles.servicesGrid}>
            <div className={styles.serviceCardHome}>
              <div className={`${styles.serviceIcon} ${styles.serviceIconOrange}`}>
                🐕
              </div>
              <h3 className={styles.serviceCardTitle}>Dog Walking</h3>
              <p className={styles.serviceCardDescription}>
                Professional care tailored to your pet's specific needs and
                routine.
              </p>
              <div className={styles.serviceCardFooter}>
                <span className={styles.serviceCardPrice}>₹20/hr</span>
              </div>
            </div>

            <div className={styles.serviceCardHome}>
              <div className={`${styles.serviceIcon} ${styles.serviceIconRose}`}>
                ❤️
              </div>
              <h3 className={styles.serviceCardTitle}>Pet Sitting</h3>
              <p className={styles.serviceCardDescription}>
                Professional care tailored to your pet's specific needs and
                routine.
              </p>
              <div className={styles.serviceCardFooter}>
                <span className={styles.serviceCardPrice}>₹45/night</span>
              </div>
            </div>

            <div className={styles.serviceCardHome}>
              <div className={`${styles.serviceIcon} ${styles.serviceIconBlue}`}>
                🐱
              </div>
              <h3 className={styles.serviceCardTitle}>Grooming</h3>
              <p className={styles.serviceCardDescription}>
                Professional care tailored to your pet's specific needs and
                routine.
              </p>
              <div className={styles.serviceCardFooter}>
                <span className={styles.serviceCardPrice}>₹30/visit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <div className={styles.ctaBox}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
              <p className={styles.ctaText}>
                Join thousands of happy pet owners who trust us with their
                beloved companions.
              </p>
              <Link to="/register" className={styles.ctaButton}>
                Create Your Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.homeFooter}>
        <p>© 2026 Pet Care+. All rights reserved.</p>
      </footer>
    </div>
  );
}