// pages/product/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    if (id) axios.get(`/api/products?id=${id}`).then(res => setProduct(res.data));
  }, [id]);

function addToCart() {
  if (!product) return;

  const existing = JSON.parse(localStorage.getItem("cart") || "[]");
  const item = {
    _id: product._id,
    name: product.name || "Produk Tanpa Nama",
    price: product.price || 0,
    color: selectedColor || product.colors?.[0] || "",
    qty: 1
  };

  localStorage.setItem("cart", JSON.stringify([...existing, item]));
  alert("Produk ditambahkan ke keranjang!");
  router.push("/checkout");
}

  if (!product) return <p>Loading...</p>;

  return (
    <div className="p-5 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
<p className="text-gray-600 mb-4">
  Rp {product.price ? product.price.toLocaleString() : 0}
</p>
      <p>{product.description}</p>

      <div className="mt-4">
        <label className="block mb-2 font-medium">Pilih warna:</label>
        <select
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="border rounded p-2 w-full"
        >
          {product.colors?.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <button
        onClick={addToCart}
        className="mt-5 w-full bg-green-600 text-white py-2 rounded"
      >
        Tambah ke Keranjang 🛒
      </button>
    </div>
  );
}
