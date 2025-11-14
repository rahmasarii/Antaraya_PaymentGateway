// pages/admin/dashboard.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [monthly, setMonthly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [weekly, setWeekly] = useState([]);

  const [selectedChart, setSelectedChart] = useState("daily");
  const [transactions, setTransactions] = useState({ checkout: [] });

  useEffect(() => {
    fetch("/api/stats/sales-monthly")
      .then((res) => res.json())
      .then(setMonthly);

    fetch("/api/stats/sales-daily")
      .then((res) => res.json())
      .then(setDaily);

    fetch("/api/stats/sales-weekly")
      .then((res) => res.json())
      .then(setWeekly);

    fetch("/api/admin/transactions")
      .then((res) => res.json())
      .then(setTransactions);
  }, []);

  const formatDate = (year, month, day) => {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;
  };

  // =============================
  // DAILY CHART
  // =============================
  const dailyLabels = daily.map((d) => d._id.date);
  const dailyValues = daily.map((d) => d.totalSales);

  const dailyChart = {
    labels: dailyLabels,
    datasets: [
      {
        label: "Sales Per Day",
        data: dailyValues,
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderRadius: 6,
      },
    ],
  };

  // =============================
  // WEEKLY CHART
  // =============================
  const weeklyLabels = weekly.map((w) => {
    const monday = new Date(w._id.year, 0, 1 + (w._id.week - 1) * 7);
    return formatDate(
      monday.getFullYear(),
      monday.getMonth() + 1,
      monday.getDate()
    );
  });

  const weeklyValues = weekly.map((w) => w.totalSales);

  const weeklyChart = {
    labels: weeklyLabels,
    datasets: [
      {
        label: "Sales Per Week",
        data: weeklyValues,
        backgroundColor: "rgba(255, 159, 64, 0.6)",
        borderRadius: 6,
      },
    ],
  };

  // =============================
  // MONTHLY CHART
  // =============================
  const monthlyLabels = monthly.map((m) =>
    formatDate(m._id.year, m._id.month, 1)
  );

  const monthlyValues = monthly.map((m) => m.totalSales);

  const monthlyChart = {
    labels: monthlyLabels,
    datasets: [
      {
        label: "Sales Per Month",
        data: monthlyValues,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderRadius: 6,
      },
    ],
  };

  const chartToDisplay =
    selectedChart === "daily"
      ? dailyChart
      : selectedChart === "weekly"
      ? weeklyChart
      : monthlyChart;

  return (
    <div style={{ padding: "40px" }}>
      <h1>Admin Dashboard</h1>

      {/* ===================================== */}
      {/* BUTTON CHOOSE CHART */}
      {/* ===================================== */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => setSelectedChart("daily")}
          style={buttonStyle(selectedChart === "daily")}
        >
          Harian
        </button>

        <button
          onClick={() => setSelectedChart("weekly")}
          style={buttonStyle(selectedChart === "weekly")}
        >
          Mingguan
        </button>

        <button
          onClick={() => setSelectedChart("monthly")}
          style={buttonStyle(selectedChart === "monthly")}
        >
          Bulanan
        </button>
      </div>

      {/* ===================================== */}
      {/* CHART SECTION */}
      {/* ===================================== */}
      <div style={{ marginTop: "40px" }}>
        <h2>
          {selectedChart === "daily"
            ? "📆 Penjualan Per Hari"
            : selectedChart === "weekly"
            ? "📈 Penjualan Per Minggu"
            : "📊 Penjualan Per Bulan"}
        </h2>

        <div style={{ width: "100%", height: "300px" }}>
          <Bar data={chartToDisplay} />
        </div>
      </div>

      {/* ===================================== */}
      {/* TRANSACTION HISTORY */}
      {/* ===================================== */}
      <div style={{ marginTop: "50px" }}>
        <h2>🧾 Riwayat Transaksi</h2>

        <table
          style={{
            width: "100%",
            marginTop: "20px",
            borderCollapse: "collapse",
            border: "1px solid #ddd",
          }}
        >
          <thead>
            <tr style={{ background: "#f3f3f3" }}>
              <th style={th}>Order ID</th>
              <th style={th}>Customer</th>
              <th style={th}>Phone</th>
              <th style={th}>Items</th>
              <th style={th}>Courier</th>
              <th style={th}>Address</th>
              <th style={th}>Description</th>
                            <th style={th}>Status</th>

              <th style={th}>Total</th>
              <th style={th}>Tanggal</th>
            </tr>
          </thead>

          <tbody>
            {(transactions.checkout ?? []).map((c) => (
              <tr key={c._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={td}>{c.orderId}</td>
                <td style={td}>
                  {c.customer?.firstName} {c.customer?.lastName}
                </td>
                <td style={td}>{c.customer?.phone}</td>

                <td style={td}>
                  {c.items?.map((item, i) => (
                    <div key={i}>
                      <b>{item.name}</b> (x{item.qty}) - {item.color}
                    </div>
                  ))}
                </td>
                

                <td style={td}>{c.customer?.courier}</td>
                <td style={td}>{c.customer?.address}</td>
                <td style={td}>{c.customer?.description}</td>
                <td style={td}>{c.status}</td>

                <td style={td}>Rp {c.total?.toLocaleString()}</td>
                <td style={td}>{new Date(c.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const buttonStyle = (active) => ({
  padding: "10px 20px",
  marginRight: "10px",
  background: active ? "#0070f3" : "#ddd",
  color: active ? "white" : "black",
  borderRadius: "8px",
  cursor: "pointer",
});

const th = {
  padding: "10px",
  textAlign: "left",
  borderBottom: "1px solid #ddd",
};

const td = {
  padding: "10px",
};
