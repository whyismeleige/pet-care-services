import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

export default function Home() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const services = [
    {
      title: "Dog Walking",
      price: "$20/hr",
      icon: "🐕",
      iconClass: styles.serviceIconOrange,
      description: "Professional care tailored to your pet's specific needs and routine.",
    },
    {
      title: "Pet Sitting",
      price: "$45/night",
      icon: "❤️",
      iconClass: styles.serviceIconRose,
      description: "Professional care tailored to your pet's specific needs and routine.",
    },
    {
      title: "Grooming",
      price: "$30/visit",
      icon: "🐱",
      iconClass: styles.serviceIconBlue,
      description: "Professional care tailored to your pet's specific needs and routine.",
    },
  ];

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Logged out successfully");
    navigate("/login");
  }

  return (
    <div className={styles.homePage}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div>
          <div className={styles.navBrand}>
            <span style={{ fontSize: "24px" }}>🐾</span>
            <h2>Pet Care Services</h2>
          </div>
          <div className={styles.navLinks}>
            <Link to="/">Home</Link>
            <Link to="/services">Services</Link>
            {isLoggedIn ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">
                  <button className={styles.button}>Get Started</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroGrid}>
            {/* Hero Text */}
            <div className={styles.heroText}>
              <div className={styles.heroBadge}>
                <span className={styles.starIcon}>⭐</span> #1 Pet Care Service
              </div>

              <h1 className={styles.heroTitle}>
                Your Pet's Happy Place
              </h1>

              <p className={styles.heroSubtitle}>
                Connect with trusted, local pet sitters and walkers who'll treat
                your furry friends like family.
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

              {/* Trust Badges */}
              <div className={styles.trustBadges}>
                <span className={styles.trustBadge}>
                  <span className={styles.iconSm}>🛡️</span> Fully Insured
                </span>
                <span className={styles.trustBadge}>
                  <span className={styles.iconSm}>✓</span> Vetted Sitters
                </span>
              </div>
            </div>

            {/* Hero Images (Bento Grid Style) */}
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

              {/* Decorative blob */}
              <div className={styles.heroImagesBlob}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Cards */}
      <section className={styles.servicesSection}>
        <div className={styles.servicesContainer}>
          <div className={styles.servicesHeader}>
            <h2 className={styles.servicesTitle}>Our Services</h2>
            <p className={styles.servicesSubtitle}>
              Whether you're away for work or vacation, we have the perfect care
              plan for your furry friend.
            </p>
          </div>

          <div className={styles.servicesGrid}>
            {services.map((service, i) => (
              <div key={i} className={styles.serviceCard}>
                <div className={`${styles.serviceIcon} ${service.iconClass}`}>
                  {service.icon}
                </div>
                <h3 className={styles.serviceCardTitle}>{service.title}</h3>
                <p className={styles.serviceCardDescription}>
                  {service.description}
                </p>
                <div className={styles.serviceCardFooter}>
                  <span className={styles.serviceCardPrice}>{service.price}</span>
                  <div className={styles.serviceCardArrow}>→</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <div className={styles.ctaBox}>
            {/* Background Pattern */}
            <div className={styles.ctaPattern}></div>

            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Ready to wag tails?</h2>
              <p className={styles.ctaText}>
                Join our community of animal lovers today and get $20 off your
                first booking.
              </p>
              {!isLoggedIn && (
                <Link to="/register" className={styles.ctaButton}>
                  Sign Up Free
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.homeFooter}>
        © 2026 Pet Care Services. Made with love.
      </footer>
    </div>
  );
}