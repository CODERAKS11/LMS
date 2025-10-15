import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import moment from "moment";
import { toast } from "react-toastify";
import SearchCatalog from "./SearchCatalog";
import React from "react";

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renewing, setRenewing] = useState(false);

  // Modal states - ADDED NEW STATES FOR MODAL/FULL-PAGE VIEWS
  const [showCatalog, setShowCatalog] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  // Simulating navigation effects for these, which would typically be separate routes
  const [showReadingChallenges, setShowReadingChallenges] = useState(false);
  const [showBookClubs, setShowBookClubs] = useState(false);
  const [showRecommendedBooks, setShowRecommendedBooks] = useState(false); 

  const [notifications, setNotifications] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  // Consolidated activeTab for the main profile content
  const [activeTab, setActiveTab] = useState("profile"); 
  const [recommendedBooks, setRecommendedBooks] = useState([]);

  const userId = localStorage.getItem("user_id");

  // Department-based book recommendations (CONSERVED)
  const DEPARTMENT_RECOMMENDATIONS = {
    IT: [
      {
        id: "it001",
        title: "Computer Networking: A Top-Down Approach (7th Edition)",
        author: "James F. Kurose and Keith W. Ross",
        reason: "Comprehensive understanding of modern computer networks using top-down approach.",
      },
      {
        id: "it002",
        title: "Database System Concepts (7th Edition)",
        author: "Abraham Silberschatz, Henry F. Korth, and S. Sudarshan",
        reason: "Core textbook for relational databases, SQL, and transaction management.",
      },
      {
        id: "it003",
        title: "Operating System Concepts (10th Edition)",
        author: "Abraham Silberschatz, Peter B. Galvin, and Greg Gagne",
        reason: "Fundamental principles behind modern operating systems.",
      },
      {
        id: "it004",
        title: "Artificial Intelligence: A Modern Approach (4th Edition)",
        author: "Stuart Russell and Peter Norvig",
        reason: "Definitive guide to AI fundamentals, from search algorithms to deep learning.",
      },
      {
        id: "it005",
        title: "Introduction to Machine Learning with Python",
        author: "Andreas C. Müller and Sarah Guido",
        reason: "Practical guide for applying machine learning algorithms using Python and scikit-learn.",
      },
      {
        id: "it006",
        title: "Data Structures and Algorithm Analysis in C++",
        author: "Mark Allen Weiss",
        reason: "Classic textbook explaining efficient data structures and algorithm design.",
      },
      {
        id: "it007",
        title: "Computer Organization and Design: The Hardware/Software Interface",
        author: "David A. Patterson and John L. Hennessy",
        reason: "Covers digital logic, CPU architecture, and hardware-software interaction.",
      },
      {
        id: "it008",
        title: "Pattern Recognition and Machine Learning",
        author: "Christopher M. Bishop",
        reason: "Mathematical foundations of pattern recognition and probabilistic learning models.",
      },
      {
        id: "it009",
        title: "Web Technologies: HTML, CSS, JavaScript, PHP, and MySQL",
        author: "Uttam K. Roy",
        reason: "Practical introduction to modern web development and dynamic web applications.",
      },
      {
        id: "it010",
        title: "The Elements of Statistical Learning",
        author: "Trevor Hastie, Robert Tibshirani, and Jerome Friedman",
        reason: "Comprehensive text on statistical models and machine learning methods.",
      },
    ],
    ComputerScience: [
      {
        id: "cs001",
        title: "Introduction to Algorithms",
        author: "Cormen, Leiserson, Rivest, Stein",
        reason: "Comprehensive algorithms reference.",
      },
      {
        id: "cs002",
        title: "Structure and Interpretation of Computer Programs",
        author: "Abelson, Sussman",
        reason: "Foundational computer science concepts.",
      },
      {
        id: "cs003",
        title: "Computer Networks",
        author: "Andrew S. Tanenbaum",
        reason: "Essential networking knowledge.",
      },
      {
        id: "cs004",
        title: "Artificial Intelligence: A Modern Approach",
        author: "Russell, Norvig",
        reason: "Comprehensive AI textbook.",
      },
      {
        id: "cs005",
        title: "The Pragmatic Programmer",
        author: "Andrew Hunt, David Thomas",
        reason: "Practical software development advice.",
      },
    ],
    Electrical: [
      {
        id: "ee001",
        title: "The Art of Electronics",
        author: "Horowitz, Hill",
        reason: "Comprehensive electronics reference.",
      },
      {
        id: "ee002",
        title: "Microelectronic Circuits",
        author: "Sedra, Smith",
        reason: "Fundamental circuit analysis.",
      },
      {
        id: "ee003",
        title: "Digital Design and Computer Architecture",
        author: "Harris, Harris",
        reason: "Digital systems and architecture.",
      },
      {
        id: "ee004",
        title: "Power System Analysis",
        author: "John J. Grainger",
        reason: "Power systems engineering.",
      },
      {
        id: "ee005",
        title: "Control Systems Engineering",
        author: "Norman S. Nise",
        reason: "Control theory and applications.",
      },
    ],
    Mechanical: [
      {
        id: "me001",
        title: "Shigleys Mechanical Engineering Design",
        author: "Budynas, Nisbett",
        reason: "Mechanical design fundamentals.",
      },
      {
        id: "me002",
        title: "Introduction to Fluid Mechanics",
        author: "Fox, McDonald",
        reason: "Fluid dynamics principles.",
      },
      {
        id: "me003",
        title: "Heat and Mass Transfer",
        author: "Cengel, Ghajar",
        reason: "Thermodynamics and heat transfer.",
      },
      {
        id: "me004",
        title: "Mechanics of Materials",
        author: "Beer, Johnston",
        reason: "Stress analysis and material behavior.",
      },
      {
        id: "me005",
        title: "Theory of Machines and Mechanisms",
        author: "Uicker, Pennock, Shigley",
        reason: "Machine design and kinematics.",
      },
    ],
    Civil: [
      {
        id: "ce001",
        title: "Structural Analysis",
        author: "R. C. Hibbeler",
        reason: "Structural engineering principles.",
      },
      {
        id: "ce002",
        title: "Principles of Geotechnical Engineering",
        author: "Braja M. Das",
        reason: "Soil mechanics and foundations.",
      },
      {
        id: "ce003",
        title: "Transportation Engineering",
        author: "C. Jotin Khisty",
        reason: "Transportation systems planning.",
      },
      {
        id: "ce004",
        title: "Water Resources Engineering",
        author: "Larry W. Mays",
        reason: "Hydrology and water systems.",
      },
      {
        id: "ce005",
        title: "Building Construction Illustrated",
        author: "Francis D.K. Ching",
        reason: "Construction methods and materials.",
      },
    ],
  };

  // Predefined badge names (CONSERVED)
  const BADGE_NAMES = {
    // Reading milestones
    first_book: "📖 First Book Read",
    five_books: "📚 5 Books Club",
    ten_books: "🔥 10 Books Master",
    twenty_books: "🏆 20 Books Champion",
    fifty_books: "🌟 50 Books Legend",

    // Consistency badges
    weekly_reader: "📅 Weekly Reader",
    monthly_champion: "📆 Monthly Champion",
    streak_7: "⚡ 7-Day Streak",
    streak_30: "💫 30-Day Streak",

    // Genre badges
    fiction_lover: "🎭 Fiction Lover",
    nonfiction_expert: "🔬 Non-Fiction Expert",
    scifi_fan: "🚀 Sci-Fi Fan",
    mystery_solver: "🕵️ Mystery Solver",
    history_buff: "🏛️ History Buff",

    // Special achievements
    fast_reader: "⚡ Speed Reader",
    reviewer: "✍️ Avid Reviewer",
    book_club: "👥 Book Club Member",
    recommender: "💡 Book Recommender",
    explorer: "🧭 Genre Explorer",
  };

  // Predefined milestone names (CONSERVED)
  const MILESTONE_NAMES = {
    books_5: "5 Books Read",
    books_10: "10 Books Read",
    books_25: "25 Books Read",
    books_50: "50 Books Read",
    books_100: "100 Books Read",
    year_2024: "2024 Reading Goal",
    year_2025: "2025 Reading Goal",
    department_top: "Department Top Reader",
    speed_reader: "Speed Reading Master",
    consistent_reader: "Consistent Reader",
  };

  const getHeaders = useCallback(() => {
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required.");
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  }, []);

  // Helper function to safely extract array data (CONSERVED)
  const getSafeArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === "object") {
      // If it's an object with numeric keys, convert to array
      const hasNumericKeys = Object.keys(data).some((key) => !isNaN(key));
      if (hasNumericKeys) {
        return Object.values(data);
      }
      // If it's a single object, wrap in array
      return [data];
    }
    return [];
  };

  // Helper to extract text from character-based object structure (CONSERVED)
  const extractTextFromCharacterObject = (obj) => {
    if (!obj || typeof obj !== "object") return "";

    // Extract characters from numeric keys and sort them
    const characters = Object.keys(obj)
      .filter((key) => !isNaN(key)) // Only numeric keys
      .sort((a, b) => parseInt(a) - parseInt(b)) // Sort by numeric value
      .map((key) => obj[key]) // Get the character
      .join(""); // Join into string

    return characters;
  };

  // Improved helper function to extract meaningful badge/milestone name (CONSERVED)
  const getAchievementName = (item, type = "badge") => {
    if (!item) return type === "badge" ? "🏅 Achievement" : "🎯 Milestone";

    // If it's a string, try to map it to a predefined name
    if (typeof item === "string") {
      const nameMap = type === "badge" ? BADGE_NAMES : MILESTONE_NAMES;
      return nameMap[item] || formatCustomName(item);
    }

    // If it's an object, look for type or name fields
    if (typeof item === "object" && item !== null) {
      // First, check if this is a character-based object (like {0: 'F', 1: 'i', ...})
      const extractedText = extractTextFromCharacterObject(item);
      if (extractedText) {
        // Map the extracted text to a predefined name
        const nameMap = type === "badge" ? BADGE_NAMES : MILESTONE_NAMES;

        // Try to match the extracted text with our predefined names
        const lowerText = extractedText.toLowerCase();
        if (lowerText.includes("first") && lowerText.includes("book")) {
          return nameMap["first_book"] || "📖 First Book Read";
        }
        if (lowerText.includes("five") || lowerText.includes("5")) {
          return nameMap["five_books"] || "📚 5 Books Club";
        }
        if (lowerText.includes("ten") || lowerText.includes("10")) {
          return nameMap["ten_books"] || "🔥 10 Books Master";
        }

        // If no specific match, use the extracted text
        return extractedText;
      }

      // Check for type field first (most common)
      if (item.type) {
        const nameMap = type === "badge" ? BADGE_NAMES : MILESTONE_NAMES;
        return nameMap[item.type] || formatCustomName(item.type);
      }

      // Check for name field
      if (item.name) {
        const nameMap = type === "badge" ? BADGE_NAMES : MILESTONE_NAMES;
        return nameMap[item.name] || formatCustomName(item.name);
      }

      // Check for other common fields
      const possibleFields = [
        "badgeType",
        "milestoneType",
        "achievement",
        "title",
      ];
      for (const field of possibleFields) {
        if (item[field]) {
          const nameMap = type === "badge" ? BADGE_NAMES : MILESTONE_NAMES;
          return nameMap[item[field]] || formatCustomName(item[field]);
        }
      }

      // If no identifiable field, generate based on _id or index
      if (item._id) {
        return formatCustomName(item._id);
      }
    }

    // Fallback
    return type === "badge" ? "🏅 Reading Achievement" : "🎯 Reading Milestone";
  };

  // Helper to format custom names (CONSERVED)
  const formatCustomName = (str) => {
    if (!str) return "Achievement";

    const strString = String(str);

    // If it looks like an ID, generate a generic name
    if (
      strString.length > 10 &&
      (strString.includes("_") || /^[0-9a-f]{24}$/i.test(strString))
    ) {
      // Generate name based on some logic
      const totalBooks = user?.totalBooksRead || 0;
      if (totalBooks >= 50) return "🌟 Reading Legend";
      if (totalBooks >= 25) return "🔥 Avid Reader";
      if (totalBooks >= 10) return "📚 Book Enthusiast";
      if (totalBooks >= 5) return "📖 Book Lover";
      return "📖 First Steps";
    }

    // Convert snake_case or camelCase to readable format
    return strString
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .trim();
  };

  // Format date for display (CONSERVED)
  const formatBadgeDate = (dateString) => {
    if (!dateString) return "";
    return moment(dateString).format("MMM DD, YYYY");
  };

  // Get appropriate emoji for badge type (CONSERVED)
  const getBadgeEmoji = (badgeName) => {
    if (badgeName.includes("First")) return "📖";
    if (badgeName.includes("5 Books")) return "📚";
    if (badgeName.includes("10 Books")) return "🔥";
    if (badgeName.includes("20 Books")) return "🏆";
    if (badgeName.includes("50 Books")) return "🌟";
    if (badgeName.includes("Streak")) return "⚡";
    if (badgeName.includes("Weekly")) return "📅";
    if (badgeName.includes("Monthly")) return "📆";
    if (badgeName.includes("Fiction")) return "🎭";
    if (badgeName.includes("Non-Fiction")) return "🔬";
    if (badgeName.includes("Sci-Fi")) return "🚀";
    if (badgeName.includes("Mystery")) return "🕵️";
    if (badgeName.includes("History")) return "🏛️";
    if (badgeName.includes("Speed")) return "⚡";
    if (badgeName.includes("Review")) return "✍️";
    if (badgeName.includes("Club")) return "👥";
    if (badgeName.includes("Recommend")) return "💡";
    if (badgeName.includes("Explorer")) return "🧭";
    return "🏅";
  };

  // Get appropriate emoji for milestone type (CONSERVED)
  const getMilestoneEmoji = (milestoneName) => {
    if (milestoneName.includes("5 Books")) return "📚";
    if (milestoneName.includes("10 Books")) return "🔥";
    if (milestoneName.includes("25 Books")) return "⭐";
    if (milestoneName.includes("50 Books")) return "🌟";
    if (milestoneName.includes("100 Books")) return "🏆";
    if (milestoneName.includes("2024") || milestoneName.includes("2025"))
      return "📅";
    if (milestoneName.includes("Top Reader")) return "👑";
    if (milestoneName.includes("Speed")) return "⚡";
    if (milestoneName.includes("Consistent")) return "📊";
    return "🎯";
  };

  // 🔄 Fetch User Data (CONSERVED)
  const fetchUserData = useCallback(async () => {
    if (!userId) {
      console.error("No user ID found. Redirecting to login...");
      navigate("/login");
      return;
    }

    const headers = getHeaders();
    if (!headers) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:3001/api/users/${userId}`, {
        headers,
        timeout: 10000,
      });

      const userData =
        Array.isArray(res.data) && res.data.length > 0
          ? res.data[0]
          : res.data;

      if (userData && userData.name) {
        setUser(userData);

        // Set recommended books based on user's department
        if (userData.department) {
          const deptKey = Object.keys(DEPARTMENT_RECOMMENDATIONS).find(
            (key) => key.toLowerCase() === userData.department.toLowerCase()
          );

          if (deptKey) {
            setRecommendedBooks(DEPARTMENT_RECOMMENDATIONS[deptKey]);
          } else {
            // Default to IT if department not found
            setRecommendedBooks(DEPARTMENT_RECOMMENDATIONS.IT); 
          }
        } else {
            // Default to IT if department is missing
            setRecommendedBooks(DEPARTMENT_RECOMMENDATIONS.IT); 
        }
      } else {
        setError("Profile data is incomplete or missing.");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load user data. Please try again.");
      setLoading(false);
    }
  }, [navigate, userId, getHeaders]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // 🏆 Fetch Leaderboard Data (MODIFIED to only show the modal on success)
  const fetchLeaderboard = useCallback(async () => {
    const headers = getHeaders();
    if (!headers) return;

    try {
      const userRes = await axios.get("http://localhost:3001/api/admin/users", {
        headers,
      });
      const allUsers = userRes.data;

      const sortedLeaderboard = allUsers
        .map((u) => ({
          id: u._id,
          name: u.name,
          role: u.role,
          // Assuming 'totalBooksRead' might be a better metric than 'borrowedBooks.length' for "Books Read"
          totalBorrowed: u.totalBooksRead || u.borrowedBooks?.length || 0, 
        }))
        .sort((a, b) => b.totalBorrowed - a.totalBorrowed)
        .slice(0, 10);

      setLeaderboard(sortedLeaderboard);
      setShowLeaderboard(true); // Open modal on success
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast.error("Failed to fetch leaderboard data.");
      setLeaderboard([]);
    }
  }, [getHeaders]);

  // 🔔 Fetch Notifications (MODIFIED to only show the modal on success)
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(
        "http://localhost:3001/api/users/notifications?unread=true",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications(res.data);
      setShowNotifications(true); // Open modal on success
    } catch (error) {
      setNotifications([]);
      setShowNotifications(true); // Still open modal to show 'No notifications found'
      console.error("Error fetching notifications:", error);
    }
  };

  // Mark notification as read (NEW FEATURE)
  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `http://localhost:3001/api/users/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== notificationId)
      );
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  // Mark all notifications as read (NEW FEATURE)
  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const unreadIds = notifications.map((n) => n._id);

      // Optimistically clear the local state before API calls
      setNotifications([]); 
      
      // Batch API calls (or use a dedicated bulk endpoint if available)
      await Promise.all(unreadIds.map(id => 
        axios.put(
          `http://localhost:3001/api/users/notifications/${id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ));
      
      toast.success("All notifications marked as read");
    } catch (error) {
      // Re-fetch or set back to previous state if bulk fails
      fetchNotifications();
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read. Please try again.");
    }
  };

  // 🔁 Handle Renew (CONSERVED)
  const handleRenew = async (bookId) => {
    if (renewing) return;
    setRenewing(true);

    const authToken = localStorage.getItem("authToken");
    if (!authToken) return alert("Authentication token missing.");

    try {
      const res = await axios.put(
        `http://localhost:3001/api/books/renew/${bookId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      toast.success(res.data.message);
      fetchUserData();
    } catch (error) {
      console.error("Error renewing book:", error);
      toast.error(error.response?.data?.message || "Failed to renew the book.");
    } finally {
      setRenewing(false);
    }
  };

  // ✍️ Handle Review (CONSERVED)
  const handleReview = (bookId) => {
    const reviewText = prompt("Enter your review:");
    const rating = prompt("Enter your rating (0-5):");

    if (reviewText && rating) {
      const token = localStorage.getItem("authToken");
      axios
        .post(
          `http://localhost:3001/api/users/review/${bookId}`,
          { reviewText, rating },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then(() => {
          toast.success("Review submitted successfully!");
          fetchUserData();
        })
        .catch((error) => {
          console.error("Error submitting review:", error);
          toast.error("Failed to submit review.");
        });
    }
  };

  // The original component's modal logic was flawed as it was nested within the main return.
  // The new structure uses conditional rendering for MODALS OUTSIDE the main profile body.
  // The main profile body only renders if no modal is active.

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl">
        Loading...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p>{error || "No user data found."}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const borrowedBooks = Array.isArray(user.borrowedBooks)
    ? user.borrowedBooks
    : [];
  const safeBadges = getSafeArray(user.badges);
  const safeMilestones = getSafeArray(user.milestones);
  const safeReservations = getSafeArray(user.reservations);

  // Check if any modal is currently active. If so, only render the modal.
  const isModalActive =
    showCatalog ||
    showNotifications ||
    showLeaderboard ||
    showReadingChallenges ||
    showBookClubs ||
    showRecommendedBooks;

  // The main return wraps all the conditional logic in a parent div.
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      {/* This is the main profile view. It only renders when no modal/full-page view is active.
        This provides a cleaner, single-view per state.
      */}
      {!isModalActive && (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header and Buttons - MODIFIED BUTTONS TO SET MODAL STATE */}
          <div className="bg-blue-600 text-white py-4 px-6 flex flex-wrap justify-between items-center gap-2">
            <h2 className="text-3xl font-bold">User Profile</h2>
            <div className="flex flex-wrap space-x-2">
              <button
                onClick={fetchLeaderboard}
                className="bg-purple-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-purple-600"
              >
                🏆 View Leaderboard
              </button>
              <button
                onClick={() => setShowCatalog(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600"
              >
                🔍 Search Catalog
              </button>
              <button
                onClick={fetchNotifications}
                className="bg-yellow-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-yellow-600"
              >
                🔔 Notifications
              </button>
               <button

              onClick={() => navigate("/reading-challenges")}

              className="bg-orange-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-orange-600"

            >

              🎯 Reading Challenges

            </button>
              <button

              onClick={() => navigate("/book-clubs")}

              className="bg-teal-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-teal-600"

            >

              📖 Book Clubs

            </button>
              <button
                onClick={() => setShowRecommendedBooks(true)}
                className="bg-indigo-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-600"
              >
                📚 Recommended
              </button>
            </div>
          </div>

          {/* Tab Navigation for Main Profile */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "profile"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("achievements")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "achievements"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                🏆 Achievements
              </button>
              <button
                onClick={() => setActiveTab("reservations")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "reservations"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                ⏳ Reservations
              </button>
              <button
              onClick={() => {
                localStorage.removeItem("authToken");
                localStorage.removeItem("user_id");
                navigate("/login");
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
            >
              Logout
            </button>
            </nav>
            
          </div>

          <div className="p-6">
            {/* --- Profile & Loan Tab Content --- */}
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Details */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 border-b pb-2">Personal Details</h3>
                  <p className="text-lg">
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p className="text-lg">
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p className="text-lg">
                    <strong>Role:</strong> {user.role}
                  </p>
                  <p className="text-lg">
                    <strong>Department:</strong> {user.department}
                  </p>
                  <p className="text-lg">
                    <strong>Phone:</strong> {user.phone}
                  </p>
                </div>

                {/* Borrowed Books */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-md max-h-[500px] overflow-y-auto">
                  <h3 className="text-xl font-semibold mb-4 border-b pb-2">
                    Current Loans
                  </h3>
                  <p className="text-lg mb-4">
                    <strong>Total Books Borrowed:</strong>{" "}
                    {
                      borrowedBooks.filter((book) => book.status === "borrowed")
                        .length
                    }
                  </p>
                  {borrowedBooks.filter((book) => book.status === "borrowed")
                    .length > 0 ? (
                    <ul className="space-y-4">
                      {borrowedBooks
                        .filter((book) => book.status === "borrowed")
                        .map((book, index) => (
                          <li key={index} className="border-b pb-4">
                            <p>
                              <strong>Book ID:</strong> {book.bookId}
                            </p>
                            <p>
                              <strong>Title:</strong> {book.bookTitle}
                            </p>
                            <p>
                              <strong>Author:</strong> {book.bookAuthor}
                            </p>
                            <p>
                              <strong>Borrowed Date:</strong>{" "}
                              {moment(book.borrowedDate).format("DD-MM-YYYY")}
                            </p>
                            <p>
                              <strong>Due Date:</strong>{" "}
                              {moment(book.dueDate).format("DD-MM-YYYY")}
                            </p>
                            <p>
                              <strong>Status:</strong> {book.status}
                            </p>
                            <p>
                              <strong>Renewals:</strong> {book.renewals}
                            </p>

                            <div className="bg-gray-100 p-2 mt-2 rounded-md">
                              <h4 className="text-sm font-semibold">
                                Renewal History:
                              </h4>
                              {book.renewalHistory &&
                              Array.isArray(book.renewalHistory) &&
                              book.renewalHistory.length > 0 ? (
                                book.renewalHistory.map((renew, idx) => (
                                  <div key={idx}>
                                    <p>
                                      <strong>Renewed:</strong>{" "}
                                      {moment(renew.renewedDate).format(
                                        "DD-MM-YYYY"
                                      )}
                                    </p>
                                    <p>
                                      <strong>New Due Date:</strong>{" "}
                                      {moment(renew.newDueDate).format(
                                        "DD-MM-YYYY"
                                      )}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <p>No renewals yet</p>
                              )}
                            </div>
                            
                            {/* Renew Button */}
                            {book.status !== "returned" && (
                              <button
                                onClick={() => handleRenew(book.bookId)}
                                disabled={renewing}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 disabled:opacity-50"
                              >
                                {renewing ? "Renewing..." : "Renew Book"}
                              </button>
                            )}

                            {/* Review Section for Returned Books */}
                            <div className="mt-4">
                              {book.review ? (
                                <div className="bg-green-100 p-4 rounded-lg">
                                  <h4 className="text-sm font-semibold text-green-700">
                                    Your Review:
                                  </h4>
                                  <p>
                                    <strong>Review:</strong>{" "}
                                    {book.review.reviewText}
                                  </p>
                                  <p>
                                    <strong>Rating:</strong> {book.review.rating}
                                    /5
                                  </p>
                                </div>
                              ) : (
                                book.status === "returned" && (
                                  <button
                                    onClick={() => handleReview(book.bookId)}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
                                  >
                                    Review Book
                                  </button>
                                )
                              )}
                            </div>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p>No books currently borrowed.</p>
                  )}
                </div>
              </div>
            )}

            {/* --- Achievements Tab Content --- */}
            {activeTab === "achievements" && (
              <div className="bg-yellow-50 p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">
                  Reading Achievements
                </h3>
                <p className="text-lg mb-6">
                  <strong>Total Books Read:</strong> {user.totalBooksRead || 0}
                </p>

                {/* Badges Section */}
                <div className="mt-4">
                  <h4 className="text-lg font-semibold mb-3">
                    🏅 Badges Earned
                  </h4>
                  {safeBadges.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {safeBadges.map((badge, idx) => {
                        const badgeName = getAchievementName(badge, "badge");
                        const badgeEmoji = getBadgeEmoji(badgeName);
                        return (
                          <div
                            key={idx}
                            className="bg-white border border-yellow-300 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-yellow-700">
                                  {badgeEmoji} {badgeName}
                                </p>
                                {badge.earnedAt && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Earned: {formatBadgeDate(badge.earnedAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No badges earned yet. Start reading to earn badges!
                    </p>
                  )}
                </div>

                {/* Milestones Section */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-3">
                    🎯 Milestones Reached
                  </h4>
                  {safeMilestones.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {safeMilestones.map((milestone, idx) => {
                        const milestoneName = getAchievementName(
                          milestone,
                          "milestone"
                        );
                        const milestoneEmoji = getMilestoneEmoji(milestoneName);
                        return (
                          <div
                            key={idx}
                            className="bg-white border border-green-300 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-green-700">
                                  {milestoneEmoji} {milestoneName}
                                </p>
                                {milestone.earnedAt && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Achieved:{" "}
                                    {formatBadgeDate(milestone.earnedAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No milestones reached yet. Keep reading to reach
                      milestones!
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* --- Reservations Tab Content --- */}
            {activeTab === "reservations" && (
              <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">
                  Reservations
                </h3>
                {safeReservations.length > 0 ? (
                  <ul className="space-y-4">
                    {safeReservations.map((reservation, index) => (
                      <li key={index} className="border-b pb-4">
                        <p>
                          <strong>Book Title:</strong> {reservation.bookTitle}
                        </p>
                        <p>
                          <strong>Reserved Date:</strong>{" "}
                          {moment(reservation.reservedDate).format(
                            "DD-MM-YYYY"
                          )}
                        </p>
                        <p>
                          <strong>Status:</strong> {reservation.status}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No reservations made.</p>
                )}
              </div>
            )}
          </div>

          
        </div>
      )}

      {/* -------------------- MODALS/FULL-PAGE OVERLAYS -------------------- 
        These are rendered outside the main profile block when their state is true.
        They cover the page (or are centered on it) and typically have a clear close mechanism.
      */}

      {/* Search Catalog Modal */}
      {showCatalog && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-start pt-10 pb-10 z-50 overflow-y-auto">
          <div className="max-w-6xl w-full mx-auto bg-white rounded-lg shadow-2xl">
            <div className="bg-green-600 text-white py-4 px-6 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-3xl font-bold">🔍 Search Catalog</h2>
              <button
                onClick={() => setShowCatalog(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600"
              >
                Close Catalog
              </button>
            </div>
            <div className="p-6">
              <SearchCatalog />
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4 sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-800">
                🔔 Notifications
              </h3>
              <div className="flex space-x-2">
                {notifications.length > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="bg-blue-500 text-white px-3 py-1 text-sm rounded-md shadow-md hover:bg-blue-600"
                  >
                    Mark All as Read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="bg-red-500 text-white px-3 py-1 text-sm rounded-md shadow-md hover:bg-red-600"
                >
                  Close
                </button>
              </div>
            </div>
            {notifications.length > 0 ? (
              <ul className="space-y-4">
                {notifications.map((note, idx) => (
                  <li
                    key={idx}
                    className={`border-b pb-4 flex justify-between items-start transition-colors duration-150 ${note.isRead ? 'bg-gray-50' : 'bg-yellow-50'} p-3 rounded-lg`}
                  >
                    <div className="flex-1 pr-4">
                      <span className="font-medium capitalize text-blue-700">
                        {note.type}:
                      </span>{" "}
                      {note.message}
                      <span className="text-xs text-gray-500 ml-2 block mt-1">
                        {note.createdAt
                          ? new Date(note.createdAt).toLocaleString()
                          : ""}
                      </span>
                    </div>
                    {!note.isRead && (
                      <button
                        onClick={() => markNotificationAsRead(note._id)}
                        className="flex-shrink-0 ml-4 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        Mark Read
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-8 text-gray-500">
                No unread notifications found.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4 sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-800">
                🏆 Top 10 Readers Leaderboard
              </h3>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => setShowLeaderboard(false)}
              >
                Close
              </button>
            </div>
            {leaderboard.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                Loading or no data available.
              </p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider">
                      Books Read
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {leaderboard.map((u, index) => (
                    <tr
                      key={u.id}
                      className={`transition-colors duration-150 ${
                        u.id === userId
                          ? "bg-yellow-100 font-bold"
                          : index % 2 === 0
                          ? "bg-gray-50"
                          : "bg-white"
                      } hover:bg-blue-50`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {index + 1 === 1 && <span className="text-yellow-600">🥇</span>}
                        {index + 1 === 2 && <span className="text-gray-500">🥈</span>}
                        {index + 1 === 3 && <span className="text-amber-700">🥉</span>}
                        {index + 1 > 3 ? index + 1 : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {u.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {u.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-extrabold">
                        {u.totalBorrowed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                {leaderboard.find((u) => u.id === userId)
                  ? `You are ranked #${
                      leaderboard.findIndex((u) => u.id === userId) + 1
                    } on the leaderboard!`
                  : "Your rank will appear here once your reading data is available."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Books Modal */}
      {showRecommendedBooks && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4 sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-800">
                📚 Recommended Reading List
              </h3>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => setShowRecommendedBooks(false)}
              >
                Close
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Curated book recommendations for{" "}
              <span className="font-semibold text-blue-600">
                {user.department || "your"}
              </span>{" "}
              department
            </p>

            {recommendedBooks.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-1">
                {recommendedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {book.title}
                        </h3>
                        <p className="text-gray-600">by {book.author}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {book.reason}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowRecommendedBooks(false);
                          setShowCatalog(true);
                          toast.info(
                            `Searching for "${book.title}" in catalog...`
                          );
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex-shrink-0 ml-4"
                      >
                        Find in Catalog
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No recommendations available for your department.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reading Challenges Modal (Simulated) */}
      {showReadingChallenges && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-xl w-full">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-2xl font-bold text-orange-600">
                🎯 Reading Challenges
              </h3>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => setShowReadingChallenges(false)}
              >
                Close
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-xl text-gray-700 font-semibold">
                Reading Challenges feature is under development!
              </p>
              <p className="text-md text-gray-500 mt-3">
                Soon you'll be able to set personal reading goals, track your
                progress, and compete with friends.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Book Clubs Modal (Simulated) */}
      {showBookClubs && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-xl w-full">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-2xl font-bold text-teal-600">
                📖 Book Clubs
              </h3>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => setShowBookClubs(false)}
              >
                Close
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-xl text-gray-700 font-semibold">
                Book Clubs feature is coming soon!
              </p>
              <p className="text-md text-gray-500 mt-3">
                Organize, join, and discuss books with clubs dedicated to your
                favorite genres or department topics.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;