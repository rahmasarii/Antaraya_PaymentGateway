// pages/select-items.js
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function SelectItems() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [popupProduct, setPopupProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    axios.get("/api/products").then((r) => setProducts(r.data));

    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored);
  }, []);

  function openColorPopup(prod) {
    setPopupProduct(prod);

    if (prod.colors?.length > 0) {
      setSelectedColor(prod.colors[0]);
    } else {
      setSelectedColor(null);
    }

    setShowPopup(true);
  }

  function addToCart() {
    const prod = popupProduct;

    const item = {
      _id: prod._id,
      name: prod.name,
      price: prod.price,
      color: selectedColor?.colorName || "",
      displayImage:
        selectedColor?.image || prod.displayImage || "/no-image.png",
      qty: 1,
    };

    const newCart = [...cart, item];
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));

    alert("Produk ditambahkan ke keranjang!");
    setShowPopup(false);
  }

  return (
    <div>
      <h1>Select Items</h1>

      <Link href="/checkout">Go to Checkout ({cart.length})</Link>

      <div>
        {products.map((p) => (
          <div key={p._id} className="border p-3 my-2 rounded">
            <img
              src={p.displayImage || "/no-image.png"}
              className="w-full h-40 object-cover rounded mb-2"
            />

            <h3 className="font-bold">{p.name}</h3>
            <p>Rp {p.price}</p>

       <button
  onClick={() => {
    const firstColor =
      Array.isArray(p.colors) && p.colors.length > 0
        ? p.colors[0]
        : null;

    const item = {
      _id: p._id,
      name: p.name,
      price: p.price,
      color: firstColor?.colorName || "",
      displayImage: firstColor?.image || p.displayImage,
      qty: 1,
    };

    const newCart = [...cart, item];
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));

    alert("Produk ditambahkan ke keranjang!");
  }}
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

      <button
  onClick={() => window.open("https://wa.me/6281296135571", "_blank")}
  className="contact-us-btn"
>
  Contact Us
</button>


     
        
     
      
    </div>
  );
}
