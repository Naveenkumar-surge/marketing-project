import { useEffect, useState } from "react";
import { User2 } from 'lucide-react';
import {
  FaTachometerAlt,
  FaBook,
  FaTruck,
  FaSignOutAlt,
  FaHeadset,
  FaUser,
} from "react-icons/fa";
import '../styles/WorkerDashboardMobile.css';
import BookingContent from "./BookingContent";
import TrackingContent from "./TrackingContent";
import Dashboard from "./Dashboard";
import PersonalInfoForm from "./PersonalInfoForm";
import BankDetailsForm from "./BankDetailsForm";
import PaymentStatus from "./PaymentStatus";
import ContactAdminForm from "./ContactAdminForm";
import BookingHistory from "./BookingHistory";

interface WorkerDashboardProps {
  onLogout: () => void;
}

const getUserDetails = () => {
  const userInfo = localStorage.getItem("userInfo");
  return userInfo ? JSON.parse(userInfo) : null;
};

const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ onLogout }) => {
  const [workerName, setWorkerName] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [email, setEmail] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showMyInfoMenu, setShowMyInfoMenu] = useState(false);

  useEffect(() => {
    const user = getUserDetails();
    if (user?.name) {
      setWorkerName(user.name);
      setEmail(user.email);
    }

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeMenu = () => setShowMyInfoMenu(false);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar for Desktop/Tablet */}
      {!isMobile && (
        <aside className="w-60 bg-blue-800 p-4 flex flex-col justify-between shadow-lg text-white">
          <div>
            <h1 className="text-xl font-bold mb-6">Worker Portal</h1>
            <ul className="space-y-3">
              <li className={`nav-item flex items-center gap-2 cursor-pointer ${activeTab === "dashboard" && "font-bold text-blue-300"}`} onClick={() => setActiveTab("dashboard")}>
                <FaTachometerAlt /> Dashboard
              </li>
              <li className={`nav-item flex items-center gap-2 cursor-pointer ${activeTab === "booking" && "font-bold text-blue-300"}`} onClick={() => setActiveTab("booking")}>
                <FaBook /> Booking
              </li>
              <li className={`nav-item flex items-center gap-2 cursor-pointer ${activeTab === "tracking" && "font-bold text-blue-300"}`} onClick={() => setActiveTab("tracking")}>
                <FaTruck /> Tracking
              </li>
              <li className={`nav-item flex items-center gap-2 cursor-pointer ${activeTab === "personal" && "font-bold text-blue-300"}`} onClick={() => setActiveTab("personal")}>
              <User2 size={16} /> Personal Info
              </li>
              <li className={`nav-item flex items-center gap-2 cursor-pointer ${activeTab === "bank" && "font-bold text-blue-300"}`} onClick={() => setActiveTab("bank")}>
                🏦 Bank Details
              </li>
              <li className={`nav-item flex items-center gap-2 cursor-pointer ${activeTab === "paymentStatus" && "font-bold text-blue-300"}`} onClick={() => setActiveTab("paymentStatus")}>
                💰 Payment Status
              </li>
              <li className={`nav-item flex items-center gap-2 cursor-pointer ${activeTab === "GrievancyForm" && "font-bold text-blue-300"}`} onClick={() => setActiveTab("GrievancyForm")}>
                🎫 Raise Ticket
              </li>
              <li className={`nav-item flex items-center gap-2 cursor-pointer ${activeTab === "BookingHistory" && "font-bold text-blue-300"}`} onClick={() => setActiveTab("BookingHistory")}>
                ✅ Completed Work
              </li>
            </ul>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 bg-blue-500 mt-6 text-white py-2 rounded-lg hover:bg-blue-600 px-3 text-sm">
            <FaSignOutAlt /> Logout
          </button>
        </aside>
      )}

      {/* Right Side: Topbar + Main Content */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        
        {/* Topbar for Desktop */}
        <header className="fixed top-0 left-0 right-0 bg-blue-900 text-white px-4 py-2 shadow-md z-50 flex flex-row items-center justify-between">
  {/* Title */}
  <h2 className="text-lg font-semibold">
    Welcome to worker Dashboard
  </h2>

  {/* Logout Button */}
  <button
    onClick={onLogout}
    className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded"
  >
    Logout
  </button>
</header>



        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 mt-16 md:mt-0">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "booking" && <BookingContent />}
          {activeTab === "tracking" && <TrackingContent />}
          {activeTab === "personal" && <PersonalInfoForm email={email} />}
          {activeTab === "bank" && <BankDetailsForm email={email} />}
          {activeTab === "paymentStatus" && <PaymentStatus email={email} />}
          {activeTab === "GrievancyForm" && <ContactAdminForm />}
          {activeTab === "BookingHistory" && <BookingHistory />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && !showMyInfoMenu && (
        <nav className="mobile-nav">
          <button onClick={() => { setActiveTab("dashboard"); setShowMyInfoMenu(false); }} className="text-xs">
            <FaTachometerAlt />
            <span>Dashboard</span>
          </button>
          <button onClick={() => { setActiveTab("booking"); setShowMyInfoMenu(false); }} className="text-xs">
            <FaBook />
            <span>Bookings</span>
          </button>
          <button onClick={() => { setActiveTab("tracking"); setShowMyInfoMenu(false); }} className="text-xs">
            <FaTruck />
            <span>Tracking</span>
          </button>
          <button onClick={() => setShowMyInfoMenu(true)} className="text-xs">
            <FaUser />
            <span>My Info</span>
          </button>
        </nav>
      )}

      {/* Mobile Info Menu Overlay */}
      {isMobile && showMyInfoMenu && (
        <div className="info-overlay">
          <div className="info-overlay-content">
            <button className="text-blue-600 font-semibold mb-4" onClick={closeMenu}>← Back</button>
            <div className="space-y-3">
              <button className="sub-nav-btn" onClick={() => { setActiveTab("personal"); closeMenu(); }}><User2 size={16} /> Personal Info</button>
              <button className="sub-nav-btn" onClick={() => { setActiveTab("bank"); closeMenu(); }}>🏦 Bank Details</button>
              <button className="sub-nav-btn" onClick={() => { setActiveTab("GrievancyForm"); closeMenu(); }}>📩 Grievancy</button>
              <button className="sub-nav-btn" onClick={() => { setActiveTab("BookingHistory"); closeMenu(); }}>✅ Completed Work</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
