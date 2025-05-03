import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

type Booking = {
  fromDate: string;
  paymentStatus: string;
  price: number;
  workerName: string;
};

type ChartData = {
  label: string;
  amount: number;
};

const RevenueDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`https://marketing-nodejs.onrender.com/api/all-bookings`);
        const data: Booking[] = await res.json();
        setBookings(data);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getYearlyData = (): ChartData[] => {
    const yearMap: Record<number, number> = {};
    bookings.forEach((b) => {
      const year = new Date(b.fromDate).getFullYear();
      if (b.paymentStatus === "Paid") {
        yearMap[year] = (yearMap[year] || 0) + b.price;
      }
    });
    return Object.entries(yearMap).map(([year, amount]) => ({
      label: year,
      amount,
    }));
  };

  const getMonthlyData = (year: number): ChartData[] => {
    const monthMap: Record<string, number> = {};
    bookings.forEach((b) => {
      const d = new Date(b.fromDate);
      if (d.getFullYear() === year && b.paymentStatus === "Paid") {
        const month = format(d, "MMM");
        monthMap[month] = (monthMap[month] || 0) + b.price;
      }
    });
    return Object.entries(monthMap).map(([month, amount]) => ({
      label: month,
      amount,
    }));
  };

  const getDailyData = (year: number, monthName: string): ChartData[] => {
    const dayMap: Record<string, number> = {};
    bookings.forEach((b) => {
      const d = new Date(b.fromDate);
      if (
        d.getFullYear() === year &&
        format(d, "MMM") === monthName &&
        b.paymentStatus === "Paid"
      ) {
        const day = format(d, "yyyy-MM-dd");
        dayMap[day] = (dayMap[day] || 0) + b.price;
      }
    });
    return Object.entries(dayMap).map(([day, amount]) => ({
      label: day,
      amount,
    }));
  };

  const renderGraph = (data: ChartData[]) => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Legend />
        <ReferenceLine y={0} stroke="#000" strokeWidth={1} />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#4f46e5"
          dot={{ r: 6 }}
          activeDot={{ r: 8 }}
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  if (isLoading) {
    return <p className="text-center mt-10">Loading revenue data...</p>;
  }

  return (
    <div className="p-4">
      {!selectedYear && (
        <>
          <h2 className="text-xl font-bold mb-2">Yearly Revenue Trend</h2>
          {renderGraph(getYearlyData())}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {getYearlyData().map(({ label }) => (
              <div
                key={label}
                className="p-3 bg-gray-100 rounded shadow cursor-pointer"
                onClick={() => setSelectedYear(Number(label))}
              >
                <p className="font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedYear && !selectedMonth && (
        <>
          <button
            className="mb-3 text-blue-600"
            onClick={() => setSelectedYear(null)}
          >
            ← Back to Year
          </button>
          <h2 className="text-xl font-bold mb-2">
            Monthly Revenue in {selectedYear}
          </h2>
          {renderGraph(getMonthlyData(selectedYear))}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {getMonthlyData(selectedYear).map(({ label }) => (
              <div
                key={label}
                className="p-3 bg-green-100 rounded shadow cursor-pointer"
                onClick={() => setSelectedMonth(label)}
              >
                <p className="font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedMonth && selectedYear && (
        <>
          <button
            className="mb-3 text-blue-600"
            onClick={() => setSelectedMonth(null)}
          >
            ← Back to Month
          </button>
          <h2 className="text-xl font-bold mb-2">
            Daily Revenue in {selectedMonth} {selectedYear}
          </h2>
          {renderGraph(getDailyData(selectedYear, selectedMonth))}
        </>
      )}
    </div>
  );
};

export default RevenueDashboard;
