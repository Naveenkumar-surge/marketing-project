import { useEffect, useState } from "react";
import { FaTachometerAlt, FaBook, FaTruck, FaSignOutAlt, FaHeadset } from "react-icons/fa";
import BookingContent from "./BookingHistory";
import TrackingContent from "./TrackingContent";
import Dashboard from "./Dashboard";
import PersonalInfoForm from "./PersonalInfoForm";
import BankDetailsForm from "./BankDetailsForm";
import PaymentStatus from "./PaymentStatus";
import ContactAdminForm from "./ContactAdminForm";
interface WorkerDashboardProps {
    onLogout: () => void;
}

const getUserDetails = () => {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
};

interface AdminDashboardProps {
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [workerName, setWorkerName] = useState("");
    const [activeTab, setActiveTab] = useState("dashboard");
    const [email, setEmail] = useState("");

    useEffect(() => {

        const user = getUserDetails();
        if (user?.name) {
            setWorkerName(user.name);
            setEmail(user.email);
        }
    }, []);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-60 bg-blue-800 p-5 flex flex-col justify-between shadow-lg">
                <div>
                    <h1 className="text-xl font-bold text-white mb-5">Worker Portal</h1>
                    <ul className="space-y-4">
                        <li
                            className={`flex items-center gap-3 text-lg font-medium cursor-pointer ${
                                activeTab === "dashboard" ? "text-blue-300" : "text-white"
                            }`}
                            onClick={() => setActiveTab("dashboard")}
                        >
                            <FaTachometerAlt /> Dashboard
                        </li>
                        <li
                            className={`flex items-center gap-3 text-lg font-medium cursor-pointer ${
                                activeTab === "booking" ? "text-blue-300" : "text-white"
                            }`}
                            onClick={() => setActiveTab("booking")}
                        >
                            <FaBook /> Booking
                        </li>
                        <li
                            className={`flex items-center gap-3 text-lg font-medium cursor-pointer ${
                                activeTab === "tracking" ? "text-blue-300" : "text-white"
                            }`}
                            onClick={() => setActiveTab("tracking")}
                        >
                            <FaTruck /> Tracking
                        </li>
                        <li
  className={`flex items-center gap-3 text-lg font-medium cursor-pointer ${
    activeTab === "personal" ? "text-blue-300" : "text-white"
  }`}
  onClick={() => setActiveTab("personal")}
>
  🧾 Personal Info
</li>
<li
  className={`flex items-center gap-3 text-lg font-medium cursor-pointer ${
    activeTab === "bank" ? "text-blue-300" : "text-white"
  }`}
  onClick={() => setActiveTab("bank")}
>
  🏦 Bank Details
</li>
<li
  className={`flex items-center gap-3 text-lg font-medium cursor-pointer ${
    activeTab === "paymentStatus" ? "text-blue-300" : "text-white"
  }`}
  onClick={() => setActiveTab("paymentStatus")}
>
  💰 Payment Status
</li>
<li
  className={`flex items-center gap-3 text-lg font-medium cursor-pointer ${
    activeTab === "GrievancyForm" ? "text-blue-300" : "text-white"
  }`}
  onClick={() => setActiveTab("GrievancyForm")}
>
    Raise Ticket
</li>
                    </ul>
                </div>

                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 px-3 text-sm"
                >
                    <FaSignOutAlt /> Logout
                </button>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <header className="bg-white shadow-md p-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-blue-600">Welcome to Customer Portal</h2>
                    <div className="flex items-center gap-4">
                        <FaHeadset className="text-blue-600 text-2xl cursor-pointer" title="Support" />
                        <span className="font-medium text-gray-800">{workerName}</span>
                        <button
                            onClick={onLogout}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">
                     {activeTab === "dashboard" && <Dashboard />}
                    {activeTab === "booking" && <BookingContent />}
                    {activeTab === "tracking" && <TrackingContent />}
                    {activeTab === "personal" && <PersonalInfoForm email={email} />}
{activeTab === "bank" && <BankDetailsForm email={email} />}
{activeTab === "paymentStatus" && <PaymentStatus email={email} />}
{activeTab === "GrievancyForm" && <ContactAdminForm />}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
