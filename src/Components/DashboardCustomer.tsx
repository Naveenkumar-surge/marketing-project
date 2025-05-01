import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/DashboardCustomer.css'; // Importing custom CSS
import { toast } from "react-toastify";
const DashboardCustomer = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [slideType, setSlideType] = useState<'personal' | 'booking' | null>(null);
  const [personalDetails, setPersonalDetails] = useState<any>(null);
  const [personalStep, setPersonalStep] = useState(0);
  const [email, setEmail] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage, setBookingsPerPage] = useState(isMobile ? 1 : 6);

  useEffect(() => {
    const info = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (info?.email) fetchBookings(info.email);
    setEmail(info.email);

    const handleResize = () => {
      const mobileView = window.innerWidth <= 768;
      setIsMobile(mobileView);
      setBookingsPerPage(mobileView ? 1 : 6); // 1 booking per page for mobile, 6 for desktop
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchBookings = async (email: string) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/by-customer/${email}`);
      const filtered = res.data.filter(
        (b: any) => b.workcomplted !== 'done' && b.paymentStatus === 'Paid'
      );
      setBookings(filtered);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const openSlide = async (index: number, type: 'personal' | 'booking') => {
    setCurrentIndex(index);
    setSlideType(type);
    setPersonalStep(0);

    const workerEmail = bookings[index]?.workerEmail;

    if (type === 'personal') {
      try {
        const res = await axios.get(`http://localhost:5000/api/personal-info/personaldetails?email=${workerEmail}`);
        setPersonalDetails(res.data);
      } catch (error) {
        console.error('Error fetching personal info:', error);
      }
    }
  };

  const closeSlide = () => {
    setCurrentIndex(null);
    setSlideType(null);
    setPersonalDetails(null);
    setPersonalStep(0);
  };

  const handleMarkAsDone = async (booking: any) => {
    try {
      const { workerEmail, fromDate, toDate } = booking;

      await axios.put('http://localhost:5000/api/mark-work-done', {
        customerEmail: email,
        workerEmail,
        fromDate,
        toDate,
      });

      setBookings((prev) =>
        prev.filter(
          (b) =>
            !(
              b.workerEmail === workerEmail &&
              b.customerEmail === email &&
              b.fromDate === fromDate &&
              b.toDate === toDate
            )
        )
      );

      toast.success('Work marked as done!');
    } catch (error) {
      console.error('Failed to mark work as done:', error);
      toast.error('Something went wrong.');
    }
  };

  const currentBooking = currentIndex !== null ? bookings[currentIndex] : null;

  // Pagination logic
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);
  const paginatedBookings = bookings.slice(
    (currentPage - 1) * bookingsPerPage,
    currentPage * bookingsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="p-4 relative">
      <h2 className="text-xl font-bold mb-4">Your Bookings</h2>

      {!isMobile ? (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Worker email</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBookings.map((booking, index) => (
              <tr key={booking.workerEmail + index} className="border-t">
                <td className="p-2 border text-gray-800">
                  {booking.workerName || booking.workerEmail || 'N/A'}
                </td>
                <td className="p-2 border">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openSlide(index, 'personal')}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Personal Info
                    </button>
                    <button
                      onClick={() => openSlide(index, 'booking')}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Booking Details
                    </button>
                    <button
                      onClick={() => handleMarkAsDone(booking)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Work Done
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedBookings.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center text-gray-500 p-4 bg-transparent">
                  No pending bookings.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <div className="mobile-cards-container">
          {paginatedBookings.map((booking, index) => (
            <div key={booking.workerEmail + index} className="booking-card">
              <p><strong>Worker:</strong> {booking.workerName || booking.workerEmail || 'N/A'}</p>
              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={() => openSlide(index, 'personal')}
                  className="bg-blue-500 text-white py-1 rounded"
                >
                  Personal Info
                </button>
                <button
                  onClick={() => openSlide(index, 'booking')}
                  className="bg-blue-500 text-white py-1 rounded"
                >
                  Booking Details
                </button>
                <button
                  onClick={() => handleMarkAsDone(booking)}
                  className="bg-green-600 hover:bg-green-700 text-white py-1 rounded text-xs"
                >
                  Work Done
                </button>
              </div>
            </div>
          ))}
          {paginatedBookings.length === 0 && (
            <p className="text-center text-gray-500 bg-transparent">No pending bookings.</p>
          )}
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-300 text-gray-500 px-4 py-2 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="mx-4">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-gray-300 text-gray-500 px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Slide-out panel */}
      {currentBooking && slideType && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <h3 className="text-xl font-semibold mb-4 text-center bg-transparent">
              {slideType === 'personal' ? 'Personal Information' : 'Booking Details'}
            </h3>

            <div className="space-y-3">
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
                </>
              )}

              {slideType === 'booking' && currentBooking && (
                <>
                  <p><strong>Your Name:</strong> {currentBooking.customername}</p>
                  <p><strong>Worker Name:</strong> {currentBooking.workername}</p>
                  <p><strong>Worker Email:</strong> {currentBooking.workerEmail}</p>
                  <p><strong>Service:</strong> {currentBooking.service}</p>
                  <p><strong>From:</strong> {currentBooking.fromDate}</p>
                  <p><strong>To:</strong> {currentBooking.toDate}</p>
                  <p><strong>Worker Price:</strong> {currentBooking.price}</p>
                  <p><strong>Payment Status:</strong> {currentBooking.paymentStatus || 'Pending'}</p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-between items-center">
              {slideType === 'personal' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setPersonalStep((step) => Math.max(0, step - 1))}
                    disabled={personalStep === 0}
                    className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPersonalStep((step) => Math.min(1, step + 1))}
                    disabled={personalStep === 1}
                    className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
              <button
                onClick={closeSlide}
                className="ml-auto bg-red-500 text-white px-4 py-1 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCustomer;
