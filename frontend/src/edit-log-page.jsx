import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import styles from "./styles.module.css";

export default function EditLogPage({ user, setUser }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    description: "",
    travelDate: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchLog();
  }, [id]);

  async function fetchLog() {
    try {
      setFetching(true);
      const response = await fetch(`http://localhost:8080/api/travel-logs/${id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch log");
      }

      const data = await response.json();
      const log = data.data;

      setFormData({
        title: log.title,
        location: log.location,
        description: log.description,
        travelDate: log.travelDate.split("T")[0],
        imageUrl: log.imageUrl || "",
      });
    } catch (error) {
      toast.error("Failed to load travel log");
      navigate("/my-logs");
    } finally {
      setFetching(false);
    }
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.title || !formData.location || !formData.description || !formData.travelDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/travel-logs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update travel log");
      }

      toast.success("Travel log updated!");
      navigate("/my-logs");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
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

  if (fetching) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}></div>
      </div>
    );
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
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <Link to="/my-logs" className={styles.backButton}>
              ← Back to Logs
            </Link>
            <h1 className={styles.formTitle}>Edit Travel Log</h1>
          </div>

          <form onSubmit={handleSubmit} className={styles.logForm}>
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.label}>
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={styles.input}
                placeholder="e.g., Amazing trip to Paris"
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="location" className={styles.label}>
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={styles.input}
                placeholder="e.g., Paris, France"
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Share your travel experience..."
                rows="6"
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="travelDate" className={styles.label}>
                Travel Date *
              </label>
              <input
                type="date"
                id="travelDate"
                name="travelDate"
                value={formData.travelDate}
                onChange={handleChange}
                className={styles.input}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="imageUrl" className={styles.label}>
                Image URL (optional)
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className={styles.input}
                placeholder="https://example.com/image.jpg"
                disabled={loading}
              />
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? "Updating..." : "Update Travel Log"}
              </button>
              <Link to="/my-logs" className={styles.cancelButton}>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}