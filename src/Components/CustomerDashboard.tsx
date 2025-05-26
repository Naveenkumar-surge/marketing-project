import React, { useState, useEffect,useCallback,useRef} from "react";
import { FaTachometerAlt, FaBook, FaTruck, FaHeadset, FaSignOutAlt,FaUserCircle } from "react-icons/fa";
import io from "socket.io-client";
import 'leaflet/dist/leaflet.css';
import { User2 } from 'lucide-react';
import { toast } from "react-toastify";
import { OpenStreetMapProvider } from 'leaflet-geosearch';

import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup ,useMapEvent,useMap} from "react-leaflet";
import PersonalInfoForm from "./PersonalInfoForm";
import ContactAdminForm from "./ContactAdminForm";
import DashboardCustomer from "./DashboardCustomer";
import CompletedWork from "./CompletedWork";
interface CustomerDashboardProps {
    onLogout: () => void;
}

const provider = new OpenStreetMapProvider();
const getUserDetails = () => {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
};
const services = [
    "Plumbing", "Electrical", "Cleaning", "Painting", "Carpentry",
    "Male Baby Care", "Female Baby Care", "Elderly Care", "Cooking", "Laundry",
    "Gardening", "Security Guard", "Delivery Service", "Housekeeping", "Driver",
    "Pet Care", "Personal Assistant", "Grocery Shopping", "Tutoring", "Massage Therapy"
];

// Set default marker icon
// Set default marker icon correctly
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
interface Worker {
    contactNumber: any;
    name: any;
    email: string;
    services: string[];
    price: number;
    availability: {
        from: string;
        to: string;
    };
}

