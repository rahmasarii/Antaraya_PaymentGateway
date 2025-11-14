// pages/admin/products.js
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    displayImage: "",
    galleryImages: [],
    // stock: "",
    status: "READY",
    colors: [],
  });

  const [colorInput, setColorInput] = useState({ colorName: "", image: "" });
  const [galleryInput, setGalleryInput] = useState("");
  const [editId, setEditId] = useState(null);

  const fetchProducts = async () => {
    const res = await axios.get("/api/products");
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // HANDLE FORM INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ADD COLOR VARIANT
  const addColor = () => {
    if (!colorInput.colorName) return alert("Nama warna wajib");
    setForm({
      ...form,
      colors: [...form.colors, colorInput],
    });
    setColorInput({ colorName: "", image: "" });
  };

  const removeColor = (index) => {
    setForm({
      ...form,
      colors: form.colors.filter((_, i) => i !== index),
    });
  };

  // ADD GALLERY IMAGE
  const addGalleryImage = () => {
    if (!galleryInput) return alert("URL gambar wajib");
    setForm({
      ...form,
      galleryImages: [...form.galleryImages, galleryInput],
    });
    setGalleryInput("");
  };

  const removeGalleryImage = (index) => {
    setForm({
      ...form,
      galleryImages: form.galleryImages.filter((_, i) => i !== index),
    });
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      colors: JSON.stringify(form.colors),
    };

    try {
      if (editId) {
        await axios.put("/api/products", { id: editId, ...payload });
      } else {
        await axios.post("/api/products", payload);
      }

      setForm({
        name: "",
        price: "",
        description: "",
        displayImage: "",
        galleryImages: [],
        // stock: "",
        status: "READY",
        colors: [],
      });

      setEditId(null);
      fetchProducts();
    } catch (e) {
      alert("Error saving product");
    }
  };

  // EDIT PRODUCT
  const handleEdit = (p) => {
    setForm({
      name: p.name,
      price: p.price,
      description: p.description || "",
      displayImage: p.displayImage || "",
      galleryImages: p.galleryImages || [],
      // stock: p.stock || "",
      status: p.status || "READY",
      colors: p.colors || [],
    });
    setEditId(p._id);
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus produk ini?")) return;
    await axios.delete(`/api/products?id=${id}`);
    fetchProducts();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🛍️ Admin Products</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-6 border p-4 rounded">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product Name"
          className="border p-2 w-full rounded"
          required
        />

        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="border p-2 w-full rounded"
          required
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="border p-2 w-full rounded"
        />

        <input
          name="displayImage"
          value={form.displayImage}
          onChange={handleChange}
          placeholder="Display Image URL"
          className="border p-2 w-full rounded"
        />

        {/* GALLERY IMAGES */}
        <div className="border p-3 rounded">
          <h2 className="font-semibold mb-2">Gallery Images</h2>

          <div className="flex gap-2 mb-2">
            <input
              value={galleryInput}
              onChange={(e) => setGalleryInput(e.target.value)}
              placeholder="Image URL"
              className="border p-2 w-full rounded"
            />
            <button
              type="button"
              onClick={addGalleryImage}
              className="bg-green-600 text-white px-3 rounded"
            >
              Add
            </button>
          </div>

          <ul>
            {form.galleryImages.map((img, i) => (
              <li key={i} className="flex justify-between border p-2 mb-1 rounded">
                <span className="text-sm">{img}</span>
                <button
                  type="button"
                  onClick={() => removeGalleryImage(i)}
                  className="text-red-600"
                >
                  X
                </button>
              </li>
            ))}
          </ul>
        </div>

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        >
          <option value="READY">READY</option>
          <option value="HABIS">HABIS</option>
        </select>

        {/* COLORS */}
        <div className="border p-3 rounded">
          <h2 className="font-semibold mb-2">Color Variants</h2>

          <div className="flex gap-2 mb-2">
            <input
              value={colorInput.colorName}
              onChange={(e) =>
                setColorInput({ ...colorInput, colorName: e.target.value })
              }
              placeholder="Color Name"
              className="border p-2 w-full rounded"
            />
            <input
              value={colorInput.image}
              onChange={(e) =>
                setColorInput({ ...colorInput, image: e.target.value })
              }
              placeholder="Color Image URL"
              className="border p-2 w-full rounded"
            />
            <button
              type="button"
              onClick={addColor}
              className="bg-green-600 text-white px-3 rounded"
            >
              Add
            </button>
          </div>

          <ul>
            {form.colors.map((c, i) => (
              <li key={i} className="flex justify-between border p-2 mb-1 rounded">
                <span>
                  {c.colorName} — <small>{c.image}</small>
                </span>
                <button
                  onClick={() => removeColor(i)}
                  type="button"
                  className="text-red-600"
                >
                  X
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editId ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* PRODUCT LIST */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-1">Name</th>
            <th className="border px-3 py-1">Price</th>
            <th className="border px-3 py-1">Colors</th>
            <th className="border px-3 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td className="border px-3 py-1">{p.name}</td>
              <td className="border px-3 py-1">Rp {p.price}</td>
              <td className="border px-3 py-1">
                {p.colors.map((c) => c.colorName).join(", ")}
              </td>
              <td className="border px-3 py-1 space-x-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="bg-yellow-400 px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

