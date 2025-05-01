// Add imports at the top
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CustomerDetails = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [slideType, setSlideType] = useState<'personal' | 'bank' | null>(null);
  const [personalDetails, setPersonalDetails] = useState<any>(null);
  const [personalStep, setPersonalStep] = useState(0);
  const [aadharBase64, setAadharBase64] = useState<string | null>(null);
  const [panBase64, setPanBase64] = useState<string | null>(null);
  const [loadingAadhar, setLoadingAadhar] = useState(false);
  const [loadingPan, setLoadingPan] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    if (personalStep === 2 && personalDetails) {
      fetchBase64Files();
    }
  }, [personalStep]);

  const fetchWorkers = async () => {
    try {
      const res = await axios.get('https://marketing-nodejs.onrender.com/api/auth/getCustomerDetails');
      const filtered = res.data.filter((b: any) => b.approved ===false);
      setWorkers(filtered);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const openSlide = async (index: number, type: 'personal' | 'bank') => {
    setCurrentIndex(index);
    setSlideType(type);
    setPersonalStep(0);
    setAadharBase64(null);
    setPanBase64(null);

    if (type === 'personal') {
      const email = workers[index]?.email;
      try {
        const res = await axios.get(`https://marketing-nodejs.onrender.com/api/personal-info/personaldetails?email=${email}`);
        setPersonalDetails(res.data);
      } catch (error) {
        console.error('Failed to fetch personal info:', error);
      }
    }
  };

  const fetchBase64Files = async () => {
    setLoadingAadhar(true);
    setLoadingPan(true);

    if (personalDetails?.aadharFileId) {
      try {
        const { data } = await axios.get(`https://marketing-nodejs.onrender.com/api/personal-info/filebase64/${personalDetails.aadharFileId}`);
        setAadharBase64(`data:application/pdf;base64,${data.base64}`);
      } catch (error) {
        console.error('Error fetching Aadhar base64:', error);
      } finally {
        setLoadingAadhar(false);
      }
    }

    if (personalDetails?.panFileId) {
      try {
        const { data } = await axios.get(`https://marketing-nodejs.onrender.com/api/personal-info/filebase64/${personalDetails.panFileId}`);
        setPanBase64(`data:application/pdf;base64,${data.base64}`);
      } catch (error) {
        console.error('Error fetching PAN base64:', error);
      } finally {
        setLoadingPan(false);
      }
    }
  };

  const closeSlide = () => {
    setCurrentIndex(null);
    setSlideType(null);
    setPersonalDetails(null);
    setPersonalStep(0);
    setAadharBase64(null);
    setPanBase64(null);
    setLoadingAadhar(false);
    setLoadingPan(false);
  };

  const handleApprove = async (email: string) => {
    try {
      await axios.put('https://marketing-nodejs.onrender.com/api/workers/approve', { email });
      alert('User approved successfully!');
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Failed to approve user.');
    }
  };

  const handleDeletePersonalInfo = async () => {
    if (!personalDetails?.email) return;
  
    const confirmed = window.confirm("Are you sure you want to delete this personal info?");
    if (!confirmed) return;
  
    try {
      await axios.delete(`https://marketing-nodejs.onrender.com/api/personal-info/delete?email=${personalDetails.email}`);
  
      alert("Personal info deleted and email sent successfully.");
    } catch (error) {
      console.error("Failed to delete personal info or send email:", error);
      alert("Something went wrong while deleting or sending email.");
    }
  };
  

  const worker = currentIndex !== null ? workers[currentIndex] : null;

  return (
    <div className="p-4 relative">
      <h2 className="text-xl font-bold mb-4">Customer Details</h2>

      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Contact</th>
            <th className="p-2 border">Actions</th>
            <th className="p-2 border">Approval</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((worker, index) => (
            <tr key={worker.email} className="border-t">
              <td className="p-2 border">{worker.name}</td>
              <td className="p-2 border">{worker.email}</td>
              <td className="p-2 border">{worker.contactNumber}</td>
              <td className="p-2 border space-x-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => openSlide(index, 'personal')}
                >
                  Personal Info
                </button>
              </td>
              <td className="p-2 border">
                {worker.approved ? (
                  <span className="text-green-600 font-semibold">Approved</span>
                ) : (
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded"
                    onClick={() => handleApprove(worker.email)}
                  >
                    Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Slide Modal */}
      {worker && slideType && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <h3 className="text-xl font-semibold mb-4 text-center">
              {slideType === 'personal' ? 'Personal Information' : 'Bank Details'}
            </h3>

            <div className="space-y-4">
              {slideType === 'personal' && personalDetails && (
                <>
                  {personalStep === 0 && (
                    <>
                      <p><strong>Current City:</strong> {personalDetails.currentCity}</p>
                      <p><strong>Current Address:</strong> {personalDetails.currentAddress}</p>
                      <p><strong>PIN:</strong> {personalDetails.currentPin}</p>
                      <p><strong>Contact:</strong> {personalDetails.currentContact}</p>
                    </>
                  )}

                  {personalStep === 1 && (
                    <>
                      <p><strong>Permanent City:</strong> {personalDetails.permanentCity}</p>
                      <p><strong>Permanent Address:</strong> {personalDetails.permanentAddress}</p>
                      <p><strong>PIN:</strong> {personalDetails.permanentPin}</p>
                      <p><strong>Contact:</strong> {personalDetails.permanentContact}</p>
                    </>
                  )}

                  {personalStep === 2 && (
                    <>
                      <p><strong>Aadhar Number:</strong> {personalDetails.aadharNumber}</p>
                      {loadingAadhar ? (
                        <p className="text-sm text-gray-500">Loading Aadhar file...</p>
                      ) : aadharBase64 ? (
                        <embed
                          src={aadharBase64}
                          type="application/pdf"
                          width="100%"
                          height="200px"
                          className="border"
                        />
                      ) : (
                        <p className="text-red-500">Aadhar file not available.</p>
                      )}

                      <p className="mt-4"><strong>PAN Number:</strong> {personalDetails.panNumber}</p>
                      {loadingPan ? (
                        <p className="text-sm text-gray-500">Loading PAN file...</p>
                      ) : panBase64 ? (
                        <embed
                          src={panBase64}
                          type="application/pdf"
                          width="100%"
                          height="200px"
                          className="border"
                        />
                      ) : (
                        <p className="text-red-500">PAN file not available.</p>
                      )}
                    </>
                  )}
                </>
              )}

            </div>

            {/* Navigation & Buttons */}
            <div className="mt-6 flex justify-between items-center flex-wrap gap-2">
              {slideType === 'personal' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setPersonalStep((step) => Math.max(0, step - 1))}
                    disabled={personalStep === 0}
                    className="bg-gray-300 px-2 py-1 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPersonalStep((step) => Math.min(2, step + 1))}
                    disabled={personalStep === 2}
                    className="bg-gray-300 px-2 py-1 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}

              <div className="flex gap-2 ml-auto">
                {slideType === 'personal' && (
                  <button
                    onClick={handleDeletePersonalInfo}
                    className="bg-yellow-600 text-white px-3 py-1 rounded"
                  >
                    Delete Personal Info
                  </button>
                )}
                <button
                  onClick={closeSlide}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;
