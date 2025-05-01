import { useState } from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaUser,
  FaBook,
  FaTruck,
  FaMoneyBill,
  FaSignOutAlt,
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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 bg-blue-900 p-5 flex flex-col justify-between shadow-lg text-white">
        <div>
          <h1 className="text-xl font-bold mb-5">Admin Panel</h1>
          <ul className="space-y-4">
            <li
              className={`cursor-pointer ${activeTab === "dashboard" && "text-yellow-300"}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <FaTachometerAlt className="inline mr-2" /> Dashboard
            </li>
            <li
              className={`cursor-pointer ${activeTab === "workers" && "text-yellow-300"}`}
              onClick={() => setActiveTab("workers")}
            >
              <FaUsers className="inline mr-2" /> Worker Details
            </li>
            <li
              className={`cursor-pointer ${activeTab === "workersdetails" && "text-yellow-300"}`}
              onClick={() => setActiveTab("workersdetails")}
            >
              <FaUsers className="inline mr-2" /> approved Workers
            </li>
            <li
              className={`cursor-pointer ${activeTab === "customers" && "text-yellow-300"}`}
              onClick={() => setActiveTab("customers")}
            >
              <FaUser className="inline mr-2" /> Customer Details
            </li>
            <li
              className={`cursor-pointer ${activeTab === "CustomersDetails" && "text-yellow-300"}`}
              onClick={() => setActiveTab("CustomersDetails")}
            >
              <FaUser className="inline mr-2" /> Approved Customer
            </li>
            <li
              className={`cursor-pointer ${activeTab === "bookings" && "text-yellow-300"}`}
              onClick={() => setActiveTab("bookings")}
            >
              <FaBook className="inline mr-2" /> Booking Details
            </li>
            <li
              className={`cursor-pointer ${activeTab === "tracking" && "text-yellow-300"}`}
              onClick={() => setActiveTab("tracking")}
            >
              <FaTruck className="inline mr-2" /> Tracking
            </li>
            <li
              className={`cursor-pointer ${activeTab === "payments" && "text-yellow-300"}`}
              onClick={() => setActiveTab("payments")}
            >
              <FaMoneyBill className="inline mr-2" /> Payment Status
            </li>
          </ul>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-white text-sm"
        >
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "workers" && <WorkerDetails />}
        {activeTab==="workersdetails"&&<WorkerDetailsHistory/>}
        {activeTab === "customers" && <CustomerDetails />}
        {activeTab==="CustomersDetails"&&<CustomerDetailsHistory/>}
        {activeTab === "bookings" && <BookingDetails />}
        {activeTab === "tracking" && <TrackingDetails />}
        {activeTab === "payments" && <PaymentStatus />}
      </main>
    </div>
  );
};

export default AdminDashboard;
