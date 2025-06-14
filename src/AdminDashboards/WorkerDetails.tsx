// Add imports at the top
import React, { useEffect, useState,useRef } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`; // Webpack 5 or Vite

// ✅ Set the workerSrc only once

interface Props {
  base64: string;
}

const WorkerDetails = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [slideType, setSlideType] = useState<'personal' | 'bank' | null>(null);
  const [personalDetails, setPersonalDetails] = useState<any>(null);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [personalStep, setPersonalStep] = useState(0);
  const [bankStep, setBankStep] = useState(0);
  const [aadharBase64, setAadharBase64] = useState<string | null>(null);
  const [panBase64, setPanBase64] = useState<string | null>(null);
  const [bankDocBase64, setBankDocBase64] = useState<string | null>(null);
  const [loadingBankDoc, setLoadingBankDoc] = useState(false);
  const [loadingAadhar, setLoadingAadhar] = useState(false);
  const [loadingPan, setLoadingPan] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const itemsPerPage = 6;
 useEffect(() => {
       const checkMobile = () => setIsMobile(window.innerWidth < 768);
       checkMobile();
       window.addEventListener('resize', checkMobile);
       return () => window.removeEventListener('resize', checkMobile);
     }, []);
  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
     // Always call for personal files only on desktop
     if (!isMobile && slideType === 'personal' && personalStep === 2 && personalDetails) {
       fetchBase64Files();
     }
   
     // Call bank doc for both desktop and mobile
     if (slideType === 'bank' && bankStep === 1 && bankDetails) {
       fetchBankDoc();
     }
   }, [personalStep, bankStep, isMobile, slideType, personalDetails, bankDetails]);
   

  const fetchWorkers = async () => {
    try {
      const res = await axios.get('https://marketing-nodejs.onrender.com/api/auth/getworkersDetails');
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
    setBankStep(0);
    setAadharBase64(null);
    setPanBase64(null);
    setBankDocBase64(null);

    const email = workers[index]?.email;
    if (type === 'personal') {
      try {
        const res = await axios.get(`https://marketing-nodejs.onrender.com/api/personal-info/personaldetails?email=${email}`);
        setPersonalDetails(res.data);
      } catch (error) {
        console.error('Failed to fetch personal info:', error);
      }
    } else if (type === 'bank') {
      try {
        const res = await axios.get(`https://marketing-nodejs.onrender.com/api/details?email=${email}`);
        setBankDetails(res.data);
      } catch (error) {
        console.error('Failed to fetch bank info:', error);
      }
    }
  };

  const fetchBase64Files = async () => {
    setLoadingAadhar(true);
    setLoadingPan(true);

    try {
      if (personalDetails?.aadharFileId) {
        const { data } = await axios.get(`https://marketing-nodejs.onrender.com/api/personal-info/filebase64/${personalDetails.aadharFileId}`);
        setAadharBase64(`data:application/pdf;base64,${data.base64}`);
      }
    } catch (error) {
      console.error('Error fetching Aadhar base64:', error);
    } finally {
      setLoadingAadhar(false);
    }

    try {
      if (personalDetails?.panFileId) {
        const { data } = await axios.get(`https://marketing-nodejs.onrender.com/api/personal-info/filebase64/${personalDetails.panFileId}`);
        setPanBase64(`data:application/pdf;base64,${data.base64}`);
      }
    } catch (error) {
      console.error('Error fetching PAN base64:', error);
    } finally {
      setLoadingPan(false);
    }
  };

  const fetchBankDoc = async () => {
    setLoadingBankDoc(true);
    try {
      if (bankDetails?.bankDocFileId) {
        const { data } = await axios.get(`https://marketing-nodejs.onrender.com/api/filebase64/${bankDetails.bankDocFileId}`);
        setBankDocBase64(`data:application/pdf;base64,${data.base64}`);
      }
    } catch (error) {
      console.error('Failed to load bank doc:', error);
    } finally {
      setLoadingBankDoc(false);
    }
  };

  const handleDeleteBankDoc = async () => {
    if (!bankDetails?.email) return;
    const confirmDelete = window.confirm("Are you sure you want to delete the bank document?");
    if (!confirmDelete) return;

    try {
        await axios.delete(`https://marketing-nodejs.onrender.com/api/delete?email=${bankDetails.email}`);
        toast.success("Personal info deleted and email sent successfully.");
      } catch (error) {
        console.error("Failed to delete personal info or send email:", error);
        toast.error("Something went wrong while deleting or sending email.");
      }
  };

  const closeSlide = () => {
    setCurrentIndex(null);
    setSlideType(null);
    setPersonalDetails(null);
    setBankDetails(null);
    setPersonalStep(0);
    setBankStep(0);
    setAadharBase64(null);
    setPanBase64(null);
    setBankDocBase64(null);
    setLoadingAadhar(false);
    setLoadingPan(false);
    setLoadingBankDoc(false);
  };

  const handleApprove = async (email: string) => {
    try {
      await axios.put('https://marketing-nodejs.onrender.com/api/workers/approve', { email });
      toast.success('User approved successfully!');
    } catch (error) {
      console.error('Approval failed:', error);
      toast.error('Failed to approve user.');
    }
  };
  const handleDeletePersonalInfo = async () => {
    if (!personalDetails?.email) return;

    const confirmed = window.confirm("Are you sure you want to delete this personal info?");
    if (!confirmed) return;

    try {
      await axios.delete(`https://marketing-nodejs.onrender.com/api/personal-info/delete?email=${personalDetails.email}`);
      toast.success("Personal info deleted and email sent successfully.");
    } catch (error) {
      console.error("Failed to delete personal info or send email:", error);
      toast.error("Something went wrong while deleting or sending email.");
    }
  };
   useEffect(() => {
    const fetchAadharAndPan = async () => {
      if (personalStep === 2 && personalDetails?.aadharFileId && !aadharBase64) {
        setLoadingAadhar(true);
        try {
          const { data } = await axios.get(
            `https://marketing-nodejs.onrender.com/api/personal-info/filebase64/${personalDetails.aadharFileId}`
          );
          setAadharBase64(`data:application/pdf;base64,${data.base64}`);
        } catch (error) {
          console.error('Error fetching Aadhar base64:', error);
        } finally {
          setLoadingAadhar(false);
        }
      }
  
      if (personalStep === 3 && personalDetails?.panFileId && !panBase64) {
        setLoadingPan(true);
        try {
          const { data } = await axios.get(
            `https://marketing-nodejs.onrender.com/api/personal-info/filebase64/${personalDetails.panFileId}`
          );
          setPanBase64(`data:application/pdf;base64,${data.base64}`);
        } catch (error) {
          console.error('Error fetching PAN base64:', error);
        } finally {
          setLoadingPan(false);
        }
      }
    };
  
    if (slideType === 'personal' && isMobile) {
      fetchAadharAndPan();
    }
  }, [personalStep, slideType, personalDetails, aadharBase64, panBase64]);
   const PDFViewer = ({ base64 }: Props) => {
      const canvasRef = useRef<HTMLCanvasElement>(null);
    
      useEffect(() => {
        const loadingTask = getDocument({ data: atob(base64.split(",")[1]) });
        loadingTask.promise.then((pdf) => {
          pdf.getPage(1).then((page) => {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = canvasRef.current;
            if (canvas) {
              const context = canvas.getContext("2d");
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              page.render({ canvasContext: context!, viewport });
            }
          });
        });
      }, [base64]);
    
      return <canvas ref={canvasRef} className="w-full border rounded" />;
    };
  
  const worker = currentIndex !== null ? workers[currentIndex] : null;
  const indexOfLastWorker = currentPage * itemsPerPage;
  const indexOfFirstWorker = indexOfLastWorker - itemsPerPage;
  const currentWorkers = workers.slice(indexOfFirstWorker, indexOfLastWorker);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  return (
    <div className="p-4 relative">
      <h2 className="text-xl font-bold mb-4">Worker Details</h2>
      <div className="hidden md:block">
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
                <button
                  className="bg-purple-500 text-white px-2 py-1 rounded"
                  onClick={() => openSlide(index, 'bank')}
                >
                  Bank Details
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
      <div className="flex justify-center mt-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span className="mx-2">{currentPage}</span>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(workers.length / itemsPerPage)}
          >
            Next
          </button>
        </div>
      </div>
      {/* Mobile Cards */}
    {/* Mobile Cards */}
<div className="md:hidden max-h-[80vh] overflow-y-auto flex flex-col items-center gap-4 px-4 py-4 pb-[6rem]">
  {workers
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    .map((worker, index) => {
      const globalIndex = (currentPage - 1) * itemsPerPage + index;
      return (
        <div key={worker.email} className="bg-white p-4 rounded shadow-md w-full max-w-xs">
          <div className="font-semibold text-lg text-center bg-transparent">{worker.name}</div>
          <div className="text-center bg-transparent">{worker.email}</div>
          <div className="text-center bg-transparent">{worker.contactNumber}</div>

          <div className="mt-4 flex justify-between">
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded w-[48%]"
              onClick={() => openSlide(globalIndex, 'personal')}
            >
              Personal Info
            </button>
            <button
              className="bg-purple-500 text-white px-2 py-1 rounded w-[48%]"
              onClick={() => openSlide(globalIndex, 'bank')}
            >
              Bank Details
            </button>
          </div>

          <div className="mt-4 flex justify-center">
            {worker.approved ? (
              <span className="text-green-600 font-semibold">Approved</span>
            ) : (
              <button
                className="bg-green-500 text-white px-4 py-1 rounded"
                onClick={() => handleApprove(worker.email)}
              >
                Approve
              </button>
            )}
          </div>
        </div>
      );
    })}
</div>


      {/* Slide Modal */}
      {worker && slideType && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <h3 className="text-xl font-semibold mb-4 text-center bg-transparent">
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

{!isMobile && personalStep === 2 && (
            <>
              <p><strong>Aadhar Number:</strong> {personalDetails.aadharNumber}</p>
              {loadingAadhar ? (
                <p className="text-sm text-gray-500">Loading Aadhar file...</p>
              ) : aadharBase64 ? (
                <embed
                  src={aadharBase64}
                  type="application/pdf"
                  className="border w-full h-[100px] md:h-[100px]"
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
                  className="border w-full h-[100px] md:h-[100px]"
                />
              ) : (
                <p className="text-red-500">PAN file not available.</p>
              )}
            </>
          )}

          {/* Aadhar on step 2 (Mobile) */}
          {isMobile && personalStep === 2 && (
  <>
    <p><strong>Aadhar Number:</strong> {personalDetails.aadharNumber}</p>
    {loadingAadhar ? (
      <p className="text-sm text-gray-500">Loading Aadhar file...</p>
    ) : aadharBase64 ? (
      <div style={{ maxHeight: '250px', overflowY: 'scroll' }}>
        <PDFViewer base64={aadharBase64} />
      </div>
    ) : (
      <p className="text-red-500">Aadhar file not available.</p>
    )}
  </>
)}

{isMobile && personalStep === 3 && (
  <>
    <p><strong>PAN Number:</strong> {personalDetails.panNumber}</p>
    {loadingPan ? (
      <p className="text-sm text-gray-500">Loading PAN file...</p>
    ) : panBase64 ? (
      <div style={{ maxHeight: '250px', overflowY: 'scroll' }}>
        <PDFViewer base64={panBase64} />
      </div>
    ) : (
      <p className="text-red-500">PAN file not available.</p>
    )}
  </>
)}
        </>
      )}

              {slideType === 'bank' && bankDetails && (
                <>
                  {bankStep === 0 && (
                    <>
                      <p><strong>Bank Name:</strong> {bankDetails.bankName}</p>
                      <p><strong>Account Number:</strong> {bankDetails.accountNumber}</p>
                      <p><strong>IFSC:</strong> {bankDetails.ifsc}</p>
                    </>
                  )}

                  {!isMobile && bankStep === 1 && (
                    <>
                      <p><strong>Bank Document:</strong></p>
                      {loadingBankDoc ? (
                        <p className="text-sm text-gray-500">Loading document...</p>
                      ) : bankDocBase64 ? (
                        <embed src={bankDocBase64} type="application/pdf" width="100%" height="200px" className="border" />
                      ) : (
                        <p className="text-red-500">Document not available.</p>
                      )}
                    </>
                  )}
            {isMobile && bankStep === 1 && (
  <>
    <p><strong>Bank Document:</strong></p>
    {loadingBankDoc ? (
      <p className="text-sm text-gray-500">Loading document...</p>
    ) : bankDocBase64 && bankDocBase64.startsWith("data:application/pdf") ? (
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        <PDFViewer base64={bankDocBase64} />
      </div>
    ) : (
      <p className="text-red-500">Document not available.</p>
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

              {slideType === 'bank' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setBankStep((step) => Math.max(0, step - 1))}
                    disabled={bankStep === 0}
                    className="bg-gray-300 px-2 py-1 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setBankStep((step) => Math.min(1, step + 1))}
                    disabled={bankStep === 1}
                    className="bg-gray-300 px-2 py-1 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                  <button
                    onClick={handleDeleteBankDoc}
                    className="bg-yellow-600 text-white px-3 py-1 rounded"
                  >
                    Delete Bank Info
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

export default WorkerDetails;
