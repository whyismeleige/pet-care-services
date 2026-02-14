import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import styles from "./styles.module.css";

export default function DashboardPage({ user, setUser }) {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  }

  return (
    <div className={styles.dashboardContainer}>
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <Link to="/" className={styles.logo}>
            TravLog
          </Link>

          <div className={styles.navLinks}>
            {user ? (
              <>
                <Link to="/my-logs" className={styles.navLink}>
                  My Logs
                </Link>
                <Link to="/create-log" className={styles.navLink}>
                  Create Log
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
                <Link to="/register" className={styles.primaryButton}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            
            <h1 className={styles.heroTitle}>
              Document Your Travel Adventures
            </h1>
            
            <p className={styles.heroSubtitle}>
              Create beautiful travel logs, preserve memories, and relive your journeys 
              with our simple and aesthetic digital diary
            </p>

            {user ? (
              <div className={styles.heroButtons}>
                <Link to="/my-logs" className={styles.heroButton}>
                  📖 View My Logs
                </Link>
                <Link to="/create-log" className={styles.heroButtonSecondary}>
                  ✍️ Create New Log
                </Link>
              </div>
            ) : (
              <div className={styles.heroButtons}>
                <Link to="/register" className={styles.heroButton}>
                  🚀 Get Started Free
                </Link>
                <Link to="/login" className={styles.heroButtonSecondary}>
                  👋 Login
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className={styles.featuresSection}>
          <div className={styles.featuresContainer}>
            <h2 className={styles.featuresTitle}>Why TravLog?</h2>
            
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>📸</div>
                <h3 className={styles.featureCardTitle}>Capture Memories</h3>
                <p className={styles.featureCardText}>
                  Add photos and detailed descriptions of every adventure
                </p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🗺️</div>
                <h3 className={styles.featureCardTitle}>Track Locations</h3>
                <p className={styles.featureCardText}>
                  Remember exactly where each memory was made
                </p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>⏰</div>
                <h3 className={styles.featureCardTitle}>Timeline View</h3>
                <p className={styles.featureCardText}>
                  See your journeys organized by date and time
                </p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>✨</div>
                <h3 className={styles.featureCardTitle}>Simple & Beautiful</h3>
                <p className={styles.featureCardText}>
                  Clean design that lets your memories shine
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={styles.ctaContainer}>
            <h2 className={styles.ctaTitle}>Ready to Start Your Journey?</h2>
            <p className={styles.ctaText}>
              Join travelers worldwide who trust TravLog to preserve their adventures
            </p>
            {!user && (
              <Link to="/register" className={styles.ctaButton}>
                Create Your Free Account
              </Link>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}