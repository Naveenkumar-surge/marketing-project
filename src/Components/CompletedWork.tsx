import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CompletedWork = () => {
  const [completed, setCompleted] = useState<any[]>([]);
  const [mobilePage, setMobilePage] = useState(0); // for mobile one card per page
  const [desktopPage, setDesktopPage] = useState(0); // for desktop 6 items per page
  const itemsPerPage = 6;

  useEffect(() => {
    const info = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (info?.email) fetchCompletedBookings(info.email);
  }, []);

  const fetchCompletedBookings = async (email: string) => {
    try {
      const res = await axios.get(`https://marketing-nodejs.onrender.com/api/by-customer/${email}`);
      const completedBookings = res.data.filter((b: any) => b.workcomplted === 'done');
      setCompleted(completedBookings);
    } catch (error) {
      console.error('Error fetching completed bookings:', error);
    }
  };

  const handleMobileNext = () => {
    if (mobilePage < completed.length - 1) setMobilePage(mobilePage + 1);
  };
  const handleMobilePrev = () => {
    if (mobilePage > 0) setMobilePage(mobilePage - 1);
  };

  const handleDesktopNext = () => {
    if ((desktopPage + 1) * itemsPerPage < completed.length) setDesktopPage(desktopPage + 1);
  };
  const handleDesktopPrev = () => {
    if (desktopPage > 0) setDesktopPage(desktopPage - 1);
  };

  const paginatedDesktopData = completed.slice(
    desktopPage * itemsPerPage,
    (desktopPage + 1) * itemsPerPage
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-center mb-4 bg-transparent">Completed Work</h2>

      {/* ✅ MOBILE VIEW */}
      <div className="block md:hidden">
  {completed.length === 0 ? (
    <p className="text-gray-700 bg-transparent">No work has been marked as completed yet.</p>
  ) : (
    <div className="space-y-4 pb-[6rem]">
      {completed.map((booking, index) => (
        <div
          key={index}
          className="bg-white shadow-md rounded-lg p-4 mx-2 border border-gray-200"
        >
          <p><strong>Worker Name:</strong> {booking.workername || 'N/A'}</p>
          <p><strong>Email:</strong> {booking.workerEmail}</p>
          <p><strong>Service:</strong> {booking.service}</p>
          <p><strong>From:</strong> {booking.fromDate}</p>
          <p><strong>To:</strong> {booking.toDate}</p>
          <p className="text-green-600 font-semibold text-xs"><strong>Status:</strong> Done</p>
        </div>
      ))}
    </div>
  )}
</div>


      {/* ✅ DESKTOP VIEW */}
      <div className="hidden md:block bg-transparent">
        {completed.length === 0 ? (
          <p className="text-gray-700 bg-transparent">No work has been marked as completed yet.</p>
        ) : (
          <>
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border">Worker Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Service</th>
                  <th className="p-2 border">From</th>
                  <th className="p-2 border">To</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDesktopData.map((booking, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2 border">{booking.workername || 'N/A'}</td>
                    <td className="p-2 border">{booking.workerEmail}</td>
                    <td className="p-2 border">{booking.service}</td>
                    <td className="p-2 border">{booking.fromDate}</td>
                    <td className="p-2 border">{booking.toDate}</td>
                    <td className="p-2 border text-green-600 font-semibold text-xs">Done</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination-buttons mt-2">
              <button onClick={handleDesktopPrev} disabled={desktopPage === 0}>Prev</button>
              <button
                onClick={handleDesktopNext}
                disabled={(desktopPage + 1) * itemsPerPage >= completed.length}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CompletedWork;
