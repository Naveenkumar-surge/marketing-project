import { useEffect, useState, useRef } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TrackingContent = () => {
  const [trackingLink, setTrackingLink] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  const getWorkerEmail = (): string | null => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      const user = userInfo ? JSON.parse(userInfo) : null;
      return user?.email || null;
    } catch (err) {
      console.error("Error parsing userInfo:", err);
      return null;
    }
  };

  useEffect(() => {
    const fetchAndBuildTrackingLink = async () => {
      const email = getWorkerEmail();
      if (!email) {
        setError("Worker email not found.");
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const workerLat = position.coords.latitude;
          const workerLng = position.coords.longitude;
          console.log("Worker Location:", workerLat, workerLng);
          setOrigin([workerLat, workerLng]);

          try {
            const res = await axios.get(
              `http://localhost:5000/api/auth/tracking-link?workerEmail=${email}`
            );

            const { latitude, longitude } = res.data;

            if (!latitude || !longitude) {
              setError("Customer location not found.");
            } else {
              setDestination([latitude, longitude]);

              const mapLink = `https://www.google.com/maps/dir/?api=1&origin=${workerLat},${workerLng}&destination=${latitude},${longitude}&travelmode=driving`;
              setTrackingLink(mapLink);
            }
          } catch (err) {
            console.error("Error fetching customer location:", err);
            setError("Failed to fetch tracking data.");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Failed to get your current location.");
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    };

    fetchAndBuildTrackingLink();
  }, []);

  useEffect(() => {
    if (!origin || !destination || !mapRef.current) return;

    // Destroy previous map instance if it exists
    if (leafletMap.current) {
      leafletMap.current.remove();
      leafletMap.current = null;
    }

    const map = L.map(mapRef.current).setView(origin, 13);
    leafletMap.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    L.marker(origin).addTo(map).bindPopup("Worker").openPopup();
    L.marker(destination).addTo(map).bindPopup("Customer");

    const coordinates = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;
    const routeUrl = `https://us1.locationiq.com/v1/directions/driving/${coordinates}?key=pk.e2cae39f158f9990a214324452e6a9c7&geometries=geojson`;

    fetch(routeUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.routes && data.routes[0].geometry.coordinates) {
          const geojsonCoords = data.routes[0].geometry.coordinates;

          const latLngs: [number, number][] = geojsonCoords.map(
            (coord: [number, number]) => [coord[1], coord[0]]
          );

          const routeLine = L.polyline(latLngs, { color: "blue", weight: 4 }).addTo(map);
          map.fitBounds(routeLine.getBounds());
        } else {
          setError("Error processing route data.");
        }
      })
      .catch((err) => {
        console.error("Error loading directions", err);
        setError("Failed to load route.");
      });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [origin, destination]);

  return (
    <div className="tracking-section">
      <h2 className="text-xl mb-4 font-semibold">Tracking</h2>

      {loading && <p>Loading map...</p>}
      {!loading && error && <p className="text-red-500">{error}</p>}

      {!loading && trackingLink && (
        <>
          <a
            href={trackingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded shadow"
          >
            Open Google Maps Directions
          </a>

          <div className="mt-6">
            <div
              ref={mapRef}
              style={{ height: "400px", width: "100%", borderRadius: "12px", overflow: "hidden" }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TrackingContent;
