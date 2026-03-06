import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./styles.module.css";

export default function Messages() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv._id);
      // Poll for new messages every 5 seconds
      pollRef.current = setInterval(() => fetchMessages(activeConv._id), 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [activeConv]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function fetchConversations() {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/conversations", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await response.json();
      if (response.ok) {
        setConversations(data);
        if (data.length > 0 && !activeConv) setActiveConv(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(convId) {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${convId}`, {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await response.json();
      if (response.ok) setMessages(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;
    setSending(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ conversationId: activeConv._id, text: newMessage.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessages([...messages, data]);
        setNewMessage("");
        // Update conversation list preview
        setConversations(conversations.map((c) =>
          c._id === activeConv._id ? { ...c, lastMessage: newMessage.trim(), lastMessageAt: new Date() } : c
        ));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function getOtherParticipantName(conv) {
    if (!conv.participantNames) return "Unknown";
    const otherUserId = conv.participants.find((p) => p !== user._id?.toString());
    return conv.participantNames[otherUserId] || "Unknown";
  }

  function timeAgo(dateStr) {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

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
            <Link to="/messages" className={`${styles.navLink} ${styles.navLinkActive}`}>Messages</Link>
            <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
          </div>
        </div>
      </nav>

      <div className={styles.messagesPage}>
        {/* CONVERSATIONS SIDEBAR */}
        <div className={styles.conversationsSidebar}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Messages</h2>
            <span className={styles.convCount}>{conversations.length}</span>
          </div>

          {loading ? (
            <div className={styles.loadingConvs}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.convSkeleton}>
                  <div className={styles.skeletonAvatar} />
                  <div className={styles.skeletonLines}>
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLineShort} />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className={styles.noConvs}>
              <p className={styles.noConvsIcon}>💬</p>
              <p>No conversations yet</p>
              <p className={styles.noConvsHint}>
                Message a provider from their service page to start a conversation
              </p>
              <Link to="/services" className={styles.browseServicesLink}>
                Browse Services →
              </Link>
            </div>
          ) : (
            <div className={styles.convsList}>
              {conversations.map((conv) => {
                const otherName = getOtherParticipantName(conv);
                const isActive = activeConv?._id === conv._id;
                return (
                  <div
                    key={conv._id}
                    className={`${styles.convItem} ${isActive ? styles.convItemActive : ""}`}
                    onClick={() => setActiveConv(conv)}
                  >
                    <div className={styles.convAvatar}>
                      {otherName.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.convInfo}>
                      <div className={styles.convHeader}>
                        <span className={styles.convName}>{otherName}</span>
                        <span className={styles.convTime}>{timeAgo(conv.lastMessageAt)}</span>
                      </div>
                      {conv.serviceName && (
                        <span className={styles.convService}>re: {conv.serviceName}</span>
                      )}
                      <p className={styles.convLastMsg}>
                        {conv.lastMessage || "Start the conversation..."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CHAT WINDOW */}
        <div className={styles.chatWindow}>
          {!activeConv ? (
            <div className={styles.noChatSelected}>
              <div className={styles.noChatIcon}>💬</div>
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className={styles.chatHeader}>
                <div className={styles.chatHeaderAvatar}>
                  {getOtherParticipantName(activeConv).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className={styles.chatHeaderName}>{getOtherParticipantName(activeConv)}</h3>
                  {activeConv.serviceName && (
                    <p className={styles.chatHeaderService}>About: {activeConv.serviceName}</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className={styles.messagesContainer}>
                {messages.length === 0 ? (
                  <div className={styles.noMessages}>
                    <p>No messages yet. Say hello! 👋</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId === user._id?.toString();
                    const prevMsg = messages[idx - 1];
                    const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
                    return (
                      <div
                        key={msg._id || idx}
                        className={`${styles.messageWrapper} ${isMe ? styles.messageWrapperMe : styles.messageWrapperThem}`}
                      >
                        {!isMe && showAvatar && (
                          <div className={styles.msgAvatar}>
                            {msg.senderName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className={`${styles.messageBubble} ${isMe ? styles.messageBubbleMe : styles.messageBubbleThem}`}>
                          {!isMe && showAvatar && (
                            <span className={styles.msgSenderName}>{msg.senderName}</span>
                          )}
                          <p className={styles.msgText}>{msg.text}</p>
                          <span className={styles.msgTime}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form className={styles.messageInputArea} onSubmit={sendMessage}>
                <input
                  type="text"
                  className={styles.messageInput}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                />
                <button
                  type="submit"
                  className={styles.sendBtn}
                  disabled={sending || !newMessage.trim()}
                >
                  {sending ? "..." : "➤"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}