interface LocationData {
    workerEmail: string;
    latitude: number;
    longitude: number;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onLogout }) => {
    const [userEmail, setUserEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [customerLocation, setCustomerLocation] = useState<{
      latitude: number;
      longitude: number;
      label?: string;
    } | null>(null);
    const [locationSent, setLocationSent] = useState(false);
    const [selectedService, setSelectedService] = useState("");
    const today = new Date();
    const [fromDate, setFromDate] = useState<Date>(today);
    const [bookings, setBookings] = useState<any[]>([]);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [locationData, setLocationData] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [zoomToLocation, setZoomToLocation] = useState(false);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [locations, setLocations] = useState<LocationData[]>([]);
    const [socket, setSocket] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [showMyInfoOverlay, setShowMyInfoOverlay] = useState(false);
     useEffect(() => {
             const user = getUserDetails();
             if (user?.email&&user?.name) {
                 setUserEmail(user.email);
                 setUserName(user.name);
             }
         }, []);
         const handleSearch = () => {
          if (customerLocation) {
            setZoomToLocation(true); // Now allow map to zoom
          }
        };
        const cache = useRef<{ [key: string]: any }>({});

        const fetchSuggestions = async (query: string) => {
          if (!query || query.length < 3) return;
        
          if (cache.current[query]) {
            setSuggestions(cache.current[query]);
            return;
          }
        
          try {
            const response = await fetch(
              `https://us1.locationiq.com/v1/search.php?key=pk.e4d3e5cba6dfad6ec9632230f7797940&q=${encodeURIComponent(query)}&format=json`
            );
        
            if (!response.ok) return;
        
            const data = await response.json();
            cache.current[query] = data; // Cache it
            setSuggestions(data);
          } catch {
            return; // Silent
          }
        };
        
         useEffect(() => {
            const fetchBookings = async () => {
              if (!userEmail) return;
          
              try {
                const response = await fetch(`https://marketing-nodejs.onrender.com/api/by-customer/${userEmail}`);
                if (!response.ok) throw new Error("No bookings found");
          
                const data = await response.json();
                setBookings(data);
                const nam=data.completedWork;
                console.log("Work status for booking",data,nam);
              } catch (error) {
                console.error("Error fetching bookings:", error);
                setBookings([]);
              }
            };
          
            if (activeTab === "Dashboard") {
              fetchBookings();
            }
          }, [activeTab, userEmail]);
          
    useEffect(() => {
        const newSocket = io("http://localhost:5000"); // Ensure backend is running
        setSocket(newSocket);
    
        newSocket.on("locationUpdate", (data: LocationData) => {
            setLocations((prev) => {
                if (!data.workerEmail) return prev; // Prevents undefined errors
                const updated = [...prev.filter(l => l.workerEmail !== data.workerEmail), data];
                return updated;
            });
        });
    
        return () => {
            newSocket.disconnect(); // Cleanup on unmount
        };
    }, []);
    const FlyToLocation = ({ latitude = 0, longitude = 0 }) => {
      const map = useMap();
    
      useEffect(() => {
        if (latitude && longitude) {
          map.flyTo([latitude, longitude], 13);
        }
      }, [latitude, longitude, map]);
    
      return null;
    };
  
    const handleSelect = (s: { x: number; y: number; label: string }) => {
      setCustomerLocation({
        latitude: s.y,
        longitude: s.x,
        label: s.label,
      });
      setSearchQuery(s.label);
      setSuggestions([]);
      setLocationSent(false);
      setZoomToLocation(false); // Wait for Search button
    };
    
    useEffect(() => {
        if (activeTab === "Tracking") {
          if (!customerLocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                console.log("pages", position.coords.latitude, position.coords.longitude);
                setCustomerLocation({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });
              },
              (error) => {
                console.error("Error fetching location:", error);
                toast.error("Unable to fetch your location.");
              }
            );
          }
        } else {
          setCustomerLocation(null);
        }
      }, [activeTab]);
      
      
      const sendLocationToWorker = async () => {
  if (!customerLocation || !userEmail) return;

  try {
    const payload = {
      customerEmail: userEmail,
      latitude: customerLocation.latitude,
      longitude: customerLocation.longitude,
      label: customerLocation.label || "",
    };

    const response = await fetch("https://marketing-nodejs.onrender.com/api/auth/store-location", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("Store response:", data);

    if (response.ok) {
      toast.success("Location sent to the worker successfully!");
      setLocationSent(true);
    } else {
      toast.error(data.message || "Failed to send location.");
    }

  } catch (error) {
    console.error("Error sending location:", error);
    toast.error("Failed to send location.");
  }
};

      
    // 👇 ADD THIS Razorpay script loader here 👇
useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
        document.body.removeChild(script);
    };
}, []);
  
    useEffect(() => {
        console.log("Fetching workers with:", { selectedService, fromDate, toDate });
        fetchAvailableWorkers();
    }, [selectedService, fromDate, toDate]);
    
    const fetchAvailableWorkers = async () => {
        if (!fromDate || !toDate || !selectedService) return;
    
        try {
            const params = new URLSearchParams();
            const fromDateFormatted = fromDate.toISOString().split('T')[0]; // "2025-04-04"
    const toDateFormatted = toDate.toISOString().split('T')[0]; // "2025-04-19"
params.append("service", selectedService);
params.append("fromDate", fromDateFormatted);
params.append("toDate", toDateFormatted);

console.log(params.toString()); // Debug: check the output
const res = await fetch(`https://marketing-nodejs.onrender.com/api/auth/getByEmail/${userEmail}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
});

if (!res.ok) {
  throw new Error("Failed to fetch user info");
}

const user = await res.json();
console.log(user);
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
const re = await fetch(`https://marketing-nodejs.onrender.com/api/auth/location/${userEmail}`);
const dat = await re.json();
setLocationData(dat);
             if(dat===null){
                toast.error("before booking please select ans send your location");
                return;
             }
            const response = await fetch(`https://marketing-nodejs.onrender.com/api/available?${params}`);
            if (!response.ok) {
                throw new Error("Failed to fetch workers");
            }
    
            const data = await response.json();
    
            setWorkers(data);
        } catch (error) {
            console.error("Error fetching workers:", error);
        }
    };

    useEffect(() => {
        fetchAvailableWorkers();
    }, [selectedService, fromDate, toDate]);

    const handlePayment = async (worker: Worker) => {
    try {
        // Step 1: Create booking + Razorpay order
        const bookingResponse = await fetch("https://marketing-nodejs.onrender.com/bookings/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customername: userName,
                customerEmail: userEmail,
                workername: worker.name,
                workerEmail: worker.email,
                service: selectedService,
                fromDate,
                toDate,
                price: worker.price
            })
        });

        const bookingData = await bookingResponse.json();

        if (!bookingData.orderId || !bookingData.bookingId) {
            toast.error("Failed to create booking");
            return;
        }

        const options = {
            key: "rzp_live_0cdo6yosjt7OZH",
            amount: worker.price * 100,
            currency: "INR",
            name: "Marketing Booking",
            description: `Booking for ${selectedService}`,
            order_id: bookingData.orderId,
            handler: async function (response: any) {
                const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

                // Step 3: Verify payment
                await fetch("https://marketing-nodejs.onrender.com/bookings/updatePayment", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        bookingId: bookingData.bookingId,
                        razorpay_payment_id,
                        razorpay_order_id,
                        razorpay_signature
                    })
                });

                toast.success("Payment Successful!");

                // Send location email
                try {
                    const res = await fetch(`https://marketing-nodejs.onrender.com/api/auth/location/${userEmail}`);
                    const data = await res.json();

                    if (!data || !data.latitude || !data.longitude) {
                        toast.error("Stored location not found.");
                    } else {
                        await fetch("https://marketing-nodejs.onrender.com/api/auth/send-location-email", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                customerEmail: userEmail,
                                workerEmail: worker.email,
                                latitude: data.latitude,
                                longitude: data.longitude,
                                label: data.label || ""
                            })
                        });

                        toast.success("Location sent to the worker successfully!");
                    }
                } catch (error) {
                    console.error("Error sending location:", error);
                    toast.error("Failed to send location.");
                }

                // Mark worker busy
                await fetch("https://marketing-nodejs.onrender.com/api/markBusy", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ workerEmail: worker.email })
                });

                fetchAvailableWorkers();
            },
            prefill: {
                email: userEmail
            },
            theme: {
                color: "#22c55e"
            }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
    } catch (error) {
        console.error("Payment error:", error);
        toast.error("Something went wrong during the booking process.");
    }
};


