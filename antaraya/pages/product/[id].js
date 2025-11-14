import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [displayImage, setDisplayImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/products?id=${id}`);
        const data = res.data;
        setProduct(data);

        // Default color
        if (data.colors?.length > 0) {
          const defaultColor = data.colors[0];
          setSelectedColor(defaultColor);
          setDisplayImage(defaultColor.image || data.displayImage);
        } else {
          setDisplayImage(data.displayImage);
        }

      } catch (err) {
        setError("Gagal memuat produk");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p className="p-5 text-center">Memuat produk...</p>;
  if (error) return <p className="p-5 text-red-600 text-center">{error}</p>;
  if (!product) return <p className="p-5 text-center">Produk tidak ditemukan.</p>;

  const onColorChange = (colorName) => {
    const colorObj = product.colors.find(c => c.colorName === colorName);
    setSelectedColor(colorObj);
    setDisplayImage(colorObj?.image || product.displayImage);
  };

  const addToCart = () => {
    const existing = JSON.parse(localStorage.getItem("cart") || "[]");

    const item = {
      _id: product._id,
      name: product.name,
      price: product.price,
      color: selectedColor?.colorName || "",
    displayImage: displayImage, 
      qty: 1
    };

    localStorage.setItem("cart", JSON.stringify([...existing, item]));
    alert("Produk ditambahkan ke keranjang!");
    router.push("/checkout");
  };

  return (
    <div className="p-5 max-w-md mx-auto">

      {/* MAIN IMAGE */}
      <img
        src={displayImage || "/no-image.png"}
        className="w-full h-64 object-cover rounded mb-4"
      />

      <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

      <p className="text-green-700 font-semibold mb-4">
        Rp {product.price.toLocaleString()}
      </p>

      <p className="mb-4">{product.description}</p>

      {/* GALLERY IMAGES */}
      {Array.isArray(product.galleryImages) && product.galleryImages.length > 0 && (
        <div className="flex gap-2 overflow-x-auto mb-4">
          {product.galleryImages.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => {
                setSelectedColor(null);
                setDisplayImage(img);
              }}
              className="w-20 h-20 object-cover rounded cursor-pointer border hover:border-green-600"
            />
          ))}
        </div>
      )}

      {/* COLOR DROPDOWN */}
      {Array.isArray(product.colors) && product.colors.length > 0 && (
        <div className="mb-6">
          <label className="block font-semibold mb-2">Pilih warna:</label>

          {/* DROPDOWN */}
          <select
            value={selectedColor?.colorName || ""}
            onChange={(e) => onColorChange(e.target.value)}
            className="border p-2 w-full rounded mb-3"
          >
            {product.colors.map((c, i) => (
              <option key={i} value={c.colorName}>
                {c.colorName}
              </option>
            ))}
          </select>

          {/* PREVIEW IMAGE OF SELECTED COLOR */}
          {selectedColor && (
            <div className="flex items-center gap-3 border p-3 rounded">
              <img
                src={selectedColor.image || "/no-image.png"}
                className="w-20 h-20 object-cover rounded"
              />
              <div>
                <p className="font-medium">{selectedColor.colorName}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADD TO CART */}
      <button
        onClick={addToCart}
        className="w-full bg-green-600 text-white py-2 rounded mt-4"
      >
        Tambah ke Keranjang 🛒
      </button>

      {/* BUY NOW */}
      <button
        onClick={() => {
          const item = {
            _id: product._id,
            name: product.name,
            price: product.price,
            color: selectedColor?.colorName || "",
            qty: 1
          };

          localStorage.setItem("cart", JSON.stringify([item]));
          router.push("/payment");
        }}
        className="w-full bg-blue-600 text-white py-2 rounded mt-3"
      >
        Bayar Sekarang 💸
      </button>

    </div>
  );
}
