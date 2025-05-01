import { useEffect, useState } from "react";
import axios from "axios";

interface PaymentStatusProps {
  email: string;
}

interface PaymentEntry {
  date: string;
  amount: number;
  status: "In Progress" | "Paid" | "Pending";
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ email }) => {
  const [paymentData, setPaymentData] = useState<PaymentEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get(`/api/payments?email=${email}`);
        const filtered = response.data.filter((entry: PaymentEntry) => {
          const date = new Date(entry.date);
          const now = new Date();
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        });

        setPaymentData(filtered);
        setTotal(filtered.reduce((acc:number, curr:any) => acc + curr.amount, 0));
        setTotalDays(filtered.length);
      } catch (err) {
        console.error("Error fetching payment status", err);
      }
    };

    fetchPayments();
  }, [email]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Payment Status</h2>

      <div className="mb-6 space-y-1">
        <p className="text-lg text-green-600 font-medium">
          💵 Total Earned This Month: ₹{total}
        </p>
        <p className="text-md text-blue-600 font-medium">
          📅 Total Days Worked: {totalDays}
        </p>
        <p className="text-sm text-gray-600">
          ⏱️ Payments are processed daily between <strong>6:00 PM to 12:00 PM</strong>.
        </p>
      </div>

      <div className="overflow-y-auto max-h-[400px] bg-white rounded-lg shadow-md border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-blue-100 text-gray-700 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {paymentData.length > 0 ? (
              paymentData.map((payment, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{payment.date}</td>
                  <td className="px-4 py-2">₹{payment.amount}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        payment.status === "Paid"
                          ? "bg-green-200 text-green-700"
                          : payment.status === "Pending"
                          ? "bg-yellow-200 text-yellow-700"
                          : "bg-blue-200 text-blue-700"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-2" colSpan={3}>
                  No payment data found for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentStatus;
