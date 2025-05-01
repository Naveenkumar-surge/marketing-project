import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import './WorkerDashboard.mobile.css';
const PersonalInfoForm = ({ email }: { email: string }) => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [existingData, setExistingData] = useState<any>(null);

  // Current Address Fields
  const [currentCity, setCurrentCity] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [currentContact, setCurrentContact] = useState("");

  // Permanent Address Fields
  const [permanentCity, setPermanentCity] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [permanentPin, setPermanentPin] = useState("");
  const [permanentContact, setPermanentContact] = useState("");
  const [loading, setLoading] = useState(true);
  // File Uploads
  const [aadhar, setAadhar] = useState<File | null>(null);
  const [pan, setPan] = useState<File | null>(null);
  const [aadharNumber, setAadharNumber] = useState<string>("");
  const [panNumber, setPanNumber] = useState<string>("");
  const isValidPhone = (number: string) => /^\d{10}$/.test(number);
  const isValidPin = (pin: string) => /^\d{6}$/.test(pin);
  interface ErrorType {
    aadharNumber?: string;
    panNumber?: string;
    [key: string]: string | undefined; // to allow dynamic keys if needed
  }
  const [errors, setErrors] = useState<ErrorType>({});
  const validate = () => {
    const newErrors: ErrorType = {};

    // Aadhar validation: 12 digits
    if (!/^\d{12}$/.test(aadharNumber)) {
      newErrors.aadharNumber = "Aadhar number must be exactly 12 digits.";
    }

    // PAN validation: 5 letters + 4 digits + 1 letter
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber.toUpperCase())) {
      newErrors.panNumber = "PAN number must be 10 characters (e.g., ABCDE1234F).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/personal-info/personaldetails?email=${email}`);
        if (res.data && Object.keys(res.data).length > 0) {
          setExistingData(res.data);
          setSubmitted(true);
        } else {
          setExistingData(null);
          setSubmitted(false);
        }
      } catch (err) {
        setExistingData(null);
        setSubmitted(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [email]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !currentCity || !currentAddress || !currentPin || !currentContact ||
      !permanentCity || !permanentAddress || !permanentPin || !permanentContact ||
      !aadhar || !pan
    ) {
      toast.error("Please fill all fields before submitting.");
      return;
    }
    const isValid = validate();
  if (!isValid) {
    return; // Prevent submission if validation fails
  }

    if (!isValidPhone(currentContact) || !isValidPhone(permanentContact)) {
      toast.error("Contact numbers must be exactly 10 digits.");
      return;
    }

    if (!isValidPin(currentPin) || !isValidPin(permanentPin)) {
      toast.error("PIN codes must be exactly 6 digits.");
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("currentCity", currentCity);
    formData.append("currentAddress", currentAddress);
    formData.append("currentPin", currentPin);
    formData.append("currentContact", currentContact);
    formData.append("permanentCity", permanentCity);
    formData.append("permanentAddress", permanentAddress);
    formData.append("permanentPin", permanentPin);
    formData.append("permanentContact", permanentContact);
    formData.append("aadhar", aadhar);
    formData.append("pan", pan);
    formData.append("aadharNumber", aadharNumber);
    formData.append("panNumber", panNumber);
    try {
      await axios.post("http://localhost:5000/api/personal-info/", formData);
      toast.success("Personal Info submitted!");
      setSubmitted(true);
      
      setIsUpdating(false);
      setExistingData({
        email,
        currentCity,
        currentAddress,
        currentPin,
        currentContact,
        permanentCity,
        permanentAddress,
        permanentPin,
        permanentContact,
        aadharNumber,
        panNumber,
      });
    } catch (err) {
      toast.error("Error submitting info");
    }
  };
  const handleUpdate = () => {
    if (existingData) {
      setCurrentCity(existingData.currentCity);
      setCurrentAddress(existingData.currentAddress);
      setCurrentPin(existingData.currentPin);
      setCurrentContact(existingData.currentContact);
      setPermanentCity(existingData.permanentCity);
      setPermanentAddress(existingData.permanentAddress);
      setPermanentPin(existingData.permanentPin);
      setPermanentContact(existingData.permanentContact);
      setAadharNumber(existingData.aadharNumber);
      setPanNumber(existingData.panNumber);
      setStep(1);
      setIsUpdating(true);
    }
  };

  if (existingData) {
    return (
      <div className="personal-info-container p-6 bg-white shadow rounded-md w-full max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Personal Info Summary</h2>
        <div className="space-y-2 text-gray-800">
          <p><strong>Current City:</strong> {existingData.currentCity}</p>
          <p><strong>Current Address:</strong> {existingData.currentAddress}</p>
          <p><strong>Current Pin:</strong> {existingData.currentPin}</p>
          <p><strong>Current Contact:</strong> {existingData.currentContact}</p>
          <p><strong>Permanent City:</strong> {existingData.permanentCity}</p>
          <p><strong>Permanent Address:</strong> {existingData.permanentAddress}</p>
          <p><strong>Permanent Pin:</strong> {existingData.permanentPin}</p>
          <p><strong>Permanent Contact:</strong> {existingData.permanentContact}</p>
          
          <div className="mt-4 space-y-2">
            <p><strong>Aadhar Number:</strong> {existingData.aadharNumber}</p>
            <p><strong>PAN Number:</strong> {existingData.panNumber}</p>
          </div>
        </div>

        {/* <button
          onClick={handleUpdate}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update
        </button> */}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="personal-info-container space-y-4 p-6 bg-white shadow rounded-md w-full max-w-lg mx-auto form-container mt-4 md:mt-9">
      <h2 className="personal-info-container text-2xl font-bold text-blue-700">Personal Information</h2>

      {/* Step 1: Current Address */}
      {step === 1 && (
        <>
          <label className="block">
            Current City:
            <input
              type="text"
              value={currentCity}
              onChange={(e) => setCurrentCity(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Enter City"
            />
          </label>
          <label className="block">
            Current Address:
            <input
              type="text"
              value={currentAddress}
              onChange={(e) => setCurrentAddress(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Enter Address"
            />
          </label>
          <label className="block">
            Current Pin Code:
            <input
              type="text"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Enter PIN Code"
            />
          </label>
          <label className="block">
            Current Contact Number:
            <input
              type="text"
              value={currentContact}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,10}$/.test(value)) setCurrentContact(value);
              }}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Enter Contact Number"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              if (!currentCity || !currentAddress || !currentPin || !currentContact) {
                toast.error("Please fill all current address fields.");
                return;
              }
              if (!isValidPhone(currentContact) || !isValidPin(currentPin)) {
                toast.error("Contact and PIN must be valid.");
                return;
              }
              setStep(2);
            }}
            className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
          >
            Next
          </button>
        </>
      )}

      {/* Step 2: Permanent Address */}
      {step === 2 && (
        <>
          <label className="block">
            Permanent City:
            <input
              type="text"
              value={permanentCity}
              onChange={(e) => setPermanentCity(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Enter City"
            />
          </label>
          <label className="block">
            Permanent Address:
            <input
              type="text"
              value={permanentAddress}
              onChange={(e) => setPermanentAddress(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Enter Address"
            />
          </label>
          <label className="block">
            Permanent Pin Code:
            <input
              type="text"
              value={permanentPin}
              onChange={(e) => setPermanentPin(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Enter PIN Code"
            />
          </label>
          <label className="block">
            Permanent Contact Number:
            <input
              type="text"
              value={permanentContact}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,10}$/.test(value)) setPermanentContact(value);
              }}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Enter Contact Number"
            />
          </label>
          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="text-blue-600 underline">Back</button>
            <button
              type="button"
              onClick={() => {
                if (!permanentCity || !permanentAddress || !permanentPin || !permanentContact) {
                  toast.error("Please fill all permanent address fields.");
                  return;
                }
                if (!isValidPhone(permanentContact) || !isValidPin(permanentPin)) {
                  toast.error("Contact and PIN must be valid.");
                  return;
                }
                setStep(3);
              }}
              className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </>
      )}

     {/* Step 3: File Uploads */}
      {/* Step 3: Aadhar & PAN Upload */}
      {step === 3 && (
        <>
          <label className="block">
            Aadhar Number:
            <input
              type="text"
              value={aadharNumber}
              onChange={(e) => setAadharNumber(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Enter 12-digit Aadhar Number"
            />
            {errors.aadharNumber && <p className="text-red-500">{errors.aadharNumber}</p>}
          </label>

          <label className="block">
            Aadhar File Upload:
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setAadhar(e.target.files?.[0] || null)}
              className="w-full mt-1 p-2 border rounded"
            />
          </label>

          <label className="block">
            PAN Number:
            <input
              type="text"
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Enter PAN Number (e.g. ABCDE1234F)"
            />
            {errors.panNumber && <p className="text-red-500">{errors.panNumber}</p>}
          </label>

          <label className="block">
            PAN File Upload:
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setPan(e.target.files?.[0] || null)}
              className="w-full mt-1 p-2 border rounded"
            />
          </label>

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(2)} className="text-blue-600 underline">Back</button>
            <button
              type="submit"
              onClick={() => {
                const isValid = validate();
                if (!isValid) return;
              }}
              className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700"
            >
              Submit
            </button>
          </div>
        </>
      )}

    </form>
  );
};

export default PersonalInfoForm;
