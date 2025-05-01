import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/CompletedWork.css';

const BookingHistory = () => {
  const [completed, setCompleted] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const itemsPerPage = isMobile ? completed.length : 5;

  useEffect(() => {
    const info = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (info?.email) fetchCompletedBookings(info.email);
  }, []);

  const fetchCompletedBookings = async (email: string) => {
    try {
      const res = await axios.get(`https://marketing-nodejs.onrender.com/api/by-worker/${email}`);
      const completedBookings = res.data.filter((b: any) => b.workcomplted === 'done');
      setCompleted(completedBookings);
    } catch (error) {
      console.error('Error fetching completed bookings:', error);
    }
  };

  const totalPages = Math.ceil(completed.length / itemsPerPage);
  const paginatedData = completed.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  return (
    <div className="completed-header p-4">
      <h2 className="completed-heading text-xl font-bold mb-4">Completed Work</h2>

      {completed.length === 0 ? (
        <p>No work has been marked as completed yet.</p>
      ) : (
        <>
          {/* Desktop/Table View */}
          <table className="hidden md:table min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Customer Name</th>
                <th className="p-2 border">Customer Email</th>
                <th className="p-2 border">Service</th>
                <th className="p-2 border">From</th>
                <th className="p-2 border">To</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((booking, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2 border">{booking.customername || 'N/A'}</td>
                  <td className="p-2 border">{booking.customerEmail}</td>
                  <td className="p-2 border">{booking.service}</td>
                  <td className="p-2 border">{booking.fromDate}</td>
                  <td className="p-2 border">{booking.toDate}</td>
                  <td className="p-2 border text-green-600 font-semibold text-xs">Done</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Scrollable Card View */}
          <div className="md:hidden flex flex-col gap-4 overflow-y-auto max-h-[70vh] pr-2">
            {completed.map((booking, index) => (
              <div key={index} className="border rounded-lg shadow p-4 bg-white">
                <p className="text-sm"><span className="font-semibold">Customer Name:</span> {booking.customername || 'N/A'}</p>
                <p className="text-sm"><span className="font-semibold">Email:</span> {booking.customerEmail}</p>
                <p className="text-sm"><span className="font-semibold">Service:</span> {booking.service}</p>
                <p className="text-sm"><span className="font-semibold">From:</span> {booking.fromDate}</p>
                <p className="text-sm"><span className="font-semibold">To:</span> {booking.toDate}</p>
                <p className="text-sm text-green-600 font-semibold">Status: Done</p>
              </div>
            ))}
          </div>

          {/* Pagination Controls - Only for Desktop */}
          {!isMobile && (
            <div className="flex justify-center mt-4 gap-4">
              <button
                className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
                onClick={handlePrev}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookingHistory;
