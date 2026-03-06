import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styles from "./styles.module.css";

function StarRating({ rating, interactive = false, onRate }) {
  const [hover, setHover] = useState(0);
  return (
    <div className={styles.starRating}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={
            s <= (interactive ? hover || rating : Math.round(rating))
              ? styles.starFilled
              : styles.starEmpty
          }
          style={interactive ? { cursor: "pointer", fontSize: "24px" } : {}}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate && onRate(s)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function ServiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [bookingData, setBookingData] = useState({ date: "", time: "", notes: "" });
  const [reviewData, setReviewData] = useState({ rating: 0, comment: "" });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    fetchService();
    fetchReviews();
  }, [id]);

  async function fetchService() {
    try {
      const response = await fetch(`http://localhost:5000/api/services/${id}`);
      const data = await response.json();
      if (response.ok) setService(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function fetchReviews() {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/${id}`);
      const data = await response.json();
      if (response.ok) setReviews(data);
    } catch (e) { console.error(e); }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (response.ok) navigate("/services");
    } catch (e) { alert("Network error"); }
  }

  async function handleBooking(e) {
    e.preventDefault();
    if (!bookingData.date || !bookingData.time) { alert("Please select a date and time"); return; }
    setBookingLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ serviceId: id, ...bookingData }),
      });
      const data = await response.json();
      if (response.ok) {
        setBookingSuccess(true);
        setTimeout(() => {
          setShowBookingModal(false);
          setBookingSuccess(false);
          setBookingData({ date: "", time: "", notes: "" });
        }, 2000);
      } else { alert(data.error || "Booking failed"); }
    } catch (e) { alert("Network error"); }
    finally { setBookingLoading(false); }
  }

  async function handleReview(e) {
    e.preventDefault();
    if (!reviewData.rating) { alert("Please select a rating"); return; }
    setReviewLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ serviceId: id, ...reviewData }),
      });
      const data = await response.json();
      if (response.ok) {
        setReviews([data, ...reviews]);
        setShowReviewModal(false);
        setReviewData({ rating: 0, comment: "" });
        fetchService();
      } else { alert(data.error || "Review failed"); }
    } catch (e) { alert("Network error"); }
    finally { setReviewLoading(false); }
  }

  async function handleMessageProvider() {
    if (!isLoggedIn) { navigate("/login"); return; }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ otherUserId: service.userId, serviceId: id }),
      });
      if (response.ok) navigate("/messages");
    } catch (e) { alert("Network error"); }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!service) return <div className={styles.loading}>Service not found</div>;

  const isOwner = user._id === service.userId?.toString();

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
        {/* TOP BAR: back link + category badge */}
        <div className={styles.serviceViewTopBar}>
          <Link to="/services" className={styles.backLink}>
            ← Back to Services
          </Link>
          <span className={styles.serviceCategoryBadge}>{service.category}</span>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className={styles.serviceDetailLayout}>

          {/* LEFT: main content */}
          <div className={styles.serviceDetailMain}>

            {/* SERVICE INFO CARD */}
            <div className={styles.serviceDetail}>
              <h1 className={styles.serviceDetailTitle}>{service.name}</h1>

              <div className={styles.ratingRow}>
                <StarRating rating={service.avgRating || 0} />
                <span className={styles.ratingText}>
                  {service.avgRating > 0
                    ? `${service.avgRating.toFixed(1)} out of 5 · ${service.reviewCount} review${service.reviewCount !== 1 ? "s" : ""}`
                    : "No reviews yet"}
                </span>
              </div>

              <p className={styles.serviceDescription}>{service.description}</p>

              <div className={styles.serviceDetailInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Price</span>
                  <span className={styles.infoValue}>₹{service.price}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Duration</span>
                  <span className={styles.infoValue}>{service.duration}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Category</span>
                  <span className={styles.infoValue}>{service.category}</span>
                </div>
              </div>

              {isOwner && (
                <div className={styles.serviceActions}>
                  <Link to={`/edit-service/${service._id}`} className={styles.editButton}>
                    ✏️ Edit Service
                  </Link>
                  <button onClick={handleDelete} className={styles.deleteButton}>
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>

            {/* REVIEWS CARD */}
            <div className={styles.reviewsSection}>
              <div className={styles.reviewsHeader}>
                <h2 className={styles.reviewsTitle}>⭐ Reviews ({reviews.length})</h2>
                {isLoggedIn && !isOwner && (
                  <button className={styles.writeReviewBtn} onClick={() => setShowReviewModal(true)}>
                    Write a Review
                  </button>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className={styles.noReviews}>
                  <p>No reviews yet. Be the first to review this service!</p>
                </div>
              ) : (
                <div className={styles.reviewsList}>
                  {reviews.map((review) => (
                    <div key={review._id} className={styles.reviewCard}>
                      <div className={styles.reviewCardHeader}>
                        <div className={styles.reviewerAvatar}>
                          {review.reviewerName?.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.reviewerInfo}>
                          <p className={styles.reviewerName}>{review.reviewerName}</p>
                          <p className={styles.reviewDate}>{timeAgo(review.createdAt)}</p>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      {review.comment && (
                        <p className={styles.reviewComment}>{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: booking sidebar */}
          <div className={styles.bookingSidebar}>
            <div className={styles.bookingCard}>
              {/* Price header */}
              <div className={styles.bookingCardHeader}>
                <span className={styles.bookingPrice}>₹{service.price}</span>
                <span className={styles.bookingPricePer}> / {service.duration}</span>
              </div>

              {/* CTA buttons */}
              {!isOwner && isLoggedIn ? (
                <>
                  <button className={styles.bookNowBtn} onClick={() => setShowBookingModal(true)}>
                    📅 Book Now
                  </button>
                  <button className={styles.messageProviderBtn} onClick={handleMessageProvider}>
                    💬 Message Provider
                  </button>
                </>
              ) : !isLoggedIn ? (
                <Link to="/login" className={styles.bookNowBtn}>
                  Login to Book
                </Link>
              ) : (
                <div className={styles.ownerNoteBox}>
                  <span>🏠</span>
                  <p className={styles.ownerNote}>This is your service</p>
                </div>
              )}

              {/* Divider */}
              <div className={styles.bookingCardDivider} />

              {/* Trust features */}
              <div className={styles.bookingCardFeatures}>
                <div className={styles.bookingFeature}>
                  <span>✅</span><span>Instant confirmation</span>
                </div>
                <div className={styles.bookingFeature}>
                  <span>🛡️</span><span>Fully insured</span>
                </div>
                <div className={styles.bookingFeature}>
                  <span>↩️</span><span>Free cancellation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <div className={styles.modalOverlay} onClick={() => setShowBookingModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {bookingSuccess ? (
              <div className={styles.bookingSuccessState}>
                <div className={styles.successIcon}>✅</div>
                <h3>Booking Requested!</h3>
                <p>The provider will confirm your appointment shortly. Check your dashboard for updates.</p>
              </div>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <h2>Book: {service.name}</h2>
                  <button className={styles.modalClose} onClick={() => setShowBookingModal(false)}>✕</button>
                </div>
                <form onSubmit={handleBooking} className={styles.bookingForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Select Date</label>
                    <input
                      type="date" className={styles.input} value={bookingData.date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Select Time</label>
                    <select
                      className={styles.input} value={bookingData.time}
                      onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                      required
                    >
                      <option value="">Choose a time slot</option>
                      {["08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM",
                        "01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Notes for Provider (optional)</label>
                    <textarea
                      className={styles.textarea}
                      placeholder="Any special requirements or information about your pet..."
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className={styles.bookingSummary}>
                    <span>Total</span>
                    <span className={styles.bookingTotal}>₹{service.price}</span>
                  </div>
                  <button type="submit" className={styles.bookNowBtn} disabled={bookingLoading}>
                    {bookingLoading ? "Sending Request..." : "Confirm Booking Request"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div className={styles.modalOverlay} onClick={() => setShowReviewModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Leave a Review</h2>
              <button className={styles.modalClose} onClick={() => setShowReviewModal(false)}>✕</button>
            </div>
            <form onSubmit={handleReview} className={styles.bookingForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Your Rating</label>
                <StarRating
                  rating={reviewData.rating} interactive={true}
                  onRate={(r) => setReviewData({ ...reviewData, rating: r })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Your Review (optional)</label>
                <textarea
                  className={styles.textarea} placeholder="Share your experience..."
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  rows={4}
                />
              </div>
              <button type="submit" className={styles.bookNowBtn} disabled={reviewLoading}>
                {reviewLoading ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}