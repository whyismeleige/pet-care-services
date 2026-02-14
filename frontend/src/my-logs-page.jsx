import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import styles from "./styles.module.css";

export default function MyLogsPage({ user, setUser }) {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/travel-logs", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }

      const data = await response.json();
      setLogs(data.data || []);
    } catch (error) {
      toast.error("Failed to load travel logs");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this travel log?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/travel-logs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("Travel log deleted");
      setLogs(logs.filter((log) => log._id !== id));
    } catch (error) {
      toast.error("Failed to delete travel log");
    }
  }

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
    <div className={styles.pageContainer}>
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <Link to="/" className={styles.logo}>
            TravLog
          </Link>

          <div className={styles.navLinks}>
            <Link to="/my-logs" className={styles.navLink}>
              My Logs
            </Link>
            <Link to="/create-log" className={styles.navLink}>
              Create Log
            </Link>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>My Travel Logs</h1>
          <Link to="/create-log" className={styles.createButton}>
            + Create New Log
          </Link>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
          </div>
        ) : logs.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>
              No travel logs yet. Start documenting your adventures!
            </p>
            <Link to="/create-log" className={styles.createButton}>
              Create Your First Log
            </Link>
          </div>
        ) : (
          <div className={styles.logsGrid}>
            {logs.map((log) => (
              <div key={log._id} className={styles.logCard}>
                <img
                  src={log.imageUrl}
                  alt={log.title}
                  className={styles.logImage}
                />
                <div className={styles.logContent}>
                  <h3 className={styles.logTitle}>{log.title}</h3>
                  <p className={styles.logLocation}>{log.location}</p>
                  <p className={styles.logDescription}>
                    {log.description.length > 120
                      ? log.description.substring(0, 120) + "..."
                      : log.description}
                  </p>
                  <p className={styles.logDate}>
                    {new Date(log.travelDate).toLocaleDateString()}
                  </p>

                  <div className={styles.logActions}>
                    <Link
                      to={`/edit-log/${log._id}`}
                      className={styles.editButton}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(log._id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}