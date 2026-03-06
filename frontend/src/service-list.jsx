import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

const CATEGORIES = ["All", "Dog Walking", "Pet Sitting", "Grooming", "Training", "Veterinary"];

function StarRating({ rating, count }) {
  return (
    <div className={styles.starRating}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? styles.starFilled : styles.starEmpty}>
          ★
        </span>
      ))}
      <span className={styles.ratingText}>
        {rating > 0 ? `${rating.toFixed(1)} (${count})` : "No reviews"}
      </span>
    </div>
  );
}

export default function ServiceList() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category !== "All") params.append("category", category);
      if (priceRange.min) params.append("minPrice", priceRange.min);
      if (priceRange.max) params.append("maxPrice", priceRange.max);
      if (sortBy) params.append("sortBy", sortBy);

      const response = await fetch(`http://localhost:5000/api/services?${params}`, {
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (response.ok) setServices(data);
    } catch (error) {
      console.error("Network error");
    } finally {
      setLoading(false);
    }
  }, [search, category, sortBy, priceRange]);

  useEffect(() => {
    const timer = setTimeout(() => fetchServices(), 300);
    return () => clearTimeout(timer);
  }, [fetchServices]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  const isLoggedIn = !!localStorage.getItem("token");

  const categoryIcons = {
    "Dog Walking": "🐕",
    "Pet Sitting": "🏠",
    Grooming: "✂️",
    Training: "🎓",
    Veterinary: "🩺",
  };

  function clearFilters() {
    setSearch("");
    setCategory("All");
    setSortBy("newest");
    setPriceRange({ min: "", max: "" });
  }

  const hasActiveFilters =
    search || category !== "All" || sortBy !== "newest" || priceRange.min || priceRange.max;

  return (
    <div className={styles.container}>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.navBrand} onClick={() => navigate("/")}>
            <span className={styles.navBrandIcon}>🐾</span>
            Pet Care+
          </div>
          <div className={styles.navLinks}>
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
                <Link to="/services" className={styles.navLink}>Services</Link>
                <Link to="/messages" className={styles.navLink}>Messages</Link>
                <Link to="/create-service" className={styles.navLink}>+ List Service</Link>
                <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/" className={styles.navLink}>Home</Link>
                <Link to="/login" className={styles.navLink}>Login</Link>
                <Link to="/register"><button className={styles.navButton}>Get Started</button></Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className={styles.mainContent}>
        {/* PAGE HEADER */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Find Pet Care Services</h1>
            <p className={styles.pageSubtitle}>
              {services.length} service{services.length !== 1 ? "s" : ""} available
            </p>
          </div>
          {isLoggedIn && (
            <Link to="/create-service" className={styles.ctaButton}>
              + List Your Service
            </Link>
          )}
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className={styles.searchFilterBar}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search services, descriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            {search && (
              <button className={styles.clearSearch} onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          <button
            className={`${styles.filterToggle} ${showFilters ? styles.filterToggleActive : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            ⚙️ Filters {hasActiveFilters && <span className={styles.filterBadge}>•</span>}
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* EXPANDED FILTERS */}
        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filterSection}>
              <p className={styles.filterLabel}>Category</p>
              <div className={styles.categoryChips}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`${styles.categoryChip} ${category === cat ? styles.categoryChipActive : ""}`}
                  >
                    {cat !== "All" && <span>{categoryIcons[cat] || "🐾"}</span>}
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <p className={styles.filterLabel}>Price Range (₹)</p>
              <div className={styles.priceInputs}>
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className={styles.priceInput}
                />
                <span className={styles.priceDash}>—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className={styles.priceInput}
                />
              </div>
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className={styles.clearFiltersBtn}>
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* CATEGORY QUICK FILTERS */}
        {!showFilters && (
          <div className={styles.quickCategories}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`${styles.quickCategoryBtn} ${category === cat ? styles.quickCategoryActive : ""}`}
              >
                {cat !== "All" && <span>{categoryIcons[cat] || "🐾"}</span>}
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* SERVICES GRID */}
        {loading ? (
          <div className={styles.loadingGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLineShort} />
                <div className={styles.skeletonBlock} />
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🐾</div>
            <p className={styles.emptyTitle}>No services found</p>
            <p className={styles.emptySubtitle}>Try adjusting your search or filters</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className={styles.button}>Clear Filters</button>
            )}
          </div>
        ) : (
          <div className={styles.serviceGrid}>
            {services.map((service) => (
              <div
                key={service._id}
                className={styles.serviceCard}
                onClick={() => navigate(`/services/${service._id}`)}
              >
                <div className={styles.serviceCardTop}>
                  <span className={styles.serviceCategoryBadge}>
                    {categoryIcons[service.category] || "🐾"} {service.category}
                  </span>
                  <span className={styles.serviceCardPrice}>₹{service.price}</span>
                </div>
                <h3 className={styles.serviceCardTitle}>{service.name}</h3>
                <p className={styles.serviceCardDesc}>{service.description}</p>
                <div className={styles.serviceCardMeta}>
                  <span className={styles.durationBadge}>⏱ {service.duration}</span>
                </div>
                <div className={styles.serviceCardFooterRow}>
                  <StarRating rating={service.avgRating || 0} count={service.reviewCount || 0} />
                  <button
                    className={styles.viewDetailsBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/services/${service._id}`);
                    }}
                  >
                    View →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}