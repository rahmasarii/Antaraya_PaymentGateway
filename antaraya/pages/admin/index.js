// pages/admin1/index.js
import AdminNavbar from "@/components/AdminNavbar";
import styles from "@/styles/AdminDashboard.module.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useEffect, useState, useRef } from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [monthly, setMonthly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [selectedChart, setSelectedChart] = useState("daily");
  const [transactions, setTransactions] = useState({ checkout: [] });
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [periodStats, setPeriodStats] = useState({
    totalRevenue: 0,
    totalProducts: 0,
  }); // <-- ringkasan periode untuk card kecil
  const chartRef = useRef(null);

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

  useEffect(() => {
    updateChartData();
  }, [selectedChart, daily, weekly, monthly, currentIndex]);

  const isPaid = (status) => {
  if (!status) return false;
  const s = status.toLowerCase();
  return ["paid", "PAID", "success", "settlement", "completed"].includes(s);
};

const updateStatus = async (id, newStatus) => {
  try {
    const res = await fetch(`/api/admin/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Gagal update status");
      return;
    }

    // Update state tanpa reload halaman
    setTransactions((prev) => ({
      ...prev,
      checkout: prev.checkout.map((item) =>
        item._id === id ? { ...item, status: newStatus } : item
      ),
    }));

    alert("Status berhasil diperbarui!");
  } catch (err) {
    console.error(err);
    alert("Error update status");
  }
};

  // Fungsi untuk menapilkan total pendapatan (semua transaksi)
const totalRevenue = transactions.checkout
  .filter((c) => isPaid(c.status))
  .reduce((sum, c) => sum + (c.total || 0), 0);


const totalProductsSold = transactions.checkout
  .filter((c) => isPaid(c.status))
  .reduce(
    (sum, c) =>
      sum + c.items.reduce((s, item) => s + (item.qty || 0), 0),
    0
  );

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (selectedChart === "daily") {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
    } else if (selectedChart === "weekly") {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(startDate.getDate() + 6);
      return `${startDate.getDate()} ${startDate.toLocaleDateString("id-ID", {
        month: "short",
      })} - ${endDate.getDate()} ${endDate.toLocaleDateString("id-ID", {
        month: "short",
      })}`;
    } else {
      return date.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });
    }
  };

  const getChartData = () => {
    let data = [];
    switch (selectedChart) {
      case "daily":
        data = daily;
        break;
      case "weekly":
        data = weekly;
        break;
      case "monthly":
        data = monthly;
        break;
      default:
        data = [];
    }
    return data;
  };

  const updateChartData = () => {
  const data = getChartData();
  const itemsToShow = 5;
  const startIndex = Math.max(0, data.length - itemsToShow - currentIndex);
  const endIndex = startIndex + itemsToShow;
  const displayData = data.slice(startIndex, endIndex);

  // Helper: tentukan field pendapatan dari response API
  const getRevenue = (d) =>
    d.totalRevenue ??
    d.revenue ??
    d.totalAmount ??
    d.totalSales ??
    0;

  let labels = [];
  let values = [];

  switch (selectedChart) {
    case "daily":
      labels = displayData.map((d) => formatDate(d._id.date));
      values = displayData.map((d) => getRevenue(d));
      break;
    case "weekly":
      labels = displayData.map((w) => {
        const monday = new Date(w._id.year, 0, 1 + (w._id.week - 1) * 7);
        return formatDate(monday.toISOString().split("T")[0]);
      });
      values = displayData.map((w) => getRevenue(w));
      break;
    case "monthly":
      labels = displayData.map((m) =>
        formatDate(
          `${m._id.year}-${String(m._id.month).padStart(2, "0")}-01`
        )
      );
      values = displayData.map((m) => getRevenue(m));
      break;
    default:
      break;
  }

  // === 1. Tentukan range tanggal dari data yang sedang tampil di chart ===
  let rangeStart = null;
  let rangeEnd = null;

  if (displayData.length > 0) {
    if (selectedChart === "daily") {
      const dates = displayData
        .map((d) => new Date(d._id.date))
        .sort((a, b) => a - b);
      rangeStart = dates[0];
      rangeEnd = dates[dates.length - 1];
    } else if (selectedChart === "weekly") {
      const weeks = displayData
        .map((w) => ({
          start: new Date(w._id.year, 0, 1 + (w._id.week - 1) * 7),
        }))
        .sort((a, b) => a.start - b.start);

      rangeStart = weeks[0].start;
      const lastStart = weeks[weeks.length - 1].start;
      rangeEnd = new Date(lastStart);
      rangeEnd.setDate(rangeEnd.getDate() + 6); // akhiran minggu terakhir
    } else if (selectedChart === "monthly") {
      const months = displayData
        .map((m) => {
          const start = new Date(m._id.year, m._id.month - 1, 1);
          const end = new Date(m._id.year, m._id.month, 0); // last day of month
          return { start, end };
        })
        .sort((a, b) => a.start - b.start);

      rangeStart = months[0].start;
      rangeEnd = months[months.length - 1].end;
    }
  }

  // === 2. Hitung total produk & pendapatan dari TABEL TRANSAKSI di range itu ===
  let totalProductsRange = 0;
  let totalRevenueRange = 0;

  if (rangeStart && rangeEnd && transactions?.checkout) {
    transactions.checkout.forEach((c) => {
  if (!isPaid(c.status)) return; // hanya paid

  const created = new Date(c.createdAt);
  if (created >= rangeStart && created <= rangeEnd) {
    totalRevenueRange += c.total || 0;

    if (Array.isArray(c.items)) {
      c.items.forEach((item) => {
        totalProductsRange += item.qty || 0;
      });
    }
  }
});

  }

  // Kalau tidak ada data sama sekali, fallback ke 0
  setPeriodStats({
    totalRevenue: totalRevenueRange,
    totalProducts: totalProductsRange,
  });

  // === 3. Set chartData seperti biasa ===
  setChartData({
    labels,
    datasets: [
      {
        label:
          selectedChart === "daily"
            ? "Pendapatan Harian"
            : selectedChart === "weekly"
            ? "Pendapatan Mingguan"
            : "Pendapatan Bulanan",
        data: values,
        backgroundColor:
          selectedChart === "daily"
            ? "rgba(153, 102, 255, 0.6)"
            : selectedChart === "weekly"
            ? "rgba(255, 159, 64, 0.6)"
            : "rgba(75, 192, 192, 0.6)",
        borderRadius: 6,
        borderColor:
          selectedChart === "daily"
            ? "rgba(153, 102, 255, 1)"
            : selectedChart === "weekly"
            ? "rgba(255, 159, 64, 1)"
            : "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  });
};


  const handleScrollChart = (direction) => {
    const data = getChartData();
    const itemsToShow = 5;

    if (direction === "left") {
      setCurrentIndex((prev) =>
        Math.min(prev + 1, Math.max(0, data.length - itemsToShow))
      );
    } else {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const canScrollLeft = () => {
    const data = getChartData();
    return currentIndex < Math.max(0, data.length - 5);
  };

  const canScrollRight = () => {
    return currentIndex > 0;
  };

  return (
    <>
      <AdminNavbar onLogout={handleLogout} />

      <div className={styles["admin-dashboard"]}>
        {/* Earnings Summary */}
        <div className={styles["earnings-summary"]}>
          <div className={styles["earnings-card"]}>
            <h3>Total Pendapatan</h3>
            <p className={styles["earnings-amount"]}>
              Rp {totalRevenue.toLocaleString("id-ID")}
            </p>
          </div>

          <div className={styles["earnings-card"]}>
            <h3>Total Produk Terjual</h3>
            <p className={styles["earnings-amount"]}>
              {totalProductsSold.toLocaleString("id-ID")} pcs
            </p>
          </div>
        </div>

        <div className={styles["dashboard-content"]}>
          {/* Chart Container */}
          <section className={styles["chart-container"]}>
            <div className={styles["chart-header"]}>
              <h2>Analisis Penjualan</h2>
              <div className={styles["chart-controls"]}>
                <button
                  onClick={() => {
                    setSelectedChart("daily");
                    setCurrentIndex(0);
                  }}
                  className={`${styles["chart-btn"]} ${
                    selectedChart === "daily" ? styles["active"] : ""
                  }`}
                >
                  Harian
                </button>
                <button
                  onClick={() => {
                    setSelectedChart("weekly");
                    setCurrentIndex(0);
                  }}
                  className={`${styles["chart-btn"]} ${
                    selectedChart === "weekly" ? styles["active"] : ""
                  }`}
                >
                  Mingguan
                </button>
                <button
                  onClick={() => {
                    setSelectedChart("monthly");
                    setCurrentIndex(0);
                  }}
                  className={`${styles["chart-btn"]} ${
                    selectedChart === "monthly" ? styles["active"] : ""
                  }`}
                >
                  Bulanan
                </button>
              </div>
            </div>

            {/* Card kecil di bawah tombol periode
            <div className={styles["chart-stats"]}>
              <div className={styles["chart-stat-card"]}>
                <span className={styles["chart-stat-label"]}>
                  Produk terjual :
                </span>
                <span className={styles["chart-stat-value"]}>
                  {periodStats.totalProducts.toLocaleString("id-ID")} pcs
                </span>
              </div>
              <div className={styles["chart-stat-card"]}>
                <span className={styles["chart-stat-label"]}>
                  Pendapatan :
                </span>
                <span className={styles["chart-stat-value"]}>
                  Rp {periodStats.totalRevenue.toLocaleString("id-ID")}
                </span>
              </div>
            </div> */}

            <div className={styles["chart-wrapper"]}>
              <button
                className={`${styles["scroll-btn"]} ${styles["left"]}`}
                onClick={() => handleScrollChart("left")}
                disabled={!canScrollLeft()}
              >
                ‹
              </button>

              <div className={styles["chart-area"]}>
                <Bar
                  ref={chartRef}
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        grid: {
                          display: false,
                        },
                        ticks: {
                          maxRotation: 45,
                          minRotation: 45,
                        },
                      },
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Pendapatan (Rp)", // <-- ubah dari Jumlah Barang Terjual
                        },
                        ticks: {
                          callback: function (value) {
                            return (
                              "Rp " +
                              Number(value).toLocaleString("id-ID")
                            );
                          },
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: true,
                        position: "top",
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return (
                              "Pendapatan: Rp " +
                              Number(context.parsed.y).toLocaleString("id-ID")
                            );
                          },
                        },
                      },
                    },
                  }}
                />
              </div>

              <button
                className={`${styles["scroll-btn"]} ${styles["right"]}`}
                onClick={() => handleScrollChart("right")}
                disabled={!canScrollRight()}
              >
                ›
              </button>
            </div>
          </section>

          {/* Transactions Container */}
          <section className={styles["transactions-container"]}>
            <h2>Riwayat Transaksi</h2>

            <div className={styles["table-wrapper"]}>
              <table className={styles["transactions-table"]}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Items</th>
                    <th>Courier</th>
                    <th>Address</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {(transactions.checkout ?? []).map((c) => (
                    <tr key={c._id}>
                      <td>{c.orderId}</td>
                      <td>
                        {c.customer?.firstName} {c.customer?.lastName}
                      </td>
                      <td>{c.customer?.phone}</td>
                      <td>
                        {c.items?.map((item, i) => (
                          <div key={i}>
                            <b>{item.name}</b> (x{item.qty}) - {item.color}
                          </div>
                        ))}
                      </td>
                      <td>{c.customer?.courier}</td>
                      <td>{c.customer?.address}</td>
                      <td>{c.customer?.description}</td>
<td>
  <select
    value={c.status || "pending"}
    onChange={async (e) => {
      const newStatus = e.target.value;

      try {
        const res = await fetch("/api/admin/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: c.orderId,
            status: newStatus,
          }),
        });

        if (res.ok) {
          alert("Status updated!");
          // refresh tanpa reload:
          setTransactions((prev) => ({
            ...prev,
            checkout: prev.checkout.map((item) =>
              item.orderId === c.orderId
                ? { ...item, status: newStatus }
                : item
            ),
          }));
        } else {
          alert("Failed to update");
        }
      } catch (err) {
        console.error(err);
        alert("Error updating status");
      }
    }}
  >
    <option value={c.status}>{c.status}</option>
    <option value="PAID">PAID</option>
    <option value="cancelled">cancelled</option>
  </select>
</td>


                      
                      <td>Rp {c.total?.toLocaleString("id-ID")}</td>
                      <td>
                        {new Date(c.createdAt).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}