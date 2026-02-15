import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./styles.module.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [myServices, setMyServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyServices();
  }, []);

  async function fetchMyServices() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/services/user/my-services",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMyServices(data);
      } else {
        alert(data.error || "Failed to load your services");
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
    alert("Logged out successfully");
    navigate("/login");
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.navBrand}>
            <span className={styles.navBrandIcon}>🐾</span>
            Pet Care Services
          </div>
          <div className={styles.navLinks}>
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
          </div>
        </div>
      </nav>

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Welcome, {user.name || "User"}!</h1>
          <p>Manage your pet care services</p>
        </div>

        {/* MY SERVICES SECTION */}
        <div className={styles.myServicesSection}>
          <div className={styles.sectionHeader}>
            <h2>My Services</h2>
            <p>Services you've created</p>
          </div>

          {loading ? (
            <div className={styles.loadingServices}>Loading your services...</div>
          ) : myServices.length === 0 ? (
            <div className={styles.emptyState}>
              <p>You haven't created any services yet</p>
              <Link to="/create-service">
                <button className={styles.button}>Create Your First Service</button>
              </Link>
            </div>
          ) : (
            <div className={styles.serviceGrid}>
              {myServices.map((service) => (
                <div key={service._id} className={styles.serviceCard}>
                  <div className={styles.serviceCategory}>{service.category}</div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className={styles.serviceInfo}>
                    <span className={styles.price}>${service.price}</span>
                    <span className={styles.duration}>{service.duration}</span>
                  </div>
                  <div className={styles.serviceCardActions}>
                    <Link
                      to={`/services/${service._id}`}
                      className={styles.viewButton}
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/edit-service/${service._id}`}
                      className={styles.editButtonSmall}
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}