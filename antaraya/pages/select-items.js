// pages/select-items.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function SelectItems(){
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(()=>{ axios.get('/api/products').then(r=>setProducts(r.data)); },[]);

  function addToCart(prod){
    const exists = cart.find(i => i._id === prod._id && i.color === prod.color);
    const item = { ...prod, qty: 1, color: prod.colors?.[0] || '' };
    setCart(prev => [...prev, item]);
    localStorage.setItem('cart', JSON.stringify([...cart, item]));
  }

  return (
    <div>
      <h1>Select Items</h1>
      <Link href="/checkout">Go to Checkout ({cart.length})</Link>
      <div>
        {products.map(p=>(
          <div key={p._id}>
            <h3>{p.name}</h3>
            <p>{p.category} - Rp {p.price}</p>
            <select onChange={e=>{/* set color */}}>
              {p.colors?.map(c=> <option key={c}>{c}</option>)}
            </select>
            <button onClick={()=>addToCart(p)}>Add</button>
          </div>
        ))}
      </div>
    </div>
  )
}
