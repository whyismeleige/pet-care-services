import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

export default function ServiceList() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const response = await fetch("http://localhost:5000/api/services", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok) {
        setServices(data);
      } else {
        alert(data.error || "Failed to load services");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  if (loading) {
    return <div className={styles.loading}>Loading services...</div>;
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.navBrand} onClick={() => navigate("/")}>
            <span className={styles.navBrandIcon}>🐾</span>
            Pet Care+
          </div>
          <div className={styles.navLinks}>
            {localStorage.getItem("token") ? (
              <>
                <Link to="/dashboard" className={styles.navLink}>
                  Dashboard
                </Link>
                <Link to="/services" className={styles.navLink}>
                  All Services
                </Link>
                <Link to="/create-service" className={styles.navLink}>
                  Create Service
                </Link>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/" className={styles.navLink}>
                  Home
                </Link>
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

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>All Pet Care Services</h1>
          <p>Browse available services</p>
        </div>

        {services.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No services available yet</p>
            {localStorage.getItem("token") && (
              <Link to="/create-service">
                <button className={styles.button}>Create First Service</button>
              </Link>
            )}
          </div>
        ) : (
          <div className={styles.serviceGrid}>
            {services.map((service) => (
              <div key={service._id} className={styles.serviceCard}>
                <div className={styles.serviceCategory}>{service.category}</div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className={styles.serviceInfo}>
                  <span className={styles.price}>₹{service.price}</span>
                  <span className={styles.duration}>{service.duration}</span>
                </div>
                <Link
                  to={`/services/${service._id}`}
                  className={styles.viewButton}
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}