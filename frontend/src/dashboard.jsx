import { useNavigate, Link } from "react-router-dom";
import styles from "./styles.module.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Logged out successfully");
    navigate("/login");
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navBrand}>
          <h2>Pet Care Services</h2>
        </div>
        <div className={styles.navLinks}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/services">All Services</Link>
          <Link to="/create-service">Create Service</Link>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </nav>

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Welcome, {user.name || "User"}!</h1>
          <p>Manage your pet care services</p>
        </div>

        <div className={styles.dashboardGrid}>
          <div className={styles.card}>
            <h3>Your Services</h3>
            <p>View and manage all your pet care services</p>
            <Link to="/services" className={styles.cardLink}>
              View Services
            </Link>
          </div>

          <div className={styles.card}>
            <h3>Create New Service</h3>
            <p>Add a new pet care service to your catalog</p>
            <Link to="/create-service" className={styles.cardLink}>
              Create Service
            </Link>
          </div>

          <div className={styles.card}>
            <h3>Profile</h3>
            <p>Update your account information</p>
            <span className={styles.cardLink}>Coming Soon</span>
          </div>

          <div className={styles.card}>
            <h3>Settings</h3>
            <p>Configure your preferences</p>
            <span className={styles.cardLink}>Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}