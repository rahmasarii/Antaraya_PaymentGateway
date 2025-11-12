import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return; // tunggu sampai router siap

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/products?id=${id}`);
        const data = res.data;
        setProduct(data);
        // otomatis pilih warna pertama kalau ada
        if (data.colors?.length > 0) {
          setSelectedColor(data.colors[0]);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Gagal memuat produk");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const addToCart = () => {
    if (!product) return;

    const existing = JSON.parse(localStorage.getItem("cart") || "[]");

    const item = {
      _id: product._id,
      name: product.name || "Produk Tanpa Nama",
      price: product.price || 0,
      color: selectedColor || "",
      qty: 1,
    };

    localStorage.setItem("cart", JSON.stringify([...existing, item]));
    alert("Produk ditambahkan ke keranjang!");
    router.push("/checkout");
  };

  // tampilkan status loading / error
  if (loading) return <p className="p-5 text-center">Memuat produk...</p>;
  if (error) return <p className="p-5 text-red-600 text-center">{error}</p>;
  if (!product) return <p className="p-5 text-center">Produk tidak ditemukan.</p>;

  return (
    <div className="p-5 max-w-md mx-auto">
      <img
        src={product.image || "/no-image.png"}
        alt={product.name}
        className="w-full h-64 object-cover rounded mb-4"
      />

      <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
      <p className="text-gray-600 mb-1">{product.category}</p>
      <p className="text-green-700 font-semibold mb-4">
        Rp {product.price ? product.price.toLocaleString() : 0}
      </p>

      <p className="text-gray-800 mb-6">{product.description}</p>

      {product.colors?.length > 0 && (
        <div className="mt-4">
          <label className="block mb-2 font-medium">Pilih warna:</label>
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="border rounded p-2 w-full"
          >
            {product.colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={addToCart}
        className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
      >
        Tambah ke Keranjang 🛒
      </button>

      <button
  onClick={() => {
    if (!product) return;

    // simpan produk ke cart (supaya bisa dibaca di /payment)
    const item = {
      _id: product._id,
      name: product.name,
      price: product.price,
      color: selectedColor,
      qty: 1,
    };

    localStorage.setItem("cart", JSON.stringify([item])); // overwrite biar cuma 1 item
    router.push("/payment"); // langsung ke halaman payment
  }}
  className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
>
  Bayar Sekarang 💸
</button>


    </div>
  );
}
