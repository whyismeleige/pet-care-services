import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styles from "./styles.module.css";

export default function EditService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "Dog Walking",
  });
  const [loading, setLoading] = useState(false);
  const [loadingService, setLoadingService] = useState(true);

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
        setFormData({
          name: data.name,
          description: data.description,
          price: data.price,
          duration: data.duration,
          category: data.category,
        });
      } else {
        alert(data.error || "Failed to load service");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setLoadingService(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/services/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Service updated successfully!");
        navigate(`/services/${id}`);
      } else {
        alert(data.error || "Failed to update service");
        setLoading(false);
      }
    } catch (error) {
      alert("Network error. Please try again.");
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  if (loadingService) {
    return <div className={styles.loading}>Loading service...</div>;
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
        <div className={styles.formContainer}>
          <h1>Edit Service</h1>
          <p className={styles.formSubtitle}>Update service details</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Service Name</label>
              <input
                type="text"
                required
                className={styles.input}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <textarea
                required
                className={styles.textarea}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Price ($)</label>
                <input
                  type="number"
                  required
                  className={styles.input}
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Duration</label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Category</label>
              <select
                className={styles.select}
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="Dog Walking">Dog Walking</option>
                <option value="Pet Sitting">Pet Sitting</option>
                <option value="Grooming">Grooming</option>
                <option value="Training">Training</option>
                <option value="Veterinary">Veterinary</option>
              </select>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => navigate(`/services/${id}`)}
              >
                Cancel
              </button>
              <button type="submit" disabled={loading} className={styles.button}>
                {loading ? "Updating..." : "Update Service"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}