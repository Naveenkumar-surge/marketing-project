import { useState, useEffect } from "react";
import "../styles/DashboardContentMobile.css";    // ← mobile overrides
import { toast } from "react-toastify";
const services = [
  "Plumbing", "Electrical", "Cleaning", "Painting", "Carpentry",
  "Male Baby Care", "Female Baby Care", "Elderly Care", "Cooking", "Laundry",
  "Gardening", "Security Guard", "Delivery Service", "Housekeeping", "Driver",
  "Pet Care", "Personal Assistant", "Grocery Shopping", "Tutoring", "Massage Therapy"
];

const getUserDetails = () => {
  const userInfo = localStorage.getItem("userInfo");
  return userInfo ? JSON.parse(userInfo) : null;
};

const DashboardContent = () => {
  const [workerName, setWorkerName] = useState("");
  const [worker, setWorker] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [availability, setAvailability] = useState({ from: "", to: "" });
  const [price, setPrice] = useState("");

  useEffect(() => {
    const user = getUserDetails();
    if (user?.email && user?.name) {
      setWorkerName(user.email);
      setWorker(user.name);
    }
  }, []);

  const handleServiceSelection = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [service] // only one service allowed
    );
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAvailability((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value);
  };

  const handleSubmit = async () => {

    try {
      // Fetch latest user info using email
      const res = await fetch(`https://marketing-nodejs.onrender.com/api/auth/getByEmail/${workerName}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!res.ok) {
        throw new Error("Failed to fetch user info");
      }
  
      const user = await res.json();
      if (!user.personalInfo) {
        toast.error("Please fill in your Personal Info.");
        return;
      }
  
      if (!user.bankDetails) {
        toast.error("Please complete your Bank Details before registering service.");
        return;
      }
  
      if (!user.approved) {
        toast.error("Your account is not yet approved. Please wait for admin approval.");
        return;
      }
  
      // Validate form data
      if (
        selectedServices.length !== 1 ||
        !availability.from ||
        !availability.to ||
        !price
      ) {
        toast.error("Please select exactly one service, dates, and price before saving!");
        return;
      }
  
      const enteredPrice = parseInt(price, 10);
      if (enteredPrice < 1000 || enteredPrice > 65000) {
        toast.error("Price must be between ₹1000 and ₹65000.");
        return;
      }
  
      const workerData = {
        name: worker,
        email: workerName,
        services: selectedServices,
        availability,
        price,
      };
  
      // Submit worker service registration
      const response = await fetch("https://marketing-nodejs.onrender.com/api/saveWorkerDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workerData),
      });
  
      if (response.ok) {
        toast.success("Details saved successfully!");
      } else {
        const err = await response.json();
        throw new Error(err.message || "Failed to save details");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while submitting your details.");
    }
  };
  
  return (
    <div className="registration-container p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-blue-700 mb-3">
        Worker Registration
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Select Your Services
          </h4>
          {/* Desktop & Tablet view - checkbox list */}
<div className="services-list flex md:grid md:grid-cols-2 gap-2 md:max-h-64 md:overflow-y-auto">
  {services.map((service) => (
    <label key={service} className="flex items-center space-x-2 text-sm bg-gray-100 px-2 py-2 rounded cursor-pointer hover:bg-gray-200 transition">
      <input
        type="checkbox"
        checked={selectedServices.includes(service)}
        onChange={() => handleServiceSelection(service)}
        className="h-4 w-4 text-blue-500"
      />
      <span>{service}</span>
    </label>
  ))}
</div>

{/* Mobile View - dropdown */}
<select
  className="services-dropdown mt-2"
  value={selectedServices[0] || ""}
  onChange={(e) => handleServiceSelection(e.target.value)}
>
  <option value="">Select a service</option>
  {services.map((service) => (
    <option key={service} value={service}>
      {service}
    </option>
  ))}
</select>

        </section>

        <section>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Set Availability & Price
          </h4>
          <div className=" date-input-wrapper grid grid-cols-2 gap-4">
            <div className="date-input-wrapper">
              <label className="text-gray-600 text-sm mb-1">From Date:</label>
              <input
                type="date"
                name="from"
                value={availability.from}
                min={new Date().toISOString().split("T")[0]}
                onChange={handleDateChange}
                className="border rounded px-2 py-2 w-full text-sm"
              />
            </div>
            <div className="date-input-wrapper">
              <label className="text-gray-600 text-sm mb-1">To Date:</label>
              <input
                type="date"
                name="to"
                value={availability.to}
                min={
                  availability.from ||
                  new Date().toISOString().split("T")[0]
                }
                onChange={handleDateChange}
                className="border rounded px-2 py-2 w-full text-sm"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-gray-600 text-sm mb-1">
              Enter Your Price:
            </label>
            <input
              type="number"
              placeholder="₹1000 - ₹65000"
              value={price}
              onChange={handlePriceChange}
              className="border rounded px-2 py-2 w-full text-sm"
            />
          </div>
        </section>
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-600 shadow-md"
        >
          Save Details
        </button>
      </div>
    </div>
  );
};

export default DashboardContent;
