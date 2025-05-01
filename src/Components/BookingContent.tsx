import '../styles/BookingContent.css'; // Import external CSS
import React, { useEffect, useState } from 'react';
import axios from 'axios';// ✅ Import the external CSS

const BookingContent = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [slideType, setSlideType] = useState<'personal' | 'booking' | null>(null);
  const [personalDetails, setPersonalDetails] = useState<any>(null);
  const [personalStep, setPersonalStep] = useState(0);

  useEffect(() => {
    const info = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (info?.email) fetchBookings(info.email);
  }, []);

  const fetchBookings = async (email: string) => {
    try {
      const res = await axios.get(`https://marketing-nodejs.onrender.com/api/by-worker/${email}`);
      const filtered = res.data.filter((b: any) => b.workcomplted === 'pending' && b.paymentStatus === 'Paid');
      setBookings(filtered);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const openSlide = async (index: number, type: 'personal' | 'booking') => {
    setCurrentIndex(index);
    setSlideType(type);
    setPersonalStep(0);

    const workerEmail = bookings[index]?.customerEmail;
    if (type === 'personal') {
      try {
        const res = await axios.get(
          `https://marketing-nodejs.onrender.com/api/personal-info/personaldetails?email=${workerEmail}`
        );
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

  const currentBooking = currentIndex !== null ? bookings[currentIndex] : null;

  return (
    <div className="p-4 relative">
      <h2 className="text-xl font-bold mb-4">Your Bookings</h2>

      <div className="booking-table-wrapper">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Actions</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr key={booking.customerEmail + index}>
                <td>{booking.customerName || booking.customerEmail || "N/A"}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-button" onClick={() => openSlide(index, "personal")}>Personal Info</button>
                    <button className="action-button" onClick={() => openSlide(index, "booking")}>Booking Details</button>
                  </div>
                </td>
                <td>Pending</td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-gray-500 p-4">No pending bookings.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mobile-booking-cards">
  {bookings.length === 0 ? (
    <div className="text-center text-gray-500 font-bold p-4 bg-transparent">No bookings found.</div>
  ) : (
    bookings.map((booking, index) => (
      <div key={booking.customerEmail + index} className="booking-card">
        <div className="card-heading">🎉 Congratulations! Booking with {booking.customerName || booking.customerEmail}</div>
        <div className="card-status">Work done : Pending</div>
        <div className="card-buttons">
          <button className="card-headin" onClick={() => openSlide(index, 'personal')}>Personal Info</button>
          <button onClick={() => openSlide(index, 'booking')}>Booking Details</button>
        </div>
      </div>
    ))
  )}
</div>
{currentBooking && slideType && (
  <div className="modal-backdrop">
    <div className="modal-panel">
      <h3 className="modal-title">
        {slideType === 'personal' ? 'Personal Information' : 'Booking Details'}
      </h3>

      <div className="personal-info-card space-y-3">
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
            <p><strong>Your Name:</strong> {currentBooking.workername}</p>
            <p><strong>Customer Name:</strong> {currentBooking.customername}</p>
            <p><strong>Customer Email:</strong> {currentBooking.customerEmail}</p>
            <p><strong>Service:</strong> {currentBooking.service}</p>
            <p><strong>From:</strong> {currentBooking.fromDate}</p>
            <p><strong>To:</strong> {currentBooking.toDate}</p>
            <p><strong>Your Price:</strong> {currentBooking.price}</p>
            <p><strong>Payment Status:</strong> {currentBooking.paymentStatus || 'Pending'}</p>
          </>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="modal-footer">
        {slideType === 'personal' && (
          <div className="step-buttons flex gap-2">
            <button
              onClick={() => setPersonalStep((step) => Math.max(0, step - 1))}
              disabled={personalStep === 0}
            >
              Prev
            </button>
            <button
              onClick={() => setPersonalStep((step) => Math.min(1, step + 1))}
              disabled={personalStep === 1}
            >
              Next
            </button>
          </div>
        )}
        <button
          onClick={closeSlide}
          className="close-btn"
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

export default BookingContent;