return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 relative">
      {/* Sidebar for Desktop */}
      <div className="hidden md:block w-72 h-screen bg-blue-900 text-white p-6 shadow-xl rounded-r-2xl border-r border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-white-400 mb-10">Customer Portal</h1>
          <ul className="space-y-4 text-white-400">
            {["Dashboard", "Booking", "Tracking"].map((tab) => (
              <li
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 font-medium cursor-pointer ${
                  activeTab === tab ? "text-green-400" : "text-white hover:text-green-300"
                }`}
              >
                {tab === "Dashboard" && <FaTachometerAlt />}
                {tab === "Booking" && <FaBook />}
                {tab === "Tracking" && <FaTruck />}
                {tab}
              </li>
            ))}
            <li
              className={`flex items-center gap-2 font-medium cursor-pointer ${
                activeTab === "personal" ? "text-green-400" : "text-white hover:text-green-300"
              }`}
              onClick={() => setActiveTab("personal")}
            >
              <User2 size={16} /> Personal Info
            </li>
            <li
              className={`flex items-center gap-3 text-lg font-medium cursor-pointer ${
                activeTab === "GrievancyForm" ? "text-blue-400" : "text-white hover:text-green-300"
              }`}
              onClick={() => setActiveTab("GrievancyForm")}
            >
              Raise Ticket
            </li>
            <li
              className={`flex items-center gap-3 text-lg font-medium cursor-pointer ${
                activeTab === "History" ? "text-blue-400" : "text-white hover:text-green-300"
              }`}
              onClick={() => setActiveTab("History")}
            >
              Booking History
            </li>
            <li>
              <a
                href="https://wa.me/9618382766"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-5 text-white font-medium hover:text-green-400 cursor-pointer"
              >
                <FaHeadset /> Support
              </a>
            </li>
          </ul>
        </div>
      </div>
  
      {/* Main Content */}
   <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        
        {/* Topbar for Desktop */}
        <header className="fixed top-0 left-0 right-0 bg-blue-900 text-white flex items-center justify-between px-4 py-2 shadow-md z-50 md:static">
  {/* Left: Circle with Initials */}
  <div className="relative group flex items-center ml-2 mr-4 custom-circle-wrapper">
    <div className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold uppercase cursor-pointer">
      {userName ? userName.slice(0, 2) : 'NA'}
    </div>
    {/* Tooltip: Show Full Name on Hover */}
    <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white text-black text-xs font-semibold px-3 py-1 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
      {userName}
    </div>
  </div>

  {/* Center: Title */}
  <div className="flex-2 flex justify-center items-center -mt-2">
    <h2 className="text-lg font-semibold text-center help -ml-4">
      Welcome to customer Portal
    </h2>
  </div>

  {/* Right: Logout Button */}
  <div className="flex items-center mr-2">
    <button
      onClick={onLogout}
      className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded"
    >
      Logout
    </button>
  </div>
</header>

  
        {/* Content Wrapper - Hide when showMyInfoOverlay */}
        <div className={`${showMyInfoOverlay ? "hidden md:block" : ""}`}>
          {/* Active Tab Content */}
          {activeTab === "Booking" && (
  <div className="px-4 flex flex-col items-center">
    <h2 className="text-3xl font-bold text-blue-500 text-center pt-6 mb-4 w-full bg-transparent">
      Available Workers
    </h2>

    {/* Form Container: Flex for side-by-side on desktop, stack on mobile */}
    <div className="w-full max-w-6xl bg-white p-6 rounded-2xl shadow-lg space-y-5 md:space-y-0 md:flex md:items-center md:justify-between">
      {/* Select Service */}
      <div className="md:w-1/3 mb-4 md:mb-0">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Select Service</label>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="">-- Choose Service --</option>
          {services.map((service, index) => (
            <option key={index} value={service}>{service}</option>
          ))}
        </select>
      </div>

      {/* From Date */}
      <div className="md:w-1/3 mb-4 md:mb-0">
  <label className="block text-sm font-semibold text-gray-700 mb-1">From Date</label>
  <input
    type="date"
    value={fromDate ? fromDate.toISOString().split('T')[0] : ""}
    min={today.toISOString().split('T')[0]} // Disable all past dates
    onChange={(e) => {
      const selected = new Date(e.target.value);
      setFromDate(selected);
      if (toDate && selected >= toDate) {
        setToDate(null); // Clear To Date if it's now invalid
      }
    }}
    className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400"
  />
</div>

      {/* To Date */}
      <div className="md:w-1/3">
  <label className="block text-sm font-semibold text-gray-700 mb-1">To Date</label>
  <input
    type="date"
    value={toDate ? toDate.toISOString().split('T')[0] : ""}
    min={fromDate.toISOString().split('T')[0]} // Disable dates before From Date
    onChange={(e) => setToDate(new Date(e.target.value))}
    className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400"
  />
</div>
    </div>

    {/* ✅ MOBILE WORKER CARDS (scrollable, no pagination) */}
    <div className="md:hidden w-full space-y-4 mt-4">
      {workers.length > 0 ? (
        workers.map((worker, idx) => (
          <div key={idx} className="bg-white p-4 rounded shadow-md mx-2">
            <h3 className="font-semibold text-green-700">{worker.email}</h3>
            <p>Services: {worker.services.join(", ")}</p>
            <p>Price: ₹{worker.price}</p>
            <button
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={() => handlePayment(worker)}
            >
              Book Now
            </button>
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-cente bg-transparent">No workers available for the selected criteria.</p>
      )}
    </div>

    {/* ✅ DESKTOP TABLE VIEW WITH PAGINATION */}
    <div className="hidden md:block w-full max-w-5xl mt-6">
      {workers.length > 0 ? (
        <>
          <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Services</th>
                <th className="p-3 border">Price</th>
                <th className="p-3 border">Action</th>
              </tr>
            </thead>
            <tbody>
            {workers
                .slice(currentPage * 3, currentPage * 3 + 3) // Show 3 per page
                .map((worker, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-3 border">{worker.email}</td>
                    <td className="p-3 border">{worker.services.join(", ")}</td>
                    <td className="p-3 border">₹{worker.price}</td>
                    <td className="p-3 border">
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        onClick={() => handlePayment(worker)}
                      >
                        Book Now
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Pagination Buttons */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            >
              Prev
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
              disabled={(currentPage + 1) * 3 >= workers.length}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-600 text-center">No workers available for the selected criteria.</p>
      )}
    </div>
  </div>
)}

          <main className="flex-1">
            {activeTab === "History" && <CompletedWork />}
            {activeTab === "Dashboard" && <DashboardCustomer />}
            {activeTab === "personal" && <PersonalInfoForm email={userEmail} />}
            {activeTab === "GrievancyForm" && <ContactAdminForm />}
          </main>
  
          {activeTab === "Tracking" && (
        <div className="map-container px-4">
        <h2 className="text-2xl font-semibold mb-4 text-green-700">Select Your Location</h2>
      
        {/* Search Input */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4 relative z-20">
          <div className="w-full relative">
          <input
  type="text"
  placeholder="Search for an address"
  value={searchQuery}
  onChange={(e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchSuggestions(value); // ✅ debounced API call
  }}
  className="w-full px-4 py-2 rounded border border-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-green-400"
/>

      
            {/* Autocomplete Suggestions */}
            {suggestions.length > 0 && (
              <ul className="absolute top-full left-0 w-full z-30 bg-white shadow-md border mt-1 rounded max-h-48 overflow-y-auto">
                {suggestions.map((s, idx) => (
  <li
    key={idx}
    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
    onClick={() => handleSelect({
      x: parseFloat(s.lon),
      y: parseFloat(s.lat),
      label: s.display_name // ✅ this is what you need
    })}
  >
    {s.display_name} {/* ✅ fix this line */}
  </li>
))}

              </ul>
            )}
          </div>
      
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>
      
        {/* Mobile Button */}
        <div className="block md:hidden mb-4">
          <button
            onClick={sendLocationToWorker}
            disabled={!customerLocation || locationSent}
            className={`w-full px-4 py-3 rounded text-white font-semibold transition ${
              !customerLocation || locationSent
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {locationSent ? "Location Sent" : "Send Location to Worker"}
          </button>
        </div>
      
        {/* Map Display */}
        <div className="w-full h-[300px] md:h-[400px] lg:h-[450px] xl:h-[500px] mb-6 rounded-xl shadow overflow-hidden relative z-10">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            className="w-full h-full"
            style={{ borderRadius: "1rem" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {customerLocation && (
              <>
                <Marker position={[customerLocation.latitude, customerLocation.longitude]}>
                  <Popup>{customerLocation.label || "Your selected location"}</Popup>
                </Marker>
                {zoomToLocation && (
                  <FlyToLocation
                    latitude={customerLocation.latitude}
                    longitude={customerLocation.longitude}
                  />
                )}
              </>
            )}
          </MapContainer>
        </div>
      
        {/* Desktop Button */}
        <div className="hidden md:block">
          <button
            onClick={sendLocationToWorker}
            disabled={!customerLocation || locationSent}
            className={`px-6 py-3 rounded text-white font-semibold transition ${
              !customerLocation || locationSent
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {locationSent ? "Location Sent" : "Send Location to Worker"}
          </button>
        </div>
      </div>
      
)}

        </div>
      </div>
  
      {/* Bottom Navigation Mobile */}
      <div className="fixed bottom-0 md:hidden w-full bg-white border-t shadow-md flex justify-around py-2 z-50">
        <button className="flex flex-col items-center" onClick={() => setActiveTab('Dashboard')}>
          <FaTachometerAlt className="text-xl" />
          <span className="text-xs">Dashboard</span>
        </button>
        <button className="flex flex-col items-center" onClick={() => setActiveTab('Booking')}>
          <FaBook className="text-xl" />
          <span className="text-xs">Booking</span>
        </button>
        <button className="flex flex-col items-center" onClick={() => setActiveTab('Tracking')}>
          <FaTruck className="text-xl" />
          <span className="text-xs">Tracking</span>
        </button>
        <button className="flex flex-col items-center" onClick={() => setShowMyInfoOverlay(true)}>
          <FaUserCircle className="text-xl" />
          <span className="text-xs">My Info</span>
        </button>
      </div>
  
      {/* My Info Overlay Mobile */}
      {showMyInfoOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex flex-col justify-end z-50 md:hidden">
          <div className="bg-white rounded-t-2xl p-6">
            <button
              className="text-red-500 font-bold mb-4"
              onClick={() => setShowMyInfoOverlay(false)}
            >
              Back
            </button>
            <div className="flex flex-col space-y-4">
              <button onClick={() => { setActiveTab('personal'); setShowMyInfoOverlay(false); }} className="text-green-700 font-semibold -ml-7">
             👤 Personal Info
              </button>
              <button onClick={() => { setActiveTab('GrievancyForm'); setShowMyInfoOverlay(false); }} className="text-green-700 font-semibold">
              📩 Raise Grievancy
              </button>
              <button onClick={() => { setActiveTab('History'); setShowMyInfoOverlay(false); }} className="text-green-700 font-semibold">
              ✅ Completed Work
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
    
};
export default CustomerDashboard;
