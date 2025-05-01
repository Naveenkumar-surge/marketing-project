import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "./Components/Homepage";
import AdminDashboard from "./AdminDashboards/AdminDashboard";
import WorkerDashboard from "./Components/WorkerDashboard";
import CustomerDashboard from "./Components/CustomerDashboard";
import { isUserAuthenticated, isAdminAuthenticated, userLogout } from "./services/authService";

// ✅ Toastify Imports
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App: React.FC = () => {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const userInfo = localStorage.getItem("userInfo");
      const user = userInfo ? JSON.parse(userInfo) : null;
      console.log(user);

      if (isAdminAuthenticated()) {
        setAuth(true);
        setUserType("admin");
      } else if (isUserAuthenticated() && user?.userType) {
        setAuth(true);
        setUserType(user.userType);
      } else {
        setAuth(false);
        setUserType(null);
      }

      setLoading(false);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLoginSuccess = () => {
    const userInfo = localStorage.getItem("userInfo");
    const user = userInfo ? JSON.parse(userInfo) : null;

    if (isAdminAuthenticated()) {
      setAuth(true);
      setUserType("admin");
      navigate("/admin-dashboard", { replace: true });
      toast.success("Welcome Admin!");
    } else if (user?.userType === "worker") {
      setAuth(true);
      setUserType("worker");
      navigate("/worker-dashboard", { replace: true });
      toast.success("Welcome Worker!");
    } else if (user?.userType === "customer") {
      setAuth(true);
      setUserType("customer");
      navigate("/customer-dashboard", { replace: true });
      toast.success("Welcome Customer!");
    }
  };

  const handleLogout = () => {
    userLogout();
    setAuth(false);
    setUserType(null);
    navigate("/", { replace: true });
    toast.info("You have been logged out.");
  };

  if (loading) return null; // Replace with spinner if desired

  return (
    <>
      {/* ✅ ToastContainer for showing notifications */}
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        <Route
          path="/"
          element={
            auth && userType ? (
              <Navigate to={`/${userType}-dashboard`} replace />
            ) : (
              <HomePage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            auth && userType === "admin" ? (
              <AdminDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/worker-dashboard"
          element={
            auth && userType === "worker" ? (
              <WorkerDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/customer-dashboard"
          element={
            auth && userType === "customer" ? (
              <CustomerDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="*"
          element={<Navigate to={auth ? `/${userType}-dashboard` : "/"} />}
        />
      </Routes>
    </>
  );
};

export default App;
