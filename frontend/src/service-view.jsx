import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styles from "./styles.module.css";

export default function ServiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchService();
  }, [id]);

  async function fetchService() {
    try {
      const response = await fetch(`http://localhost:5000/api/services/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok) {
        setService(data);
      } else {
        alert(data.error || "Failed to load service");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/services/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert("Service deleted successfully");
        navigate("/services");
      } else {
        alert(data.error || "Failed to delete service");
      }
    } catch (error) {
      alert("Network error");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  if (loading) {
    return <div className={styles.loading}>Loading service...</div>;
  }

  if (!service) {
    return <div className={styles.loading}>Service not found</div>;
  }

  const isOwner = user._id === service.userId;

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.navBrand}>
            <span className={styles.navBrandIcon}>🐾</span>
            Pet Care Services
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
        <div className={styles.serviceDetail}>
          <div className={styles.serviceDetailHeader}>
            <Link to="/services" className={styles.backLink}>
              Back to Services
            </Link>
            <div className={styles.serviceCategory}>{service.category}</div>
          </div>

          <h1>{service.name}</h1>
          <p className={styles.serviceDescription}>{service.description}</p>

          <div className={styles.serviceDetailInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Price</span>
              <span className={styles.infoValue}>${service.price}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Duration</span>
              <span className={styles.infoValue}>{service.duration}</span>
            </div>
          </div>

          {isOwner && (
            <div className={styles.serviceActions}>
              <Link
                to={`/edit-service/${service._id}`}
                className={styles.editButton}
              >
                Edit Service
              </Link>
              <button onClick={handleDelete} className={styles.deleteButton}>
                Delete Service
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}