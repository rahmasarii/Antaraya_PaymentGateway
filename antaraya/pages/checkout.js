// pages/checkout.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored);
  }, []);

  const handleQuantityChange = (index, delta) => {
    const updated = [...cart];
    updated[index].quantity = Math.max(1, (updated[index].quantity || 1) + delta);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const handleRemoveItem = (index) => {
    if (confirm("Hapus item ini dari keranjang?")) {
      const updated = cart.filter((_, i) => i !== index);
      setCart(updated);
      localStorage.setItem("cart", JSON.stringify(updated));
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🛒 Keranjang Belanja</h1>

      {cart.length === 0 ? (
        <p>Keranjang masih kosong.</p>
      ) : (
        <table className="w-full border mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-1">Produk</th>
              <th className="border px-3 py-1">Harga</th>
              <th className="border px-3 py-1">Jumlah</th>
              <th className="border px-3 py-1">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, i) => (
              <tr key={i}>
                <td className="border px-3 py-1">{item.name}</td>
                <td className="border px-3 py-1">
                  Rp{(item.price * (item.quantity || 1)).toLocaleString()}
                </td>
                <td className="border px-3 py-1">
                  <button onClick={() => handleQuantityChange(i, -1)} className="px-2">−</button>
                  {item.quantity || 1}
                  <button onClick={() => handleQuantityChange(i, 1)} className="px-2">+</button>
                </td>
                <td className="border px-3 py-1">
                  <button
                    onClick={() => handleRemoveItem(i)}
                    className="text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="font-semibold text-lg mb-3">Total: Rp{total.toLocaleString()}</h2>

      {cart.length > 0 && (
        <button
          onClick={() => router.push("/payment")}
          className="bg-green-600 text-white w-full py-3 rounded hover:bg-green-700"
        >
          Lanjut ke Pembayaran 💳
        </button>
      )}
    </div>
  );
}
