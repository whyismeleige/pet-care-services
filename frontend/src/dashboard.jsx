import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./styles.module.css";

const TABS = ["My Services", "My Bookings", "Incoming Requests"];

const STATUS_COLORS = {
  pending: styles.statusPending,
  confirmed: styles.statusConfirmed,
  completed: styles.statusCompleted,
  cancelled: styles.statusCancelled,
};

const STATUS_LABELS = {
  pending: "⏳ Pending",
  confirmed: "✅ Confirmed",
  completed: "🎉 Completed",
  cancelled: "❌ Cancelled",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [activeTab, setActiveTab] = useState("My Services");
  const [myServices, setMyServices] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [providerBookings, setProviderBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchAll() {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: "Bearer " + token };
    try {
      const [svcRes, bookRes, provRes, notifRes] = await Promise.all([
        fetch("http://localhost:5000/api/services/user/my-services", { headers }),
        fetch("http://localhost:5000/api/bookings/my-bookings", { headers }),
        fetch("http://localhost:5000/api/bookings/provider-bookings", { headers }),
        fetch("http://localhost:5000/api/notifications", { headers }),
      ]);
      const [svcData, bookData, provData, notifData] = await Promise.all([
        svcRes.json(), bookRes.json(), provRes.json(), notifRes.json(),
      ]);
      if (svcRes.ok) setMyServices(svcData);
      if (bookRes.ok) setMyBookings(bookData);
      if (provRes.ok) setProviderBookings(provData);
      if (notifRes.ok) setNotifications(notifData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleBookingAction(bookingId, status) {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        fetchAll();
      }
    } catch (e) {
      alert("Network error");
    }
  }

  async function markAllRead() {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:5000/api/notifications/read-all", {
      method: "PUT",
      headers: { Authorization: "Bearer " + token },
    });
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  }

  async function markOneRead(notifId) {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/api/notifications/${notifId}/read`, {
      method: "PUT",
      headers: { Authorization: "Bearer " + token },
    });
    setNotifications(notifications.map((n) => n._id === notifId ? { ...n, read: true } : n));
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const pendingProviderBookings = providerBookings.filter((b) => b.status === "pending").length;

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
            <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
            <Link to="/services" className={styles.navLink}>Services</Link>
            <Link to="/messages" className={styles.navLink}>
              Messages
            </Link>
            <Link to="/create-service" className={styles.navLink}>+ List Service</Link>

            {/* Notification Bell */}
            <div className={styles.notifWrapper} ref={notifRef}>
              <button
                className={styles.notifBell}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                🔔
                {unreadCount > 0 && (
                  <span className={styles.notifBadge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </button>
              {showNotifications && (
                <div className={styles.notifDropdown}>
                  <div className={styles.notifDropdownHeader}>
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <button className={styles.markAllReadBtn} onClick={markAllRead}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className={styles.notifList}>
                    {notifications.length === 0 ? (
                      <p className={styles.noNotifs}>No notifications yet</p>
                    ) : (
                      notifications.slice(0, 15).map((n) => (
                        <div
                          key={n._id}
                          className={`${styles.notifItem} ${!n.read ? styles.notifUnread : ""}`}
                          onClick={() => markOneRead(n._id)}
                        >
                          <div className={styles.notifIcon}>
                            {n.type === "booking_new" && "📅"}
                            {n.type === "booking_confirmed" && "✅"}
                            {n.type === "booking_completed" && "🎉"}
                            {n.type === "booking_cancelled" && "❌"}
                            {n.type === "review_new" && "⭐"}
                            {n.type === "message_new" && "💬"}
                          </div>
                          <div className={styles.notifContent}>
                            <p className={styles.notifTitle}>{n.title}</p>
                            <p className={styles.notifMessage}>{n.message}</p>
                            <p className={styles.notifTime}>
                              {new Date(n.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {!n.read && <div className={styles.notifDot} />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
          </div>
        </div>
      </nav>

      <div className={styles.mainContent}>
        {/* WELCOME HEADER */}
        <div className={styles.dashboardWelcome}>
          <div>
            <h1 className={styles.welcomeTitle}>Welcome back, {user.name?.split(" ")[0]}! 👋</h1>
            <p className={styles.welcomeSubtitle}>Here's what's happening with your pet care activity</p>
          </div>
          <Link to="/create-service" className={styles.ctaButton}>
            + List New Service
          </Link>
        </div>

        {/* STATS ROW */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🛎️</div>
            <div className={styles.statNumber}>{myServices.length}</div>
            <div className={styles.statLabel}>My Services</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📅</div>
            <div className={styles.statNumber}>{myBookings.length}</div>
            <div className={styles.statLabel}>My Bookings</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏳</div>
            <div className={styles.statNumber}>{pendingProviderBookings}</div>
            <div className={styles.statLabel}>Pending Requests</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎉</div>
            <div className={styles.statNumber}>
              {providerBookings.filter((b) => b.status === "completed").length}
            </div>
            <div className={styles.statLabel}>Completed</div>
          </div>
        </div>

        {/* TABS */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
              >
                {tab}
                {tab === "Incoming Requests" && pendingProviderBookings > 0 && (
                  <span className={styles.tabBadge}>{pendingProviderBookings}</span>
                )}
              </button>
            ))}
          </div>

          {/* TAB: MY SERVICES */}
          {activeTab === "My Services" && (
            <div className={styles.tabContent}>
              {loading ? (
                <div className={styles.loadingServices}>Loading...</div>
              ) : myServices.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🐾</div>
                  <p className={styles.emptyTitle}>No services listed yet</p>
                  <p>Start earning by listing your pet care services</p>
                  <Link to="/create-service">
                    <button className={styles.button}>Create Your First Service</button>
                  </Link>
                </div>
              ) : (
                <div className={styles.serviceGrid}>
                  {myServices.map((service) => (
                    <div key={service._id} className={styles.serviceCard}>
                      <div className={styles.serviceCardTop}>
                        <span className={styles.serviceCategoryBadge}>{service.category}</span>
                        <span className={styles.serviceCardPrice}>₹{service.price}</span>
                      </div>
                      <h3 className={styles.serviceCardTitle}>{service.name}</h3>
                      <p className={styles.serviceCardDesc}>{service.description}</p>
                      <div className={styles.serviceCardActions}>
                        <Link to={`/services/${service._id}`} className={styles.viewButton}>
                          View
                        </Link>
                        <Link to={`/edit-service/${service._id}`} className={styles.editButtonSmall}>
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: MY BOOKINGS */}
          {activeTab === "My Bookings" && (
            <div className={styles.tabContent}>
              {loading ? (
                <div className={styles.loadingServices}>Loading...</div>
              ) : myBookings.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📅</div>
                  <p className={styles.emptyTitle}>No bookings yet</p>
                  <p>Browse services and book your first appointment</p>
                  <Link to="/services">
                    <button className={styles.button}>Browse Services</button>
                  </Link>
                </div>
              ) : (
                <div className={styles.bookingsList}>
                  {myBookings.map((booking) => (
                    <div key={booking._id} className={styles.bookingCard}>
                      <div className={styles.bookingCardLeft}>
                        <div className={styles.bookingServiceName}>{booking.serviceName}</div>
                        <div className={styles.bookingMeta}>
                          <span>📅 {booking.date}</span>
                          <span>🕐 {booking.time}</span>
                          <span>👤 Provider: {booking.providerName}</span>
                        </div>
                        {booking.notes && (
                          <p className={styles.bookingNotes}>📝 {booking.notes}</p>
                        )}
                      </div>
                      <div className={styles.bookingCardRight}>
                        <span className={styles.bookingPrice}>₹{booking.price}</span>
                        <span className={`${styles.statusBadge} ${STATUS_COLORS[booking.status]}`}>
                          {STATUS_LABELS[booking.status]}
                        </span>
                        {booking.status === "pending" && (
                          <button
                            className={styles.cancelBookingBtn}
                            onClick={() => handleBookingAction(booking._id, "cancelled")}
                          >
                            Cancel
                          </button>
                        )}
                        {booking.status === "completed" && (
                          <Link
                            to={`/services/${booking.serviceId}`}
                            className={styles.reviewBtn}
                          >
                            Leave Review
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: INCOMING REQUESTS */}
          {activeTab === "Incoming Requests" && (
            <div className={styles.tabContent}>
              {loading ? (
                <div className={styles.loadingServices}>Loading...</div>
              ) : providerBookings.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📬</div>
                  <p className={styles.emptyTitle}>No incoming requests</p>
                  <p>Booking requests from clients will appear here</p>
                </div>
              ) : (
                <div className={styles.bookingsList}>
                  {providerBookings.map((booking) => (
                    <div key={booking._id} className={styles.bookingCard}>
                      <div className={styles.bookingCardLeft}>
                        <div className={styles.bookingServiceName}>{booking.serviceName}</div>
                        <div className={styles.bookingMeta}>
                          <span>📅 {booking.date}</span>
                          <span>🕐 {booking.time}</span>
                          <span>👤 Client: {booking.clientName}</span>
                        </div>
                        {booking.notes && (
                          <p className={styles.bookingNotes}>📝 {booking.notes}</p>
                        )}
                        <p className={styles.bookingCreated}>
                          Requested: {formatDate(booking.createdAt)}
                        </p>
                      </div>
                      <div className={styles.bookingCardRight}>
                        <span className={styles.bookingPrice}>₹{booking.price}</span>
                        <span className={`${styles.statusBadge} ${STATUS_COLORS[booking.status]}`}>
                          {STATUS_LABELS[booking.status]}
                        </span>
                        {booking.status === "pending" && (
                          <div className={styles.providerActions}>
                            <button
                              className={styles.confirmBtn}
                              onClick={() => handleBookingAction(booking._id, "confirmed")}
                            >
                              ✅ Confirm
                            </button>
                            <button
                              className={styles.declineBtn}
                              onClick={() => handleBookingAction(booking._id, "cancelled")}
                            >
                              ❌ Decline
                            </button>
                          </div>
                        )}
                        {booking.status === "confirmed" && (
                          <button
                            className={styles.completeBtn}
                            onClick={() => handleBookingAction(booking._id, "completed")}
                          >
                            🎉 Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}