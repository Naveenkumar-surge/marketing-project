import React, { useState,useEffect } from "react";
import NavigationBar from "../Navigationbar";
import { useNavigate } from "react-router-dom";
import { userLogin, adminLogin } from "../services/authService";
import ServiceDetails from "./ServiceDetails";
import axios from "axios";
const HomePage: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const [activeSection, setActiveSection] = useState<string>("home");
  const [role, setRole] = useState<"user" | "admin" | null>(null);
  const [isUserRegistered, setIsUserRegistered] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<string | null>(null);
  const [userType, setUserType] = useState<"customer" | "worker" | "">("");
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const handleContactNumberChange = (value: string) => {
    setContactNumber(value);
    setFormData((prev) => ({ ...prev, contactNumber: value }));
  };
  const [formDat, setFormDat] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "", // added
    password: "",
    confirmPassword: "",
    userType: ""
  });
  const services = [
    {
      name: "Plumbing",
      details: "Our expert plumbers handle everything from fixing leaks, unblocking drains, to installing complete plumbing systems. We ensure your home or office is always leak-free and functional."
    },
    {
      name: "Electrical",
      details: "We offer a wide range of electrical services including wiring, repairs, and safety inspections. Our team ensures your electrical systems are safe and efficient."
    },
    {
      name: "Cleaning",
      details: "Our cleaning services cover homes, offices, and commercial spaces. From deep cleaning to regular maintenance, we ensure your space stays clean, hygienic, and welcoming."
    },
    {
      name: "Painting",
      details: "Transform your space with our painting services. We offer both interior and exterior painting with high-quality materials and a smooth, professional finish."
    },
    {
      name: "Carpentry",
      details: "Our carpenters create custom furniture, handle repairs, and provide expert woodwork solutions to meet all your interior design needs with precision and skill."
    },
    {
      name: "Male Baby Care",
      details: "We offer specialized care for your baby boys, including feeding, diapering, and offering nurturing support to ensure their comfort and well-being."
    },
    {
      name: "Female Baby Care",
      details: "Our female baby care services focus on providing nurturing support, feeding, and diapering to ensure your baby girl is well taken care of."
    },
    {
      name: "Elderly Care",
      details: "Our elderly care services provide compassionate assistance to seniors, including daily activities, mobility support, and ensuring their overall safety and comfort."
    },
    {
      name: "Cooking",
      details: "We offer home-cooked meals tailored to your dietary preferences and needs. Whether it's preparing regular meals or special dishes, we have you covered."
    },
    {
      name: "Laundry",
      details: "Our laundry services take the hassle out of washing, folding, and ironing. We ensure your clothes are fresh, clean, and well cared for."
    },
    {
      name: "Gardening",
      details: "We provide comprehensive gardening services, including lawn maintenance, landscaping, and seasonal planting to keep your garden thriving throughout the year."
    },
    {
      name: "Security Guard",
      details: "Our trained security personnel offer reliable protection for your home, office, or event, ensuring safety and peace of mind around the clock."
    },
    {
      name: "Delivery Service",
      details: "We offer fast and reliable delivery services, whether it's for small packages or larger items. We ensure your goods reach their destination safely and on time."
    },
    {
      name: "Housekeeping",
      details: "Our housekeeping services cover all aspects of cleaning and organizing your home or office, ensuring that everything is neat and well-maintained."
    },
    {
      name: "Driver",
      details: "Our professional drivers are available for personal or business transportation needs, ensuring you get to your destination safely and on time."
    },
    {
      name: "Pet Care",
      details: "We offer pet care services, including walking, feeding, grooming, and overall attention to ensure your pets remain happy, healthy, and well-cared for."
    },
    {
      name: "Personal Assistant",
      details: "Our personal assistants help you organize your schedule, handle tasks, and assist with various errands, making your daily life easier and more efficient."
    },
    {
      name: "Grocery Shopping",
      details: "Let us handle your grocery shopping! We ensure you get all your essentials delivered fresh to your doorstep, saving you time and effort."
    },
    {
      name: "Tutoring",
      details: "Our tutoring services offer personalized lessons in various subjects. Whether it's for school, university, or professional development, we provide expert guidance."
    },
    {
      name: "Massage Therapy",
      details: "Our massage therapy services aim to relax and rejuvenate your body, helping to relieve stress, improve circulation, and enhance overall wellness."
    }
  ];
  
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const handleServiceClick = (serviceName: string) => {
    setSelectedService(prev => (prev === serviceName ? null : serviceName));
  };
  const handleChang = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormDat({ ...formDat, [e.target.name]: e.target.value });
  };
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const displayMessage = (msg: string, type: string) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 3000);
  };
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // initial check
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage("");

    try {
      const response = await axios.post("https://marketing-nodejs.onrender.com/api/send-confirmation", formDat);

      if (response.data.success) {
        setStatusMessage("Confirmation email sent successfully!");
        setFormDat({ name: "", email: "", phone: "", message: "" }); // clear form
      } else {
        setStatusMessage("Failed to send email.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setStatusMessage("An error occurred while sending the email.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const success = await adminLogin(formData.email, formData.password);
        
        if (success) {
            displayMessage("Admin Login Successful!", "success");
            navigate("/admin-dashboard");
        } else {
            displayMessage("Invalid credentials. Please try again.", "error");
        }
    } catch (error: any) {
        console.error("Admin Login Failed", error.message);
        
        if (error.response && error.response.status === 404) {
            displayMessage("User not found. Please check your email.", "error");
        } else {
            displayMessage("Invalid credentials. Please try again.", "error");
        }
    }
};
const handleSendOtp = async () => {
  if (!contactNumber || contactNumber.length !== 10) {
    displayMessage("Please enter a valid 10-digit contact number", "error");
    return;
  }

  try {
    setLoading(true);
    console.log(contactNumber);
    const response = await fetch("https://marketing-nodejs.onrender.com/api/personal-info/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contactNumber }),
    });

    const data = await response.json();

    if (data.success) {
      setOtpSent(true);
      displayMessage("OTP sent successfully!", "success");
    } else {
      displayMessage(data.message || "Failed to send OTP", "error");
    }
  } catch (error) {
    displayMessage("Error sending OTP", "error");
  } finally {
    setLoading(false);
  }
};

