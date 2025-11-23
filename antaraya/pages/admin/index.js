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

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (selectedChart === "daily") {
      return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    } else if (selectedChart === "weekly") {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(startDate.getDate() + 6);
      return `${startDate.getDate()} ${startDate.toLocaleDateString("id-ID", { month: "short" })} - ${endDate.getDate()} ${endDate.toLocaleDateString("id-ID", { month: "short" })}`;
    } else {
      return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
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

    let labels = [];
    let values = [];
    let backgroundColor = "";

    switch (selectedChart) {
      case "daily":
        labels = displayData.map((d) => formatDate(d._id.date));
        values = displayData.map((d) => d.totalSales || 0);
        backgroundColor = "rgba(153, 102, 255, 0.6)";
        break;
      case "weekly":
        labels = displayData.map((w) => {
          const monday = new Date(w._id.year, 0, 1 + (w._id.week - 1) * 7);
          return formatDate(monday.toISOString().split('T')[0]);
        });
        values = displayData.map((w) => w.totalSales || 0);
        backgroundColor = "rgba(255, 159, 64, 0.6)";
        break;
      case "monthly":
        labels = displayData.map((m) => 
          formatDate(`${m._id.year}-${String(m._id.month).padStart(2, "0")}-01`)
        );
        values = displayData.map((m) => m.totalSales || 0);
        backgroundColor = "rgba(75, 192, 192, 0.6)";
        break;
      default:
        break;
    }

    setChartData({
      labels,
      datasets: [
        {
          label: selectedChart === "daily" 
            ? "Jumlah Barang Terjual (Harian)" 
            : selectedChart === "weekly" 
            ? "Jumlah Barang Terjual (Mingguan)" 
            : "Jumlah Barang Terjual (Bulanan)",
          data: values,
          backgroundColor,
          borderRadius: 6,
          borderColor: backgroundColor.replace('0.6', '1'),
          borderWidth: 1,
        },
      ],
    });
  };

  const handleScrollChart = (direction) => {
    const data = getChartData();
    const itemsToShow = 5;
    
    if (direction === 'left') {
      setCurrentIndex(prev => Math.min(prev + 1, Math.max(0, data.length - itemsToShow)));
    } else {
      setCurrentIndex(prev => Math.max(prev - 1, 0));
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

      <div className={styles['admin-dashboard']}>
        {/* Earnings Summary */}
        <div className={styles['earnings-summary']}>
          <div className={styles['earnings-card']}>
            <h3>Net Income</h3>
            <p className={styles['earnings-amount']}>$23,289</p>
          </div>
          <div className={styles['earnings-card']}>
            <h3>Withdrawn</h3>
            <p className={styles['earnings-amount']}>$11,289</p>
          </div>
          <div className={styles['earnings-card']}>
            <h3>Pending</h3>
            <p className={styles['earnings-amount']}>$9,289</p>
          </div>
        </div>

        <div className={styles['dashboard-content']}>
          {/* Chart Container */}
          <section className={styles['chart-container']}>
            <div className={styles['chart-header']}>
              <h2>Analisis Penjualan</h2>
              <div className={styles['chart-controls']}>
                <button
                  onClick={() => {
                    setSelectedChart("daily");
                    setCurrentIndex(0);
                  }}
                  className={`${styles['chart-btn']} ${selectedChart === "daily" ? styles['active'] : ""}`}
                >
                  Harian
                </button>
                <button
                  onClick={() => {
                    setSelectedChart("weekly");
                    setCurrentIndex(0);
                  }}
                  className={`${styles['chart-btn']} ${selectedChart === "weekly" ? styles['active'] : ""}`}
                >
                  Mingguan
                </button>
                <button
                  onClick={() => {
                    setSelectedChart("monthly");
                    setCurrentIndex(0);
                  }}
                  className={`${styles['chart-btn']} ${selectedChart === "monthly" ? styles['active'] : ""}`}
                >
                  Bulanan
                </button>
              </div>
            </div>

            <div className={styles['chart-wrapper']}>
              <button 
                className={`${styles['scroll-btn']} ${styles['left']}`}
                onClick={() => handleScrollChart('left')}
                disabled={!canScrollLeft()}
              >
                ‹
              </button>
              
              <div className={styles['chart-area']}>
                <Bar 
                  ref={chartRef}
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        grid: {
                          display: false
                        },
                        ticks: {
                          maxRotation: 45,
                          minRotation: 45
                        }
                      },
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Jumlah Barang Terjual'
                        },
                        ticks: {
                          callback: function(value) {
                            return value.toLocaleString();
                          }
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `Jumlah: ${context.parsed.y.toLocaleString()} barang`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
              
              <button 
                className={`${styles['scroll-btn']} ${styles['right']}`}
                onClick={() => handleScrollChart('right')}
                disabled={!canScrollRight()}
              >
                ›
              </button>
            </div>
          </section>

          {/* Transactions Container */}
          <section className={styles['transactions-container']}>
            <h2>Riwayat Transaksi</h2>
            
            <div className={styles['table-wrapper']}>
              <table className={styles['transactions-table']}>
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
                        <span className={`${styles['status']} ${styles[`status-${c.status?.toLowerCase()}`]}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>Rp {c.total?.toLocaleString()}</td>
                      <td>{new Date(c.createdAt).toLocaleString('id-ID')}</td>
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

// //pages/admin/index.js
// import AdminNavbar from "@/components/AdminNavbar";

// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// import { Bar } from "react-chartjs-2";
// import { useEffect, useState } from "react";

// export default function AdminDashboard() {
//   const [monthly, setMonthly] = useState([]);
//   const [daily, setDaily] = useState([]);
//   const [weekly, setWeekly] = useState([]);

//   const [selectedChart, setSelectedChart] = useState("daily");
//   const [transactions, setTransactions] = useState({ checkout: [] });

//   useEffect(() => {
//     fetch("/api/stats/sales-monthly")
//       .then((res) => res.json())
//       .then(setMonthly);

//     fetch("/api/stats/sales-daily")
//       .then((res) => res.json())
//       .then(setDaily);

//     fetch("/api/stats/sales-weekly")
//       .then((res) => res.json())
//       .then(setWeekly);

//     fetch("/api/admin/transactions")
//       .then((res) => res.json())
//       .then(setTransactions);
//   }, []);

//   const handleLogout = async () => {
//     await fetch("/api/admin/logout", { method: "POST" });
//     window.location.href = "/login";
//   };

//   const formatDate = (year, month, day) =>
//     `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

//   // === DAILY CHART ===
//   const dailyLabels = daily.map((d) => d._id.date);
//   const dailyValues = daily.map((d) => d.totalSales);
//   const dailyChart = {
//     labels: dailyLabels,
//     datasets: [
//       {
//         label: "Sales Per Day",
//         data: dailyValues,
//         backgroundColor: "rgba(153, 102, 255, 0.6)",
//         borderRadius: 6,
//       },
//     ],
//   };

//   // === WEEKLY CHART ===
//   const weeklyLabels = weekly.map((w) => {
//     const monday = new Date(w._id.year, 0, 1 + (w._id.week - 1) * 7);
//     return formatDate(
//       monday.getFullYear(),
//       monday.getMonth() + 1,
//       monday.getDate()
//     );
//   });

//   const weeklyValues = weekly.map((w) => w.totalSales);
//   const weeklyChart = {
//     labels: weeklyLabels,
//     datasets: [
//       {
//         label: "Sales Per Week",
//         data: weeklyValues,
//         backgroundColor: "rgba(255, 159, 64, 0.6)",
//         borderRadius: 6,
//       },
//     ],
//   };

//   // === MONTHLY CHART ===
//   const monthlyLabels = monthly.map((m) =>
//     formatDate(m._id.year, m._id.month, 1)
//   );

//   const monthlyValues = monthly.map((m) => m.totalSales);
//   const monthlyChart = {
//     labels: monthlyLabels,
//     datasets: [
//       {
//         label: "Sales Per Month",
//         data: monthlyValues,
//         backgroundColor: "rgba(75, 192, 192, 0.6)",
//         borderRadius: 6,
//       },
//     ],
//   };

//   const chartToDisplay =
//     selectedChart === "daily"
//       ? dailyChart
//       : selectedChart === "weekly"
//       ? weeklyChart
//       : monthlyChart;

//   return (
//     <>
//       <AdminNavbar onLogout={handleLogout} />

//       {/* Wrapper utama - ada paddingTop agar tidak tertutup navbar */}
//       <div style={{ padding: "40px", paddingTop: "130px", maxWidth: "1200px", margin: "0 auto" }}>

//         {/* ========================== */}
//         {/* SECTION: REKAP PENJUALAN  */}
//         {/* ========================== */}
//         <section id="rekap">
//           <h1>Admin Dashboard</h1>

//           {/* Chart selector */}
//           <div style={{ marginTop: "20px" }}>
//             <button
//               onClick={() => setSelectedChart("daily")}
//               style={buttonStyle(selectedChart === "daily")}
//             >
//               Harian
//             </button>

//             <button
//               onClick={() => setSelectedChart("weekly")}
//               style={buttonStyle(selectedChart === "weekly")}
//             >
//               Mingguan
//             </button>

//             <button
//               onClick={() => setSelectedChart("monthly")}
//               style={buttonStyle(selectedChart === "monthly")}
//             >
//               Bulanan
//             </button>
//           </div>

//           {/* Chart */}
//           <div style={{ marginTop: "40px" }}>
//             <h2>
//               {selectedChart === "daily"
//                 ? "📆 Penjualan Per Hari"
//                 : selectedChart === "weekly"
//                 ? "📈 Penjualan Per Minggu"
//                 : "📊 Penjualan Per Bulan"}
//             </h2>

//             <div style={{ width: "100%", height: "300px" }}>
//               <Bar data={chartToDisplay} />
//             </div>
//           </div>
//         </section>

//         {/* ========================== */}
//         {/* SECTION: TRANSAKSI         */}
//         {/* ========================== */}
//         <section id="transaksi" style={{ marginTop: "70px" }}>
//           <h2>🧾 Riwayat Transaksi</h2>

//           <table
//             style={{
//               width: "100%",
//               marginTop: "20px",
//               borderCollapse: "collapse",
//               border: "1px solid #ddd",
//             }}
//           >
//             <thead>
//               <tr style={{ background: "#f3f3f3" }}>
//                 <th style={th}>Order ID</th>
//                 <th style={th}>Customer</th>
//                 <th style={th}>Phone</th>
//                 <th style={th}>Items</th>
//                 <th style={th}>Courier</th>
//                 <th style={th}>Address</th>
//                 <th style={th}>Description</th>
//                 <th style={th}>Status</th>
//                 <th style={th}>Total</th>
//                 <th style={th}>Tanggal</th>
//               </tr>
//             </thead>

//             <tbody>
//               {(transactions.checkout ?? []).map((c) => (
//                 <tr key={c._id} style={{ borderBottom: "1px solid #eee" }}>
//                   <td style={td}>{c.orderId}</td>
//                   <td style={td}>
//                     {c.customer?.firstName} {c.customer?.lastName}
//                   </td>
//                   <td style={td}>{c.customer?.phone}</td>

//                   <td style={td}>
//                     {c.items?.map((item, i) => (
//                       <div key={i}>
//                         <b>{item.name}</b> (x{item.qty}) - {item.color}
//                       </div>
//                     ))}
//                   </td>

//                   <td style={td}>{c.customer?.courier}</td>
//                   <td style={td}>{c.customer?.address}</td>
//                   <td style={td}>{c.customer?.description}</td>
//                   <td style={td}>{c.status}</td>

//                   <td style={td}>Rp {c.total?.toLocaleString()}</td>
//                   <td style={td}>{new Date(c.createdAt).toLocaleString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </section>
//       </div>
//     </>
//   );
// }

// const buttonStyle = (active) => ({
//   padding: "10px 20px",
//   marginRight: "10px",
//   background: active ? "#0070f3" : "#ddd",
//   color: active ? "white" : "black",
//   borderRadius: "8px",
//   cursor: "pointer",
// });

// const th = {
//   padding: "10px",
//   textAlign: "left",
//   borderBottom: "1px solid #ddd",
// };

// const td = {
//   padding: "10px",
// };