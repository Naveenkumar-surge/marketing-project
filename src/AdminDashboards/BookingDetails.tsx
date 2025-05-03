import React, { useEffect, useState } from "react";

type Booking = {
  customername: string;
  customerEmail: string;
  workername: string;
  workerEmail: string;
  service: string;
  fromDate: string;
  toDate: string;
};

const BookingDetails = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    // Replace with your real API
    fetch("https://marketing-nodejs.onrender.com/api/all-bookings")
      .then((res) => res.json())
      .then((data: Booking[]) => setBookings(data))
      .catch((err) => console.error("Failed to fetch bookings", err));
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (filter === "All") return true;
    return filter === "Pending" ? false : true; // You can adjust logic if needed
  });

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const totalPages = Math.ceil(filteredBookings.length / perPage);

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-xl font-semibold">Booking Information and History</h2>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="p-2 border rounded-md w-full sm:w-60"
        >
          <option value="All">All</option>
          <option value="Pending">Pending Work</option>
          <option value="Completed">Completed Work</option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block">
        <table className="min-w-full border border-gray-300 rounded-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Worker Name</th>
              <th className="px-4 py-2 text-left">Worker Email</th>
              <th className="px-4 py-2 text-left">Customer Name</th>
              <th className="px-4 py-2 text-left">Customer Email</th>
              <th className="px-4 py-2 text-left">Service</th>
              <th className="px-4 py-2 text-left">From</th>
              <th className="px-4 py-2 text-left">To</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBookings.map((b, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2">{b.workername}</td>
                <td className="px-4 py-2">{b.workerEmail}</td>
                <td className="px-4 py-2">{b.customername}</td>
                <td className="px-4 py-2">{b.customerEmail}</td>
                <td className="px-4 py-2">{b.service}</td>
                <td className="px-4 py-2">{new Date(b.fromDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">{new Date(b.toDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-white text-black"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {filteredBookings.map((b, index) => (
          <div key={index} className="p-4 border rounded shadow bg-white">
            <p><strong>Worker:</strong> {b.workername}</p>
            <p><strong>Worker Email:</strong> {b.workerEmail}</p>
            <p><strong>Customer:</strong> {b.customername}</p>
            <p><strong>Customer Email:</strong> {b.customerEmail}</p>
            <p><strong>Service:</strong> {b.service}</p>
            <p><strong>From:</strong> {new Date(b.fromDate).toLocaleDateString()}</p>
            <p><strong>To:</strong> {new Date(b.toDate).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingDetails;