const handleVerifyOtp = async () => {
  if (!otp || otp.length !== 6) {
    displayMessage("Please enter a valid 6-digit OTP", "error");
    return;
  }

  try {
    setLoading(true);

    const response = await fetch("https://marketing-nodejs.onrender.com/api/personal-info/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contactNumber, otp }),
    });

    const data = await response.json();

    if (data.success) {
      setOtpVerified(true);
      displayMessage("OTP verified successfully!", "success");
    } else {
      displayMessage(data.message || "Incorrect OTP", "error");
    }
  } catch (error) {
    displayMessage("Error verifying OTP", "error");
  } finally {
    setLoading(false);
  }
};


  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // if(!otpVerified)
    //   {
    //    displayMessage("please verify the otp first", "error");
    //    return;
    //   }
    try {
        const user = await userLogin(formData.email, formData.password);
        displayMessage("User Login Successful!", "success");
        navigate(user.userType === "worker" ? "/worker-dashboard" : "/customer-dashboard");
    } catch (error: any) {
        console.error("User Login Failed", error.message);
        displayMessage(error.message || "User login failed. Please try again.", "error");
    }
};
const handleUserRegister = async (e: React.FormEvent) => {
    e.preventDefault();
   if(!otpVerified)
   {
    displayMessage("please verify the otp first", "error");
    return;
   }
    if (formData.password !== formData.confirmPassword) {
      displayMessage("Passwords do not match", "error"); // Show error message
        return;
    }

    console.log("Sending Data:", formData); // Debugging

    try {
        const response = await fetch("https://marketing-nodejs.onrender.com/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: formData.name.trim(),
                email: formData.email.trim(),
                contactNumber: formData.contactNumber.trim(),
                password: formData.password.trim(),
                userType: formData.userType.trim()
            }),
        });

        const data = await response.json();
        console.log("Response Status:", response.status); // Log response status
        console.log("Response Data:", data); // Log full response

        if (response.ok) {
            setIsUserRegistered(true);
            displayMessage("Registration Successful! Please login.", "success");
        } else {
            console.error("User Registration Failed", data);
            displayMessage(data.error || "user details already exists", "error");
        }
    } catch (error) {
        console.error("User Registration Failed", error);
        displayMessage("Registration failed. Please try again.", "error");
    }
};


  return (
    <div className="relative w-full h-screen">
  <NavigationBar setActiveSection={setActiveSection} />
  
  {/* Home Section with Video */}
  {message && (
    <div className={messageType === "success" ? "success-msg" : "error-msg"}>
      {message}
    </div>
  )}
  
  {activeSection === "home" && (
  <div className="relative w-full h-screen bg-white sm:bg-gray-100"> 
    <video autoPlay loop muted className="absolute w-full h-full object-cover hidden sm:block">
      <source src="/videos/background.mp4" type="video/mp4" />
    </video>

    {/* Mobile view card container for the video */}
    {!role && (
  <div className="sm:hidden relative w-full h-full bg-white">
    <div className="w-full h-full flex justify-center items-center bg-white shadow-xl rounded-lg object-cover p-4 overflow-hidden">
      <video
        playsInline
        preload="metadata"
        controls
        className="w-full h-auto rounded-lg brightness-100 z-10"
      >
        <source src="/videos/intro.mp4" type="video/mp4" />
      </video>
    </div>
  </div>
)}

    {/* Content container */}
    <div className="absolute inset-0 flex flex-col justify-start items-center bg-black bg-opacity-60 sm:bg-transparent pt-10 sm:pt-20">
      <div className="w-full sm:w-96 p-6 sm:h-auto h-full overflow-y-auto">
        {/* Title with margin-top to avoid overlap */}
        <h1 className="text-white text-3xl font-extrabold mb-6 sm:text-4xl text-center bg-transparent sm:absolute sm:top-16 sm:left-1/2 sm:transform sm:-translate-x-1/2">
          Welcome to markting service
        </h1>

        {/* Role Selection or Form based on User's Choice */}
        {!role ? (
          <>
            {/* Buttons for mobile view, positioned at the bottom */}
            <div className="sm:hidden absolute bottom-12 left-0 right-0 flex justify-center space-x-4">
              <button onClick={() => setRole("user")} className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all duration-300 ease-in-out">
                User
              </button>
              <button onClick={() => setRole("admin")} className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-all duration-300 ease-in-out">
                Admin
              </button>
            </div>

            {/* Buttons for desktop view, centered (hidden on mobile) */}
            <div className="hidden sm:flex sm:flex-row sm:space-x-6 sm:justify-center sm:items-center sm:w-full sm:max-w-xs sm:absolute sm:top-1/2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2">
              <button onClick={() => setRole("user")} className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all duration-300 ease-in-out">
                User
              </button>
              <button onClick={() => setRole("admin")} className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-all duration-300 ease-in-out">
                Admin
              </button>
            </div>
          </>
        ) : (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-sm mx-auto mt-6 transition-all duration-300 ease-in-out overflow-y-auto max-h-[65vh] sm:max-h-full">
            {/* User Form or Admin Form */}
            {role === "user" ? (
          <>
            <h2 className="text-xl font-bold text-center mb-4 text-gray-700 bg-transparent">{isUserRegistered ? "User Login" : "User Registration"}</h2>
            {message && (
              <div className={`p-3 rounded text-white text-center ${messageType === "success" ? "bg-green-500" : "bg-red-500"}`}>
                {message}
              </div>
            )}
            <form onSubmit={isUserRegistered ? handleUserLogin : handleUserRegister} className="space-y-4">
              {/* Default to User Registration */}
              {!isUserRegistered && (
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  onChange={handleChange}
                  required
                />
              )}
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                onChange={handleChange}
                required
              />

              {/* Contact Number (Only for Registration) */}
              {!isUserRegistered && (
                <div className="mb-4">
                  <div className="flex">
                    <input
                      type="text"
                      value={contactNumber}
                      onChange={(e) => handleContactNumberChange(e.target.value)}
                      placeholder="Enter your contact number"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                      disabled={otpVerified}
                    />
                    <button
                      onClick={handleSendOtp}
                      disabled={loading || otpVerified}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    >
                      {loading ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                </div>
              )}

              {/* OTP Verification (Only for Registration) */}
              {!isUserRegistered && otpSent && !otpVerified && (
                <div className="mb-4">
                  <div className="flex">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    />
                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    >
                      {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>
                </div>
              )}

              {otpVerified && (
                <div className="text-green-600 font-semibold">OTP Verified ✅</div>
              )}

              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                onChange={handleChange}
                required
              />
              {!isUserRegistered && (
                <>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    onChange={handleChange}
                    required
                  />
                  <select
                    name="userType"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose Type</option>
                    <option value="customer">Customer</option>
                    <option value="worker">Worker</option>
                  </select>
                </>
              )}
              <button className="w-full bg-blue-500 text-white py-2 rounded-lg shadow-md hover:bg-blue-600 transition-all duration-300">
                {isUserRegistered ? "Login" : "Register"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-600 mt-2 bg-transparent">
              {isUserRegistered ? "Not registered? " : "Already registered? "}
              <button onClick={() => setIsUserRegistered(!isUserRegistered)} className="text-blue-500 hover:underline bg-transparent">
                {isUserRegistered ? "Register here" : "Login here"}
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-center mb-4 text-gray-700 bg-transparent">Admin Login</h2>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Admin Email"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                onChange={handleChange}
                required
              />
              <button className="w-full bg-green-500 text-white py-2 rounded-lg shadow-md hover:bg-green-600 transition-all duration-300">Login</button>
            </form>
          </>
        )}
        <button onClick={() => setRole(null)} className="w-full mt-4 text-gray-500 hover:underline transition-all duration-300">Back</button>
      </div>
    )}
      </div>
    </div>
  </div>
)}
{/* About Section */}
{/* About Section */}
{activeSection === "about" && (
  <div className="h-screen overflow-y-auto pb-[6rem]">
    <div className="container mx-auto mt-20 p-6">
      {/* What We Offer */}
      <h2 className="text-4xl font-bold mb-6 text-center bg-transparent">What We Offer</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 bg-transparent">
        {[
          {
            icon: "/icons/icon.jpg",
            title: "Efficient Task Management",
            desc: "Leave your tasks to us and focus on what’s important. Your convenience comes first."
          },
          {
            icon: "/icons/icon1.jpeg",
            title: "Convenient Task Solutions",
            desc: "Simplify your day with our convenient services designed to save your time and effort."
          },
          {
            icon: "/icons/icon2.png",
            title: "Your Trusted Partner",
            desc: "Count on us to take care of your work with professionalism and care, ensuring peace of mind."
          }
        ].map((card, index) => (
          <div
            key={index}
            className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition"
          >
            <img
              src={card.icon}
              alt="Feature Icon"
              className="w-16 h-16 mx-auto mb-4 object-contain"
            />
            <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
            <p className="text-gray-600">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="mt-20">
        <h2 className="text-4xl font-bold mb-6 text-center bg-transparent">How It Works</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 text-center bg-transparent">
          {[
            {
              step: "1",
              title: "Sign Up or Login",
              desc: "Create an account or login to access our services."
            },
            {
              step: "2",
              title: "Book a Service",
              desc: "Choose from a variety of professional services."
            },
            {
              step: "3",
              title: "Relax and Enjoy",
              desc: "Let us handle your tasks while you focus on what matters."
            }
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition flex flex-col items-center bg-transparent"
            >
              <div className="text-4xl font-bold text-blue-600 mb-4">{item.step}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}
{activeSection === "privacy" && (
  <div className="h-screen overflow-y-auto pb-[6rem]">
    <div className="container mx-auto mt-20 p-6">
      {/* Section Heading */}
      <h2 className="text-4xl font-bold mb-10 text-center bg-transparent">Privacy Policy</h2>

      {/* Embedded TermsFeed Policy */}
      <div className="w-full h-[70vh] border rounded-lg shadow-lg overflow-hidden">
        <iframe
          src="https://www.termsfeed.com/live/638437d4-b16c-44fb-a55b-54b57166e55d"
          title="Privacy Policy"
          width="100%"
          height="100%"
          style={{ border: "none" }}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>

      {/* Back to Home Button */}
      <div className="text-center mt-12">
        <button
          onClick={() => setActiveSection("home")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition bg-transparent"
        >
          Back to Home
        </button>
      </div>
    </div>
  </div>
)}
{activeSection === "terms" && (
  <div className="h-screen overflow-y-auto pb-[6rem]">
    <div className="container mx-auto mt-20 p-6">
      {/* Section Heading */}
      <h2 className="text-4xl font-bold mb-10 text-center bg-transparent">Terms & Conditions</h2>

      {/* Terms Content */}
      <div className="bg-white border rounded-lg shadow-lg p-6 space-y-6 text-gray-800 max-w-3xl mx-auto">
        <section>
          <h3 className="text-2xl font-semibold mb-2">1. Acceptance of Terms</h3>
          <p>
            By accessing and using this platform, users (both customers and workers) agree to comply with and be bound by these Terms & Conditions. If you do not agree, please do not use the service.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-2 bg-transperent">2. Booking & Payment</h3>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Customers must pay for services at the time of booking or as per the platform’s billing rules.</li>
            <li>Workers must honor the confirmed bookings and be present at the designated time and location.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-2">3. Service Delivery</h3>
          <p>
            Once a worker confirms availability, they are contractually obligated to fulfill the service as scheduled. Failure to do so will result in penalties and may be subject to our <span className="underline">Refund Policy</span>.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-2">4. Refunds</h3>
          <p>
            Refunds will be provided in accordance with our <span className="underline">Refund Policy</span>, especially in cases of no-show or non-performance by the worker.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-2">5. User Responsibilities</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li>Customers must provide accurate service details and be available at the booked time.</li>
            <li>Workers must provide the agreed service to the best of their ability.</li>
            <li>No abusive language, fraud, or misconduct will be tolerated on the platform.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-2">6. Termination</h3>
          <p>
            We reserve the right to suspend or terminate any user account for violating our policies, including but not limited to misuse, fraudulent behavior, or repeated cancellations.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-2">7. Contact Us</h3>
          <p>
            For any concerns regarding these terms, please contact our support team at:
            <br />
            <strong>Email:</strong> teamservicehelp8@gmail.com
          </p>
        </section>
      </div>

      {/* Back to Home Button */}
      <div className="text-center mt-12 bg-transparent">
        <button
          onClick={() => setActiveSection("home")}
          className="bg-blue-600 hover:bg-blue-700 font-bold py-3 px-8 rounded-full shadow-lg transition bg-transparent"
        >
          Back to Home
        </button>
      </div>
    </div>
  </div>
)}

 {activeSection === "refund" && (
  <div className="h-screen overflow-y-auto pb-[6rem]">
    <div className="container mx-auto mt-20 p-6">
      {/* Section Heading */}
      <h2 className="text-4xl font-bold mb-10 text-center bg-transparent">Refund Policy</h2>

      {/* Policy Content */}
      <div className="bg-white border rounded-lg shadow-lg p-6 space-y-6 text-gray-800 max-w-3xl mx-auto">
        <section>
          <h3 className="text-2xl font-semibold mb-2">1. Eligibility for Refund</h3>
          <p>Customers are eligible for a full refund under the following conditions:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>The booked worker did not provide the agreed-upon service.</li>
            <li>Payment has already been made (full or partial).</li>
            <li>A refund request is submitted within 48 hours of the missed appointment.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-2">2. Refund Process</h3>
          <ol className="list-decimal ml-6 mt-2 space-y-2">
            <li>
              <strong>Verification:</strong> Admin reviews the booking, service status, and communication logs.
            </li>
            <li>
              <strong>Approval:</strong> Valid claims are approved, and the amount is refunded within 5–7 business days.
            </li>
            <li>
              <strong>Notification:</strong> A confirmation email is sent to the customer after approval.
            </li>
          </ol>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-2">3. Service Non-Performance Examples</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li>Worker did not show up at the service location.</li>
            <li>Worker canceled at the last minute without reason.</li>
            <li>Worker refused to complete the service.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-2">4. Exceptions</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li>Customer-initiated cancellations outside the allowed window.</li>
            <li>Subjective dissatisfaction when service was delivered as agreed.</li>
            <li>Requests made after the 48-hour refund window.</li>
          </ul>
        </section>
      </div>

      {/* Back to Home Button */}
      <div className="text-center mt-12 bg-transparent">
        <button
          onClick={() => setActiveSection("contact")}
          className="bg-pink-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition bg-transparent"
        >
          Contact us
        </button>
      </div>
    </div>
  </div>
)}

  {/* Career Section */}
  {activeSection === "career" && (
      <div className="h-screen overflow-y-auto pb-[6rem]">
      <div className="container mx-auto mt-20 p-6">
        {/* Section Heading */}
        <h2 className="text-4xl font-bold mb-10 text-center bg-transparent">Our Services</h2>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Services List */}
          <div className="space-y-4">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex flex-col bg-gray-200 rounded-lg p-6 shadow hover:shadow-md transition cursor-pointer"
                onClick={() => handleServiceClick(service.name)} // Toggle the service description
              >
                <div className="flex items-center">
                  {/* Arrow and Service Name */}
                  <span className="text-blue-600 text-2xl mr-4">›</span>
                  <span className="text-lg font-semibold">{service.name}</span>
                </div>

                {/* Only show description if the service is selected */}
                {selectedService === service.name && (
                  <p className="text-gray-600 mt-4">
                    {service.details}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Why Choose Us */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold mb-4 text-center md:text-left bg-transparent">
              Why Choose King's Hand?
            </h2>
            {[
              { title: "Time-Saving", desc: "Save your time and energy – let us handle your tasks." },
              { title: "Convenience", desc: "Experience the ease of having tasks managed for you." },
              { title: "Reliability", desc: "Trust our professionals to get the job done efficiently." },
              { title: "Quality Service", desc: "Enjoy top-notch service from our skilled and dedicated team." }
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3 bg-transparent">
                <span className="text-blue-600 text-2xl bg-transparent">✓</span>
                <div>
                  <h4 className="font-bold text-lg">{item.title}</h4>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Single "Book Now" Button at the Bottom */}
        <div className="text-center mt-12">
        <button
          onClick={() => setActiveSection("home")} // When clicked, show the home section (login/register form)
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition bg-transparent"
        >
          Book Now
        </button>
        </div>
      </div>
    </div>
)}

{activeSection === "shipping" && (
  <div className="h-screen overflow-y-auto pb-[6rem]">
    <div className="container mx-auto mt-20 p-6">
      {/* Section Heading */}
      <h2 className="text-4xl font-bold mb-10 text-center bg-transparent">Shipping & Service Fulfillment Policy</h2>

      {/* Policy Content */}
      <div className="bg-white border rounded-lg shadow-lg p-6 space-y-6 text-gray-800 max-w-3xl mx-auto">
        <section>
          <h3 className="text-2xl font-semibold mb-2">1. Service Fulfillment Commitment</h3>
          <p>
            Once a worker confirms their availability and the customer books the service,
            the worker is fully responsible for delivering the service at the scheduled date and time.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-2">2. Shipping Definition</h3>
          <p>
            "Shipping" in this context refers to the timely arrival and proper execution of the service by the booked worker.
            This includes:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Arriving at the customer’s location on time</li>
            <li>Carrying out the service as described in the booking</li>
            <li>Using any required tools or materials agreed upon</li>
          </ul>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-2">3. Delays and No-Shows</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li>
              Workers must inform both the customer and the platform in advance if any delay or cancellation is unavoidable.
            </li>
            <li>
              Uninformed delays or failure to show up may result in penalties and impact the worker’s standing on the platform.
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-2">4. Customer Assurance</h3>
          <p>
            Customers are assured that service delivery is treated with the same importance as product shipping in e-commerce.
            In cases of failure to fulfill, customers may raise a support request and refer to our <span className="underline">Refund Policy</span>.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-2">5. Contact for Issues</h3>
          <p>
            For any issues related to service delays, non-performance, or support, customers can contact us at:
            <br />
            <strong>Email:</strong> teamservicehelp8@gmail.com
          </p>
        </section>
      </div>

      {/* Back to Home Button */}
      <div className="text-center mt-12">
        <button
          onClick={() => setActiveSection("contact")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition bg-transparent"
        >
          Contact us
        </button>
      </div>
    </div>
  </div>
)}

  {/* Contact Section */}
  {activeSection === "contact" && (
  <div className="h-screen overflow-y-auto bg-gradient-to-br from-purple-600 to-pink-500 text-white pb-[6rem]">
    <div className="container mx-auto mt-20 p-6">
      {/* Section Heading */}
      <h2 className="text-4xl font-bold mb-10 text-center animate-pulse bg-transparent">Contact Us</h2>

      {/* Contact Form */}
      <div className="max-w-lg w-full bg-white shadow-xl p-8 rounded-xl text-gray-900 mx-auto"> {/* Added mx-auto here to center on desktop */}
      <form className="space-y-6" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formDat.name}
              onChange={handleChang}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 transition-shadow focus:shadow-lg"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formDat.email}
              onChange={handleChang}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 transition-shadow focus:shadow-lg"
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Your Phone Number"
              value={formDat.phone}
              onChange={handleChang}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 transition-shadow focus:shadow-lg"
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              value={formDat.message}
              onChange={handleChang}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 transition-shadow focus:shadow-lg"
              rows={4}
              required
            ></textarea>
            <button
              type="submit"
              className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-all duration-300 transform hover:scale-105 shadow-md"
              disabled={loading}
            >
              {loading ? "Sending..." : "Submit"}
            </button>
            {statusMessage && (
              <p className="mt-2 text-center text-sm text-gray-700 bg-transparent">{statusMessage}</p>
            )}
          </form>
      </div>

      {/* Footer */}
      <footer className="mt-6 py-4 w-full bg-gray-800 text-center">
        <p>@All rights reserved || Made with ❤️ by Naveen</p>
      </footer>
    </div>
  </div>
)}

</div>

  );
};

export default HomePage;