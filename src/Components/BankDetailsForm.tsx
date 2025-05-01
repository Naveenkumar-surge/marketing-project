import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import '../styles/BankDetailsForm.css';
const BankDetailsForm = ({ email }: { email: string }) => {
  const [formData, setFormData] = useState({
    email: "",
    contactNumber: "", // <-- added
    bankName: "",
    accountNumber: "",
    ifsc: "",
    bankDoc:"",
    submitted: true,
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
    const [existingData, setExistingData] = useState<any>(null);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [bankDoc, setBankDoc] = useState<File | null>(null);

  const [registeredData, setRegisteredData] = useState<typeof formData | null>(null);
  const [activeTab, setActiveTab] = useState<"bankDetails" | "contactAdmin">("bankDetails");

  const [issueType, setIssueType] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [description, setDescription] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const isFormValid = formData.email && formData.contactNumber&& formData.bankName && formData.accountNumber && formData.ifsc && isOtpVerified;
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      const email = JSON.parse(storedUser)?.email;
      if (email) {
        setUserEmail(email);
      }
    }
  }, []);
  
  
  // Check for bank details on component mount
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const response = await axios.post("https://marketing-nodejs.onrender.com/api/get-bank-details", {
          email: userEmail, // make sure this key matches backend's expectation
        });
  
        if (response.data) {
          setExistingData(response.data); // directly set the returned bankDetails
        } else {
          setRegisteredData(null); // no data found
        }
      } catch (error) {
        setMessage("Error fetching bank details.");
        setMessageType("error");
      }
    };
  
    if (userEmail) {
      fetchBankDetails();
    }
  }, [userEmail]);
  
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      setMessage("Please enter email.");
      setMessageType("error");
      return;
    }
    if (formData.email !== userEmail) {
      setMessage("Please enter registered email.");
      setMessageType("error");
      return;
    }
    


    if (isOtpVerified && verifiedEmail === formData.email) {
      setMessage("OTP already verified for this email.");
      setMessageType("success");
      return;
    }

    setIsOtpVerified(false);
    setVerifiedEmail(null);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    try {
      const response = await fetch("https://marketing-nodejs.onrender.com/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      if (response.ok) {
        setOtpSent(true);
        setMessage("OTP sent to your email.");
        setMessageType("success");
      } else {
        setMessage("Failed to send OTP.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Error sending OTP.");
      setMessageType("error");
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();

    if (enteredOtp === generatedOtp) {
      setIsOtpVerified(true);
      setVerifiedEmail(formData.email);
      setMessage("OTP verified! You can now submit the form.");
      setMessageType("success");
    } else {
      setMessage("Invalid OTP.");
      setMessageType("error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setMessage("Please fill all fields and verify email.");
      setMessageType("error");
      return;
    }
    if(!bankDoc)
    {
      setMessage("Please upload bank passbook.");
    }
    const datas = new FormData();
    datas.append("email", formData.email);
    datas.append("contactNumber", formData.contactNumber);
    datas.append("bankName", formData.bankName);
    datas.append("accountNumber", formData.accountNumber);
    datas.append("ifsc", formData.ifsc);
    if (bankDoc) {
      datas.append("bankDoc", bankDoc);
    }
    try {
      const response = await fetch("https://marketing-nodejs.onrender.com/api/register", {
        method: "POST",
      body: datas, // no headers set here
    });

      const data = await response.json();

      if (response.ok) {
        await fetch("https://marketing-nodejs.onrender.com/api/sendWelcomeEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });

        setMessage("Registration successful!");
        setMessageType("success");
        setRegisteredData({ ...formData });

        localStorage.setItem("bankDetails", JSON.stringify(formData));
        setFormData({ email: "", contactNumber: "", bankName: "", accountNumber: "", ifsc: "", bankDoc:"", submitted: true });
        setEnteredOtp("");
        setOtpSent(false);
        setIsOtpVerified(false);
      } else {
        setMessage(data.message || "Something went wrong.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Failed to register. Try again!");
      setMessageType("error");
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("https://marketing-nodejs.onrender.com/api/contact-admin", {
        issueType,
        email: userEmail,
        description,
      });
      toast.success("Message sent to admin!");
      setIssueType("");
      setAdminEmail("");
      setDescription("");
    } catch (error) {
      toast.error("Failed to send message.");
    }
  };

  const renderContactAdminTab = () => (
    <div className="p-6 bg-white shadow rounded-md w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Contact Admin</h2>

      <form onSubmit={handleAdminSubmit} className="space-y-4">
      <div>
  <label className="block font-medium">Issue Type:</label>
  <select
    value={issueType}
    onChange={(e) => setIssueType(e.target.value)}
    className="w-full mt-1 p-2 border rounded"
    required
  >
    <option value="">Select an issue</option>
    <option value="Update Bank Details">Update Bank Details</option>
    <option value="Change Email">Change Email</option>
    <option value="Incorrect Account Info">Incorrect Account Info</option>
    <option value="Unable to Submit Form">Unable to Submit Form</option>
    <option value="Other">Other</option>
  </select>
</div>


       

        <div className="bank-form-wrapper">
          <label className="block font-medium">Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your issue"
            className="w-full mt-1 p-2 border rounded"
            rows={4}
            required
          />
        </div>

        <button type="submit" className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
          Submit
        </button>
      </form>
    </div>
  );

  const renderBankDetailsTab = () => {
    if (existingData) {
      return (
        <div className="bank-form-wrapper p-6 bg-white shadow rounded-md w-full max-w-lg mx-auto">
          <p className="text-green-600 font-medium mt-4">
            ✅ Please contact admin to edit or update your bank details.
          </p>
          <h2 className=" text-2xl font-bold text-green-700 mb-4">🎉 Registration Successful!</h2>
          <div className=" space-y-2 mb-4">
            <p><strong>Email:</strong> {existingData.email}</p>
            <p><strong>Bank Name:</strong> {existingData.bankName}</p>
            <p><strong>Account Number:</strong> {existingData.accountNumber}</p>
            <p><strong>IFSC Code:</strong> {existingData.ifsc}</p>
          </div>
          <div className="flex justify-center mb-4 gap-4">
            <button
              className="text bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
              onClick={() => setActiveTab("contactAdmin")}
            >
              Contact Admin to Edit
            </button>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white shadow rounded-md w-full max-w-lg mx-auto bank-form-wrapper">
        <h2 className="text text-lg sm:text-xl md:text-2xl font-bold">Bank Details</h2>

        {message && (
          <p className={`font-semibold ${messageType === "success" ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        <div className="flex items-center gap-2">
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter your email"
            className="flex-grow p-2 border rounded form-group "
            required
          />
          <button
            type="button"
            onClick={handleSendOtp}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 send-otp-btn"
          >
            Send OTP
          </button>
        </div>

        {otpSent && !isOtpVerified && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
              placeholder="Enter OTP"
              className="flex-grow p-2 border rounded form-group"
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 form-button"
            >
              Verify OTP
            </button>
          </div>
        )}

        {isOtpVerified && (
          <p className="text-green-600 font-semibold">✅ Email Verified</p>
        )}
         <label className="block">
  Contact Number:
  <input
    type="tel"
    value={formData.contactNumber}
    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
    placeholder="Enter your contact number"
    className="w-full mt-1 p-2 border rounded form-group"
    required
  />
</label>
        <label className="block">
          Bank Name:
          <input
            type="text"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            placeholder="Enter your bank name"
            className="w-full mt-1 p-2 border rounded form-group"
            required
          />
        </label>
        
        <label className="block">
          Account Number:
          <input
            type="text"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            placeholder="Enter your account number"
            className="w-full mt-1 p-2 border rounded form-group"
            required
          />
        </label>

        <label className="block">
          IFSC Code:
          <input
            type="text"
            value={formData.ifsc}
            onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
            placeholder="Enter IFSC code"
            className="w-full mt-1 p-2 border rounded form-group"
            required
          />
        </label>
        <label className="block">
  Upload Passbook (PDF/JPG/PNG):
  <input
    type="file"
    accept=".pdf,.jpg,.jpeg,.png"
    onChange={(e) => {
      if (e.target.files && e.target.files[0]) {
        setBankDoc(e.target.files[0]);
      }
    }}
    className="w-full mt-1 p-2 border rounded form-group"
    required
  />
</label>

        <button
          type="submit"
          disabled={!isFormValid}
          className={`px-4 py-2 rounded text-white ${isFormValid ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}
        >
          Submit
        </button>
      </form>
    );
  };

  return (
    <div>
      {/* Tab Header */}
      <div className="tab-header flex justify-center mb-4 gap-4">
        <button
          onClick={() => setActiveTab("bankDetails")}
          className={`tab-button px-4 py-2 rounded-t-md font-medium ${activeTab === "bankDetails" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
        >
          Bank Details
        </button>
        <button
          onClick={() => setActiveTab("contactAdmin")}
          className={`tab-button px-4 py-2 rounded-t-md font-medium ${activeTab === "contactAdmin" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
        >
          Contact Admin
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "bankDetails" ? renderBankDetailsTab() : renderContactAdminTab()}
    </div>
  );
};

export default BankDetailsForm;
