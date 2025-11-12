// pages/admin/transactions.js (simplified)
import { Bar } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import axios from 'axios';
export default function TransactionsAdmin(){
  const [data, setData] = useState(null);
  useEffect(()=>{
    axios.get('/api/admin-sales').then(r=>setData(r.data));
  },[]);
  if(!data) return <>loading</>;
  const chartData = {
    labels: data.map(d=>d.date),
    datasets: [{ label: 'Pendapatan', data: data.map(d=>d.total) }]
  };
  return <Bar data={chartData} />;
}
