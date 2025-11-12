// pages/select-items.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function SelectItems(){
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(()=>{ axios.get('/api/products').then(r=>setProducts(r.data)); },[]);

function addToCart(prod) {
  const item = {
    _id: prod._id,
    name: prod.name || "Produk Tanpa Nama",
    price: prod.price || 0,
    qty: 1,
    color: prod.colors?.[0] || ""
  };

  // buat cart baru dengan data lama + item baru
  const newCart = [...cart, item];

  // update state dan localStorage bersamaan
  setCart(newCart);
  localStorage.setItem("cart", JSON.stringify(newCart));

  alert("Produk ditambahkan ke keranjang!");
}


  return (
    <div>
      <h1>Select Items</h1>
      <Link href="/checkout">Go to Checkout ({cart.length})</Link>
      <div>
        {products.map(p=>(
          <div key={p._id} className="border p-3 my-2 rounded">
  <h3 className="font-bold">{p.name}</h3>
  <p>{p.category} - Rp {p.price}</p>

  <button
    onClick={() => addToCart(p)}
    className="bg-green-600 text-white px-3 py-1 rounded mt-2"
  >
    Tambah ke Keranjang
  </button>

  <Link href={`/product/${p._id}`} className="text-blue-600 underline ml-3">
    Lihat Detail
  </Link>
</div>


        ))}
      </div>
    </div>
  )
}
