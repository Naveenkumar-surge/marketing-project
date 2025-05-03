import { useState } from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaUser,
  FaBook,
  FaTruck,
  FaMoneyBill,
  FaSignOutAlt,
  FaEllipsisH,
} from "react-icons/fa";
import Dashboard from "./Dashboard";
import WorkerDetails from "./WorkerDetails";
import CustomerDetails from "./CustomerDetails";
import CustomerDetailsHistory from "./CustomerDetailsHistory";
import WorkerDetailsHistory from "./WorkDetailsHistory";
import BookingDetails from "./BookingDetails";
import TrackingDetails from "./TrackingDetails";
import PaymentStatus from "./PaymentStatus";

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showMore, setShowMore] = useState(false);

  const renderMainContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "workers":
        return <WorkerDetails />;
      case "workersdetails":
        return <WorkerDetailsHistory />;
      case "customers":
        return <CustomerDetails />;
      case "CustomersDetails":
        return <CustomerDetailsHistory />;
      case "bookings":
        return <BookingDetails />;
      case "tracking":
        return <TrackingDetails />;
      case "payments":
        return <PaymentStatus />;
      default:
        return <Dashboard />;
    }
  };

  return (
    
    <div className="h-screen bg-gray-100 flex flex-col md:flex-row">
      <div className="flex justify-between items-center bg-blue-900 text-white p-4 md:hidden">
        <h1 className="text-xl font-bold">Welcome to Admin Panel</h1>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-white text-sm"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-60 bg-blue-900 p-5 flex-col justify-between shadow-lg text-white">
        <div>
          <h1 className="text-xl font-bold mb-5">Admin Panel</h1>
          <ul className="space-y-4">
            <li className={`cursor-pointer ${activeTab === "dashboard" && "text-yellow-300"}`} onClick={() => setActiveTab("dashboard")}>
              <FaTachometerAlt className="inline mr-2" /> Dashboard
            </li>
            <li className={`cursor-pointer ${activeTab === "workers" && "text-yellow-300"}`} onClick={() => setActiveTab("workers")}>
              <FaUsers className="inline mr-2" /> Worker Details
            </li>
            <li className={`cursor-pointer ${activeTab === "workersdetails" && "text-yellow-300"}`} onClick={() => setActiveTab("workersdetails")}>
              <FaUsers className="inline mr-2" /> Approved Workers
            </li>
            <li className={`cursor-pointer ${activeTab === "customers" && "text-yellow-300"}`} onClick={() => setActiveTab("customers")}>
              <FaUser className="inline mr-2" /> Customer Details
            </li>
            <li className={`cursor-pointer ${activeTab === "CustomersDetails" && "text-yellow-300"}`} onClick={() => setActiveTab("CustomersDetails")}>
              <FaUser className="inline mr-2" /> Approved Customers
            </li>
            <li className={`cursor-pointer ${activeTab === "bookings" && "text-yellow-300"}`} onClick={() => setActiveTab("bookings")}>
              <FaBook className="inline mr-2" /> Booking Details
            </li>
            <li className={`cursor-pointer ${activeTab === "tracking" && "text-yellow-300"}`} onClick={() => setActiveTab("tracking")}>
              <FaTruck className="inline mr-2" /> Tracking
            </li>
            <li className={`cursor-pointer ${activeTab === "payments" && "text-yellow-300"}`} onClick={() => setActiveTab("payments")}>
              <FaMoneyBill className="inline mr-2" /> Payment Status
            </li>
          </ul>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-white text-sm"
        >
          <FaSignOutAlt /> Logout
        </button>
      </aside>
       
      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">{renderMainContent()}</main>

      {/* Bottom Nav for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-blue-900 text-white flex justify-around items-center p-3 border-t z-50">
        <button onClick={() => setActiveTab("dashboard")} className="flex flex-col items-center">
          <FaTachometerAlt />
          <span className="text-xs">Dashboard</span>
        </button>
        <button onClick={() => setActiveTab("workers")} className="flex flex-col items-center">
          <FaUsers />
          <span className="text-xs">Workers</span>
        </button>
        <button onClick={() => setActiveTab("customers")} className="flex flex-col items-center">
          <FaUser />
          <span className="text-xs">Customers</span>
        </button>
        <button
          onClick={() => setShowMore(!showMore)}
          className="flex flex-col items-center"
        >
          <FaEllipsisH />
          <span className="text-xs">More</span>
        </button>
      </nav>

      {/* More options dropdown (mobile only) */}
      {showMore && (
        <div className="fixed bottom-16 left-0 right-0 bg-white shadow-md border rounded-t-md z-40 p-4 space-y-2 md:hidden">
          <button className="w-full text-left" onClick={() => { setActiveTab("workersdetails"); setShowMore(false); }}>
            Approved Workers
          </button>
          <button className="w-full text-left" onClick={() => { setActiveTab("CustomersDetails"); setShowMore(false); }}>
            Approved Customers
          </button>
          <button className="w-full text-left" onClick={() => { setActiveTab("bookings"); setShowMore(false); }}>
            Booking Details
          </button>
          <button className="w-full text-left" onClick={() => { setActiveTab("tracking"); setShowMore(false); }}>
            Tracking
          </button>
          <button className="w-full text-left" onClick={() => { setActiveTab("payments"); setShowMore(false); }}>
            Payment Status
          </button>
          <button className="w-full text-left text-red-600" onClick={onLogout}>
            <FaSignOutAlt className="inline mr-1" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
