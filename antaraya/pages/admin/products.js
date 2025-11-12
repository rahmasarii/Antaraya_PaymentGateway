// pages/admin/products.js
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", category: "", colors: "" });
  const [editId, setEditId] = useState(null);

  // 🔹 Fetch products from DB
  const fetchProducts = async () => {
    const res = await axios.get("/api/products");
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔹 Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Create or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put("/api/products", { id: editId, ...form });
      } else {
        await axios.post("/api/products", form);
      }
      setForm({ name: "", price: "", category: "", colors: "" });
      setEditId(null);
      fetchProducts();
    } catch (err) {
      alert("Error saving product");
    }
  };

  // 🔹 Edit product
  const handleEdit = (p) => {
    setForm({
      name: p.name,
      price: p.price,
      category: p.category,
      colors: p.colors.join(","),
    });
    setEditId(p._id);
  };

  // 🔹 Delete product
  const handleDelete = async (id) => {
    if (!confirm("Yakin mau hapus?")) return;
    await axios.delete(`/api/products?id=${id}`);
    fetchProducts();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🛍️ Admin Product Management</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
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
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Category"
          className="border p-2 w-full rounded"
          required
        />
        <input
          name="colors"
          value={form.colors}
          onChange={handleChange}
          placeholder="Colors (comma separated)"
          className="border p-2 w-full rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editId ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* PRODUCT LIST */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-1">Name</th>
            <th className="border px-3 py-1">Price</th>
            <th className="border px-3 py-1">Category</th>
            <th className="border px-3 py-1">Colors</th>
            <th className="border px-3 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td className="border px-3 py-1">{p.name}</td>
              <td className="border px-3 py-1">{p.price}</td>
              <td className="border px-3 py-1">{p.category}</td>
              <td className="border px-3 py-1">{p.colors?.join(", ")}</td>
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
