import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./styles.module.css";

export default function CreateService() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "Dog Walking",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Service created successfully!");
        navigate("/services");
      } else {
        alert(data.error || "Failed to create service");
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
          <h1>Create New Service</h1>
          <p className={styles.formSubtitle}>
            Add a new pet care service to your catalog
          </p>

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
                  placeholder="e.g., 1 hour"
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
                onClick={() => navigate("/services")}
              >
                Cancel
              </button>
              <button type="submit" disabled={loading} className={styles.button}>
                {loading ? "Creating..." : "Create Service"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}