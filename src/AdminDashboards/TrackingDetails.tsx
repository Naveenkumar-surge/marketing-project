import React, { useEffect, useState } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'https://marketing-nodejs.onrender.com'; // Set backend base URL

// Define the structure of a location item
interface LocationItem {
  _id: string;
  customerEmail: string;
  workerEmail: string;
  latitude: number;
  longitude: number;
  label?: string;
  sentCount: number;
}

const TrackingDetailsTable: React.FC = () => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [sending, setSending] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(locations.length / itemsPerPage);

  const paginatedLocations = locations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    axios
      .get('/api/locationemails')
      .then((res) => {
        setLocations(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching location data:', err);
        setLoading(false);
      });
  }, []);

  const getMapLink = (lat: number, lng: number): string => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  const handleSend = async (item: LocationItem) => {
    const { customerEmail, workerEmail, latitude, longitude, label } = item;
    const mapLink = getMapLink(latitude, longitude);

    setSending((prev) => ({ ...prev, [item._id]: true }));

    try {
      await axios.post('/api/ap/send-location-email', {
        customerEmail,
        workerEmail,
        mapLink,
        label,
      });

      const updatedLocation = await axios.post('/api/update-sent-count', {
        _id: item._id,
      });

      const updatedLocations = locations.map((loc) =>
        loc._id === item._id ? { ...loc, sentCount: updatedLocation.data.sentCount } : loc
      );
      setLocations(updatedLocations);

      alert(`Email sent to ${customerEmail}`);
    } catch (err) {
      console.error('Email send failed:', err);
      alert('Failed to send email.');
    } finally {
      setSending((prev) => ({ ...prev, [item._id]: false }));
    }
  };

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (loading) {
    return <p className="p-4 text-gray-600">Loading tracking details...</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tracking Details</h2>
      {locations.length === 0 ? (
        <p>No tracking records found.</p>
      ) : (
        <div>
          {/* Desktop Table with Pagination */}
          <div className="hidden md:block">
            <table className="min-w-full border border-gray-300 rounded">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 border">Customer Email</th>
                  <th className="px-4 py-2 border">Worker Email</th>
                  <th className="px-4 py-2 border">Map Link</th>
                  <th className="px-4 py-2 border">Label</th>
                  <th className="px-4 py-2 border">Sent Count</th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLocations.map((item) => (
                  <tr key={item._id} className="border-t">
                    <td className="px-4 py-2 border">{item.customerEmail}</td>
                    <td className="px-4 py-2 border">{item.workerEmail}</td>
                    <td className="px-4 py-2 border text-blue-600 underline">
                      <a
                        href={getMapLink(item.latitude, item.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Map
                      </a>
                    </td>
                    <td className="px-4 py-2 border">{item.label || '-'}</td>
                    <td className="px-4 py-2 border">{item.sentCount}</td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => handleSend(item)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                        disabled={sending[item._id]}
                      >
                        {sending[item._id] ? 'Sending...' : 'Send'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          {/* Mobile View Scrollable */}
          <div className="md:hidden">
            <div className="overflow-y-auto max-h-[500px]">
              {locations.map((item) => (
                <div
                  key={item._id}
                  className="bg-white border border-gray-300 rounded mb-4 p-4 shadow-md"
                >
                  <h3 className="font-bold">{item.customerEmail}</h3>
                  <p>Worker: {item.workerEmail}</p>
                  <p>
                    <a
                      href={getMapLink(item.latitude, item.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Map
                    </a>
                  </p>
                  <p>{item.label || 'No label'}</p>
                  <p>Sent Count: {item.sentCount}</p>
                  <button
                    onClick={() => handleSend(item)}
                    className="bg-blue-600 text-white px-3 py-1 mt-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={sending[item._id]}
                  >
                    {sending[item._id] ? 'Sending...' : 'Send'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingDetailsTable;
